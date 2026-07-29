import { auth } from "@clerk/nextjs/server";

import { Prisma } from "@/app/generated/prisma/client";
import {
  errorResponse,
  parseCreateProjectId,
  parseCreateProjectName,
  projectResponseSelect,
  readJsonObject,
} from "@/lib/project-api";
import { getOwnedProjects } from "@/lib/project-data";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return errorResponse(
      "UNAUTHENTICATED",
      "Authentication is required.",
      401,
    );
  }

  const projects = await getOwnedProjects(userId);

  return Response.json({ projects });
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

  if (!body) {
    return errorResponse(
      "INVALID_REQUEST",
      "Request body must be a JSON object.",
      400,
    );
  }

  const name = parseCreateProjectName(body);
  const projectId = parseCreateProjectId(body);

  if (!name) {
    return errorResponse(
      "INVALID_PROJECT_NAME",
      "Project name must be a string.",
      400,
    );
  }

  if (projectId === null) {
    return errorResponse(
      "INVALID_PROJECT_ID",
      "Project ID must be a lowercase room ID.",
      400,
    );
  }

  try {
    const project = await prisma.project.create({
      data: {
        ...(projectId ? { id: projectId } : {}),
        ownerId: userId,
        name,
      },
      select: projectResponseSelect,
    });

    return Response.json({ project }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return errorResponse(
        "PROJECT_ALREADY_EXISTS",
        "Project already exists.",
        409,
      );
    }

    throw error;
  }
}
