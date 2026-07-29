import "server-only";

import { projectResponseSelect } from "@/lib/project-api";
import { prisma } from "@/lib/prisma";
import { type EditorProject, type EditorProjectLists } from "@/types/project";

interface ProjectRecord {
  id: string;
  name: string;
  updatedAt: Date;
}

interface ProjectListInput {
  emailAddresses: string[];
  userId: string;
}

export async function getOwnedProjects(userId: string) {
  return prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: projectResponseSelect,
  });
}

function formatUpdatedAt(updatedAt: Date) {
  const elapsedMs = Date.now() - updatedAt.getTime();
  const elapsedDays = Math.floor(elapsedMs / 86_400_000);

  if (elapsedDays <= 0) {
    return "Updated today";
  }

  if (elapsedDays === 1) {
    return "Updated yesterday";
  }

  return `Updated ${updatedAt.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
  })}`;
}

function toEditorProject(
  project: ProjectRecord,
  role: EditorProject["role"],
): EditorProject {
  return {
    id: project.id,
    name: project.name,
    role,
    updatedAt: formatUpdatedAt(project.updatedAt),
  };
}

export async function getEditorProjectLists({
  emailAddresses,
  userId,
}: ProjectListInput): Promise<EditorProjectLists> {
  const sharedProjectQuery =
    emailAddresses.length > 0
      ? prisma.project.findMany({
          where: {
            ownerId: {
              not: userId,
            },
            collaborators: {
              some: {
                email: {
                  in: emailAddresses,
                },
              },
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
          select: {
            id: true,
            name: true,
            updatedAt: true,
          },
        })
      : Promise.resolve([]);

  const [ownedProjects, sharedProjects] = await Promise.all([
    getOwnedProjects(userId),
    sharedProjectQuery,
  ]);

  return {
    ownedProjects: ownedProjects.map((project) =>
      toEditorProject(project, "owner"),
    ),
    sharedProjects: sharedProjects.map((project) =>
      toEditorProject(project, "collaborator"),
    ),
  };
}
