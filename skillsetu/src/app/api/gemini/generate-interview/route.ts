import { NextRequest, NextResponse } from "next/server";


interface GenerateInterviewRequest {
  type: string;
  careerPath: string;
  difficulty: string;
  count: number;
  department?: string;
}

export async function POST(req: NextRequest) {
  try {
    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY1
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0 || apiKeys[0] === "your-gemini-api-key") {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const body: GenerateInterviewRequest = await req.json();
    const { type, careerPath, difficulty, count = 5, department = "CSE" } = body;

    const isAyurveda = department === "Ayurveda";
    
    let deptContext = "";
    let typeContextDesc = "";
    
    if (isAyurveda) {
      deptContext = `The candidate is an Ayurveda medical student/professional (BAMS). The target career path is "${careerPath}". Ensure all questions (even HR or Behavioral) reflect the clinical, hospital, wellness, or Ayurvedic pharma context. Do NOT act like a software/tech recruiter.`;
      typeContextDesc = `
- HR/Behavioral: Focus on cultural fit, past experiences, stress handling, leadership in a medical/clinical setting.
- Clinical & Domain: Focus on deep domain knowledge related to ${careerPath}, Clinical Knowledge, Ayurveda fundamentals, Clinical case scenarios, Ayurvedic Pharma, Documentation, and Patient communication. DO NOT ask software or IT technical questions.
- Mixed: A combination of HR, Behavioral, Clinical & Domain, and Aptitude.`;
    } else {
      deptContext = `The candidate is applying for the "${careerPath}" role. Provide relevant industry-standard interview questions.`;
      typeContextDesc = `
- HR/Behavioral: Focus on cultural fit, past experiences, stress handling, leadership.
- Technical: Focus on deep domain knowledge related to ${careerPath}.
- Mixed: A combination of both.`;
    }

    const prompt = `You are an expert recruiter conducting a mock interview.
${deptContext}

Generate exactly ${count} mock interview questions for an interview of type: ${type}
Difficulty level: ${difficulty}

Type Context:${typeContextDesc}

CRITICAL: Return ONLY a valid JSON array with NO markdown formatting, NO code fences. 

Each question object must have this exact structure:
{
  "id": "q_timestamp_index",
  "type": "${type}",
  "difficulty": "${difficulty}",
  "question": "The interview question text",
  "expectedKeywords": ["keyword1", "keyword2", "keyword3"]
}

Requirements:
- Questions must be realistic for a ${difficulty} level interview.
- expectedKeywords should be 3-5 keywords you expect in a good answer.`;
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.6-flash"];
    const MAX_RETRIES = 2;
    let geminiRes: Response | null = null;
    let usedModel = modelsToTry[0];

    for (const apiKey of apiKeys) {
      for (const model of modelsToTry) {
        usedModel = model;
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
          geminiRes = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: {
                temperature: 0.7,
                responseMimeType: "application/json",
              },
            }),
          });

          if (geminiRes.ok) break;

          const errorBody = await geminiRes.text();
          console.error(`Gemini Error (${model} key ${apiKey.slice(-4)} attempt ${attempt}):`, geminiRes.status, errorBody);

          if (geminiRes.status === 429 || geminiRes.status === 503) {
            if (attempt < MAX_RETRIES) {
               const delay = Math.pow(2, attempt) * 1000;
               await new Promise(r => setTimeout(r, delay));
            }
          } else {
             break; // Stop retrying if it's 400 or 401
          }
        }
        if (geminiRes?.ok) break;
      }
      if (geminiRes?.ok) break;
    }

    if (!geminiRes || !geminiRes.ok) {
      return NextResponse.json(
        { error: "Failed to generate interview from AI after retries", status: geminiRes?.status },
        { status: geminiRes?.status || 500 }
      );
    }

    const geminiData = await geminiRes.json();
    const candidate = geminiData?.candidates?.[0];
    const rawText = candidate?.content?.parts?.[0]?.text || "[]";
    
    let questions;
    try {
      questions = JSON.parse(rawText);
    } catch (e) {
      const cleaned = rawText.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
      try {
        questions = JSON.parse(cleaned);
      } catch (e2) {
        console.error("JSON Parsing Error:", rawText);
        return NextResponse.json({ error: "Failed to parse AI response into questions format" }, { status: 500 });
      }
    }

    // Ensure IDs are unique strings
    questions = questions.map((q: any, i: number) => ({
      ...q,
      id: `ai_${Date.now()}_${i}`
    }));

    return NextResponse.json({ questions });
  } catch (err) {
    console.error("[generate-interview] Error:", err);
    return NextResponse.json(
      { error: "Internal server error generating interview questions" },
      { status: 500 }
    );
  }
}
