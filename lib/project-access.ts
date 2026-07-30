import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface CurrentProjectIdentity {
  emailAddresses: string[];
  primaryEmail: string | null;
  userId: string;
}

export interface AccessibleProject {
  canManageAccess: boolean;
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
      return normalizeEmail(value);
    }
  }

  return null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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

      if (!Array.isArray(value)) {
        return [];
      }

      return value
        .filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
        .map(normalizeEmail);
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

async function getClerkEmailAddresses(userId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const emailAddresses = user.emailAddresses
      .map((address) => normalizeEmail(address.emailAddress))
      .filter(Boolean);
    const primaryEmail =
      user.emailAddresses.find(
        (address) => address.id === user.primaryEmailAddressId,
      )?.emailAddress ?? null;

    return {
      emailAddresses,
      primaryEmail: primaryEmail ? normalizeEmail(primaryEmail) : null,
    };
  } catch {
    // Session claims remain a useful fallback if Clerk's Backend API is
    // temporarily unavailable during a server render.
    return { emailAddresses: [], primaryEmail: null };
  }
}

export async function getCurrentProjectIdentity(): Promise<CurrentProjectIdentity | null> {
  const { sessionClaims, userId } = await auth();

  if (!userId) {
    return null;
  }

  const claimedPrimaryEmail = getPrimaryEmail(sessionClaims);
  const claimedEmailAddresses = getEmailAddresses(
    sessionClaims,
    claimedPrimaryEmail,
  );
  const clerkIdentity = await getClerkEmailAddresses(userId);

  return {
    emailAddresses: [
      ...new Set([...clerkIdentity.emailAddresses, ...claimedEmailAddresses]),
    ],
    primaryEmail: clerkIdentity.primaryEmail ?? claimedPrimaryEmail,
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

  const project = await prisma.project.findFirst({
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
      ownerId: true,
    },
  });

  if (!project) {
    return null;
  }

  return {
    canManageAccess: project.ownerId === identity.userId,
    id: project.id,
    name: project.name,
  };
}
