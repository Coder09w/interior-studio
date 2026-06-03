// Root loading state removed — static pages (terms, privacy, contact, about)
// render server-side instantly and don't need a loading overlay.
// Editor pages have their own EditorLoader via /editor/loading.tsx.
// Other client pages (dashboard, profile, etc.) have their own loading.tsx.
export default function RootLoading() {
  return null;
}
