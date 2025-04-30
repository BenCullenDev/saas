import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token,
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
});

export const config = {
  matcher: [
    "/profile",
    "/dashboard/:path*",
    // Add other protected routes here
  ],
}; 