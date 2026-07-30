import "server-only";

import { redirect } from "next/navigation";

import { getCurrentProjectIdentity } from "@/lib/project-access";
import { getEditorProjectLists } from "@/lib/project-data";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";

export async function getCurrentEditorProjectLists() {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    redirect(signInUrl);
  }

  return getEditorProjectLists({
    emailAddresses: identity.emailAddresses,
    userId: identity.userId,
  });
}
