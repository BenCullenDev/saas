import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { getUsers } from "./actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { redirect } from "next/navigation";
import { userRole, users as usersTable } from "@/lib/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  
  console.log("Session:", session);
  console.log("Expected role:", userRole.ADMIN);
  console.log("User role:", session?.user?.role);

  // Direct database check
  if (session?.user?.id) {
    const [dbUser] = await db.select().from(usersTable).where(eq(usersTable.id, session.user.id));
    console.log("Database user:", dbUser);
  }
  
  if (!session?.user?.role || session.user.role !== userRole.ADMIN) {
    console.log("Redirecting - not admin");
    redirect("/");
  }

  const users = await getUsers();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <DataTable columns={columns} data={users} />
    </div>
  );
} 