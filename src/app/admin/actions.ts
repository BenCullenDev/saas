"use server";

import { db } from "@/lib/db";
import { users, userRole, UserRole } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
  return await db.select().from(users);
}

export async function updateRole(userId: string, newRole: UserRole) {
  if (!Object.values(userRole).includes(newRole)) {
    throw new Error("Invalid role");
  }

  await db
    .update(users)
    .set({ role: newRole })
    .where(eq(users.id, userId));

  return { success: true };
}

export async function deleteUser(userId: string) {
  await db.delete(users).where(eq(users.id, userId));
  return { success: true };
} 