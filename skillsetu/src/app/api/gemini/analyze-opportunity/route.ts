import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your-gemini-api-key") {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 500 });
    }

    const { opportunityId } = await req.json();
    if (!opportunityId) {
      return NextResponse.json({ error: "Opportunity ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch Opportunity JD
    const { data: opp, error: oppError } = await supabase
      .from("opportunities")
      .select("title, description, required_skills")
      .eq("id", opportunityId)
      .single();

    if (oppError || !opp) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 });
    }

    // 2. Fetch User Resume
    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("resume_url")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile?.resume_url) {
      return NextResponse.json({ error: "NO_RESUME", message: "Please upload a resume in your profile first." }, { status: 400 });
    }

    // 3. Download the PDF from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(profile.resume_url);

    if (downloadError || !fileData) {
      return NextResponse.json({ error: "Failed to download resume document" }, { status: 500 });
    }

    // Convert Blob to Base64
    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");
    const mimeType = fileData.type || "application/pdf";

    // 4. Construct Prompt
    const prompt = `You are an expert technical recruiter and career coach.
I am providing you with a candidate's resume (attached as a document) and a Job Description (JD).

Job Title: ${opp.title}
Job Description: ${opp.description}
${opp.required_skills ? `Required Skills: ${opp.required_skills.join(", ")}` : ""}

Analyze the resume against this job description.
Return a STRICT JSON object (no markdown, no backticks, just the raw JSON) with the following structure:
{
  "matchScore": <number between 0 and 100 representing the fit>,
  "matchingSkills": ["<skill1>", "<skill2>"],
  "missingSkills": ["<skill1>", "<skill2>"],
  "recommendation": "<A short 2-3 sentence actionable recommendation on how they can improve their chances>"
}
`;

    // 5. Call Gemini
    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent JSON output
        },
      }),
    });

    if (!geminiRes.ok) {
      const errData = await geminiRes.text();
      console.error("[analyze-opportunity] Gemini API Error:", errData);
      return NextResponse.json({ error: "Failed to analyze resume via AI" }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    let aiText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!aiText) {
      return NextResponse.json({ error: "Empty response from AI" }, { status: 500 });
    }

    // Clean markdown formatting if Gemini included it despite our prompt
    if (aiText.startsWith("\`\`\`json")) {
      aiText = aiText.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    } else if (aiText.startsWith("\`\`\`")) {
      aiText = aiText.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(aiText);
    } catch (e) {
      console.error("[analyze-opportunity] Failed to parse JSON:", aiText);
      return NextResponse.json({ error: "AI returned invalid JSON" }, { status: 500 });
    }

    return NextResponse.json(parsedResult);
  } catch (err) {
    console.error("[analyze-opportunity] Error:", err);
    return NextResponse.json(
      { error: "Internal server error analyzing opportunity" },
      { status: 500 }
    );
  }
}
