import "server-only";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getEditorProjectLists } from "@/lib/project-data";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";

function getStringClaim(
  claims: Record<string, unknown>,
  keys: string[],
): string | null {
  for (const key of keys) {
    const value = claims[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getStringArrayClaim(
  claims: Record<string, unknown>,
  keys: string[],
): string[] {
  for (const key of keys) {
    const value = claims[key];

    if (Array.isArray(value)) {
      return value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      );
    }
  }

  return [];
}

function getSessionEmailAddresses(sessionClaims: unknown) {
  if (
    sessionClaims === null ||
    typeof sessionClaims !== "object" ||
    Array.isArray(sessionClaims)
  ) {
    return [];
  }

  const claims = sessionClaims as Record<string, unknown>;
  const primaryEmailAddress = getStringClaim(claims, [
    "email",
    "email_address",
    "primary_email_address",
  ]);
  const emailAddresses = getStringArrayClaim(claims, [
    "email_addresses",
    "emailAddresses",
  ]);

  return [
    ...new Set(
      [primaryEmailAddress, ...emailAddresses].filter(
        (emailAddress): emailAddress is string =>
          typeof emailAddress === "string",
      ),
    ),
  ];
}

export async function getCurrentEditorProjectLists() {
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    redirect(signInUrl);
  }

  return getEditorProjectLists({
    emailAddresses: getSessionEmailAddresses(sessionClaims),
    userId,
  });
}
