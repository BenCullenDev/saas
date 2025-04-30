import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    authorized: ({ token }) => {
      if (token) return true;
      return false;
    },
  },
});

export const config = {
  matcher: [
    "/profile",
    "/dashboard/:path*",
    // Add other protected routes here
  ],
}; 