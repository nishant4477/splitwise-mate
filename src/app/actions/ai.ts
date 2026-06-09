"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";

export async function scanReceipt(base64Image: string, mimeType: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are an expert receipt data extractor for an expense splitting application. 
Analyze the provided receipt image and extract the following information.
Format the output EXACTLY as a JSON object, without markdown formatting or code blocks:
{
  "title": "Short descriptive title of the expense (e.g., 'Dinner at McDonald's' or 'Uber ride')",
  "amount": Total final amount paid (as a number),
  "currency": "Currency code (e.g., 'USD', 'INR', 'EUR'. Infer from the symbol if possible. Default to 'INR' if unsure)",
  "date": "Date of the transaction in YYYY-MM-DD format (if found, otherwise null)",
  "category": "One of: Food & Dining, Travel, Utilities, Groceries, Entertainment, Shopping, Health, Other",
  "notes": "Any extra useful information extracted from the receipt, like taxes, tip, or items."
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      ],
    });

    const text = response.text || "{}";
    
    // Clean up potential markdown blocks if the model ignores the strict instruction
    const cleanedText = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const data = JSON.parse(cleanedText);
    return data;
  } catch (error) {
    console.error("AI Scan Error:", error);
    throw new Error("Failed to scan receipt. Please try again.");
  }
}
