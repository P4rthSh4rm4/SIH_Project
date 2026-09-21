import { NextRequest, NextResponse } from "next/server";



export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { promptData, fullName, department = "CSE" } = await req.json();

    if (!promptData) {
      return NextResponse.json(
        { error: "promptData is required" },
        { status: 400 }
      );
    }

    const deptContext = department === "Ayurveda" 
      ? "The user is an Ayurveda medical student. Tailor the professional summary and skill categories to be highly relevant to Ayurveda, Clinical Practice, or Ayurvedic Pharma where applicable."
      : "";

    const systemPrompt = `
You are an expert ATS-friendly Resume Writer and Career Coach. 
The user will provide rough notes about their background, projects, education, and skills. 
Your job is to transform this raw data into a highly professional, well-formatted, impact-driven resume in JSON format.
${deptContext}

RULES:
1. "professionalSummary": Write a 3-4 sentence professional summary highlighting their top skills and objective.
2. "education": Extract education details. If missing, provide placeholders like "[University Name]", "[Degree]".
3. "skills": Group skills into categories (e.g., "Languages", "Frameworks", "Tools", or for Ayurveda: "Clinical Skills", "Diagnostics").
4. "projects": Write 2-3 strong, action-oriented bullet points for each project mentioned. Use the XYZ formula (Accomplished [X] as measured by [Y], by doing [Z]).
5. "certifications": Extract any certifications.
6. "awards": Extract any awards.
7. Return ONLY valid JSON. No markdown wrappers.

JSON SCHEMA EXPECTED:
{
  "professionalSummary": "string",
  "education": [
    { "institution": "string", "degree": "string", "year": "string" }
  ],
  "skills": [
    { "category": "string", "items": "string (comma separated)" }
  ],
  "projects": [
    { "name": "string", "year": "string", "role": "string", "description": ["bullet 1", "bullet 2"] }
  ],
  "certifications": ["string"],
  "awards": ["string"]
}
`;

    const requestBody = {
      contents: [
        {
          role: "user",
          parts: [
            { text: `${systemPrompt}\n\nUSER NAME: ${fullName || "Candidate"}\n\nUSER ROUGH NOTES:\n${promptData}` }
          ],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        responseMimeType: "application/json",
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
      ],
    };

    const modelsToTry = ["gemini-3.5-flash", "gemini-3.6-flash"];
    const MAX_RETRIES = 2;
    let response: Response | null = null;
    let usedModel = modelsToTry[0];

    for (const model of modelsToTry) {
      usedModel = model;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        response = await fetch(`${apiUrl}?key=${apiKey}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) break;

        const errText = await response.text();
        console.error(`Gemini Resume Error (${model} attempt ${attempt}):`, response.status, errText);

        if (response.status === 429 || response.status === 503) {
          if (attempt < MAX_RETRIES) {
             const delay = Math.pow(2, attempt) * 1000;
             await new Promise(r => setTimeout(r, delay));
          }
        } else {
           break;
        }
      }
      if (response?.ok) break;
    }

    if (!response || !response.ok) {
      return NextResponse.json(
        { error: "AI service is temporarily unavailable. Please try again in a moment." },
        { status: response?.status || 503 }
      );
    }

    const data = await response.json();
    let textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Clean up markdown formatting if the model still wraps it
    textOutput = textOutput.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    // Try to locate JSON object
    const startIndex = textOutput.indexOf("{");
    const endIndex = textOutput.lastIndexOf("}");
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
      textOutput = textOutput.substring(startIndex, endIndex + 1);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(textOutput);
    } catch (e) {
      console.error("Failed to parse Gemini JSON output:", textOutput);
      return NextResponse.json(
        { error: "Failed to parse AI response into valid JSON." },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
