"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function createGroup(data: { name: string; description?: string; currency?: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const group = await prisma.group.create({
    data: {
      name: data.name,
      description: data.description,
      currency: data.currency || "INR",
      members: {
        create: {
          userId: session.user.id,
          role: "ADMIN",
        },
      },
    },
  });

  return group;
}

export async function getMyGroups() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return [];

  return prisma.group.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      _count: {
        select: { members: true, expenses: true },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getGroupDetails(groupId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              upiId: true,
              venmoUsername: true,
              paypalUsername: true,
              cashappTag: true,
            },
          },
        },
      },
      expenses: {
        orderBy: {
          date: "desc",
        },
        include: {
          paidBy: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: true,
        },
      },
    },
  });
}

export async function joinGroup(groupId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: {
      userId_groupId: {
        userId: session.user.id,
        groupId,
      },
    },
  });

  if (existing) return { success: true, message: "Already a member" };

  await prisma.groupMember.create({
    data: {
      groupId,
      userId: session.user.id,
      role: "MEMBER",
    },
  });

  return { success: true, message: "Joined group successfully" };
}

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return { totalOwed: 0, totalOwe: 0, categoryData: [] };

  const userId = session.user.id;

  // Get all expenses from groups where user is a member
  const groups = await prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      expenses: {
        include: {
          participants: true,
        },
      },
    },
  });

  let totalOwedToMe = 0; // People owe me this
  let totalIOwe = 0; // I owe this to others
  const categoryTotals: Record<string, number> = {};

  groups.forEach((group) => {
    group.expenses.forEach((expense) => {
      // Calculate category spending (only my share)
      const myParticipant = expense.participants.find((p) => p.userId === userId);
      const myShare = myParticipant ? myParticipant.amount : 0;
      
      if (myShare > 0) {
        const category = expense.category || "Other";
        categoryTotals[category] = (categoryTotals[category] || 0) + myShare;
      }

      // Calculate debts (cross-group simplified logic)
      if (expense.paidById === userId) {
        // I paid, others owe me (total amount minus my share)
        totalOwedToMe += expense.amount - myShare;
      } else if (myShare > 0) {
        // Someone else paid, I owe my share
        totalIOwe += myShare;
      }
    });
  });

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    totalOwed: totalOwedToMe,
    totalOwe: totalIOwe,
    categoryData,
  };
}

