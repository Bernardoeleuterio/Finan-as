import prisma from "@/lib/db";
import { DashboardClient } from "@/components/dashboard/DashboardClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  // Buscar perfil financeiro
  const profile = await prisma.profile.findUnique({
    where: { id: "single-profile" },
  });

  if (!profile) {
    // Caso não exista, o layout.tsx irá redirecionar, mas como fallsafe:
    notFound();
  }

  // Buscar transações com relações
  const transactions = await prisma.transaction.findMany({
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
