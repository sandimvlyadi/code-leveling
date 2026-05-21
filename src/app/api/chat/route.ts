import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are a helpful AI assistant embedded in a portfolio website. 
You help visitors learn about the portfolio owner's work, skills, and projects. 
Be friendly, concise, and professional. Answer questions about design, engineering, and the projects showcased on this portfolio.
If asked about something unrelated to the portfolio or your capabilities, politely redirect the conversation.`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const { messages } = await request.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = messages[messages.length - 1];

    const chat = ai.chats.create({
      model: "gemini-3.1-flash-lite",
      config: { systemInstruction: SYSTEM_PROMPT },
      history,
    });

    const result = await chat.sendMessage({ message: lastMessage.content });
    const text = result.text;

    return NextResponse.json({ message: text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to get response";
    console.error("Chat API error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
