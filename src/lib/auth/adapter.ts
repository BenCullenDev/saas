import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { users, userRole } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Adapter, AdapterUser } from "next-auth/adapters";

const ADMIN_EMAIL = "benjaminjcullen1@gmail.com";

const baseAdapter = DrizzleAdapter(db) as Adapter;

export const customAdapter: Adapter = {
  ...baseAdapter,
  createUser: async (data) => {
    const role = data.email === ADMIN_EMAIL ? userRole.ADMIN : userRole.USER;
    const result = await db.insert(users).values({
      ...data,
      role,
    });
    
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, data.email),
    });
    
    return user as AdapterUser;
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
    };
  },
  
  // Override the update user method to handle name fields
  updateUser: async (user: Partial<AdapterUser> & { id: string }) => {
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
    return updated as AdapterUser;
  },
} satisfies Adapter; 