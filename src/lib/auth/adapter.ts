import { db } from "@/lib/db";
import { users, userRole, UserRole } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { Adapter, AdapterUser } from "@auth/core/adapters";
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
    
    const createdUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, user.email),
    });
    
    return createdUser as CustomAdapterUser;
  },
  getUserByEmail: async (email: string) => {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    
    if (!result) return null;
    
    return {
      ...result,
      firstName: result.firstName || null,
      lastName: result.lastName || null,
      name: result.firstName && result.lastName 
        ? `${result.firstName} ${result.lastName}`
        : result.firstName || result.lastName || null,
    } as CustomAdapterUser;
  },
  
  updateUser: async (user: Partial<AdapterUser> & { id: string }) => {
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
    });

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
      .where(eq(users.id, user.id))
      .execute();

    const updated = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, user.id),
    });
    return updated as CustomAdapterUser;
  },
} satisfies Adapter; 