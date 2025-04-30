import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/options";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Redirect to signin if not authenticated
  if (!session) {
    redirect("/auth/signin");
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Home</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user?.name || session.user?.email}
        </p>
      </div>
    </div>
  );
}
