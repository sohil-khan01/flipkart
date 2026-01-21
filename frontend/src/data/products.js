export const categories = [
  { id: 'mobiles', name: 'Mobiles', iconText: '📱' },
  { id: 'fashion', name: 'Fashion', iconText: '👕' },
  { id: 'electronics', name: 'Electronics', iconText: '💻' },
  { id: 'home', name: 'Home & Furniture', iconText: '🏠' },
  { id: 'appliances', name: 'TVs & Appliances', iconText: '📺' },
  { id: 'beauty', name: 'Beauty & Personal Care', iconText: '💄' },
  { id: 'grocery', name: 'Grocery', iconText: '🛒' },
  { id: 'toys', name: 'Toys', iconText: '🧸' },
];

export const heroBanners = [
  {
    id: 'banner-1',
    title: 'Big Savings Week',
    subtitle: 'Up to 60% off on top picks',
    cta: 'Shop Deals',
    gradient: 'from-blue-600 via-blue-700 to-indigo-800',
  },
  {
    id: 'banner-2',
    title: 'New Launches',
    subtitle: 'Fresh arrivals across categories',
    cta: 'Explore',
    gradient: 'from-indigo-700 via-purple-700 to-pink-700',
  },
  {
    id: 'banner-3',
    title: 'Home Refresh',
    subtitle: 'Stylish essentials for every room',
    cta: 'See More',
    gradient: 'from-sky-600 via-blue-700 to-cyan-700',
  },
];

export const products = [
  {
    id: 'p-101',
    title: 'Nova X1 5G Smartphone (8GB/128GB)',
    category: 'mobiles',
    price: 17999,
    mrp: 22999,
    discountPercent: 22,
    rating: 4.3,
    ratingCount: 18432,
    images: [
      'https://picsum.photos/seed/phone-front/800/800',
      'https://picsum.photos/seed/phone-back/800/800',
      'https://picsum.photos/seed/phone-side/800/800',
    ],
    highlights: ['120Hz Display', '5000mAh Battery', '50MP Camera', '5G Ready'],
    specs: {
      Brand: 'Nova',
      Processor: 'Octa-core 2.4GHz',
      Display: '6.6" FHD+ 120Hz',
      Battery: '5000mAh',
      Warranty: '1 Year',
    },
    offers: ['10% instant discount with select cards (placeholder)', 'No-cost EMI available (placeholder)'],
  },
  {
    id: 'p-102',
    title: 'AeroPods Wireless Earbuds with ANC',
    category: 'electronics',
    price: 2499,
    mrp: 4999,
    discountPercent: 50,
    rating: 4.1,
    ratingCount: 5621,
    images: [
      'https://picsum.photos/seed/earbuds-case/800/800',
      'https://picsum.photos/seed/earbuds/800/800',
      'https://picsum.photos/seed/earbuds-life/800/800',
    ],
    highlights: ['Active Noise Cancellation', '30H Playback', 'Fast Charge', 'Low Latency Mode'],
    specs: {
      Brand: 'Aero',
      Connectivity: 'Bluetooth 5.3',
      Microphone: 'ENC',
      Playback: 'Up to 30 hours',
      Warranty: '1 Year',
    },
    offers: ['Extra ₹200 off on UPI (placeholder)', 'Free delivery over ₹499 (placeholder)'],
  },
  {
    id: 'p-103',
    title: 'UrbanFit Men’s Sneakers',
    category: 'fashion',
    price: 1299,
    mrp: 2599,
    discountPercent: 50,
    rating: 4.0,
    ratingCount: 9012,
    images: [
      'https://picsum.photos/seed/sneakers-1/800/800',
      'https://picsum.photos/seed/sneakers-2/800/800',
      'https://picsum.photos/seed/sneakers-3/800/800',
    ],
    highlights: ['Breathable Mesh', 'Cushioned Sole', 'Everyday Comfort', 'Lightweight'],
    specs: {
      Brand: 'UrbanFit',
      Material: 'Mesh + EVA',
      Sole: 'Rubber',
      Fit: 'Regular',
      Warranty: 'N/A',
    },
    offers: ['Buy 2 save extra (placeholder)', 'Easy returns (placeholder)'],
  },
  {
    id: 'p-104',
    title: 'AuraHome Queen Bedsheet Set (3 pcs)',
    category: 'home',
    price: 899,
    mrp: 1499,
    discountPercent: 40,
    rating: 4.4,
    ratingCount: 2310,
    images: [
      'https://picsum.photos/seed/bedsheet-set/800/800',
      'https://picsum.photos/seed/fabric-closeup/800/800',
      'https://picsum.photos/seed/bedroom-shot/800/800',
    ],
    highlights: ['Soft Microfiber', 'Fade Resistant', '1 Bedsheet + 2 Pillow Covers', 'Machine Washable'],
    specs: {
      Brand: 'AuraHome',
      Size: 'Queen',
      Fabric: 'Microfiber',
      Pattern: 'Geometric',
      Warranty: 'N/A',
    },
    offers: ['Extra 5% off on prepaid (placeholder)', 'Combo savings (placeholder)'],
  },
  {
    id: 'p-105',
    title: 'FrostCool 190L Single Door Refrigerator',
    category: 'appliances',
    price: 13499,
    mrp: 16999,
    discountPercent: 20,
    rating: 4.2,
    ratingCount: 1187,
    images: [
      'https://picsum.photos/seed/refrigerator/800/800',
      'https://picsum.photos/seed/fridge-interior/800/800',
      'https://picsum.photos/seed/energy-label/800/800',
    ],
    highlights: ['Direct Cool', 'Stabilizer Free', 'Fast Ice Making', '2 Star Rating'],
    specs: {
      Brand: 'FrostCool',
      Capacity: '190L',
      Type: 'Single Door',
      Cooling: 'Direct Cool',
      Warranty: '1 Year + 10 Years Compressor',
    },
    offers: ['Exchange offer available (placeholder)', 'No-cost EMI (placeholder)'],
  },
  {
    id: 'p-106',
    title: 'GlowUp Matte Lipstick Combo (Pack of 3)',
    category: 'beauty',
    price: 799,
    mrp: 1299,
    discountPercent: 38,
    rating: 4.5,
    ratingCount: 443,
    images: [
      'https://picsum.photos/seed/lipsticks/800/800',
      'https://picsum.photos/seed/swatches/800/800',
      'https://picsum.photos/seed/packaging/800/800',
    ],
    highlights: ['Long Lasting', 'Non-Drying', 'Bold Pigment', '3 Shades Included'],
    specs: {
      Brand: 'GlowUp',
      Finish: 'Matte',
      Net: '3 x 3.5g',
      ShelfLife: '24 Months',
      Warranty: 'N/A',
    },
    offers: ['Free gift on orders above ₹999 (placeholder)', 'Extra ₹100 off on UPI (placeholder)'],
  },
];

export function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

export function formatINR(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
