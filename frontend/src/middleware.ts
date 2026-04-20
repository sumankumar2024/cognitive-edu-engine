import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// We leave the root ("/") public so unauthenticated users can see the Teaser Chatbot
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)']); 

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};