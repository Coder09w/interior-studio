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
     * Protected routes:
     * - /dashboard
     * - /editor
     * - /profile
     * - /onboarding
     * - /api/designs
     * - /api/projects
     * - /api/rooms
     *
     * Public routes (NOT matched):
     * - / (home)
     * - /auth/* (login, register, etc.)
     * - /pricing
     * - /view/*
     * - /api/auth/* (next-auth routes)
     */
    "/dashboard/:path*",
    "/editor/:path*",
    "/profile/:path*",
    "/onboarding/:path*",
    "/api/designs/:path*",
    "/api/projects/:path*",
    "/api/rooms/:path*",
  ],
};
