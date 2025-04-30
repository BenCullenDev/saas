import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, userRole, UserRole } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Adapter, AdapterUser } from "next-auth/adapters";
import crypto from "crypto";

const ADMIN_EMAIL = "benjaminjcullen1@gmail.com";

interface CustomAdapterUser extends AdapterUser {
  role: UserRole;
}

interface CreateUserData {
  email: string;
  [key: string]: unknown;
}

const baseAdapter = DrizzleAdapter(db) as Adapter;

export const customAdapter: Adapter = {
  ...baseAdapter,
  createUser: async (data: CreateUserData) => {
    const role = data.email === ADMIN_EMAIL ? userRole.ADMIN : userRole.USER;
    const id = crypto.randomUUID();
    await db.insert(users).values({
      ...data,
      id,
      role,
    });
    
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email),
    });
    
    return user as CustomAdapterUser;
  },
  getUserByEmail: async (email: string) => {
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, email),
    });
    
    if (!result) return null;
    
    return {
      ...result,
      // Ensure these fields are always present in the session
      firstName: result.firstName || null,
      lastName: result.lastName || null,
      name: result.firstName && result.lastName 
        ? `${result.firstName} ${result.lastName}`
        : result.firstName || result.lastName || null,
    } as CustomAdapterUser;
  },
  
  // Override the update user method to handle name fields
  updateUser: async (user: Partial<CustomAdapterUser> & { id: string }) => {
    const name = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.lastName || null;

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