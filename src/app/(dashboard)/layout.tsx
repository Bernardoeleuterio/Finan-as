import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Buscar o único perfil financeiro local
  let profile = null;
  try {
    profile = await prisma.profile.findUnique({
      where: { id: "single-profile" },
    });
  } catch (error) {
    console.error("Erro ao buscar perfil local:", error);
  }

  // Se o perfil não existe ou onboarding não foi concluído, redireciona
  if (!profile || !profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      profileName={profile.fullName}
      currentBalance={profile.currentBalance}
    >
      {children}
    </AppShell>
  );
}
