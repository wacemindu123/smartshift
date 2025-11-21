import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware((auth, request) => {
  const { userId } = auth();
  const isPublic = isPublicRoute(request);
  const isRootPath = request.nextUrl.pathname === '/';

  // If user is signed in and on root path, redirect to dashboard
  if (userId && isRootPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not signed in and trying to access protected route, redirect to sign in
  if (!userId && !isPublic && !isRootPath) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('redirect_url', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
