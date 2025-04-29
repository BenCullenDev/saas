import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "./api/auth/[...nextauth]/options";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  // Redirect to signin if not authenticated
  if (!session) {
    redirect("/auth/signin");
  }
  
  // Display user email if authenticated
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to TechCMS</h1>
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <p className="text-gray-700">
          <span className="font-medium">Email:</span> {session.user?.email}
        </p>
        {session.user?.name && (
          <p className="text-gray-700 mt-2">
            <span className="font-medium">Name:</span> {session.user.name}
          </p>
        )}
      </div>
    </div>
  );
}
