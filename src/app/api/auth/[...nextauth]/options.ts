import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";
import type { NextAuthOptions } from "next-auth";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest: async ({ identifier, url }) => {
        const code = url.split("token=")[1].split("&")[0];
        
        try {
          await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: identifier,
            subject: "Your verification code",
            html: `
              <div>
                <h1>Your verification code</h1>
                <p>Your verification code is: <strong>${code}</strong></p>
                <p>Or click the link below to verify your email:</p>
                <a href="${url}">Verify Email</a>
              </div>
            `,
          });
        } catch (error) {
          console.error("Failed to send verification email:", error);
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === "development",
}; 