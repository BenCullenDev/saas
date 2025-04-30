import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
  }

  interface Session {
    user: User;
  }
} 