"use server";

import { cookies } from "next/headers";

export async function switchProfile(profileId: string) {
  const cookieStore = await cookies();
  cookieStore.set("fintrack_active_profile", profileId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 ano
  });
}
