export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#F5F0E8" }}
    >
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse"
          style={{ background: "#C17F4E" }}
        >
          <svg
            className="w-6 h-6 text-white animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "#6B6358" }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}
