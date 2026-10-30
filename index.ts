export type TransactionType = 'credit' | 'debit'; 
// credit = বাকি দিলাম (Customer gave IOUs / owes us money), or Mal kroy from supplier
// debit = টাকা পেলাম (Customer paid us / Cash In), or Paid supplier

export type PaymentMethod = 'cash' | 'bkash' | 'nagad' | 'rocket' | 'bank' | 'other';

export interface TransactionItem {
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface KhataTransaction {
  id: string;
  partyId: string; // Customer or Supplier ID
  partyType: 'customer' | 'supplier';
  type: 'gave' | 'received'; // gave = 'দিলাম' (বাকি দিলাম বা সাপ্লায়ারকে টাকা দিলাম), received = 'পেলাম' (টাকা পেলাম বা সাপ্লায়ারের থেকে মাল পেলাম)
  amount: number;
  date: string; // ISO date string
  note?: string;
  billNumber?: string;
  itemsSummary?: string;
  attachmentUrl?: string; // photo/receipt image
  sendSms?: boolean; // Tally message toggle
  paymentMethod?: PaymentMethod;
  items?: TransactionItem[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  totalDue: number; // positive = কাস্টমারের কাছে বাকি পাওনা, negative = অগ্রিম জমা
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  companyName?: string;
  address?: string;
  totalPayable: number; // positive = সাপ্লায়ার আমাদের কাছে টাকা পাবে
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string; // কেজি, লিটার, পিস, প্যাকেট, কার্টন
  purchasePrice: number; // ক্রয়মূল্য
  sellingPrice: number; // বিক্রয়মূল্য
  stockQuantity: number; // বর্তমান স্টক
  minStockAlert: number; // কম স্টক সতর্কতা
  barcode?: string;
  updatedAt: string;
}

export interface CashEntry {
  id: string;
  type: 'in' | 'out'; // in = ক্যাশ ইন (জমা), out = ক্যাশ আউট (খরচ)
  amount: number;
  category: string; // যেমন: বিক্রি, পাওনা আদায়, দোকান ভাড়া, বিদ্যুৎ বিল, কর্মচারীর বেতন, নাস্তা ও চা, পরিবহন, অন্যান্য
  note?: string;
  date: string;
  relatedPartyName?: string;
}

export interface BillItem {
  productId?: string;
  productName: string;
  unit: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: BillItem[];
  subTotal: number;
  discount: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentType: 'cash' | 'due' | 'partial' | 'digital';
  note?: string;
}

export interface ShopProfile {
  shopName: string;
  proprietor: string;
  phone: string;
  address: string;
  email?: string;
  tagline?: string;
  currencySymbol: string;
  enableBengaliDigits: boolean;
}

export type AccountCategory = 'business' | 'personal';

export interface Business {
  id: string;
  name: string;
  businessType: string; // যেমন: মুদি দোকান, ফার্মেসি, অথবা ব্যক্তিগত হিসাব
  accountCategory?: AccountCategory; // 'business' (ব্যবসা/দোকান) বা 'personal' (ব্যক্তিগত হিসাব)
  proprietor: string;
  phone: string;
  address: string;
  tagline?: string;
  currencySymbol: string;
  enableBengaliDigits: boolean;
  colorTheme?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple';
  createdAt: string;
  updatedAt: string;
}

export interface BusinessStore {
  business: Business;
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  transactions: KhataTransaction[];
  cashEntries: CashEntry[];
  bills: Bill[];
}

export interface MultiBusinessState {
  version: number;
  activeBusinessId: string;
  businesses: BusinessStore[];
}

export type ActiveTab = 'home' | 'customers' | 'suppliers' | 'inventory' | 'cashbook' | 'reports';

