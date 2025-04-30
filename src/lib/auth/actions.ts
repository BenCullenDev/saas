"use server";

import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { authOptions } from "./options";

export async function updateUser(data: { firstName?: string; lastName?: string }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.error("No user ID found in session:", session);
    return { success: false, error: "Not authenticated" };
  }

  try {
    console.log("Updating user with ID:", session.user.id);
    console.log("Update data:", data);

    const name = data.firstName && data.lastName 
      ? `${data.firstName} ${data.lastName}`
      : data.firstName || data.lastName || null;

    // First check if the user exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    });

    if (!existingUser) {
      console.error("User not found:", session.user.id);
      return { success: false, error: "User not found" };
    }

    const result = await db
      .update(users)
      .set({
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        name: name,
      })
      .where(eq(users.id, session.user.id))
      .execute();

    console.log("Update result:", result);

    // Verify the update was successful
    const updatedUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.id, session.user.id),
    });

    if (!updatedUser) {
      console.error("Failed to verify update - user not found after update");
      return { success: false, error: "Failed to verify update" };
    }

    if (updatedUser.firstName !== data.firstName || updatedUser.lastName !== data.lastName) {
      console.error("Update verification failed - values don't match", {
        expected: data,
        actual: updatedUser,
      });
      return { success: false, error: "Update verification failed" };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to update user:", error);
    return { success: false, error: "Failed to update profile" };
  }
} 