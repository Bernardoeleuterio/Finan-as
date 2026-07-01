"use server";

import prisma from "@/lib/db";
import { redirect } from "next/navigation";
import { getActiveProfileId } from "@/lib/profile";

export async function completeOnboarding(formData: FormData) {
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

  // Criar ou atualizar o perfil correspondente
  await prisma.profile.upsert({
    where: { id: activeProfileId },
    update: {
      fullName,
      occupation,
      age,
      currentBalance,
      monthlyIncome,
      monthlySavingGoal,
      financialGoal,
      onboardingCompleted: true,
    },
    create: {
      id: activeProfileId,
      fullName,
      occupation,
      age,
      currentBalance,
      monthlyIncome,
      monthlySavingGoal,
      financialGoal,
      onboardingCompleted: true,
    },
  });

  // Garantir que as categorias padrão existem no SQLite local
  const categoryCount = await prisma.category.count();
  if (categoryCount === 0) {
    const categoriesData = [
      { name: "Salário", type: "income" },
      { name: "Investimentos", type: "income" },
      { name: "Freelance", type: "income" },
      { name: "Outros (Receita)", type: "income" },
      { name: "Alimentação", type: "expense" },
      { name: "Moradia", type: "expense" },
      { name: "Transporte", type: "expense" },
      { name: "Saúde", type: "expense" },
      { name: "Educação", type: "expense" },
      { name: "Lazer", type: "expense" },
      { name: "Assinaturas & Serviços", type: "expense" },
      { name: "Imprevistos", type: "expense" },
      { name: "Dívidas & Empréstimos", type: "expense" },
      { name: "Outros (Despesa)", type: "expense" },
    ];
    for (const cat of categoriesData) {
      await prisma.category.create({ data: cat });
    }
  }

  redirect("/");
}
