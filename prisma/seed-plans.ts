/**
 * Seed script: Populates the PlanConfig table with default values.
 * Run with: npx tsx prisma/seed-plans.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FREE_ROOM_TYPES = ['living', 'bedroom', 'office'];
const ALL_ROOM_TYPES = ['living', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining'];
const FREE_LIGHTING_MOODS = ['daylight', 'evening'];
const ALL_LIGHTING_MOODS = ['daylight', 'golden', 'evening', 'night'];

const FEATURE_COMPARISON = [
  {
    category: 'Design & Editing',
    items: [
      { label: '3D Room Editor', free: true, pro: true, studio: true },
      { label: 'Furniture Items', free: '15 basic', pro: '30+ all', studio: 'All + custom' },
      { label: 'Room Types', free: '3 types', pro: '6 types', studio: '6 types' },
      { label: 'Lighting Moods', free: '2 moods', pro: '4 moods', studio: '4 moods' },
      { label: 'Custom Dimensions', free: false, pro: true, studio: true },
      { label: 'Material & Color System', free: true, pro: true, studio: true },
    ],
  },
  {
    category: 'Projects & Storage',
    items: [
      { label: 'Saved Designs', free: '3 projects', pro: '50 projects', studio: 'Unlimited' },
      { label: 'Rooms per Project', free: '1 room', pro: '10 rooms', studio: 'Unlimited' },
      { label: 'Furniture per Room', free: '15 items', pro: 'Unlimited', studio: 'Unlimited' },
      { label: 'Revision Snapshots', free: false, pro: '3 per project', studio: 'Unlimited' },
      { label: 'Mood Boards', free: false, pro: '1 per project', studio: 'Unlimited' },
    ],
  },
  {
    category: 'Export & Sharing',
    items: [
      { label: 'Screenshot Export', free: true, pro: true, studio: true },
      { label: 'Export as Image (PNG)', free: false, pro: true, studio: true },
      { label: 'Export as PDF', free: false, pro: true, studio: true },
      { label: 'HD Export', free: false, pro: false, studio: true },
      { label: '2D Floor Plan Export', free: false, pro: false, studio: true },
      { label: 'Share Links', free: false, pro: true, studio: true },
      { label: 'Client Portal (Branded)', free: false, pro: false, studio: true },
    ],
  },
  {
    category: 'Professional Tools',
    items: [
      { label: 'Cost Estimator / Budget', free: false, pro: false, studio: true },
      { label: 'Presentation Mode', free: false, pro: false, studio: true },
      { label: 'Priority Rendering', free: false, pro: true, studio: true },
      { label: 'Brand Customization', free: false, pro: false, studio: true },
      { label: 'Custom Furniture Upload', free: false, pro: false, studio: true },
      { label: 'API Access', free: false, pro: false, studio: true },
      { label: 'Priority Support', free: false, pro: false, studio: true },
    ],
  },
];

const plans = [
  {
    planKey: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    description: 'Perfect for trying out 3D interior design',
    highlight: false,
    cta: 'Start for Free',
    maxProjects: 3,
    maxRoomsPerProject: 1,
    maxFurniturePerRoom: 15,
    maxRevisionSnapshots: 0,
    maxMoodBoards: 0,
    features: {
      allFurnitureItems: false,
      allRoomTypes: false,
      allLightingMoods: false,
      customDimensions: false,
      shareLinks: false,
      exportImage: false,
      exportPDF: false,
      exportHD: false,
      revisionSnapshots: false,
      moodBoard: false,
      floorPlanExport: false,
      clientPortal: false,
      costEstimator: false,
      presentationMode: false,
      brandCustomization: false,
      priorityRendering: false,
      customFurnitureUpload: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  {
    planKey: 'pro',
    name: 'Pro',
    price: 12,
    priceId: '',
    description: 'For serious designers and homeowners',
    highlight: true,
    cta: 'Get Pro',
    maxProjects: 50,
    maxRoomsPerProject: 10,
    maxFurniturePerRoom: null,
    maxRevisionSnapshots: 3,
    maxMoodBoards: 1,
    features: {
      allFurnitureItems: true,
      allRoomTypes: true,
      allLightingMoods: true,
      customDimensions: true,
      shareLinks: true,
      exportImage: true,
      exportPDF: true,
      exportHD: false,
      revisionSnapshots: true,
      moodBoard: true,
      floorPlanExport: false,
      clientPortal: false,
      costEstimator: false,
      presentationMode: false,
      brandCustomization: false,
      priorityRendering: true,
      customFurnitureUpload: false,
      apiAccess: false,
      prioritySupport: false,
    },
  },
  {
    planKey: 'studio',
    name: 'Studio',
    price: 29,
    priceId: '',
    description: 'For professional interior designers',
    highlight: false,
    cta: 'Contact Sales',
    maxProjects: null,
    maxRoomsPerProject: null,
    maxFurniturePerRoom: null,
    maxRevisionSnapshots: null,
    maxMoodBoards: null,
    features: {
      allFurnitureItems: true,
      allRoomTypes: true,
      allLightingMoods: true,
      customDimensions: true,
      shareLinks: true,
      exportImage: true,
      exportPDF: true,
      exportHD: true,
      revisionSnapshots: true,
      moodBoard: true,
      floorPlanExport: true,
      clientPortal: true,
      costEstimator: true,
      presentationMode: true,
      brandCustomization: true,
      priorityRendering: true,
      customFurnitureUpload: true,
      apiAccess: true,
      prioritySupport: true,
    },
  },
];

async function main() {
  console.log('Seeding PlanConfig table...');

  for (const plan of plans) {
    const result = await prisma.planConfig.upsert({
      where: { planKey: plan.planKey },
      update: {
        name: plan.name,
        price: plan.price,
        description: plan.description,
        highlight: plan.highlight,
        cta: plan.cta,
        maxProjects: plan.maxProjects,
        maxRoomsPerProject: plan.maxRoomsPerProject,
        maxFurniturePerRoom: plan.maxFurniturePerRoom,
        maxRevisionSnapshots: plan.maxRevisionSnapshots,
        maxMoodBoards: plan.maxMoodBoards,
        features: JSON.stringify(plan.features),
        freeRoomTypes: JSON.stringify(FREE_ROOM_TYPES),
        freeLightingMoods: JSON.stringify(FREE_LIGHTING_MOODS),
        allRoomTypes: JSON.stringify(ALL_ROOM_TYPES),
        allLightingMoods: JSON.stringify(ALL_LIGHTING_MOODS),
        featureComparison: JSON.stringify(FEATURE_COMPARISON),
      },
      create: {
        planKey: plan.planKey,
        name: plan.name,
        price: plan.price,
        priceId: plan.priceId,
        description: plan.description,
        highlight: plan.highlight,
        cta: plan.cta,
        maxProjects: plan.maxProjects,
        maxRoomsPerProject: plan.maxRoomsPerProject,
        maxFurniturePerRoom: plan.maxFurniturePerRoom,
        maxRevisionSnapshots: plan.maxRevisionSnapshots,
        maxMoodBoards: plan.maxMoodBoards,
        features: JSON.stringify(plan.features),
        freeRoomTypes: JSON.stringify(FREE_ROOM_TYPES),
        freeLightingMoods: JSON.stringify(FREE_LIGHTING_MOODS),
        allRoomTypes: JSON.stringify(ALL_ROOM_TYPES),
        allLightingMoods: JSON.stringify(ALL_LIGHTING_MOODS),
        featureComparison: JSON.stringify(FEATURE_COMPARISON),
      },
    });
    console.log(`  ✓ Upserted plan: ${result.planKey}`);
  }

  console.log('\nSeeding complete! All plan configs are in the database.');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
