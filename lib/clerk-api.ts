import "server-only";

const CLERK_API_TIMEOUT_MS = 5_000;

export function getSignInUrl() {
  return process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
}

export class ClerkApiTimeoutError extends Error {
  constructor() {
    super(`Clerk Backend API request exceeded ${CLERK_API_TIMEOUT_MS}ms.`);
    this.name = "ClerkApiTimeoutError";
  }
}

export async function withClerkApiTimeout<T>(
  request: Promise<T>,
): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  try {
    return await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new ClerkApiTimeoutError()), CLERK_API_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timeout !== undefined) {
      clearTimeout(timeout);
    }
  }
}
