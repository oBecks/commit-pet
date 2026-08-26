import { clerkMiddleware } from "@clerk/nextjs/server";

// Only wires up Clerk's auth context (so `auth()` works in Server
// Components/Route Handlers below) — route protection happens as close to
// the data as possible instead (app/dashboard/layout.tsx), per Clerk's
// current guidance and to sidestep a known auth.protect()-in-proxy redirect
// bug on Next.js 16 (https://github.com/clerk/javascript/issues/8302).
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
