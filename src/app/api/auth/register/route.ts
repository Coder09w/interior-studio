import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { applyRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { isBetaMode } from "@/lib/plans";

export async function POST(req: NextRequest) {
  // Rate limit registration attempts
  const rateLimitResponse = applyRateLimit(req, RATE_LIMITS.register);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
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

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password (lower rounds for dev, production should use 12+)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    // During beta, new users get Pro plan automatically
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        ...(isBetaMode() ? { plan: 'pro' } : {}),
      },
    });

    // Return user info without password
    return NextResponse.json(
      {
        id: user.id,
        email: user.email,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
