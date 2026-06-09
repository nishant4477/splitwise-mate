"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateProfile(data: {
  name: string;
  upiId?: string;
  venmoUsername?: string;
  paypalUsername?: string;
  cashappTag?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      upiId: data.upiId || null,
      venmoUsername: data.venmoUsername || null,
      paypalUsername: data.paypalUsername || null,
      cashappTag: data.cashappTag || null,
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return user;
}

export async function getUserProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  return prisma.user.findUnique({
    where: { id: session.user.id },
  });
}
