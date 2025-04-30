import { UserRole } from "@/lib/schema";

declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    emailVerified?: Date | null;
    image?: string | null;
    role: UserRole;
  }

  interface Session {
    user: User;
  }
} 