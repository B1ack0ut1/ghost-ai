import "server-only";

import { Liveblocks } from "@liveblocks/node";

const cursorColorPalette = [
  "#00c8d4",
  "#a855f7",
  "#ff9f43",
  "#22c55e",
  "#ec4899",
  "#3b82f6",
] as const;

let liveblocksClient: Liveblocks | undefined;

export function getCursorColor(userId: string) {
  let hash = 0;

  for (let index = 0; index < userId.length; index += 1) {
    hash = (hash * 31 + userId.charCodeAt(index)) >>> 0;
  }

  return cursorColorPalette[hash % cursorColorPalette.length];
}

export function getLiveblocksClient() {
  if (liveblocksClient) {
    return liveblocksClient;
  }

  const secret = process.env.LIVEBLOCKS_SECRET_KEY;

  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not configured.");
  }

  liveblocksClient = new Liveblocks({ secret });

  return liveblocksClient;
}
