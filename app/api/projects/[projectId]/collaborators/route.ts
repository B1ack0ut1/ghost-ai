import { auth } from "@clerk/nextjs/server";

import { Prisma } from "@/app/generated/prisma/client";
import {
  getProjectCollaborators,
  parseCollaboratorEmail,
} from "@/lib/collaborators";
import { errorResponse, readJsonObject } from "@/lib/project-api";
import {
  getAccessibleProject,
  getCurrentProjectIdentity,
} from "@/lib/project-access";
import { prisma } from "@/lib/prisma";

interface CollaboratorRouteContext {
  params: Promise<{
    projectId: string;
  }>;
}

async function getProjectForCurrentUser(projectId: string) {
  const identity = await getCurrentProjectIdentity();

  if (!identity) {
    return { error: errorResponse("UNAUTHENTICATED", "Authentication is required.", 401) };
  }

  const project = await getAccessibleProject(projectId, identity);

  if (!project) {
    return { error: errorResponse("PROJECT_NOT_FOUND", "Project not found.", 404) };
  }

  return { project };
}

async function assertOwner(projectId: string) {
  const result = await getProjectForCurrentUser(projectId);

  if ("error" in result) {
    return result;
  }

  if (!result.project.canManageAccess) {
    return {
      error: errorResponse(
        "FORBIDDEN",
        "Only the project owner can manage collaborators.",
        403,
      ),
    };
  }

  return result;
}

export async function GET(_request: Request, context: CollaboratorRouteContext) {
  const { projectId } = await context.params;
  const result = await getProjectForCurrentUser(projectId);

  if ("error" in result) {
    return result.error;
  }

  const collaborators = await getProjectCollaborators(projectId);

  return Response.json({ collaborators });
}

export async function POST(request: Request, context: CollaboratorRouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
  }

  const body = await readJsonObject(request);

  if (!body) {
    return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);
  }

  const email = parseCollaboratorEmail(body);

  if (!email) {
    return errorResponse("INVALID_EMAIL", "Enter a valid email address.", 400);
  }

  const { projectId } = await context.params;
  const result = await assertOwner(projectId);

  if ("error" in result) {
    return result.error;
  }

  try {
    await prisma.projectCollaborator.create({
      data: { email, projectId },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        "COLLABORATOR_ALREADY_EXISTS",
        "This email already has access to the project.",
        409,
      );
    }

    throw error;
  }

  const collaborators = await getProjectCollaborators(projectId);

  return Response.json({ collaborators }, { status: 201 });
}

export async function DELETE(request: Request, context: CollaboratorRouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse("UNAUTHENTICATED", "Authentication is required.", 401);
  }

  const body = await readJsonObject(request);

  if (!body) {
    return errorResponse("INVALID_REQUEST", "Request body must be a JSON object.", 400);
  }

  const email = parseCollaboratorEmail(body);

  if (!email) {
    return errorResponse("INVALID_EMAIL", "Enter a valid email address.", 400);
  }

  const { projectId } = await context.params;
  const result = await assertOwner(projectId);

  if ("error" in result) {
    return result.error;
  }

  try {
    await prisma.projectCollaborator.delete({
      where: {
        projectId_email: { email, projectId },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return errorResponse("COLLABORATOR_NOT_FOUND", "Collaborator not found.", 404);
    }

    throw error;
  }

  const collaborators = await getProjectCollaborators(projectId);

  return Response.json({ collaborators });
}
