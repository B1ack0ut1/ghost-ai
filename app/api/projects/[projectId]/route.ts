import { auth } from "@clerk/nextjs/server";

import { Prisma } from "@/app/generated/prisma/client";
import {
  errorResponse,
  parseRenameProjectName,
  projectResponseSelect,
  readJsonObject,
} from "@/lib/project-api";
import { prisma } from "@/lib/prisma";

interface ProjectRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

async function assertOwner(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: {
      id: projectId,
    },
    select: {
      ownerId: true,
    },
  });

  if (!project) {
    return errorResponse("PROJECT_NOT_FOUND", "Project not found.", 404);
  }

  if (project.ownerId !== userId) {
    return errorResponse(
      "FORBIDDEN",
      "Only the project owner can mutate this project.",
      403,
    );
  }

  return null;
}

export async function PATCH(request: Request, context: ProjectRouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse(
      "UNAUTHENTICATED",
      "Authentication is required.",
      401,
    );
  }

  const body = await readJsonObject(request);

  if (!body) {
    return errorResponse(
      "INVALID_REQUEST",
      "Request body must be a JSON object.",
      400,
    );
  }

  const name = parseRenameProjectName(body);

  if (!name) {
    return errorResponse(
      "INVALID_PROJECT_NAME",
      "Project name must be a non-empty string.",
      400,
    );
  }

  const { projectId } = await context.params;
  const ownershipError = await assertOwner(projectId, userId);

  if (ownershipError) {
    return ownershipError;
  }

  try {
    const project = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name,
      },
      select: projectResponseSelect,
    });

    return Response.json({ project });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return errorResponse("PROJECT_NOT_FOUND", "Project not found.", 404);
    }

    throw error;
  }
}

export async function DELETE(_request: Request, context: ProjectRouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse(
      "UNAUTHENTICATED",
      "Authentication is required.",
      401,
    );
  }

  const { projectId } = await context.params;
  const ownershipError = await assertOwner(projectId, userId);

  if (ownershipError) {
    return ownershipError;
  }

  try {
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return errorResponse("PROJECT_NOT_FOUND", "Project not found.", 404);
    }

    throw error;
  }

  return Response.json({ projectId });
}
