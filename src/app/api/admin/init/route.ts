import { db } from "@/lib/db";
import { users, userRole } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const ADMIN_EMAIL = "benjaminjcullen1@gmail.com";

export async function POST() {
  try {
    await db.update(users)
      .set({ role: userRole.ADMIN })
      .where(eq(users.email, ADMIN_EMAIL))
      .execute();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to initialize admin:', error);
    return NextResponse.json({ error: 'Failed to initialize admin' }, { status: 500 });
  }
} 