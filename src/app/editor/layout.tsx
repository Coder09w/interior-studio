/**
 * Editor Layout — Isolates the 3D editor from other pages.
 *
 * Why this exists:
 * - The EditorLoader (showing "Initializing 3D Engine") should ONLY appear
 *   on /editor and /editor/[projectId] routes.
 * - The root layout does NOT include EditorLoader, but this explicit layout
 *   provides a clear boundary so future changes to the root layout can't
 *   accidentally leak 3D-engine UI into static pages like /terms, /privacy.
 * - The editor/loading.tsx is scoped to this layout's route segment.
 */
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
