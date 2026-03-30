import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import pdf from "pdf-parse";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are a professional resume parser. Your sole task is to extract professional and technical skills from the resume text provided.

RULES:
- Return ONLY a valid JSON array of strings. Nothing else.
- Do NOT include any explanation, preamble, or markdown code fences.
- Do NOT wrap the output in code fences (no \`\`\`json).
- Each item must be a single skill (e.g. "React", "Python", "SQL").
- Normalize casing: use standard capitalization (e.g. "JavaScript").
- Deduplicate: each skill should appear only once.
- Include both hard skills and tools, but exclude soft skills.

EXAMPLE OUTPUT:
["Python", "React", "TypeScript", "PostgreSQL", "Docker"]
`;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let resumeText = "";

    if (file.type === "application/pdf") {
      const buffer = Buffer.from(await file.arrayBuffer());
      const data = await pdf(buffer);
      resumeText = data.text;
    } else {
resumeText = await file.text();
    }

    if (!resumeText || resumeText.trim().length < 10) {
      return NextResponse.json({ error: "Resume text is too short or unreadable" }, { status: 422 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await model.generateContent(resumeText);
    const responseText = result.response.text();
    
    try {
      const skills = JSON.parse(responseText);
      return NextResponse.json({ skills });
    } catch (parseError) {
console.error("JSON Parse Error:", responseText);
      return NextResponse.json({ error: "AI returned invalid format" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Server Error:", error);
    return NextResponse.json(
      { error: error.message || "An internal error occurred" }, 
      { status: 500 }
    );
  }
}