"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: "/auth/signin"
    });
    router.push("/auth/signin");
  };

  return (
    <Button 
      variant="outline" 
      onClick={handleSignOut}
      className="w-full"
    >
      Sign Out
    </Button>
  );
} 