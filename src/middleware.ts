import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequestWithAuth } from "next-auth/middleware";

export async function middleware(request: NextRequestWithAuth) {
  const token = await getToken({ req: request });
  
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