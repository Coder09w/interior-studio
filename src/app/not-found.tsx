import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <div className="text-center max-w-md">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: "rgba(193,127,78,0.12)" }}
        >
          <span className="text-4xl font-bold" style={{ color: "#C17F4E" }}>
            404
          </span>
        </div>
        <h1
          className="text-2xl font-bold mb-3"
          style={{ fontFamily: "'Outfit', sans-serif", color: "#2D2D2D" }}
        >
          Page Not Found
        </h1>
        <p className="text-sm mb-8" style={{ color: "#6B6358" }}>
          The page you are looking for does not exist or has been moved. Try
          heading back to the homepage or opening the editor to start designing.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-medium text-sm transition-all hover:opacity-90"
            style={{ background: "#C17F4E" }}
          >
            Go Home
          </Link>
          <Link
            href="/editor"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-medium text-sm border transition-all hover:shadow-sm"
            style={{ borderColor: "#E2DDD4", color: "#2D2D2D" }}
          >
            Open Editor
          </Link>
        </div>
      </div>
    </div>
  );
}
