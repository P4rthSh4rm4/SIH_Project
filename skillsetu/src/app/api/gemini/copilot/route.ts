import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

interface CopilotRequest {
  messages: Array<{ role: "user" | "model"; content: string }>;
  studentContext?: {
    name?: string;
    careerObjective?: string;
    skills?: Array<{ name: string; proficiency: number }>;
    education?: string;
    completedAssessmentsCount?: number;
  };
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

    const body: CopilotRequest = await req.json();
    const { messages, studentContext } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    const contextBlock = studentContext
      ? `
Student Profile Context:
- Name: ${studentContext.name || "Unknown"}
- Career Objective: ${studentContext.careerObjective || "Not specified"}
- Skills: ${studentContext.skills?.map((s) => `${s.name} (${s.proficiency}%)`).join(", ") || "None mapped yet"}
- Education: ${studentContext.education || "Not specified"}
- Assessments Completed: ${studentContext.completedAssessmentsCount ?? 0}
`
      : "";

    const systemInstruction = `You are SkillSetu Career Copilot, an expert AI career mentor for higher education and engineering students in India. You have direct access to the student's profile data.

${contextBlock}

Your capabilities:
- Provide personalized career guidance based on the student's skills and goals
- Suggest learning paths and skill development strategies
- Help with interview preparation with practice questions
- Review and improve resume content
- Analyze skill gaps for target roles
- Provide industry insights and job market trends

Guidelines:
- Be supportive, concise, and actionable
- Use markdown formatting for code blocks, lists, and emphasis
- When suggesting skills to learn, be specific about resources
- Tailor advice to the Indian job market and education system
- If asked about something outside your scope, redirect to career-related topics gracefully`;

    // Build Gemini conversation format
    const geminiContents = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.75,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[copilot] Gemini API error:", errText);
      return NextResponse.json(
        { error: "Failed to get AI response" },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const reply =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[copilot] Error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
