import "server-only";

import { auth } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface CurrentProjectIdentity {
  emailAddresses: string[];
  primaryEmail: string | null;
  userId: string;
}

export interface AccessibleProject {
  id: string;
  name: string;
}

function getPrimaryEmail(sessionClaims: unknown) {
  if (
    sessionClaims === null ||
    typeof sessionClaims !== "object" ||
    Array.isArray(sessionClaims)
  ) {
    return null;
  }

  const claims = sessionClaims as Record<string, unknown>;

  for (const key of ["email", "email_address", "primary_email_address"]) {
    const value = claims[key];

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
}

function getEmailAddresses(sessionClaims: unknown, primaryEmail: string | null) {
  if (
    sessionClaims === null ||
    typeof sessionClaims !== "object" ||
    Array.isArray(sessionClaims)
  ) {
    return primaryEmail ? [primaryEmail] : [];
  }

  const claims = sessionClaims as Record<string, unknown>;
  const sessionEmailAddresses = ["email_addresses", "emailAddresses"].flatMap(
    (key) => {
      const value = claims[key];

      return Array.isArray(value)
        ? value.filter(
            (item): item is string =>
              typeof item === "string" && item.trim().length > 0,
          )
        : [];
    },
  );

  return [
    ...new Set(
      [primaryEmail, ...sessionEmailAddresses].filter(
        (emailAddress): emailAddress is string => Boolean(emailAddress),
      ),
    ),
  ];
}

export async function getCurrentProjectIdentity(): Promise<CurrentProjectIdentity | null> {
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    return null;
  }

  const primaryEmail = getPrimaryEmail(sessionClaims);

  return {
    emailAddresses: getEmailAddresses(sessionClaims, primaryEmail),
    primaryEmail,
    userId,
  };
}

export async function getAccessibleProject(
  projectId: string,
  identity: CurrentProjectIdentity,
): Promise<AccessibleProject | null> {
  const collaboratorAccess = identity.emailAddresses.length > 0
    ? {
        collaborators: {
          some: {
            email: {
              in: identity.emailAddresses,
            },
          },
        },
      }
    : undefined;

  return prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        {
          ownerId: identity.userId,
        },
        ...(collaboratorAccess ? [collaboratorAccess] : []),
      ],
    },
    select: {
      id: true,
      name: true,
    },
  });
}
