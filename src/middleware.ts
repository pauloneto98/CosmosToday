import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    const authObj = (await auth()) as any;
    if (typeof authObj.protect === "function") {
      await authObj.protect();
    }
  }
});

export const config = {
  matcher: [
    // Ignorar arquivos estáticos e internos do Next.js
    "/((?!_next|[^?]*\\.(?:html|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Executar sempre para rotas de API
    "/(api|trpc)(.*)",
  ],
};
