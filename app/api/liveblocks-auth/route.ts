import { auth, currentUser } from "@clerk/nextjs/server";

import { getCursorColor, getLiveblocksClient } from "@/lib/liveblocks";
import { errorResponse, readJsonObject } from "@/lib/project-api";
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access";

function getDisplayName(user: NonNullable<Awaited<ReturnType<typeof currentUser>>>) {
  const fullName = [user.firstName, user.lastName]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(" ");

  return fullName || user.username || user.primaryEmailAddress?.emailAddress || "User";
}

function getProjectId(body: Record<string, unknown>) {
  return typeof body.room === "string" && body.room.trim().length > 0
    ? body.room
    : null;
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse(
      "UNAUTHENTICATED",
      "Authentication is required.",
      401,
    );
  }

  const body = await readJsonObject(request);
  const projectId = body ? getProjectId(body) : null;

  if (!projectId) {
    return errorResponse(
      "INVALID_ROOM_ID",
      "A project room ID is required.",
      400,
    );
  }

  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return errorResponse(
      "UNAUTHENTICATED",
      "Authentication is required.",
      401,
    );
  }

  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return errorResponse("FORBIDDEN", "Project access is required.", 403);
  }

  const user = await currentUser();

  if (!user) {
    return errorResponse(
      "UNAUTHENTICATED",
      "Authentication is required.",
      401,
    );
  }

  const liveblocks = getLiveblocksClient();

  await liveblocks.getOrCreateRoom(project.id, { defaultAccesses: [] });

  const session = liveblocks.prepareSession(userId, {
    userInfo: {
      avatar: user.imageUrl,
      color: getCursorColor(userId),
      name: getDisplayName(user),
    },
  });

  session.allow(project.id, ["*:write"]);

  const { body: token, status } = await session.authorize();

  return new Response(token, {
    headers: { "Content-Type": "application/json" },
    status,
  });
}
