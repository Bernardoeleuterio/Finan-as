import prisma from "@/lib/db";
import { ProfileClient } from "./ProfileClient";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const profile = await prisma.profile.findUnique({
    where: { id: "single-profile" },
  });

  if (!profile) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Meu Perfil</h1>
        <p className="text-slate-400 text-sm mt-1">
          Gerencie seus dados pessoais, renda mensal e objetivos de poupança.
        </p>
      </div>
      <ProfileClient initialProfile={profile} />
    </div>
  );
}
