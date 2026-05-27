import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/auth/login",
    },
  }
);

export const config = {
  matcher: [
    /*
     * Protected routes (require authentication):
     * - /dashboard
     * - /profile
     * - /onboarding
     * - /api/projects (read/write user data)
     * - /api/rooms (read/write user data)
     * - /api/user (profile management)
     *
     * Public routes (NOT matched — accessible without login):
     * - / (home / landing page)
     * - /editor (free 3D editor, no auth required)
     * - /auth/* (login, register, etc.)
     * - /pricing
     * - /view/*
     * - /api/auth/* (next-auth routes)
     */
    "/dashboard/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/api/projects/:path*",
    "/api/rooms/:path*",
    "/api/user/:path*",
  ],
};
