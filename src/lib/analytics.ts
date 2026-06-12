/**
 * Instod Analytics — Custom Event Tracking
 *
 * Only 6 custom events. Keep analytics minimal and meaningful.
 * All events go through this single module for auditability.
 */
import posthog from 'posthog-js'

function capture(eventName: string, properties?: Record<string, string | number | boolean>) {
  try {
    posthog.capture(eventName, properties)
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[Analytics] Failed to capture ${eventName}:`, err)
    }
  }
}

// ── 1. user_signed_up ──
// Fired after successful registration
export function trackSignUp(properties: { method: string; email_domain: string }) {
  capture('user_signed_up', properties)
}

// ── 2. project_created ──
// Fired after a new project is created
export function trackProjectCreated(properties: { project_id: string; project_name: string }) {
  capture('project_created', properties)
}

// ── 3. room_created ──
// Fired after a new room is added to a project
export function trackRoomCreated(properties: { room_name: string; room_type: string; project_id?: string }) {
  capture('room_created', properties)
}

// ── 4. furniture_added ──
// Fired when a furniture item is placed in the editor
export function trackFurnitureAdded(properties: {
  furniture_type: string
  material_type: string
  total_items: number
}) {
  capture('furniture_added', properties)
}

// ── 5. design_saved ──
// Fired when a user explicitly saves (not auto-saves)
export function trackDesignSaved(properties: {
  room_id: string
  item_count: number
  has_cloud_save: boolean
}) {
  capture('design_saved', properties)
}

// ── 6. project_opened ──
// Fired when a user opens a project from the dashboard
export function trackProjectOpened(properties: {
  project_id: string
  project_name: string
  room_count: number
}) {
  capture('project_opened', properties)
}
