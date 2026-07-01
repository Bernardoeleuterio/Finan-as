import prisma from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { notFound } from "next/navigation";
import { getActiveProfileId } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const activeProfileId = await getActiveProfileId();

  // Buscar perfil financeiro
  const profile = await prisma.profile.findUnique({
    where: { id: activeProfileId },
  });

  if (!profile) {
    // Caso não exista, o layout.tsx irá redirecionar, mas como fallsafe:
    notFound();
  }

  // Buscar transações com relações do perfil ativo
  const transactions = await prisma.transaction.findMany({
    where: {
      profileId: activeProfileId,
    },
    include: {
      category: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  return (
    <DashboardClient
      profile={profile}
      transactions={transactions}
    />
  );
}
