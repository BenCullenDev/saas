"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

declare global {
  interface Window {
    grecaptcha: {
      enterprise: {
        ready: (callback: () => void) => void;
        execute: (siteKey: string, options: { action: string }) => Promise<string>;
      };
    };
  }
}

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Effect to update retry countdown
  useEffect(() => {
    if (retryAfter === null) return;
    
    const timer = setInterval(() => {
      setRetryAfter(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [retryAfter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Execute reCAPTCHA
      const token = await window.grecaptcha.enterprise.execute(
        process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!,
        { action: "signin" }
      );

      // Verify reCAPTCHA token
      const response = await fetch("/api/auth/verify-recaptcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Handle rate limit error
        if (response.status === 429) {
          setRetryAfter(Math.ceil((data.reset - Date.now()) / 1000));
          throw new Error("Too many attempts. Please try again later.");
        }
        
        throw new Error(data.error || "reCAPTCHA verification failed");
      }

      // Proceed with sign in
      await signIn("email", { 
        email, 
        callbackUrl,
        redirect: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid w-full items-center gap-4">
        {error && (
          <div className="text-sm text-red-500">
            {error}
            {retryAfter && (
              <div className="mt-1">
                Try again in {retryAfter} seconds
              </div>
            )}
          </div>
        )}
        <div className="flex flex-col space-y-1.5">
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading || retryAfter !== null}
          />
        </div>
        <Button 
          type="submit" 
          disabled={isLoading || retryAfter !== null}
        >
          {isLoading ? "Sending..." : "Send Verification Code"}
        </Button>
      </div>
    </form>
  );
} 