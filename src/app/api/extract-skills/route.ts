import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `Extract technical skills from the resume. Return ONLY a valid JSON array of strings. Remove duplicates.`;

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json({ error: "No resume text" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: SYSTEM_PROMPT,
    });

    const result = await model.generateContent(resumeText);
    const text = result.response.text();

    const skills = JSON.parse(text);

    return NextResponse.json({ skills });
  } catch (error: any) {
    console.error("GEMINI ERROR:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
