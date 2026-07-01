"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActiveProfileId } from "@/lib/profile";

export async function updateBalanceAction(newBalance: number) {
  const activeProfileId = await getActiveProfileId();

  await prisma.profile.update({
    where: { id: activeProfileId },
    data: {
      currentBalance: newBalance,
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
}
