// ── Demo Users ──────────────────────────────────────────────
export const demoUsers = {
  buyer: {
    id: 'u1',
    name: 'Zayan Ahmed',
    email: 'zayan@example.com',
    role: 'buyer',
    initials: 'ZA',
    password: 'buyer123',
  },
  seller: {
    id: 'u2',
    name: 'M. Soban',
    email: 'soban@example.com',
    role: 'seller',
    initials: 'MS',
    password: 'seller123',
  },
  admin: {
    id: 'u3',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    initials: 'AD',
    password: 'admin123',
  },
};

// ── Product Listings ────────────────────────────────────────
export const products = [
  {
    id: 'p1',
    title: 'Honda Civic Alloy Rims',
    subtitle: 'Set of 4 · 16 inch',
    description:
      'Good condition alloy rims, no cracks. Slight cosmetic scratches on one rim. Selling as set only. Pickup from Lahore only.',
    category: 'Wheels & Tyres',
    condition: 'Used — Good',
    price: 12800,
    type: 'auction',
    sellerId: 'u2',
    sellerName: 'M. Soban',
    sellerInitials: 'MS',
    sellerVerified: true,
    auctionEndsIn: '2h 14m',
    auctionEndTime: Date.now() + 2 * 60 * 60 * 1000 + 14 * 60 * 1000,
    startingPrice: 8000,
    currentBid: 12800,
    bids: [
      { user: 'User ***23', amount: 12800, time: '5 min ago' },
      { user: 'User ***88', amount: 11500, time: '22 min ago' },
      { user: 'User ***44', amount: 10000, time: '1 hr ago' },
    ],
  },
  {
    id: 'p2',
    title: 'Toyota Camry Headlight',
    subtitle: '2018–2022 compatible',
    description:
      'OEM headlight assembly for Toyota Camry. Crystal clear lens, no fogging. Plug-and-play installation. Left side (driver).',
    category: 'Electrical',
    condition: 'New',
    price: 4500,
    type: 'fixed',
    sellerId: 'u2',
    sellerName: 'M. Soban',
    sellerInitials: 'MS',
    sellerVerified: true,
  },
  {
    id: 'p3',
    title: 'Suzuki Alto Engine Cover',
    subtitle: 'OEM part · Used',
    description:
      'Original engine cover for Suzuki Alto VXR/VXL. Minor scratches but fully functional. All mounting clips intact.',
    category: 'Engine parts',
    condition: 'Used — Good',
    price: 2200,
    type: 'bargain',
    sellerId: 'u2',
    sellerName: 'M. Soban',
    sellerInitials: 'MS',
    sellerVerified: true,
    bargainMin: 1800,
    bargainMax: 2200,
    offers: [
      {
        id: 'o1',
        buyerUser: 'User ***71',
        amount: 1900,
        status: 'pending',
        time: '3 hr ago',
      },
    ],
  },
  {
    id: 'p4',
    title: 'Corolla Side Mirror (L)',
    subtitle: '2014–2019 · OEM',
    description:
      'Left-side mirror assembly for Toyota Corolla. Includes motor and glass. Tested and working.',
    category: 'Body & exterior',
    condition: 'Used — Good',
    price: 3800,
    type: 'fixed',
    sellerId: 'u2',
    sellerName: 'M. Soban',
    sellerInitials: 'MS',
    sellerVerified: true,
  },
  {
    id: 'p5',
    title: 'Suzuki Baleno Front Bumper',
    subtitle: '2019–2023',
    description:
      'Aftermarket front bumper for Suzuki Baleno. Primed, ready for paint. Perfect fitment.',
    category: 'Body & exterior',
    condition: 'New',
    price: 5600,
    type: 'auction',
    sellerId: 'u2',
    sellerName: 'M. Soban',
    sellerInitials: 'MS',
    sellerVerified: true,
    auctionEndsIn: '8h 50m',
    auctionEndTime: Date.now() + 8 * 60 * 60 * 1000 + 50 * 60 * 1000,
    startingPrice: 3500,
    currentBid: 5600,
    bids: [
      { user: 'User ***12', amount: 5600, time: '10 min ago' },
      { user: 'User ***77', amount: 5000, time: '1 hr ago' },
    ],
  },
  {
    id: 'p6',
    title: 'Mehran Gear Knob',
    subtitle: 'Universal fit',
    description:
      'Chrome-finish gear knob, universal fit for most Pakistani cars. Includes adapter rings.',
    category: 'Interior',
    condition: 'New',
    price: 850,
    type: 'bargain',
    sellerId: 'u2',
    sellerName: 'M. Soban',
    sellerInitials: 'MS',
    sellerVerified: true,
    bargainMin: 600,
    bargainMax: 850,
    offers: [],
  },
];

// ── Buyer Purchase History ──────────────────────────────────
export const purchases = [
  {
    id: 'pur1',
    item: 'Toyota Camry Headlight',
    method: 'fixed',
    amount: 4500,
    date: '10 Mar 2026',
    status: 'Completed',
  },
  {
    id: 'pur2',
    item: 'Mehran Gear Knob',
    method: 'bargain',
    amount: 650,
    date: '5 Mar 2026',
    status: 'Completed',
  },
  {
    id: 'pur3',
    item: 'Corolla Side Mirror (L)',
    method: 'auction',
    amount: 3200,
    date: '28 Feb 2026',
    status: 'Completed',
  },
];

export const buyerBids = [
  {
    id: 'bid1',
    item: 'Honda Civic Alloy Rims',
    yourBid: 12800,
    currentBid: 12800,
    endsIn: '2h 14m',
    status: 'Winning',
  },
  {
    id: 'bid2',
    item: 'Suzuki Baleno Front Bumper',
    yourBid: 5000,
    currentBid: 5600,
    endsIn: '8h 50m',
    status: 'Outbid',
  },
];

export const buyerOffers = [
  {
    id: 'off1',
    item: 'Suzuki Alto Engine Cover',
    offered: 1900,
    listed: 2200,
    status: 'Pending',
    time: '3 hr ago',
  },
];

// ── Seller Data ─────────────────────────────────────────────
export const sellerListings = [
  {
    id: 'p1',
    product: 'Honda Civic Alloy Rims',
    type: 'auction',
    price: 12800,
    status: 'Live',
  },
  {
    id: 'p2',
    product: 'Toyota Camry Headlight',
    type: 'fixed',
    price: 4500,
    status: 'Live',
  },
  {
    id: 'p3',
    product: 'Suzuki Alto Engine Cover',
    type: 'bargain',
    price: 2200,
    status: 'Offer pending',
  },
];

export const sellerOffers = [
  {
    id: 'so1',
    product: 'Suzuki Alto Engine Cover',
    offerAmount: 1900,
    listedPrice: 2200,
    buyer: 'User ***71',
    status: 'pending',
  },
  {
    id: 'so2',
    product: 'Toyota Camry Headlight',
    offerAmount: 4000,
    listedPrice: 4500,
    buyer: 'User ***55',
    status: 'pending',
  },
];

// ── Admin Data ──────────────────────────────────────────────
export const adminStats = {
  totalUsers: 142,
  usersThisWeek: 12,
  activeListings: 38,
  listingsToday: 5,
  liveAuctions: 9,
  endingSoon: 3,
  pendingOffers: 14,
  acrossSellers: 8,
};

export const adminActivity = [
  {
    id: 'a1',
    text: 'New user registered — <b>Ali Hassan</b> (Buyer)',
    time: '2 min ago',
  },
  {
    id: 'a2',
    text: 'Auction ended — <b>Corolla Side Mirror</b> won by User ***44',
    time: '18 min ago',
  },
  {
    id: 'a3',
    text: 'Offer accepted — <b>PKR 1,900</b> for Suzuki Alto Engine Cover',
    time: '45 min ago',
  },
  {
    id: 'a4',
    text: 'New listing — <b>Brake Pads</b> by M. Soban',
    time: '1 hr ago',
  },
  {
    id: 'a5',
    text: 'User deactivated — <b>Spam Account #44</b>',
    time: '2 hr ago',
  },
];

export const adminUsers = [
  { id: 'u1', name: 'Zayan Ahmed', email: 'zayan@example.com', role: 'Buyer', status: 'Active', joined: '1 Mar 2026' },
  { id: 'u2', name: 'M. Soban', email: 'soban@example.com', role: 'Seller', status: 'Active', joined: '15 Jan 2026' },
  { id: 'u4', name: 'Ali Hassan', email: 'ali@example.com', role: 'Buyer', status: 'Active', joined: '10 Apr 2026' },
  { id: 'u5', name: 'Sara Khan', email: 'sara@example.com', role: 'Seller', status: 'Active', joined: '20 Feb 2026' },
  { id: 'u6', name: 'Ahmed Raza', email: 'ahmed@example.com', role: 'Buyer', status: 'Inactive', joined: '5 Dec 2025' },
];

// ── Categories ──────────────────────────────────────────────
export const categories = [
  'Engine parts',
  'Body & exterior',
  'Wheels & Tyres',
  'Electrical',
  'Interior',
  'Brakes',
  'Suspension',
  'Transmission',
];
