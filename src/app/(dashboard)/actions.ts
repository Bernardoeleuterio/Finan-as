"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateBalanceAction(newBalance: number) {
  await prisma.profile.update({
    where: { id: "single-profile" },
    data: {
      currentBalance: newBalance,
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
}
