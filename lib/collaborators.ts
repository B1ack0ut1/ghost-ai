import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

import { prisma } from "@/lib/prisma";

export interface ProjectCollaboratorResponse {
  avatarUrl: string | null;
  email: string;
  name: string | null;
}

interface ClerkUserDisplay {
  avatarUrl: string;
  emails: string[];
  name: string | null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function getDisplayName(user: {
  firstName: string | null;
  lastName: string | null;
  username: string | null;
}) {
  const fullName = [user.firstName, user.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ");

  return fullName || user.username || null;
}

async function getClerkUserDisplays(emails: string[]) {
  if (emails.length === 0) {
    return new Map<string, ClerkUserDisplay>();
  }

  try {
    const client = await clerkClient();
    const emailBatches = Array.from(
      { length: Math.ceil(emails.length / 100) },
      (_, index) => emails.slice(index * 100, (index + 1) * 100),
    );
    const userLists = await Promise.all(
      emailBatches.map((emailBatch) =>
        client.users.getUserList({
          emailAddress: emailBatch,
          limit: emailBatch.length,
        }),
      ),
    );
    const displays = new Map<string, ClerkUserDisplay>();

    for (const user of userLists.flatMap((userList) => userList.data)) {
      const display = {
        avatarUrl: user.imageUrl,
        emails: user.emailAddresses.map((address) =>
          normalizeEmail(address.emailAddress),
        ),
        name: getDisplayName(user),
      };

      for (const email of display.emails) {
        displays.set(email, display);
      }
    }

    return displays;
  } catch {
    // A deleted user or a temporarily unavailable Clerk API must not prevent
    // project members from seeing the access list.
    return new Map<string, ClerkUserDisplay>();
  }
}

export async function getProjectCollaborators(projectId: string) {
  const collaboratorRecords = await prisma.projectCollaborator.findMany({
    where: { projectId },
    orderBy: { createdAt: "asc" },
    select: { email: true },
  });
  const emails = collaboratorRecords.map((collaborator) => collaborator.email);
  const userDisplays = await getClerkUserDisplays(emails);

  return collaboratorRecords.map(({ email }) => {
    const user = userDisplays.get(normalizeEmail(email));

    return {
      avatarUrl: user?.avatarUrl ?? null,
      email,
      name: user?.name ?? null,
    } satisfies ProjectCollaboratorResponse;
  });
}

export function parseCollaboratorEmail(body: Record<string, unknown>) {
  const email = body.email;

  if (typeof email !== "string") {
    return null;
  }

  const normalizedEmail = normalizeEmail(email);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ? normalizedEmail
    : null;
}
