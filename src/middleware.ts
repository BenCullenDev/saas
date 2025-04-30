import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
      verifyRequest: "/auth/verify",
    },
  }
);

export const config = {
  matcher: [
    "/profile",
    "/dashboard/:path*",
    // Add other protected routes here
  ],
}; 