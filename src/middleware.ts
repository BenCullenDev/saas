import { NextResponse } from "next/server";

export async function middleware() {
  const response = NextResponse.next();
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
}; 