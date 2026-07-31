import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const signInUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL ?? "/sign-in";
const signUpUrl = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL ?? "/sign-up";

function routePathFromEnv(value: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  try {
    const url = new URL(value);
    return url.pathname;
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}

const signInPath = routePathFromEnv(signInUrl, "/sign-in");
const signUpPath = routePathFromEnv(signUpUrl, "/sign-up");

const isPublicRoute = createRouteMatcher([
  `${signInPath}(.*)`,
  `${signUpPath}(.*)`,
]);
const isRouteHandledApi = createRouteMatcher([
  "/api/liveblocks-auth",
  "/api/projects(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (request.nextUrl.pathname === "/") {
    const { userId } = await auth();
    const redirectUrl = userId ? "/editor" : signInUrl;

    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  if (!isPublicRoute(request) && !isRouteHandledApi(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
