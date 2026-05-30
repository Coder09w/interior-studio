export type CategoryId = 'seating' | 'tables' | 'lighting' | 'decor' | 'bedroom' | 'kitchen' | 'office' | 'bathroom';
export type MatType = 'fabric' | 'leather' | 'wood' | 'metal';

export interface FurnitureItemDef {
  name: string;
  desc: string;
  icon: string;
  fn: string;
  thumb: string;
}

export const categories = [
  { id: 'seating' as CategoryId, label: 'Seating', icon: 'fa-couch' },
  { id: 'tables' as CategoryId, label: 'Tables', icon: 'fa-table' },
  { id: 'lighting' as CategoryId, label: 'Lighting', icon: 'fa-lightbulb' },
  { id: 'decor' as CategoryId, label: 'Decor', icon: 'fa-leaf' },
  { id: 'bedroom' as CategoryId, label: 'Bedroom', icon: 'fa-bed' },
  { id: 'kitchen' as CategoryId, label: 'Kitchen', icon: 'fa-utensils' },
  { id: 'office' as CategoryId, label: 'Office', icon: 'fa-laptop' },
  { id: 'bathroom' as CategoryId, label: 'Bathroom', icon: 'fa-bath' },
];

export const furnitureItems: Record<CategoryId, FurnitureItemDef[]> = {
  seating: [
    { name: 'Modern Sofa', desc: '3-seat sofa, 210×90cm', icon: 'fa-couch', fn: 'createSofa', thumb: '🛋️' },
    { name: 'Armchair', desc: 'Accent chair, 75×80cm', icon: 'fa-chair', fn: 'createArmchair', thumb: '💺' },
    { name: 'Ottoman', desc: 'Round ottoman, ⌀60cm', icon: 'fa-circle', fn: 'createOttoman', thumb: '⭕' },
  ],
  tables: [
    { name: 'Coffee Table', desc: 'Low table, 120×60cm', icon: 'fa-table', fn: 'createCoffeeTable', thumb: '☐' },
    { name: 'Side Table', desc: 'Round side table, ⌀45cm', icon: 'fa-border-all', fn: 'createSideTable', thumb: '◯' },
    { name: 'Console', desc: 'Console table, 130×35cm', icon: 'fa-minus', fn: 'createConsole', thumb: '▬' },
  ],
  lighting: [
    { name: 'Floor Lamp', desc: 'Arc floor lamp, h160cm', icon: 'fa-lightbulb', fn: 'createFloorLamp', thumb: '💡' },
    { name: 'Pendant Light', desc: 'Hanging pendant', icon: 'fa-circle', fn: 'createPendant', thumb: '🔦' },
    { name: 'Table Lamp', desc: 'Ceramic lamp, h40cm', icon: 'fa-lightbulb', fn: 'createTableLamp', thumb: '🪔' },
  ],
  decor: [
    { name: 'Bookshelf', desc: 'Tall shelf, 80×180cm', icon: 'fa-book', fn: 'createBookshelf', thumb: '📚' },
    { name: 'Plant', desc: 'Potted plant, h90cm', icon: 'fa-leaf', fn: 'createPlant', thumb: '🪴' },
    { name: 'Rug', desc: 'Area rug, 200×140cm', icon: 'fa-square', fn: 'createRug', thumb: '🟫' },
    { name: 'TV Stand', desc: 'Media console, 150×50cm', icon: 'fa-tv', fn: 'createTVStand', thumb: '📺' },
  ],
  bedroom: [
    { name: 'King Bed', desc: 'King bed, 200×180cm', icon: 'fa-bed', fn: 'createBed', thumb: '🛏️' },
    { name: 'Nightstand', desc: 'Bedside table, 50×40cm', icon: 'fa-table', fn: 'createNightstand', thumb: '🔲' },
    { name: 'Wardrobe', desc: 'Tall closet, 120×60cm', icon: 'fa-door-closed', fn: 'createWardrobe', thumb: '🚪' },
    { name: 'Dresser', desc: 'Low cabinet, 120×50cm', icon: 'fa-box', fn: 'createDresser', thumb: '🗄️' },
    { name: 'Vanity Table', desc: 'Table with mirror, 90×40cm', icon: 'fa-mirror', fn: 'createVanityTable', thumb: '🪞' },
  ],
  kitchen: [
    { name: 'Kitchen Island', desc: 'Island counter, 150×80cm', icon: 'fa-table', fn: 'createKitchenIsland', thumb: '🏪' },
    { name: 'Bar Stool', desc: 'Tall stool, h75cm', icon: 'fa-chair', fn: 'createBarStool', thumb: '🪑' },
    { name: 'Dining Table', desc: 'Dining table, 160×90cm', icon: 'fa-table', fn: 'createDiningTable', thumb: '🍽️' },
    { name: 'Dining Chair', desc: 'Wooden chair, 42×42cm', icon: 'fa-chair', fn: 'createDiningChair', thumb: '🪑' },
    { name: 'Kitchen Counter', desc: 'L-shaped counter', icon: 'fa-sink', fn: 'createKitchenCounter', thumb: '🍳' },
  ],
  office: [
    { name: 'Desk', desc: 'Office desk, 140×70cm', icon: 'fa-laptop', fn: 'createDesk', thumb: '🖥️' },
    { name: 'Office Chair', desc: 'Swivel chair, h90cm', icon: 'fa-chair', fn: 'createOfficeChair', thumb: '🪑' },
    { name: 'Filing Cabinet', desc: 'Metal cabinet, 40×130cm', icon: 'fa-box-archive', fn: 'createFilingCabinet', thumb: '📁' },
    { name: 'Monitor Stand', desc: 'Monitor on stand, 60cm', icon: 'fa-desktop', fn: 'createMonitorStand', thumb: '💻' },
  ],
  bathroom: [
    { name: 'Bathtub', desc: 'Standard tub, 170×75cm', icon: 'fa-bath', fn: 'createBathtub', thumb: '🛁' },
    { name: 'Toilet', desc: 'Standard toilet', icon: 'fa-toilet', fn: 'createToilet', thumb: '🚽' },
    { name: 'Pedestal Sink', desc: 'Classic sink, h90cm', icon: 'fa-faucet', fn: 'createPedestalSink', thumb: '🚰' },
    { name: 'Shower', desc: 'Glass shower stall, 90×90cm', icon: 'fa-shower', fn: 'createShower', thumb: '🚿' },
  ],
};

export const matColors: Record<MatType, string[]> = {
  fabric: ['#8A8478', '#7A8B6F', '#3D4F5F', '#C17F59', '#E8DCC8', '#C49898', '#4A4A4A', '#6B7D3F', '#B8706A', '#7B8EA0'],
  leather: ['#9A6B3C', '#2D2D2D', '#6B4226', '#6B2D3E', '#C4A882', '#F0EDE8'],
  wood: ['#B8956A', '#5C4033', '#D4A76A', '#8B4513', '#E0C8A0', '#3B3B3B'],
  metal: ['#C9A96E', '#C0C0C0', '#333333', '#B5A642', '#B87333', '#A0A0A8'],
};

export const colorNames: Record<string, string> = {
  '#8A8478': 'Warm Gray',
  '#7A8B6F': 'Sage Green',
  '#3D4F5F': 'Navy Steel',
  '#C17F59': 'Terracotta',
  '#E8DCC8': 'Ivory Cream',
  '#C49898': 'Dusty Rose',
  '#4A4A4A': 'Charcoal',
  '#6B7D3F': 'Olive',
  '#B8706A': 'Clay',
  '#7B8EA0': 'Slate Blue',
  '#9A6B3C': 'Cognac',
  '#2D2D2D': 'Noir',
  '#6B4226': 'Espresso',
  '#6B2D3E': 'Burgundy',
  '#C4A882': 'Camel',
  '#F0EDE8': 'Pearl',
  '#B8956A': 'Natural Oak',
  '#5C4033': 'Walnut',
  '#D4A76A': 'Honey',
  '#8B4513': 'Saddle',
  '#E0C8A0': 'Birch',
  '#3B3B3B': 'Anthracite',
  '#C9A96E': 'Antique Gold',
  '#C0C0C0': 'Silver',
  '#333333': 'Gunmetal',
  '#B5A642': 'Olive Gold',
  '#B87333': 'Copper',
  '#A0A0A8': 'Pewter',
};

export const wallColorOptions = [
  { color: '#FAF8F4', label: 'Ivory' },
  { color: '#E8E2D8', label: 'Warm Gray' },
  { color: '#D4C8B8', label: 'Taupe' },
  { color: '#B8C4C0', label: 'Sage' },
  { color: '#C4B8A8', label: 'Sand' },
  { color: '#FFFFFF', label: 'White' },
];

export const roomTypeDefaults: Record<string, { width: number; depth: number; height: number; defaultFurniture: Array<{ fn: string; color: string; mat: MatType; pos: [number, number, number]; rot?: number }> }> = {
  living: {
    width: 8, depth: 6, height: 3,
    defaultFurniture: [
      { fn: 'createSofa', color: '#7A8B6F', mat: 'fabric', pos: [0, 0, -2] },
      { fn: 'createCoffeeTable', color: '#B8956A', mat: 'wood', pos: [0, 0, 0] },
      { fn: 'createFloorLamp', color: '#333333', mat: 'metal', pos: [-3, 0, -2.2] },
      { fn: 'createRug', color: '#C49898', mat: 'fabric', pos: [0, 0, -0.2] },
      { fn: 'createPlant', color: '#C4A882', mat: 'fabric', pos: [3.2, 0, -2.4] },
      { fn: 'createBookshelf', color: '#B8956A', mat: 'wood', pos: [3.4, 0, 0], rot: -Math.PI / 2 },
    ],
  },
  bedroom: {
    width: 5, depth: 4.5, height: 3,
    defaultFurniture: [
      { fn: 'createBed', color: '#E8DCC8', mat: 'fabric', pos: [0, 0, -1.2] },
      { fn: 'createNightstand', color: '#B8956A', mat: 'wood', pos: [-1.8, 0, -1.8] },
      { fn: 'createNightstand', color: '#B8956A', mat: 'wood', pos: [1.8, 0, -1.8] },
      { fn: 'createWardrobe', color: '#B8956A', mat: 'wood', pos: [2, 0, 0.5], rot: -Math.PI / 2 },
      { fn: 'createTableLamp', color: '#E8DCC8', mat: 'fabric', pos: [-1.8, 0, -1.8] },
    ],
  },
  kitchen: {
    width: 4, depth: 3.5, height: 3,
    defaultFurniture: [
      { fn: 'createKitchenCounter', color: '#E0C8A0', mat: 'wood', pos: [-0.5, 0, -1.3] },
      { fn: 'createKitchenIsland', color: '#E0C8A0', mat: 'wood', pos: [0, 0, 0.5] },
      { fn: 'createBarStool', color: '#8A8478', mat: 'fabric', pos: [-0.4, 0, 1.2] },
      { fn: 'createBarStool', color: '#8A8478', mat: 'fabric', pos: [0.4, 0, 1.2] },
    ],
  },
  bathroom: {
    width: 3, depth: 2.5, height: 2.8,
    defaultFurniture: [
      { fn: 'createBathtub', color: '#F0EDE8', mat: 'fabric', pos: [-0.5, 0, -0.8] },
      { fn: 'createToilet', color: '#F5F5F0', mat: 'fabric', pos: [1, 0, -0.8] },
      { fn: 'createPedestalSink', color: '#F5F5F0', mat: 'fabric', pos: [1, 0, 0.8] },
    ],
  },
  office: {
    width: 4, depth: 3.5, height: 3,
    defaultFurniture: [
      { fn: 'createDesk', color: '#B8956A', mat: 'wood', pos: [0, 0, -1.2] },
      { fn: 'createOfficeChair', color: '#2D2D2D', mat: 'leather', pos: [0, 0, -0.5] },
      { fn: 'createFilingCabinet', color: '#A0A0A8', mat: 'metal', pos: [1.5, 0, -1.2] },
      { fn: 'createMonitorStand', color: '#333', mat: 'metal', pos: [0, 0, -1.4] },
      { fn: 'createPlant', color: '#C4A882', mat: 'fabric', pos: [-1.5, 0, -1.2] },
    ],
  },
  dining: {
    width: 5, depth: 4, height: 3,
    defaultFurniture: [
      { fn: 'createDiningTable', color: '#B8956A', mat: 'wood', pos: [0, 0, 0] },
      { fn: 'createDiningChair', color: '#8A8478', mat: 'fabric', pos: [-0.5, 0, 0.7] },
      { fn: 'createDiningChair', color: '#8A8478', mat: 'fabric', pos: [0.5, 0, 0.7] },
      { fn: 'createDiningChair', color: '#8A8478', mat: 'fabric', pos: [-0.5, 0, -0.7] },
      { fn: 'createDiningChair', color: '#8A8478', mat: 'fabric', pos: [0.5, 0, -0.7] },
      { fn: 'createPendant', color: '#C17F4E', mat: 'metal', pos: [0, 0, 0] },
    ],
  },
};
