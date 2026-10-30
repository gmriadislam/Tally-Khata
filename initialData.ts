import { Customer, Supplier, Product, CashEntry, KhataTransaction, ShopProfile } from '../types';

export const INITIAL_SHOP_PROFILE: ShopProfile = {
  shopName: 'বিসমিল্লাহ জেনারেল স্টোর',
  proprietor: 'মো: আব্দুল করিম',
  phone: '01712-345678',
  address: 'দোকান নং ১২, কাঁচাবাজার মোড়, মিরপুর-১০, ঢাকা',
  tagline: 'ন্যায্য মূল্যে নির্ভরযোগ্য পণ্য ও সেবার বিশ্বস্ত প্রতিষ্ঠান',
  currencySymbol: '৳',
  enableBengaliDigits: false,
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'মো: রফিকুল ইসলাম',
    phone: '01711223344',
    address: 'বাড়ি নং ৪৫, রোড ৩, মিরপুর',
    totalDue: 2450, // owes 2450 tk
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'cust-2',
    name: 'আব্দুল কাদের চৌধুরী',
    phone: '01819876543',
    address: 'ব্লক-সি, মিরপুর',
    totalDue: 5800,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'cust-3',
    name: 'মোছা: সালমা বেগম',
    phone: '01912348899',
    address: 'হাউজিং কলোনি',
    totalDue: 1200,
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'cust-4',
    name: 'মাস্টার জয়নাল আবেদিন',
    phone: '01671990011',
    address: 'স্কুল রোড',
    totalDue: 0, // no due
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'cust-5',
    name: 'হাজী বশির উল্লাহ',
    phone: '01733445566',
    address: 'বাজার গলি',
    totalDue: -500, // advance deposit of 500 tk
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'supp-1',
    name: 'মেঘনা ডিস্ট্রিবিউশন (ফ্রেশ)',
    phone: '01710998877',
    companyName: 'মেঘনা গ্রুপ অফ ইন্ডাস্ট্রিজ',
    address: 'তেজগাঁও শিল্পাঞ্চল, ঢাকা',
    totalPayable: 18500, // We have to pay them 18500 tk
    createdAt: new Date(Date.now() - 45 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'supp-2',
    name: 'প্রাণ ফুডস সাপ্লাই',
    phone: '01811224466',
    companyName: 'প্রাণ-আরএফএল গ্রুপ',
    address: 'টঙ্গী, গাজীপুর',
    totalPayable: 9200,
    createdAt: new Date(Date.now() - 60 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  },
  {
    id: 'supp-3',
    name: 'কাওসার ডিম ও পোল্ট্রি আড়ত',
    phone: '01915667788',
    companyName: 'লোকাল আড়তদার',
    address: 'কাওরান বাজার',
    totalPayable: 4500,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'মিনিকেট চাল (৫০ কেজি বস্তা)',
    category: 'চাল ও আটা',
    unit: 'বস্তা',
    purchasePrice: 3150,
    sellingPrice: 3450,
    stockQuantity: 14,
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-2',
    name: 'রূপচাঁদা সয়াবিন তেল (৫ লিটার)',
    category: 'তেল ও ঘি',
    unit: 'বোতল',
    purchasePrice: 870,
    sellingPrice: 935,
    stockQuantity: 4, // low stock!
    minStockAlert: 8,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-3',
    name: 'সাদা চিনি (১ কেজি প্যাকেট)',
    category: 'মুদি মালামাল',
    unit: 'কেজি',
    purchasePrice: 128,
    sellingPrice: 140,
    stockQuantity: 45,
    minStockAlert: 15,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-4',
    name: 'দেশি মসুর ডাল',
    category: 'মুদি মালামাল',
    unit: 'কেজি',
    purchasePrice: 135,
    sellingPrice: 155,
    stockQuantity: 28,
    minStockAlert: 10,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-5',
    name: 'ফার্মের লাল ডিম (১০০ পিস)',
    category: 'ডিম ও দুগ্ধজাত',
    unit: '১০০ পিস',
    purchasePrice: 1150,
    sellingPrice: 1280,
    stockQuantity: 3, // low stock!
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-6',
    name: 'ডানো গুঁড়ো দুধ (৫০০ গ্রাম)',
    category: 'ডিম ও দুগ্ধজাত',
    unit: 'প্যাকেট',
    purchasePrice: 430,
    sellingPrice: 470,
    stockQuantity: 12,
    minStockAlert: 6,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-7',
    name: 'লাক্স বিউটি সোপ (১০০ গ্রাম)',
    category: 'প্রসাধন ও টয়লেট্রিজ',
    unit: 'পিস',
    purchasePrice: 58,
    sellingPrice: 70,
    stockQuantity: 36,
    minStockAlert: 12,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'prod-8',
    name: 'তিব্বত হুইল গুঁড়ো সাবান (১ কেজি)',
    category: 'প্রসাধন ও টয়লেট্রিজ',
    unit: 'প্যাকেট',
    purchasePrice: 115,
    sellingPrice: 135,
    stockQuantity: 18,
    minStockAlert: 10,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_TRANSACTIONS: KhataTransaction[] = [
  {
    id: 'tx-1',
    partyId: 'cust-1',
    partyType: 'customer',
    type: 'gave', // বাকি দিলাম
    amount: 1450,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    note: 'মিনিকেট চাল ১ বস্তা ও ২ কেজি চিনি বাকি নিল',
  },
  {
    id: 'tx-2',
    partyId: 'cust-1',
    partyType: 'customer',
    type: 'gave',
    amount: 1000,
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    note: 'তেল ও ডাল নিল',
  },
  {
    id: 'tx-3',
    partyId: 'cust-2',
    partyType: 'customer',
    type: 'gave',
    amount: 7800,
    date: new Date(Date.now() - 6 * 86400000).toISOString(),
    note: 'মাসিক বাজারের অর্ধেক বাকি',
  },
  {
    id: 'tx-4',
    partyId: 'cust-2',
    partyType: 'customer',
    type: 'received', // জমা পেলাম
    amount: 2000,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: 'বিকাশে নগদ জমা দিল',
  },
  {
    id: 'tx-5',
    partyId: 'cust-3',
    partyType: 'customer',
    type: 'gave',
    amount: 1200,
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    note: 'গুঁড়ো দুধ ও সাবান নিল',
  },
  {
    id: 'tx-6',
    partyId: 'supp-1',
    partyType: 'supplier',
    type: 'received', // মাল নিলাম (দেনা বাড়ল)
    amount: 25000,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    note: 'সয়াবিন তেল ও আটা চালানের মাল ডেলিভারি',
  },
  {
    id: 'tx-7',
    partyId: 'supp-1',
    partyType: 'supplier',
    type: 'gave', // টাকা পরিশোধ করলাম (দেনা কমল)
    amount: 6500,
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    note: 'চেক মারফত আংশিক পরিশোধ',
  },
];

export const INITIAL_CASH_ENTRIES: CashEntry[] = [
  {
    id: 'cash-1',
    type: 'in',
    amount: 8500,
    category: 'নগদ বিক্রি',
    note: 'সকালের নগদ খুচরা বিক্রি',
    date: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'cash-2',
    type: 'in',
    amount: 2000,
    category: 'বাকি আদায়',
    note: 'আব্দুল কাদের চৌধুরীর থেকে আদায়',
    date: new Date(Date.now() - 4 * 3600000).toISOString(),
    relatedPartyName: 'আব্দুল কাদের চৌধুরী',
  },
  {
    id: 'cash-3',
    type: 'out',
    amount: 350,
    category: 'চা ও নাস্তা',
    note: 'দোকানের বিকেলের চা-বিস্কুট',
    date: new Date(Date.now() - 1 * 3600000).toISOString(),
  },
  {
    id: 'cash-4',
    type: 'out',
    amount: 1200,
    category: 'পরিবহন খরচ',
    note: 'বাজার থেকে মালামাল ভ্যান ভাড়া',
    date: new Date(Date.now() - 6 * 3600000).toISOString(),
  },
  {
    id: 'cash-5',
    type: 'in',
    amount: 14200,
    category: 'নগদ বিক্রি',
    note: 'গতকালের সম্পূর্ণ ক্যাশ কাউন্টার',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
];

/* ==========================================================================
   PERSONAL ACCOUNT SAMPLE DATA (ব্যক্তিগত হিসাবের ডেমো ডেটা)
   ========================================================================== */

export const PERSONAL_ACCOUNT_TYPES = [
  'ব্যক্তিগত দৈনন্দিন হিসাব (Personal Daily)',
  'পারিবারিক ও সংসার বাজেট (Family & Household)',
  'ব্যক্তিগত ধার-দেনা ও ঋণ খতিয়ান (Personal Loan & Debt)',
  'মেস / ব্যাচেলর মিল ও খরচ (Bachelor / Mess Expense)',
  'ফ্রিল্যান্সার ও পেশাগত আয়-ব্যয় (Freelance & Professional)',
  'অন্যান্য ব্যক্তিগত হিসাব',
];

export const COMMERCIAL_BUSINESS_TYPES = [
  'মুদি ও জেনারেল স্টোর',
  'ফার্মেসি ও ড্রাগ হাউস',
  'কাপড় ও গার্মেন্টসের দোকান',
  'ইলেকট্রনিক্স ও মোবাইল শপ',
  'ডিপার্টমেন্টাল ও সুপারশপ',
  'পাইকারি আড়ত ও ডিলার',
  'বই, খাতা ও স্টেশনারি',
  'রেস্টুরেন্ট, ক্যাফে ও ফাস্টফুড',
  'কনফেকশনারি ও বেকারি',
  'হার্ডওয়্যার ও স্যানিটারি',
  'অন্যান্য ব্যবসা',
];

export const INITIAL_PERSONAL_CUSTOMERS: Customer[] = [
  {
    id: 'pers-cust-1',
    name: 'মো: তারেক (বন্ধু)',
    phone: '01711998877',
    address: 'মিরপুর-২, ঢাকা',
    totalDue: 2500, // ধার দিয়েছি
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'pers-cust-2',
    name: 'তানভীর আহমেদ (সহকর্মী)',
    phone: '01819776655',
    address: 'অফিস কলিগ',
    totalDue: 1000, // ধার দিয়েছি
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'pers-cust-3',
    name: 'মামুনুল হক (আত্মীয়)',
    phone: '01912334455',
    address: 'উত্তরা',
    totalDue: 0, // শোধ
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_PERSONAL_SUPPLIERS: Supplier[] = [
  {
    id: 'pers-supp-1',
    name: 'চাচা (হাজী মোশাররফ)',
    phone: '01715667788',
    companyName: 'পারিবারিক ঋণ',
    address: 'গ্রামের বাড়ি',
    totalPayable: 5000, // দেনা দিতে হবে
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    id: 'pers-supp-2',
    name: 'সিটি ব্যাংক ক্রেডিট কার্ড',
    phone: '16234',
    companyName: 'ব্যাংক ক্রেডিট',
    address: 'কার্ড বিল',
    totalPayable: 4200,
    createdAt: new Date(Date.now() - 18 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
];

export const INITIAL_PERSONAL_PRODUCTS: Product[] = [
  {
    id: 'pers-prod-1',
    name: 'বাসার চাল (মিনিকেট)',
    category: 'পারিবারিক বাজার',
    unit: 'কেজি',
    purchasePrice: 72,
    sellingPrice: 72,
    stockQuantity: 25,
    minStockAlert: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pers-prod-2',
    name: 'সয়াবিন তেল',
    category: 'পারিবারিক বাজার',
    unit: 'লিটার',
    purchasePrice: 180,
    sellingPrice: 180,
    stockQuantity: 5,
    minStockAlert: 2,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'pers-prod-3',
    name: 'গ্যাস সিলিন্ডার (১২ কেজি)',
    category: 'গৃহস্থালি বিল',
    unit: 'পিস',
    purchasePrice: 1450,
    sellingPrice: 1450,
    stockQuantity: 1,
    minStockAlert: 1,
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PERSONAL_TRANSACTIONS: KhataTransaction[] = [
  {
    id: 'pers-tx-1',
    partyId: 'pers-cust-1',
    partyType: 'customer',
    type: 'gave',
    amount: 2500,
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    note: 'জরুরি প্রয়োজনে হাতখরচ ধার দিয়েছি',
  },
  {
    id: 'pers-tx-2',
    partyId: 'pers-cust-2',
    partyType: 'customer',
    type: 'gave',
    amount: 1000,
    date: new Date(Date.now() - 8 * 86400000).toISOString(),
    note: 'লাঞ্চ ও উবার ভাড়ার ধার দিয়েছি',
  },
  {
    id: 'pers-tx-3',
    partyId: 'pers-supp-1',
    partyType: 'supplier',
    type: 'received',
    amount: 5000,
    date: new Date(Date.now() - 12 * 86400000).toISOString(),
    note: 'বাসা ভাড়ার জন্য চাচা থেকে ধার নিয়েছি',
  },
];

export const INITIAL_PERSONAL_CASH_ENTRIES: CashEntry[] = [
  {
    id: 'pers-cash-1',
    type: 'in',
    amount: 45000,
    category: 'মাসিক বেতন',
    note: 'অক্টোবর মাসের বেতন জমা',
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'pers-cash-2',
    type: 'in',
    amount: 8000,
    category: 'টিউশনি ও ফ্রিল্যান্সিং',
    note: 'প্রজেক্ট পেমেন্ট জমা',
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'pers-cash-3',
    type: 'out',
    amount: 12000,
    category: 'বাসা ভাড়া',
    note: 'চলতি মাসের বাসা ভাড়া প্রদান',
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'pers-cash-4',
    type: 'out',
    amount: 6500,
    category: 'মাসিক কাঁচাবাজার',
    note: 'চাল, ডাল, তেল, মাছ ও মাংস',
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'pers-cash-5',
    type: 'out',
    amount: 1850,
    category: 'বিদ্যুৎ ও গ্যাস বিল',
    note: 'ইউটিলিটি বিল পরিশোধ',
    date: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
  {
    id: 'pers-cash-6',
    type: 'out',
    amount: 500,
    category: 'মোবাইল রিচার্জ',
    note: 'ইন্টারনেট ডাটা প্যাক',
    date: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
];

