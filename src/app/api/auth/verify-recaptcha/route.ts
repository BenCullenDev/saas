import { NextResponse } from "next/server";
import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
import { emailLimiter, getClientIP } from "@/lib/rate-limit";

// Initialize the client with credentials
const client = new RecaptchaEnterpriseServiceClient({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    project_id: process.env.GOOGLE_CLOUD_PROJECT_ID,
  },
});

export async function POST(request: Request) {
  try {
    // Get client IP for rate limiting
    const ip = getClientIP(request);
    
    // Check rate limit
    const { success, limit, reset, remaining } = await emailLimiter.limit(ip);
    
    // If rate limit exceeded, return error
    if (!success) {
      return NextResponse.json(
        { 
          error: "Too many attempts. Please try again later.",
          reset: reset
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString()
          }
        }
      );
    }

    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 400 }
      );
    }

    // Create assessment request
    const projectPath = client.projectPath(process.env.GOOGLE_CLOUD_PROJECT_ID!);
    const assessment = {
      event: {
        token,
        siteKey: process.env.RECAPTCHA_SITE_KEY,
      },
    };

    // Create assessment
    const [response] = await client.createAssessment({
      parent: projectPath,
      assessment,
    });

    // Check if the token is valid
    if (!response.tokenProperties?.valid) {
      return NextResponse.json(
        { error: "Invalid reCAPTCHA token" },
        { status: 400 }
      );
    }

    // Check the risk score (0.0 to 1.0, where 1.0 is very likely a good interaction)
    if (response.riskAnalysis?.score && response.riskAnalysis.score < 0.5) {
      return NextResponse.json(
        { error: "reCAPTCHA verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 