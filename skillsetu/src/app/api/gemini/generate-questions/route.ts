import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

interface GenerateRequest {
  category: "coding" | "aptitude" | "soft_skills" | "ayurveda_domain" | string;
  subcategory: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  count: number;
  department?: string;
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

    let body: GenerateRequest;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }
    const { category, subcategory, difficulty, count = 5, department = "CSE" } = body;

    if (!category || !subcategory || !difficulty) {
      return NextResponse.json(
        { error: "category, subcategory, and difficulty are required" },
        { status: 400 }
      );
    }

    const clampedCount = Math.min(Math.max(count, 1), 15);

    const topicMap: Record<string, Record<string, string>> = {
      coding: {
        dsa: "Data Structures and Algorithms (Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, Sorting, Searching)",
        sql: "SQL and Database Queries (SELECT, JOINs, GROUP BY, Aggregations, Subqueries, Indexing, Query Optimization)",
        web_dev:
          "Web Development Fundamentals (HTML, CSS, JavaScript, React basics, REST APIs, HTTP, Node.js basics)",
      },
      aptitude: {
        quant:
          "Quantitative Aptitude (Number Systems, Percentages, Profit & Loss, Time & Work, Probability, Permutations)",
        logical:
          "Logical Reasoning (Syllogisms, Blood Relations, Coding-Decoding, Puzzles, Seating Arrangements, Pattern Recognition)",
        verbal:
          "Verbal Ability (Reading Comprehension, Sentence Correction, Para Jumbles, Vocabulary, Analogies)",
      },
      soft_skills: {
        communication:
          "Communication Skills (Active Listening, Presentation, Written Communication, Feedback, Non-verbal cues)",
        leadership:
          "Leadership & Management (Decision Making, Delegation, Motivation, Vision Setting, Accountability)",
        teamwork:
          "Teamwork & Collaboration (Conflict Resolution, Group Dynamics, Cross-functional work, Consensus Building)",
        problem_solving:
          "Problem Solving & Critical Thinking (Root Cause Analysis, Creative Solutions, Prioritization, Risk Assessment)",
      },
      ayurveda_domain: {
        clinical_practice: "Ayurveda Clinical Practice (Diagnosis, Dosha assessment, Herbal treatments, Patient care)",
        research: "Ayurveda Research (Methodology, Clinical Trials, Modern validation of Ayurvedic concepts)",
        pharma: "Ayurvedic Pharma (Formulations, Quality Assurance, Manufacturing processes, Regulatory guidelines)",
      }
    };

    const topicDesc =
      topicMap[category]?.[subcategory] || `${category} - ${subcategory}`;

    const codeSnippetInstruction =
      category === "coding"
        ? 'Include relevant code snippets in the "codeSnippet" field using proper formatting. For DSA, use Python or pseudocode. For SQL, use SQL queries with sample table context.'
        : 'Set "codeSnippet" to null for non-coding questions.';

    const deptContext = department === "Ayurveda" 
      ? "Ensure questions and scenarios are highly relevant to an Ayurveda medical or clinical context, even for soft skills and aptitude."
      : "";

    const prompt = `You are a professional skill assessment question generator for a career development platform.
${deptContext}
Generate exactly ${clampedCount} multiple-choice questions on the topic: ${topicDesc}

Difficulty level: ${difficulty}
- beginner: Fundamental concepts, definitions, basic applications
- intermediate: Applied knowledge, multi-step reasoning, common patterns
- advanced: Edge cases, optimization, advanced patterns, tricky scenarios

${codeSnippetInstruction}

CRITICAL: Return ONLY a valid JSON array with NO markdown formatting, NO code fences, NO explanation text. Just the raw JSON array.

Each question object must have this exact structure:
{
  "id": "q1",
  "question": "Clear, well-formatted question text",
  "codeSnippet": "code here or null",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Detailed explanation of why the correct answer is right",
  "skillTag": "Specific skill being tested",
  "difficulty": "${difficulty}"
}

Requirements:
- Exactly 4 options per question
- correctAnswer is a zero-based index (0-3)
- Each question tests a distinct concept
- Explanations should be educational and helpful
- skillTag should be specific (e.g., "Binary Search", "SQL Joins", "Active Listening")
- Questions should be practical and relevant to real-world scenarios`;

    // Retry logic with fallback models for transient 429/503 "high demand" errors
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.6-flash"
    ];
    const MAX_RETRIES = 2;
    let geminiRes: Response | null = null;
    let usedModel = modelsToTry[0];
    let isHighDemand = false;

    for (const model of modelsToTry) {
      usedModel = model;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        geminiRes = await fetch(`${apiUrl}?key=${apiKey}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            safetySettings: [
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 65536,
              responseMimeType: "application/json",
            },
          }),
        });

        // If success or a non-retryable error, break out immediately
        if (geminiRes.ok || (geminiRes.status !== 429 && geminiRes.status !== 503)) {
          break;
        }

        // Retryable error (429/503): log and wait before retrying
        isHighDemand = true;
        const delayMs = (attempt + 1) * 2000; // 2s, 4s
        console.warn(`[generate-questions] Model ${model} returned ${geminiRes.status} (attempt ${attempt + 1}/${MAX_RETRIES + 1}). Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // If we got a successful response from this model, stop trying other models
      if (geminiRes && geminiRes.ok) {
        break;
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      const status = geminiRes ? geminiRes.status : 500;
      const errText = geminiRes ? await geminiRes.text() : "";
      console.error(`[generate-questions] Diagnostic Info:`);
      console.error(`- Failed all models/retries`);
      console.error(`- Last HTTP Status: ${status}`);
      console.error(`- Error Body: ${errText}`);
      
      let parsedMsg = errText;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error && parsed.error.message) {
          parsedMsg = parsed.error.message;
        }
      } catch (e) {}

      // Provide a user-friendly message for high-demand/rate-limit errors
      if (status === 429 || status === 503) {
        isHighDemand = true;
      }
      
      const userMessage = isHighDemand 
        ? "AI question generation is temporarily busy. Please try again in a few minutes."
        : "Failed to generate questions from AI";

      return NextResponse.json(
        { 
          error: userMessage, 
          details: parsedMsg,
          status: status
        },
        { status: isHighDemand ? 503 : 500 }
      );
    }

    const geminiData = await geminiRes!.json();
    const candidate = geminiData?.candidates?.[0];
    const finishReason = candidate?.finishReason;
    const parts = candidate?.content?.parts || [];
    const rawText = parts.map((p: any) => p.text).join("") || "[]";

    if (finishReason === "MAX_TOKENS") {
      console.warn("[generate-questions] Gemini response truncated (MAX_TOKENS). Consider requesting fewer questions.");
    }

    // Parse the JSON response, stripping any accidental markdown fences
    let cleaned = rawText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Extract just the array if Gemini included conversational text
    const firstBracket = cleaned.indexOf("[");
    const lastBracket = cleaned.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleaned = cleaned.substring(firstBracket, lastBracket + 1);
    }

    let questions;
    try {
      questions = JSON.parse(cleaned);
    } catch (e) {
      // If JSON is truncated, try to salvage complete question objects
      console.error(`[generate-questions] JSON Parse Error (finishReason: ${finishReason}). Attempting partial recovery...`);
      try {
        // Find the last complete object by locating the last "}," or "}]"
        const lastCompleteObj = cleaned.lastIndexOf("}");
        if (lastCompleteObj > 0) {
          const salvaged = cleaned.substring(0, lastCompleteObj + 1) + "]";
          questions = JSON.parse(salvaged);
          console.log(`[generate-questions] Partial recovery succeeded: ${questions.length} questions salvaged.`);
        } else {
          throw e;
        }
      } catch (e2) {
        console.error("[generate-questions] Partial recovery also failed. Raw text (first 500 chars):", rawText.substring(0, 500));
        return NextResponse.json(
          { error: "Failed to parse questions from AI (response was truncated). Try requesting fewer questions." },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ questions, category, subcategory, difficulty });
  } catch (err) {
    console.error("[generate-questions] Error:", err);
    return NextResponse.json(
      { error: "Internal server error generating questions" },
      { status: 500 }
    );
  }
}
