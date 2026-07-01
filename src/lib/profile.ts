import { cookies } from "next/headers";

export async function getActiveProfileId() {
  const cookieStore = await cookies();
  const profileId = cookieStore.get("fintrack_active_profile")?.value;
  return profileId || "personal"; // Padrão é a conta pessoal
}
