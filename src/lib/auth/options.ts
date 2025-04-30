import { NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { customAdapter } from "./adapter";

export const authOptions: NextAuthOptions = {
  adapter: customAdapter,
  session: {
    strategy: "jwt",
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
    jwt: async ({ token, user, trigger, session }) => {
      if (user) {
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
      }
      // Handle updates from client
      if (trigger === "update" && session) {
        token.firstName = session.user.firstName;
        token.lastName = session.user.lastName;
        token.name = session.user.name;
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.name = token.name as string | undefined;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
}; 