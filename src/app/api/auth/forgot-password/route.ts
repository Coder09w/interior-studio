import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit password reset requests (prevent email bombing)
  const rateLimitResponse = applyRateLimit(req, RATE_LIMITS.passwordReset);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { email } = body;

    // Validate email presence
    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Look up user by email — but don't reveal if they exist
    const user = await db.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate a secure random token
      const token = crypto.randomUUID();

      // Set expiry to 1 hour from now
      const expires = new Date(Date.now() + 3600 * 1000);

      // Delete any existing reset tokens for this email first
      await db.verificationToken.deleteMany({
        where: { identifier: email },
      });

      // Store the new token
      await db.verificationToken.create({
        data: {
          identifier: email,
          token,
          expires,
        },
      });

      // In production, send an email. For now, log the reset URL.
      const resetUrl = `/auth/reset-password?token=${token}`;
      console.log(`[DEV] Password reset URL: ${resetUrl}`);
    }

    // Always return the same success message regardless of whether user exists
    return NextResponse.json({
      message: "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
