import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { customAdapter } from "@/lib/auth/adapter";

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  session: {
    strategy: "jwt",
  },
  pages: {
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
    session: ({ session, token }) => {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
}; 