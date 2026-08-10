import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { campaignTitle, campaignDescription } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured in .env.local" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are an expert social media copywriter. 
I am a creator working on a campaign called "${campaignTitle}".
Here is what the campaign is about: "${campaignDescription}".

Write an engaging, highly-converting social media caption for TikTok or Instagram Reels. 
Keep it under 3 short paragraphs. Include a strong Call to Action (CTA) pointing to the link in my bio.
At the very end, include 5 highly relevant hashtags.

Do not include any conversational filler (like "Here is your caption:"). Just return the caption itself.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192", // Fast, standard Groq model
    });

    const caption = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ caption });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
