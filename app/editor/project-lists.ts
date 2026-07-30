import "server-only";

import { redirect } from "next/navigation";

import {
  getCurrentProjectIdentity,
  type CurrentProjectIdentity,
} from "@/lib/project-access";
import { getEditorProjectLists } from "@/lib/project-data";
import { getSignInUrl } from "@/lib/clerk-api";

export async function getCurrentEditorProjectLists(
  currentIdentity?: CurrentProjectIdentity | null,
) {
  const identity = currentIdentity ?? (await getCurrentProjectIdentity());

  if (!identity) {
    redirect(getSignInUrl());
  }

  return getEditorProjectLists({
    emailAddresses: identity.emailAddresses,
    userId: identity.userId,
  });
}
