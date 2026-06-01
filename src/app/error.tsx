"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(220,38,38,0.1)" }}
        >
          <svg
            className="w-10 h-10"
            style={{ color: "#DC2626" }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#2D2D2D" }}
        >
          Something Went Wrong
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6B6358" }}>
          An unexpected error occurred. This has been logged and our team will
          investigate. You can try again or go back to the homepage.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90 cursor-pointer"
            style={{ background: "#C17F4E" }}
          >
            Try Again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-sm border transition-all hover:shadow-sm"
            style={{ borderColor: "#E2DDD4", color: "#2D2D2D" }}
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}
