"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/schema";

export async function getUsers() {
  const allUsers = await db.select().from(users);
  return allUsers;
} 