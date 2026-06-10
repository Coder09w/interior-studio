/**
 * Analytics event tracking for Instod.
 *
 * Only 6 custom events — keep analytics minimal and meaningful.
 * All events go through this single module so we can audit,
 * throttle, or disable them from one place.
 */
import { posthog, isInitialized } from './posthog';

function capture(eventName: string, properties?: Record<string, string | number | boolean>) {
  if (!isInitialized) return;
  try {
    posthog.capture(eventName, properties);
  } catch (err) {
    console.warn(`[Analytics] Failed to capture ${eventName}:`, err);
  }
}

// ── Event: user_signed_up ──
// Fired after successful registration (client-side, after API confirms)
export function trackSignUp(properties: { method: string; email_domain: string }) {
  capture('user_signed_up', properties);
}

// ── Event: project_created ──
// Fired after a new project is created (client-side, after API confirms)
export function trackProjectCreated(properties: { project_id: string; project_name: string }) {
  capture('project_created', properties);
}

// ── Event: room_created ──
// Fired after a new room is added to a project
export function trackRoomCreated(properties: { room_name: string; room_type: string; project_id?: string }) {
  capture('room_created', properties);
}

// ── Event: furniture_added ──
// Fired when a furniture item is placed in the editor
export function trackFurnitureAdded(properties: {
  furniture_type: string;
  material_type: string;
  total_items: number;
}) {
  capture('furniture_added', properties);
}

// ── Event: design_saved ──
// Fired when a user explicitly saves (not auto-saves)
export function trackDesignSaved(properties: {
  room_id: string;
  item_count: number;
  has_cloud_save: boolean;
}) {
  capture('design_saved', properties);
}

// ── Event: project_opened ──
// Fired when a user opens a project from the dashboard
export function trackProjectOpened(properties: {
  project_id: string;
  project_name: string;
  room_count: number;
}) {
  capture('project_opened', properties);
}
