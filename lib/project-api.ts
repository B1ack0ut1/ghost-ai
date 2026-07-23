import "server-only";

export const DEFAULT_PROJECT_NAME = "Untitled Project";

export const projectResponseSelect = {
  id: true,
  ownerId: true,
  name: true,
  description: true,
  status: true,
  canvasJsonPath: true,
  createdAt: true,
  updatedAt: true,
} as const;

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export function errorResponse(
  code: string,
  message: string,
  status: number,
) {
  return Response.json(
    {
      error: {
        code,
        message,
      },
    } satisfies ApiError,
    { status },
  );
}

export async function readJsonObject(request: Request) {
  const text = await request.text();

  if (text.trim().length === 0) {
    return {};
  }

  try {
    const body: unknown = JSON.parse(text);

    if (body === null || typeof body !== "object" || Array.isArray(body)) {
      return null;
    }

    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function parseCreateProjectName(body: Record<string, unknown>) {
  const name = body.name;

  if (name === undefined || name === null) {
    return DEFAULT_PROJECT_NAME;
  }

  if (typeof name !== "string") {
    return null;
  }

  const trimmedName = name.trim();

  return trimmedName.length > 0 ? trimmedName : DEFAULT_PROJECT_NAME;
}

export function parseCreateProjectId(body: Record<string, unknown>) {
  const id = body.id;

  if (id === undefined || id === null) {
    return undefined;
  }

  if (typeof id !== "string") {
    return null;
  }

  const trimmedId = id.trim();

  if (
    trimmedId.length < 3 ||
    trimmedId.length > 96 ||
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedId)
  ) {
    return null;
  }

  return trimmedId;
}

export function parseRenameProjectName(body: Record<string, unknown>) {
  const name = body.name;

  if (typeof name !== "string") {
    return null;
  }

  const trimmedName = name.trim();

  return trimmedName.length > 0 ? trimmedName : null;
}
