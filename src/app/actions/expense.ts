"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export type SplitType = "EQUAL" | "EXACT" | "PERCENTAGE";

interface ParticipantSplit {
  userId: string;
  amount: number; // Exact amount owed (calculated on frontend if percentage or equal)
}

export async function addExpense(data: {
  groupId: string;
  description: string;
  amount: number;
  date?: Date;
  paidById: string; // the user who paid
  participants: ParticipantSplit[];
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Validate that the total amount matches the participants sum
  const totalSplit = data.participants.reduce((sum, p) => sum + p.amount, 0);
  if (Math.abs(totalSplit - data.amount) > 0.01) {
    throw new Error("Total split amounts do not match the expense amount");
  }

  const expense = await prisma.expense.create({
    data: {
      groupId: data.groupId,
      title: data.description,
      amount: data.amount,
      splitType: "EXACT",
      date: data.date || new Date(),
      paidById: data.paidById,
      participants: {
        create: data.participants.map((p) => ({
          userId: p.userId,
          amountOwed: p.amount,
        })),
      },
    },
    include: {
      participants: true,
      paidBy: true,
    },
  });

  return expense;
}

export async function recordSettlement(data: {
  groupId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // A settlement is just an expense where fromUserId paid toUserId
  // Actually, to zero the balance: fromUserId is the participant who owes the money, toUserId is the paidBy.
  // Wait, if A owes B $50. A pays B $50.
  // In the system, this means A (paidBy) paid $50 for B (participant).
  // So B's balance decreases by 50, A's balance increases by 50.
  // Let's create this expense.

  const expense = await prisma.expense.create({
    data: {
      groupId: data.groupId,
      title: "Settlement",
      amount: data.amount,
      splitType: "EXACT",
      date: new Date(),
      paidById: data.fromUserId, // A paid
      participants: {
        create: [
          {
            userId: data.toUserId, // for B
            amountOwed: data.amount,
          },
        ],
      },
    },
  });

  return expense;
}
