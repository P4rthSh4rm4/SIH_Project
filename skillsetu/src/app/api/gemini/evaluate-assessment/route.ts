import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

interface EvaluateRequest {
  category: string;
  subcategory: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    skillTag: string;
  }>;
  answers: Record<string, number>;
  timeTakenSeconds: number;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body: EvaluateRequest = await req.json();
    const { category, subcategory, questions, answers, timeTakenSeconds } = body;

    if (!questions || !answers) {
      return NextResponse.json(
        { error: "questions and answers are required" },
        { status: 400 }
      );
    }

    // Calculate raw score
    let correctCount = 0;
    const questionResults = questions.map((q, idx) => {
      const userAnswer = answers[String(idx)];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        questionId: q.id,
        skillTag: q.skillTag,
        isCorrect,
        userAnswer,
        correctAnswer: q.correctAnswer,
      };
    });

    const totalCount = questions.length;
    const score = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    // Build skill-level scores
    const skillMap: Record<string, { correct: number; total: number }> = {};
    questionResults.forEach((r) => {
      if (!skillMap[r.skillTag]) skillMap[r.skillTag] = { correct: 0, total: 0 };
      skillMap[r.skillTag].total++;
      if (r.isCorrect) skillMap[r.skillTag].correct++;
    });

    const skillsAssessed = Object.entries(skillMap).map(([name, data]) => ({
      name,
      score: Math.round((data.correct / data.total) * 100),
    }));

    // Get AI feedback
    const wrongTopics = questionResults
      .filter((r) => !r.isCorrect)
      .map((r) => r.skillTag);
    const rightTopics = questionResults
      .filter((r) => r.isCorrect)
      .map((r) => r.skillTag);

    const feedbackPrompt = `A student completed a ${category} (${subcategory}) skill assessment.
Score: ${score}% (${correctCount}/${totalCount} correct)
Time taken: ${timeTakenSeconds} seconds
Topics answered correctly: ${[...new Set(rightTopics)].join(", ") || "None"}
Topics answered incorrectly: ${[...new Set(wrongTopics)].join(", ") || "None"}

Provide a concise 2-3 sentence performance feedback covering:
1. What they did well
2. Specific areas to improve
3. One actionable next step

Return ONLY the feedback text, no JSON, no markdown formatting.`;

    let feedback =
      score >= 80
        ? "Excellent performance! You have strong fundamentals in this area."
        : score >= 50
          ? "Good effort. Focus on the topics you missed to strengthen your skills."
          : "Keep practicing! Review the fundamentals and try again.";

    try {
      const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: feedbackPrompt }] }],
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 512,
          },
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const aiText =
          geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (aiText) feedback = aiText;
      }
    } catch {
      // Use fallback feedback if Gemini call fails
    }

    return NextResponse.json({
      score,
      correctCount,
      totalCount,
      feedback,
      skillsAssessed,
      questionResults,
      timeTakenSeconds,
    });
  } catch (err) {
    console.error("[evaluate-assessment] Error:", err);
    return NextResponse.json(
      { error: "Internal server error evaluating assessment" },
      { status: 500 }
    );
  }
}
