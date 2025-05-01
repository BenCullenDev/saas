/* eslint-disable @typescript-eslint/no-unused-vars */
import { db } from "@/lib/db";
import { users, userRole, UserRole, verificationTokens } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { Adapter, AdapterUser, AdapterAccount, AdapterSession, VerificationToken } from "@auth/core/adapters";
import crypto from "crypto";

const ADMIN_EMAIL = "benjaminjcullen1@gmail.com";

interface CustomAdapterUser extends AdapterUser {
  role: UserRole;
  firstName?: string | null;
  lastName?: string | null;
}

export const customAdapter = {
  createUser: async (user: AdapterUser) => {
    const role = user.email === ADMIN_EMAIL ? userRole.ADMIN : userRole.USER;
    const id = crypto.randomUUID();
    await db.insert(users).values({
      ...user,
      id,
      role,
    });
    
    const [createdUser] = await db.select().from(users).where(eq(users.email, user.email));
    console.log("Created user:", createdUser);
    return createdUser as CustomAdapterUser;
  },
  getUser: async (id: string) => {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (!user) return null;
    console.log("Get user:", user);
    return user as CustomAdapterUser;
  },
  getUserByEmail: async (email: string) => {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    if (!result) return null;
    
    const user = {
      ...result,
      firstName: result.firstName || null,
      lastName: result.lastName || null,
      name: result.firstName && result.lastName 
        ? `${result.firstName} ${result.lastName}`
        : result.firstName || result.lastName || null,
      role: result.role || userRole.USER,
    };
    console.log("Get user by email:", user);
    return user as CustomAdapterUser;
  },
  getUserByAccount: async ({ providerAccountId: _providerAccountId, provider: _provider }: { providerAccountId: string; provider: string; }) => {
    return null;
  },
  updateUser: async (user: Partial<AdapterUser> & { id: string }) => {
    const [existingUser] = await db.select().from(users).where(eq(users.id, user.id));
    if (!existingUser) throw new Error("User not found");

    const name = existingUser.firstName && existingUser.lastName 
      ? `${existingUser.firstName} ${existingUser.lastName}`
      : existingUser.firstName || existingUser.lastName || null;

    await db
      .update(users)
      .set({
        ...user,
        name,
      })
      .where(eq(users.id, user.id));

    const [updated] = await db.select().from(users).where(eq(users.id, user.id));
    console.log("Updated user:", updated);
    return updated as CustomAdapterUser;
  },
  deleteUser: async (userId: string) => {
    await db.delete(users).where(eq(users.id, userId));
  },
  linkAccount: async (_account: AdapterAccount) => {
    return _account;
  },
  unlinkAccount: async (_account: Pick<AdapterAccount, "provider" | "providerAccountId">) => {
    return;
  },
  createSession: async (session: AdapterSession) => {
    return session;
  },
  getSessionAndUser: async (_sessionToken: string) => {
    return null;
  },
  updateSession: async (_session: Partial<AdapterSession> & Pick<AdapterSession, "sessionToken">) => {
    return null;
  },
  deleteSession: async (_sessionToken: string) => {
    return;
  },
  createVerificationToken: async (token: VerificationToken) => {
    await db.insert(verificationTokens).values(token);
    return token;
  },
  useVerificationToken: async ({ identifier, token }: { identifier: string; token: string; }) => {
    const [result] = await db.select().from(verificationTokens).where(
      and(
        eq(verificationTokens.identifier, identifier),
        eq(verificationTokens.token, token)
      )
    );
    if (!result) return null;
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, identifier));
    return result;
  },
} satisfies Adapter; 