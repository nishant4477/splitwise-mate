"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

export async function getGroupInsights(groupId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      expenses: {
        include: {
          paidBy: { select: { name: true } },
          participants: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  if (!group) throw new Error("Group not found");

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const expensesData = group.expenses.map(e => ({
    title: e.title,
    amount: e.amount,
    date: e.date,
    category: e.category,
    paidBy: e.paidBy.name,
    participants: e.participants.map(p => ({
      name: p.user.name,
      amount: p.amountOwed,
    })),
  }));

  const prompt = `
You are an expert financial advisor analyzing expenses for a group of friends/roommates.
Analyze the following expense data for the group "${group.name}".
Provide 3-4 insightful, fun, and helpful bullet points about their spending habits.
Keep it short, engaging, and use emojis. Focus on categories, who pays the most, or trends.

Data:
${JSON.stringify(expensesData, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    throw new Error("Failed to generate insights.");
  }
}
