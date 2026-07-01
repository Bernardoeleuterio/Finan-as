"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getActiveProfileId } from "@/lib/profile";

export async function updateProfile(formData: FormData) {
  const fullName = formData.get("fullName") as string;
  const occupation = formData.get("occupation") as string;
  const age = parseInt(formData.get("age") as string, 10);
  const currentBalance = parseFloat(formData.get("currentBalance") as string) || 0;
  const monthlyIncome = parseFloat(formData.get("monthlyIncome") as string) || 0;
  const monthlySavingGoal = parseFloat(formData.get("monthlySavingGoal") as string) || 0;
  const financialGoal = formData.get("financialGoal") as string || "";

  if (!fullName || !occupation || isNaN(age)) {
    throw new Error("Por favor, preencha todos os campos obrigatórios.");
  }

  const activeProfileId = await getActiveProfileId();

  await prisma.profile.update({
    where: { id: activeProfileId },
    data: {
      fullName,
      occupation,
      age,
      currentBalance,
      monthlyIncome,
      monthlySavingGoal,
      financialGoal,
    },
  });

  revalidatePath("/");
  revalidatePath("/profile");
}
