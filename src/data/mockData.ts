export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  badge?: 'new' | 'bestseller' | 'discount';
  compatibleBikes: string[];
  description: string;
  specifications: Record<string, string>;
  inStock: boolean;
}

export interface Review {
  id: string;
  user: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: { name: string; quantity: number; price: number; image: string }[];
  trackingId?: string;
}

export const bikebrands: Record<string, string[]> = {
  'Yamaha': ['YZF-R15', 'MT-15', 'FZ-S', 'R1', 'Aerox 155'],
  'KTM': ['Duke 200', 'Duke 390', 'RC 390', 'Adventure 390', 'Duke 250'],
  'Royal Enfield': ['Classic 350', 'Bullet 350', 'Himalayan', 'Meteor 350', 'Hunter 350'],
  'Honda': ['CB350', 'Hornet 2.0', 'CBR 650R', 'Africa Twin', 'Activa 6G'],
};

const IMG = 'https://images.unsplash.com/photo-';

export const products: Product[] = [
  {
    id: '1',
    name: 'Stealth Carbon Full-Face Helmet',
    price: 189.99,
    originalPrice: 249.99,
    discount: 24,
    rating: 4.8,
    reviewCount: 342,
    image: IMG + '1558618666-fcd25c85f7e7?w=600&h=600&fit=crop',
    images: [
      IMG + '1558618666-fcd25c85f7e7?w=800&h=800&fit=crop',
      IMG + '1609634700683-85843a0c1135?w=800&h=800&fit=crop',
    ],
    category: 'Helmets',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Matte Black', hex: '#1a1a1a' },
      { name: 'Gloss White', hex: '#f5f5f5' },
      { name: 'Racing Orange', hex: '#FF6A2B' },
    ],
    badge: 'bestseller',
    compatibleBikes: ['All'],
    description: 'Premium carbon fiber full-face helmet with advanced ventilation system and DOT/ECE certification. Lightweight construction at just 1.3kg with anti-fog visor.',
    specifications: { Material: 'Carbon Fiber', Weight: '1.3 kg', Certification: 'DOT, ECE 22.06', Visor: 'Pinlock-ready Anti-fog', Ventilation: '6-point system' },
    inStock: true,
  },
  {
    id: '2',
    name: 'Pro Rider Leather Jacket',
    price: 299.99,
    originalPrice: 399.99,
    discount: 25,
    rating: 4.6,
    reviewCount: 189,
    image: IMG + '1551028719-00167b16eac5?w=600&h=600&fit=crop',
    category: 'Riding Gears',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Brown', hex: '#654321' },
    ],
    badge: 'discount',
    compatibleBikes: ['All'],
    description: 'Premium cowhide leather riding jacket with CE Level 2 armor at shoulders and elbows. Removable thermal liner for year-round riding.',
    specifications: { Material: 'Cowhide Leather', Armor: 'CE Level 2', Liner: 'Removable Thermal', Pockets: '6 External, 2 Internal' },
    inStock: true,
  },
  {
    id: '3',
    name: 'All-Terrain Riding Boots',
    price: 159.99,
    rating: 4.5,
    reviewCount: 256,
    image: IMG + '1542291026-7eec264c27ff?w=600&h=600&fit=crop',
    category: 'Riding Gears',
    sizes: ['7', '8', '9', '10', '11', '12'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Dark Brown', hex: '#3e2723' },
    ],
    badge: 'new',
    compatibleBikes: ['All'],
    description: 'Waterproof adventure boots with ankle protection and oil-resistant sole. Built for both on and off-road riding.',
    specifications: { Material: 'Full-grain Leather', Waterproof: 'Yes', Sole: 'Vibram', Protection: 'Ankle & Shin Guard' },
    inStock: true,
  },
  {
    id: '4',
    name: 'Tactical Riding Gloves',
    price: 49.99,
    originalPrice: 69.99,
    discount: 29,
    rating: 4.7,
    reviewCount: 478,
    image: IMG + '1615484477778-ca3b77940c25?w=600&h=600&fit=crop',
    category: 'Riding Gears',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Orange', hex: '#FF6A2B' },
      { name: 'Grey', hex: '#6B7280' },
    ],
    badge: 'bestseller',
    compatibleBikes: ['All'],
    description: 'Touchscreen-compatible riding gloves with knuckle protection and breathable mesh panels.',
    specifications: { Material: 'Goatskin + Mesh', Protection: 'Carbon Knuckle Guard', Touchscreen: 'Yes', Closure: 'Velcro Wrist Strap' },
    inStock: true,
  },
  {
    id: '5',
    name: 'LED Fog Light Kit',
    price: 89.99,
    rating: 4.4,
    reviewCount: 134,
    image: IMG + '1558981806-ec527fa84c39?w=600&h=600&fit=crop',
    category: 'Accessories',
    sizes: ['Universal'],
    colors: [
      { name: 'Yellow', hex: '#FBBF24' },
      { name: 'White', hex: '#F3F4F6' },
    ],
    compatibleBikes: ['Yamaha YZF-R15', 'KTM Duke 200', 'KTM Duke 390', 'Honda CB350'],
    description: 'High-output LED fog lights with CNC machined aluminum housing. IP67 waterproof rating.',
    specifications: { Lumens: '3000 per unit', Waterproof: 'IP67', Material: 'CNC Aluminum', Power: '30W per unit' },
    inStock: true,
  },
  {
    id: '6',
    name: 'Performance Air Filter',
    price: 34.99,
    originalPrice: 44.99,
    discount: 22,
    rating: 4.3,
    reviewCount: 89,
    image: IMG + '1558981359-219d6364c9c8?w=600&h=600&fit=crop',
    category: 'Parts',
    sizes: ['Universal'],
    colors: [{ name: 'Red', hex: '#DC2626' }],
    badge: 'discount',
    compatibleBikes: ['KTM Duke 200', 'KTM Duke 390', 'KTM Duke 250'],
    description: 'High-flow performance air filter for increased horsepower and throttle response. Washable and reusable.',
    specifications: { Type: 'Cotton Gauze', Filtration: '99.2%', Reusable: 'Yes', 'HP Gain': 'Up to 5%' },
    inStock: true,
  },
  {
    id: '7',
    name: 'Michelin Road 6 Tire',
    price: 129.99,
    rating: 4.9,
    reviewCount: 567,
    image: IMG + '1558981285-501b9a2f22a8?w=600&h=600&fit=crop',
    category: 'Tires',
    sizes: ['120/70-17', '160/60-17', '180/55-17', '190/50-17'],
    colors: [{ name: 'Black', hex: '#111111' }],
    badge: 'bestseller',
    compatibleBikes: ['Yamaha YZF-R15', 'KTM Duke 390', 'Honda CBR 650R'],
    description: 'Premium sport touring tire with exceptional wet grip and long tread life. Silica compound for all-weather performance.',
    specifications: { Type: 'Radial', Compound: 'Silica', Tread: 'Multi-zone', 'Speed Rating': 'W (270 km/h)' },
    inStock: true,
  },
  {
    id: '8',
    name: 'Airbag Riding Vest',
    price: 449.99,
    originalPrice: 549.99,
    discount: 18,
    rating: 4.9,
    reviewCount: 78,
    image: IMG + '1558981033-7c24ee28c09e?w=600&h=600&fit=crop',
    category: 'Airbags',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Neon Yellow', hex: '#D9F99D' },
    ],
    badge: 'new',
    compatibleBikes: ['All'],
    description: 'Electronic airbag vest with 25ms deployment time. Protects chest, back, and neck. Rechargeable with companion app.',
    specifications: { Deployment: '25ms', Protection: 'Chest, Back, Neck', Battery: 'Rechargeable 25hrs', Certification: 'CE Level 2' },
    inStock: true,
  },
  {
    id: '9',
    name: 'Winter Touring Gloves',
    price: 79.99,
    rating: 4.5,
    reviewCount: 203,
    image: IMG + '1615484477778-ca3b77940c25?w=600&h=600&fit=crop',
    category: 'Winter Gear',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Grey', hex: '#6B7280' },
    ],
    compatibleBikes: ['All'],
    description: 'Insulated winter riding gloves with Thinsulate lining and waterproof membrane. Heated option available.',
    specifications: { Insulation: 'Thinsulate', Waterproof: 'Yes', Touchscreen: 'Yes', Heated: 'Optional' },
    inStock: true,
  },
  {
    id: '10',
    name: 'Frame Slider Kit',
    price: 59.99,
    rating: 4.6,
    reviewCount: 312,
    image: IMG + '1558981359-219d6364c9c8?w=600&h=600&fit=crop',
    category: 'Parts',
    sizes: ['Universal'],
    colors: [
      { name: 'Black', hex: '#111111' },
      { name: 'Orange', hex: '#FF6A2B' },
    ],
    compatibleBikes: ['Yamaha YZF-R15', 'KTM Duke 200', 'KTM Duke 390', 'Honda Hornet 2.0'],
    description: 'CNC machined Delrin frame sliders to protect your bike in case of a slide. Easy bolt-on installation.',
    specifications: { Material: 'Delrin + Aluminum', Mount: 'Bolt-on', 'Crash Test': 'Passed', Weight: '280g pair' },
    inStock: true,
  },
  {
    id: '11',
    name: 'Beginner Riding Course Kit',
    price: 199.99,
    rating: 4.8,
    reviewCount: 156,
    image: IMG + '1558618666-fcd25c85f7e7?w=600&h=600&fit=crop',
    category: 'Learn To Ride',
    sizes: ['One Size'],
    colors: [{ name: 'Standard', hex: '#FF6A2B' }],
    badge: 'new',
    compatibleBikes: ['All'],
    description: 'Complete beginner kit including safety gear, instructional handbook, and online course access.',
    specifications: { Includes: 'Gloves, Vest, Book, Online Access', Duration: '30-day access', Level: 'Beginner' },
    inStock: true,
  },
  {
    id: '12',
    name: 'New Rider Starter Pack',
    price: 149.99,
    originalPrice: 199.99,
    discount: 25,
    rating: 4.7,
    reviewCount: 98,
    image: IMG + '1551028719-00167b16eac5?w=600&h=600&fit=crop',
    category: 'New Riders',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [{ name: 'Black', hex: '#111111' }],
    badge: 'discount',
    compatibleBikes: ['All'],
    description: 'Essential gear pack for new riders. Includes helmet, gloves, and rain cover.',
    specifications: { Includes: 'Helmet, Gloves, Rain Cover', 'Helmet Cert': 'DOT', Level: 'Entry' },
    inStock: true,
  },
];

export const reviews: Review[] = [
  { id: '1', user: 'Mike R.', rating: 5, date: '2025-12-15', comment: 'Best helmet I\'ve ever owned. Super lightweight and the ventilation is incredible.', verified: true },
  { id: '2', user: 'Sarah K.', rating: 4, date: '2025-11-20', comment: 'Great quality leather. The armor feels solid. Runs a bit small, size up.', verified: true },
  { id: '3', user: 'Jake T.', rating: 5, date: '2025-10-05', comment: 'These boots are tanks. Completely waterproof and super comfortable for long rides.', verified: true },
  { id: '4', user: 'Alex P.', rating: 4, date: '2025-09-18', comment: 'Good gloves for the price. Touchscreen works well. Could use more padding on the palm.', verified: false },
  { id: '5', user: 'Chris M.', rating: 5, date: '2025-08-22', comment: 'Fog lights are incredibly bright. Easy install on my Duke 390.', verified: true },
];

export const sampleAddresses: Address[] = [
  { id: '1', name: 'Home', street: '123 Rider Lane', city: 'Austin', state: 'TX', zip: '78701', phone: '(512) 555-0123', isDefault: true },
  { id: '2', name: 'Work', street: '456 Motor Ave', city: 'Dallas', state: 'TX', zip: '75201', phone: '(214) 555-0456', isDefault: false },
];

export const sampleOrders: Order[] = [
  {
    id: 'ORD-2025-001',
    date: '2025-12-20',
    status: 'delivered',
    total: 239.98,
    items: [
      { name: 'Stealth Carbon Full-Face Helmet', quantity: 1, price: 189.99, image: IMG + '1558618666-fcd25c85f7e7?w=200&h=200&fit=crop' },
      { name: 'Tactical Riding Gloves', quantity: 1, price: 49.99, image: IMG + '1615484477778-ca3b77940c25?w=200&h=200&fit=crop' },
    ],
    trackingId: 'TRK-9876543210',
  },
  {
    id: 'ORD-2025-002',
    date: '2026-01-15',
    status: 'shipped',
    total: 129.99,
    items: [
      { name: 'Michelin Road 6 Tire', quantity: 1, price: 129.99, image: IMG + '1558981285-501b9a2f22a8?w=200&h=200&fit=crop' },
    ],
    trackingId: 'TRK-1234567890',
  },
  {
    id: 'ORD-2025-003',
    date: '2026-02-01',
    status: 'processing',
    total: 449.99,
    items: [
      { name: 'Airbag Riding Vest', quantity: 1, price: 449.99, image: IMG + '1558981033-7c24ee28c09e?w=200&h=200&fit=crop' },
    ],
  },
];

export const categories = [
  { name: 'Helmets', icon: '🪖', count: 48 },
  { name: 'Riding Gears', icon: '🧥', count: 124 },
  { name: 'Parts', icon: '⚙️', count: 86 },
  { name: 'Accessories', icon: '💡', count: 203 },
  { name: 'Tires', icon: '🛞', count: 34 },
  { name: 'Airbags', icon: '🛡️', count: 12 },
  { name: 'Winter Gear', icon: '❄️', count: 45 },
  { name: 'Learn To Ride', icon: '📚', count: 8 },
  { name: 'New Riders', icon: '🏍️', count: 15 },
];

export function getProductsByCategory(category: string): Product[] {
  return products.filter(p => p.category === category);
}

export function getProductById(id: string): Product | undefined {
  return products.find(p => p.id === id);
}

export function getCompatibleProducts(brand: string, model: string): Product[] {
  const bikeName = `${brand} ${model}`;
  return products.filter(p =>
    p.compatibleBikes.includes('All') || p.compatibleBikes.includes(bikeName)
  );
}

type SectionType = 'mostViewed' | 'bestSellers' | 'deepDiscounts' | 'newArrivals' | 'airbags' | 'winterGear' | 'learnToRide' | 'newRiders' | 'topSellers' | 'backInStock';

export function getProductsForSection(section: SectionType): Product[] {
  switch (section) {
    case 'mostViewed': return products.slice(0, 6);
    case 'bestSellers': return products.filter(p => p.badge === 'bestseller');
    case 'deepDiscounts': return products.filter(p => p.discount && p.discount >= 20);
    case 'newArrivals': return products.filter(p => p.badge === 'new');
    case 'airbags': return products.filter(p => p.category === 'Airbags');
    case 'winterGear': return products.filter(p => p.category === 'Winter Gear');
    case 'learnToRide': return products.filter(p => p.category === 'Learn To Ride');
    case 'newRiders': return products.filter(p => p.category === 'New Riders');
    case 'topSellers': return products.filter(p => p.rating >= 4.7);
    case 'backInStock': return products.slice(3, 8);
    default: return products;
  }
}
