import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

interface GenerateRequest {
  category: "coding" | "aptitude" | "soft_skills";
  subcategory: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  count: number;
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

    const body: GenerateRequest = await req.json();
    const { category, subcategory, difficulty, count = 5 } = body;

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
    };

    const topicDesc =
      topicMap[category]?.[subcategory] || `${category} - ${subcategory}`;

    const codeSnippetInstruction =
      category === "coding"
        ? 'Include relevant code snippets in the "codeSnippet" field using proper formatting. For DSA, use Python or pseudocode. For SQL, use SQL queries with sample table context.'
        : 'Set "codeSnippet" to null for non-coding questions.';

    const prompt = `You are a professional skill assessment question generator for a career development platform.

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

    const geminiRes = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("[generate-questions] Gemini API error:", errText);
      return NextResponse.json(
        { error: "Failed to generate questions from AI" },
        { status: 502 }
      );
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";

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
      console.error("[generate-questions] JSON Parse Error. Raw text:", rawText);
      return NextResponse.json(
        { error: "Failed to parse questions from AI" },
        { status: 502 }
      );
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
