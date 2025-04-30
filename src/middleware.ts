import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequestWithAuth } from "next-auth/middleware";

export async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production"
  });

  // Debug log in development
  if (process.env.NODE_ENV !== "production") {
    console.log("Middleware token check:", { 
      hasToken: !!token,
      path: request.nextUrl.pathname 
    });
  }
  
  if (!token) {
    const url = new URL("/auth/signin", request.url);
    url.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/profile",
    "/dashboard/:path*",
    // Add other protected routes here
  ],
}; 