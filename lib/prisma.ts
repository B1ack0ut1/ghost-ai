import "server-only";

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaConnectionSignature?: string;
};

interface PrismaPostgresApiKey {
  databaseUrl?: unknown;
}

function readPrismaPostgresDirectUrl(databaseUrl: string) {
  if (!databaseUrl.startsWith("prisma+postgres://")) {
    return null;
  }

  try {
    const apiKey = new URL(databaseUrl).searchParams.get("api_key");

    if (!apiKey) {
      return null;
    }

    const decoded = JSON.parse(
      Buffer.from(apiKey, "base64url").toString("utf8"),
    ) as PrismaPostgresApiKey;

    return typeof decoded.databaseUrl === "string"
      ? decoded.databaseUrl
      : null;
  } catch {
    return null;
  }
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  return databaseUrl;
}

function createPrismaClient() {
  const { databaseUrl, directDatabaseUrl } = getPrismaConnectionConfig();

  if (directDatabaseUrl) {
    return new PrismaClient({
      adapter: new PrismaPg({
        connectionString: directDatabaseUrl,
      }),
    });
  }

  if (databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    });
  }

  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });
}

function getPrismaConnectionConfig() {
  const databaseUrl = getDatabaseUrl();
  const directDatabaseUrl = readPrismaPostgresDirectUrl(databaseUrl);

  return {
    databaseUrl,
    directDatabaseUrl,
    signature: directDatabaseUrl
      ? `adapter-pg:${directDatabaseUrl}`
      : databaseUrl.startsWith("prisma+postgres://")
        ? `accelerate:${databaseUrl}`
        : `adapter-pg:${databaseUrl}`,
  };
}

const prismaConnection = getPrismaConnectionConfig();

export const prisma =
  globalForPrisma.prismaConnectionSignature === prismaConnection.signature
    ? (globalForPrisma.prisma ?? createPrismaClient())
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.prismaConnectionSignature = prismaConnection.signature;
}
