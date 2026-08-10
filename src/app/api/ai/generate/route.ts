import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

export async function POST(request: Request) {
  try {
    const { campaignTitle, campaignDescription } = await request.json();

    if (!process.env.GROQ_API_KEY) {
      console.warn("GROQ_API_KEY is missing. Using fallback generator.");
      return NextResponse.json({ 
        caption: `🚀 Excited to partner with ${campaignTitle}!\n\n${campaignDescription}\n\nCheck out the link in my bio to learn more and get an exclusive discount. Don't miss out on this!\n\n#${campaignTitle.replace(/\s+/g, '')} #ad #sponsored #musthave #creator`
      });
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
    // Return a fallback so the UI never breaks completely
    return NextResponse.json({ 
      caption: `🔥 I'm partnering with ${campaignTitle ?? 'this amazing brand'}!\n\nMake sure you click the link in my bio right now to check it out. You won't regret it!\n\n#sponsored #ad #creator` 
    });
  }
}
