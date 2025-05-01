import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { customAdapter } from "@/lib/auth/adapter";
import { type UserRole } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        ...(process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_DOMAIN
          ? { domain: process.env.NEXT_PUBLIC_DOMAIN.replace(/^https?:\/\//, '') }
          : {})
      }
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: process.env.NODE_ENV === 'production',
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        console.log("JWT token updated with user ID:", token.id);
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
        
        // Fetch the latest role from the database
        const [dbUser] = await db.select().from(users).where(eq(users.id, token.sub));
        if (dbUser) {
          session.user.role = dbUser.role as UserRole;
          console.log("Session updated with role from DB:", session.user.role);
        } else {
          console.log("No user found in database for ID:", token.sub);
        }
      }
      return session;
    },
  },
}; 