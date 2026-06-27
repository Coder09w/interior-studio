/**
 * Hail Mary — Image Library
 *
 * All images are REAL renders from the Instod 3D editor.
 * No AI-generated images. No stock photos.
 * These are the same WebP renders used on the homepage and case studies.
 */

export interface RoomImage {
  src: string;
  roomType: 'living' | 'bedroom' | 'kitchen' | 'dining' | 'bathroom' | 'office';
  label: string;
  mood: string;
  description: string;
}

export const ROOM_IMAGES: RoomImage[] = [
  {
    src: '/images/hero-living-v2.webp',
    roomType: 'living',
    label: 'Living Room — Hero',
    mood: 'Warm evening',
    description: 'A modern living room with a sectional sofa, coffee table, and warm ambient lighting. Designed for relaxation and social gatherings.',
  },
  {
    src: '/images/hero-bedroom-v2.webp',
    roomType: 'bedroom',
    label: 'Bedroom — Hero',
    mood: 'Calm morning',
    description: 'A compact bedroom with space-efficient furniture placement, soft natural light, and a minimalist aesthetic.',
  },
  {
    src: '/images/hero-kitchen-v2.webp',
    roomType: 'kitchen',
    label: 'Kitchen — Hero',
    mood: 'Bright daylight',
    description: 'A contemporary kitchen with island, cabinetry, and modern appliances. Clean lines and functional layout.',
  },
  {
    src: '/images/hero-dining-v2.webp',
    roomType: 'dining',
    label: 'Dining Room — Hero',
    mood: 'Intimate dinner',
    description: 'A dining space with table, chairs, and ambient pendant lighting. Designed for memorable meals and conversations.',
  },
  {
    src: '/images/hero-bathroom-v2.webp',
    roomType: 'bathroom',
    label: 'Bathroom — Hero',
    mood: 'Spa serene',
    description: 'A modern bathroom with vanity, mirror, and clean tile work. Spa-like atmosphere with soft lighting.',
  },
  {
    src: '/images/hero-office-v2.webp',
    roomType: 'office',
    label: 'Home Office — Hero',
    mood: 'Focused work',
    description: 'A functional home office with desk, shelving, and task lighting. Optimized for video calls and productivity.',
  },
  {
    src: '/images/gallery-living.webp',
    roomType: 'living',
    label: 'Living Room — Gallery',
    mood: 'Cozy afternoon',
    description: 'An alternate living room configuration with different furniture arrangement and color palette.',
  },
  {
    src: '/images/gallery-bedroom.webp',
    roomType: 'bedroom',
    label: 'Bedroom — Gallery',
    mood: 'Soft evening',
    description: 'A bedroom design variation showcasing different material finishes and lighting conditions.',
  },
  {
    src: '/images/gallery-kitchen.webp',
    roomType: 'kitchen',
    label: 'Kitchen — Gallery',
    mood: 'Clean modern',
    description: 'A kitchen design variation with alternative cabinetry and countertop materials.',
  },
  {
    src: '/images/gallery-dining.webp',
    roomType: 'dining',
    label: 'Dining Room — Gallery',
    mood: 'Warm gathering',
    description: 'A dining room variation with different table shape and seating arrangement.',
  },
  {
    src: '/images/gallery-bathroom.webp',
    roomType: 'bathroom',
    label: 'Bathroom — Gallery',
    mood: 'Fresh morning',
    description: 'A bathroom design variation with alternative vanity and fixture finishes.',
  },
  {
    src: '/images/gallery-office.webp',
    roomType: 'office',
    label: 'Home Office — Gallery',
    mood: 'Creative focus',
    description: 'A home office variation with different desk orientation and storage solutions.',
  },
];

/**
 * Post types supported by Hail Mary.
 * Each type has a distinct Instagram strategy and AI prompt.
 */
export type PostType =
  | 'showcase'
  | 'educational'
  | 'engagement'
  | 'behind-the-scenes'
  | 'reel-script';

export const POST_TYPES: { value: PostType; label: string; icon: string; description: string }[] = [
  {
    value: 'showcase',
    label: 'Showcase',
    icon: '✨',
    description: 'Show off a beautiful room design. Pure visual appeal.',
  },
  {
    value: 'educational',
    label: 'Educational',
    icon: '📚',
    description: 'Teach a design tip or principle. Value-first content.',
  },
  {
    value: 'engagement',
    label: 'Engagement',
    icon: '💬',
    description: 'Ask a question. Get comments. Boost reach.',
  },
  {
    value: 'behind-the-scenes',
    label: 'Behind the Scenes',
    icon: '🔧',
    description: 'Show how Instod works. Build product awareness.',
  },
  {
    value: 'reel-script',
    label: 'Reel Script',
    icon: '🎬',
    description: '15-30s video script with shot list and voiceover.',
  },
];

/**
 * Tone options for caption generation.
 */
export type Tone = 'professional' | 'casual' | 'inspirational' | 'playful';

export const TONES: { value: Tone; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'casual', label: 'Casual' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'playful', label: 'Playful' },
];
