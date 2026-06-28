/**
 * Hail Mary — Template Fallback System
 *
 * When the Z.AI chat API is unavailable, these templates generate
 * high-quality Instagram content using pre-written patterns with
 * variable substitution. This ensures Hail Mary ALWAYS works,
 * even if the AI service is down.
 *
 * Templates are written by a human (me) and follow proven Instagram
 * copywriting frameworks: hook → value → CTA → hashtags.
 */

import { RoomImage, PostType, Tone } from './hail-mary-images';

interface GenerateParams {
  image: RoomImage;
  postType: PostType;
  tone: Tone;
}

interface GeneratedContent {
  captions: string[];
  hashtags: string[];
  reelScript?: {
    hook: string;
    shots: { duration: string; visual: string; voiceover: string; textOverlay: string }[];
    music: string;
    caption: string;
  };
}

const ROOM_LABELS: Record<string, string> = {
  living: 'living room',
  bedroom: 'bedroom',
  kitchen: 'kitchen',
  dining: 'dining room',
  bathroom: 'bathroom',
  office: 'home office',
};

const HASHTAG_POOL: Record<string, string[]> = {
  living: ['#livingroomdesign', '#livingroomdecor', '#livingroominspo', '#interiordesign', '#homedecor', '#cozyhome', '#livingroomideas', '#modernliving', '#homeinspo', '#decorideas', '#interiorinspo', '#designinspiration', '#roommakeover', '#homedesign', '#decorating', '#interiorstyle', '#livingroom', '#sofastyle', '#coffeetable', '#warmvibes'],
  bedroom: ['#bedroomdesign', '#bedroomdecor', '#bedroominspo', '#cozybedroom', '#bedroomideas', '#interiordesign', '#homedecor', '#sleepsanctuary', '#bedroomstyle', '#minimalbedroom', '#bedroomgoals', '#homeinspo', '#decorideas', '#interiorinspo', '#designinspiration', '#roommakeover', '#homedesign', '#decorating', '#interiorstyle', '#bedrooms'],
  kitchen: ['#kitchendesign', '#kitchendecor', '#kitcheninspo', '#modernkitchen', '#kitchenideas', '#interiordesign', '#homedecor', '#kitchenstyle', '#kitchengoals', '#homeinspo', '#decorideas', '#interiorinspo', '#designinspiration', '#kitchenmakeover', '#homedesign', '#decorating', '#interiorstyle', '#kitchenremodel', '#cabinetry', '#countertops'],
  dining: ['#diningroom', '#diningroomdesign', '#diningroomdecor', '#dininginspo', '#diningroomideas', '#interiordesign', '#homedecor', '#diningstyle', '#entertaining', '#homeinspo', '#decorideas', '#interiorinspo', '#designinspiration', '#diningmakeover', '#homedesign', '#decorating', '#interiorstyle', '#diningtable', '#diningchairs', '#dinnervibes'],
  bathroom: ['#bathroomdesign', '#bathroomdecor', '#bathroominspo', '#modernbathroom', '#bathroomideas', '#interiordesign', '#homedecor', '#spabathroom', '#bathroomstyle', '#bathroomgoals', '#homeinspo', '#decorideas', '#interiorinspo', '#designinspiration', '#bathroommakeover', '#homedesign', '#decorating', '#interiorstyle', '#vanity', '#tilework'],
  office: ['#homeoffice', '#homeofficedesign', '#homeofficeinspo', '#workspace', '#workfromhome', '#officedecor', '#interiordesign', '#homedecor', '#officeideas', '#officestyle', '#homeinspo', '#decorideas', '#interiorinspo', '#designinspiration', '#officemakeover', '#homedesign', '#decorating', '#interiorstyle', '#deskwarmth', '#productivity'],
};

const BRAND_HASHTAGS = ['#instod', '#3ddesign', '#interiordesign', '#roomdesign', '#designpreview', '#webgl', '#browserbased', '#designtool'];

function pickHashtags(roomType: string, count: number): string[] {
  const pool = HASHTAG_POOL[roomType] || HASHTAG_POOL.living;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const roomTags = shuffled.slice(0, count - 4);
  const brandShuffled = [...BRAND_HASHTAGS].sort(() => Math.random() - 0.5);
  return [...roomTags, ...brandShuffled.slice(0, 4)];
}

function getTonePrefix(tone: Tone): string {
  switch (tone) {
    case 'professional': return '';
    case 'casual': return '';
    case 'inspirational': return '';
    case 'playful': return '';
  }
}

export function generateFromTemplate({ image, postType, tone }: GenerateParams): GeneratedContent {
  const room = ROOM_LABELS[image.roomType] || 'room';
  const roomCap = room.charAt(0).toUpperCase() + room.slice(1);
  const mood = image.mood;

  switch (postType) {
    case 'showcase': {
      const captions: string[] = [];
      if (tone === 'professional') {
        captions.push(
          `${roomCap} design — ${mood} mood.\n\nEvery piece placed with intention. Every angle considered. This is what browser-native 3D design looks like.\n\nDesigned in Instod. No installs. No plugins. Just open and create.\n\n→ Try it free at instod.vercel.app`,
          `When ${mood.toLowerCase()} light meets thoughtful design.\n\nThis ${room} was designed entirely in a browser — no software install, no GPU required. Real-time 3D rendering with PBR materials.\n\nThe future of interior design is here, and it runs in your tab.\n\n→ Start designing: instod.vercel.app`,
          `${roomCap}, reimagined.\n\n${image.description}\n\nDesigned in real-time 3D. Material swaps, lighting moods, and revision snapshots — all in your browser.\n\n→ Open the editor: instod.vercel.app`
        );
      } else if (tone === 'casual') {
        captions.push(
          `Spent way too long getting this ${room} just right 😅\n\nWorth it though. The ${mood.toLowerCase()} vibes are immaculate.\n\nBuilt this in Instod — it's a free 3D room designer that runs in your browser. No download, no signup to try.\n\n→ instod.vercel.app`,
          `POV: you finally finished designing your dream ${room} 🌙\n\nThe lighting mood? ${mood}. The furniture? Hand-placed. The tool? Instod — a browser-based 3D editor.\n\nGo play with it → instod.vercel.app`,
          `This ${room} started as an empty box and now look at it 👀\n\n${image.description}\n\nIf you've ever wanted to visualize a room before buying furniture, Instod is for you. Free during beta.\n\n→ instod.vercel.app`
        );
      } else if (tone === 'inspirational') {
        captions.push(
          `Your dream ${room} is closer than you think.\n\nThis design was built in minutes — not weeks. No expensive software. No design degree. Just a browser and an idea.\n\nStop imagining. Start designing.\n\n→ instod.vercel.app`,
          `What if designing your ${room} was as easy as arranging furniture in a video game?\n\nThis is real. This is Instod. This is browser-native 3D interior design.\n\nThe tools have finally caught up to the imagination.\n\n→ instod.vercel.app`,
          `Every great space starts with a vision.\n\nThis ${room} — ${mood.toLowerCase()} mood, every piece intentional — was designed in a web browser. No installs. No barriers.\n\nWhat will you design first?\n\n→ instod.vercel.app`
        );
      } else {
        captions.push(
          `Me: I'll just design one ${room} today\nAlso me: *spends 3 hours in Instod perfecting the ${mood.toLowerCase()} lighting* 🫠\n\nWorth every second though 👀\n\n→ instod.vercel.app (it's free, go wild)`,
          `Tried to design a "quick" ${room} and ended up with THIS 🤌\n\nThe ${mood.toLowerCase()} vibes? Immaculate. The tool? Instod. The price? Free during beta.\n\nGo make something beautiful → instod.vercel.app`,
          `Room of the day: this ${room} 🏆\n\n${image.description}\n\nDesigned in Instod — your browser is the only software you need.\n\n→ instod.vercel.app`
        );
      }
      return { captions, hashtags: pickHashtags(image.roomType, 20) };
    }

    case 'educational': {
      const tips: Record<string, string[]> = {
        living: [
          'Float your furniture — don\'t push everything against the walls. A 18-24" gap creates breathing room.',
          'Layer lighting: ambient + task + accent. One overhead light kills the mood.',
          'Anchor the space with a rug large enough that all front furniture legs sit on it.',
        ],
        bedroom: [
          'Leave 24-36" clearance around the bed for easy movement.',
          'Nightstands should be roughly the same height as your mattress top.',
          'Use warm light (2700K-3000K) for a relaxing sleep environment.',
        ],
        kitchen: [
          'Follow the work triangle: sink, stove, fridge should form a triangle with 4-9ft sides.',
          'Counter space on both sides of the stove and sink — minimum 12" each.',
          'Task lighting under cabinets is non-negotiable for food prep.',
        ],
        dining: [
          'Leave 36" behind chairs for easy pull-out and walking space.',
          'Pendant lights should hang 30-36" above the table surface.',
          'A mirror opposite a window doubles the natural light.',
        ],
        bathroom: [
          'Minimum 30x30" clearance in front of every fixture.',
          'Vanity lighting should be at face height, not overhead — avoids shadows.',
          'Matte finishes hide water spots better than glossy.',
        ],
        office: [
          'Position desk perpendicular to windows to avoid screen glare.',
          'Invest in a good chair before a good desk — your back will thank you.',
          'Layer task and ambient lighting to reduce eye strain.',
        ],
      };
      const roomTips = tips[image.roomType] || tips.living;
      const tip = roomTips[Math.floor(Math.random() * roomTips.length)];
      const captions = [
        `${roomCap} design tip #1:\n\n${tip}\n\nThis ${room} was designed in Instod — browser-native 3D so you can test these principles before buying anything.\n\n→ Try it free: instod.vercel.app`,
        `Most people get this wrong when designing a ${room}:\n\n${tip}\n\nVisualize it first in 3D. Save yourself the costly furniture returns.\n\n→ instod.vercel.app`,
        `Save this for your next ${room} project 📌\n\n${tip}\n\nTest layouts like this in real-time 3D at instod.vercel.app — no install, no signup to try.`,
      ];
      return { captions, hashtags: [...pickHashtags(image.roomType, 15), '#designtips', '#interiordesignhacks', '#decoratingtips', '#designadvice', '#homedecortips'] };
    }

    case 'engagement': {
      const captions = [
        `Quick question: ${mood} lighting or bright daylight for your ${room}? 🤔\n\nDrop your pick in the comments 👇\n\n(Designed this in Instod — you can toggle between 4 lighting moods in real-time. Try it → instod.vercel.app)`,
        `Be honest — would you live in this ${room}? 🙋\n\nRate it 1-10 in the comments. Brutal honesty welcome.\n\n→ Built in Instod at instod.vercel.app`,
        `This or that: warm palette or cool palette for a ${room}? 🎨\n\nComment your preference below.\n\n(This is the warm version — the cool version is on the next post. Both designed in Instod → instod.vercel.app)`,
        `What's missing from this ${room}? 👀\n\nComment the one piece you'd add.\n\n→ Designed in Instod — instod.vercel.app`,
      ];
      return { captions, hashtags: [...pickHashtags(image.roomType, 15), '#thisorthat', '#commentbelow', '#designpoll', '#yourthoughts', '#designcommunity'] };
    }

    case 'behind-the-scenes': {
      const captions = [
        `How this ${room} was made — no SketchUp, no V-Ray, no $1000 software stack:\n\n1. Opened Instod in a browser tab\n2. Picked the ${room} preset\n3. Dragged in furniture from the library\n4. Swapped materials (oak → walnut)\n5. Set lighting mood to "${mood}"\n6. Exported this screenshot\n\nTotal time: 23 minutes.\n\n→ instod.vercel.app`,
        `Behind the design: this ${room} exists because of Three.js + WebGL + a lot of late nights 🌙\n\nInstod renders everything in real-time in your browser. No render queue. No waiting. What you see is what you get, instantly.\n\n→ Try the editor: instod.vercel.app`,
        `What you're looking at:\n→ A ${room} designed in Instod\n→ Rendered in real-time (not pre-rendered)\n→ Running in a browser tab\n→ On a laptop with no dedicated GPU\n\nThis is what browser-native 3D design looks like in 2025.\n\n→ instod.vercel.app`,
      ];
      return { captions, hashtags: [...pickHashtags(image.roomType, 12), '#behindthescenes', '#bts', '#howitsmade', '#designprocess', '#webgl', '#threejs', '#browserbased', '#designworkflow'] };
    }

    case 'reel-script': {
      const reelScript = {
        hook: `POV: you discovered a free 3D ${room} designer that runs in your browser`,
        shots: [
          {
            duration: '0-3s',
            visual: `Quick zoom into the ${room} render — start blurred, snap to focus`,
            voiceover: `Stop scrolling if you've ever wanted to redesign your ${room} but couldn't afford the software.`,
            textOverlay: 'Free 3D room designer ↓',
          },
          {
            duration: '3-7s',
            visual: `Slow orbit around the ${room} showing different angles`,
            voiceover: `This entire ${room} was designed in a browser tab. No download. No install. No GPU required.`,
            textOverlay: 'No install. No GPU. Browser-only.',
          },
          {
            duration: '7-12s',
            visual: `Quick cuts showing furniture drag, material swap, lighting change`,
            voiceover: `Drag furniture, swap materials, change lighting moods — all in real-time 3D.`,
            textOverlay: 'Real-time 3D rendering',
          },
          {
            duration: '12-15s',
            visual: `Final hero shot of the ${room} with ${mood.toLowerCase()} lighting`,
            voiceover: `It's called Instod. It's free during beta. Link in bio.`,
            textOverlay: 'instod.vercel.app',
          },
        ],
        music: 'Lo-fi beat, 90 BPM, instrumental (search "lofi background" in Instagram audio library)',
        caption: `Found a free 3D ${room} designer that runs in your browser 🤯\n\nNo install. No GPU. No design degree.\n\n→ instod.vercel.app\n\n#instod #3ddesign #interiordesign #${roomTypeToHashtag(image.roomType)}`,
      };
      return {
        captions: [reelScript.caption],
        hashtags: pickHashtags(image.roomType, 15),
        reelScript,
      };
    }

    default:
      return { captions: ['Error generating caption'], hashtags: [] };
  }
}

function roomTypeToHashtag(roomType: string): string {
  const map: Record<string, string> = {
    living: 'livingroom',
    bedroom: 'bedroom',
    kitchen: 'kitchen',
    dining: 'diningroom',
    bathroom: 'bathroom',
    office: 'homeoffice',
  };
  return map[roomType] || 'roomdesign';
}

/**
 * Generate a 7-day content calendar with mixed post types.
 * Useful for planning a week of Instagram content.
 */
export function generateContentCalendar(): { day: string; postType: PostType; roomType: string; idea: string }[] {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const pattern: PostType[] = ['showcase', 'educational', 'engagement', 'behind-the-scenes', 'showcase', 'reel-script', 'educational'];
  const rooms = ['living', 'bedroom', 'kitchen', 'dining', 'bathroom', 'office'];

  return days.map((day, i) => ({
    day,
    postType: pattern[i],
    roomType: rooms[i % rooms.length],
    idea: `${day}: ${pattern[i].replace('-', ' ')} — ${rooms[i % rooms.length]} room`,
  }));
}
