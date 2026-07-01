import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { AppShell } from "@/components/layout/AppShell";
import { getActiveProfileId } from "@/lib/profile";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeProfileId = await getActiveProfileId();

  // Buscar o perfil financeiro local correspondente à conta ativa
  let profile = null;
  try {
    profile = await prisma.profile.findUnique({
      where: { id: activeProfileId },
    });
  } catch (error) {
    console.error("Erro ao buscar perfil local:", error);
  }

  // Se o perfil não existe ou onboarding não foi concluído, redireciona para criar
  if (!profile || !profile.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <AppShell
      profileName={profile.fullName}
      currentBalance={profile.currentBalance}
      activeProfileId={activeProfileId}
    >
      {children}
    </AppShell>
  );
}
