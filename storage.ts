import {
  Customer,
  Supplier,
  Product,
  KhataTransaction,
  CashEntry,
  Bill,
  Business,
  BusinessStore,
  MultiBusinessState,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CASH_ENTRIES,
  INITIAL_SHOP_PROFILE,
} from '../data/initialData';

export const STORAGE_KEYS = {
  MULTI_BUSINESS_ROOT: 'tally_multi_businesses_v2',
  LEGACY_SHOP_PROFILE: 'tally_shop_profile_v1',
  LEGACY_CUSTOMERS: 'tally_customers_v1',
  LEGACY_SUPPLIERS: 'tally_suppliers_v1',
  LEGACY_PRODUCTS: 'tally_products_v1',
  LEGACY_TRANSACTIONS: 'tally_transactions_v1',
  LEGACY_CASH_ENTRIES: 'tally_cash_entries_v1',
  LEGACY_BILLS: 'tally_bills_v1',
};

export const DEFAULT_BUSINESS_INITIAL: Business = {
  id: 'biz-default',
  name: INITIAL_SHOP_PROFILE.shopName,
  businessType: 'মুদি ও ডিপার্টমেন্টাল স্টোর',
  proprietor: INITIAL_SHOP_PROFILE.proprietor,
  phone: INITIAL_SHOP_PROFILE.phone,
  address: INITIAL_SHOP_PROFILE.address,
  tagline: INITIAL_SHOP_PROFILE.tagline,
  currencySymbol: '৳',
  enableBengaliDigits: false,
  colorTheme: 'emerald',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export function loadMultiBusinessState(): MultiBusinessState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MULTI_BUSINESS_ROOT);
    if (raw) {
      const parsed: MultiBusinessState = JSON.parse(raw);
      if (parsed.businesses && parsed.businesses.length > 0) {
        // Ensure activeBusinessId is valid
        const activeExists = parsed.businesses.some((b) => b.business.id === parsed.activeBusinessId);
        if (!activeExists) {
          parsed.activeBusinessId = parsed.businesses[0].business.id;
        }
        return parsed;
      }
    }

    // Check if legacy single-business storage exists
    const legacyShopProfile = localStorage.getItem(STORAGE_KEYS.LEGACY_SHOP_PROFILE);
    const legacyCustomers = localStorage.getItem(STORAGE_KEYS.LEGACY_CUSTOMERS);
    const legacySuppliers = localStorage.getItem(STORAGE_KEYS.LEGACY_SUPPLIERS);
    const legacyProducts = localStorage.getItem(STORAGE_KEYS.LEGACY_PRODUCTS);
    const legacyTransactions = localStorage.getItem(STORAGE_KEYS.LEGACY_TRANSACTIONS);
    const legacyCash = localStorage.getItem(STORAGE_KEYS.LEGACY_CASH_ENTRIES);
    const legacyBills = localStorage.getItem(STORAGE_KEYS.LEGACY_BILLS);

    if (legacyShopProfile || legacyCustomers) {
      const shopProfile = legacyShopProfile ? JSON.parse(legacyShopProfile) : INITIAL_SHOP_PROFILE;
      const initialBiz: Business = {
        id: 'biz-1',
        name: shopProfile.shopName || INITIAL_SHOP_PROFILE.shopName,
        businessType: 'মুদি ও জেনারেল স্টোর',
        proprietor: shopProfile.proprietor || INITIAL_SHOP_PROFILE.proprietor,
        phone: shopProfile.phone || INITIAL_SHOP_PROFILE.phone,
        address: shopProfile.address || INITIAL_SHOP_PROFILE.address,
        tagline: shopProfile.tagline || INITIAL_SHOP_PROFILE.tagline,
        currencySymbol: shopProfile.currencySymbol || '৳',
        enableBengaliDigits: shopProfile.enableBengaliDigits || false,
        colorTheme: 'emerald',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const defaultStore: BusinessStore = {
        business: initialBiz,
        customers: legacyCustomers ? JSON.parse(legacyCustomers) : INITIAL_CUSTOMERS,
        suppliers: legacySuppliers ? JSON.parse(legacySuppliers) : INITIAL_SUPPLIERS,
        products: legacyProducts ? JSON.parse(legacyProducts) : INITIAL_PRODUCTS,
        transactions: legacyTransactions ? JSON.parse(legacyTransactions) : INITIAL_TRANSACTIONS,
        cashEntries: legacyCash ? JSON.parse(legacyCash) : INITIAL_CASH_ENTRIES,
        bills: legacyBills ? JSON.parse(legacyBills) : [],
      };

      const newState: MultiBusinessState = {
        version: 2,
        activeBusinessId: initialBiz.id,
        businesses: [defaultStore],
      };
      saveMultiBusinessState(newState);
      return newState;
    }

    // Completely new setup
    const initialStore: BusinessStore = {
      business: DEFAULT_BUSINESS_INITIAL,
      customers: INITIAL_CUSTOMERS,
      suppliers: INITIAL_SUPPLIERS,
      products: INITIAL_PRODUCTS,
      transactions: INITIAL_TRANSACTIONS,
      cashEntries: INITIAL_CASH_ENTRIES,
      bills: [],
    };

    const newState: MultiBusinessState = {
      version: 2,
      activeBusinessId: DEFAULT_BUSINESS_INITIAL.id,
      businesses: [initialStore],
    };
    saveMultiBusinessState(newState);
    return newState;
  } catch (err) {
    console.error('Error loading multi-business state:', err);
    return {
      version: 2,
      activeBusinessId: DEFAULT_BUSINESS_INITIAL.id,
      businesses: [
        {
          business: DEFAULT_BUSINESS_INITIAL,
          customers: INITIAL_CUSTOMERS,
          suppliers: INITIAL_SUPPLIERS,
          products: INITIAL_PRODUCTS,
          transactions: INITIAL_TRANSACTIONS,
          cashEntries: INITIAL_CASH_ENTRIES,
          bills: [],
        },
      ],
    };
  }
}

export function saveMultiBusinessState(state: MultiBusinessState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MULTI_BUSINESS_ROOT, JSON.stringify(state));
  } catch (err) {
    console.error('Error saving multi-business state:', err);
  }
}

export function exportMultiBusinessBackupJSON(data: MultiBusinessState): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute(
    'download',
    `TallyKhata_AllBusinesses_Backup_${dateStr}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function resetAllToSampleData(): MultiBusinessState {
  const sampleBusiness2: Business = {
    id: 'biz-pharma',
    name: 'মদিনা ফার্মেসি ও ড্রাগ হাউস',
    businessType: 'ফার্মেসি ও ওষুধ',
    proprietor: 'মো: আব্দুল করিম',
    phone: '01812-998877',
    address: 'দোকান ৫, হাসপাতাল রোড, মিরপুর, ঢাকা',
    tagline: 'ন্যায্য মূল্যে খাঁটি ওষুধ ও সেবা',
    currencySymbol: '৳',
    enableBengaliDigits: false,
    colorTheme: 'blue',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const sampleStore1: BusinessStore = {
    business: DEFAULT_BUSINESS_INITIAL,
    customers: INITIAL_CUSTOMERS,
    suppliers: INITIAL_SUPPLIERS,
    products: INITIAL_PRODUCTS,
    transactions: INITIAL_TRANSACTIONS,
    cashEntries: INITIAL_CASH_ENTRIES,
    bills: [],
  };

  const sampleStore2: BusinessStore = {
    business: sampleBusiness2,
    customers: [
      {
        id: 'c-pharma-1',
        name: 'ডা: মহিউদ্দিন আহমেদ',
        phone: '01715566778',
        address: 'মিরপুর ২',
        totalDue: 3500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'c-pharma-2',
        name: 'হানিফ মজুমদার',
        phone: '01911445566',
        address: 'পল্লবী',
        totalDue: 1800,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    suppliers: [
      {
        id: 's-pharma-1',
        name: 'স্কয়ার ফার্মাসিউটিক্যালস ডিপো',
        phone: '01711002233',
        companyName: 'স্কয়ার ফার্মাসিউটিক্যালস লি:',
        address: 'তেজগাঁও, ঢাকা',
        totalPayable: 14200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    products: [
      {
        id: 'p-pharma-1',
        name: 'প্যারাসিটামল ৫০০ মি.গ্রা. (নাপা)',
        category: 'ট্যাবলেট ও ক্যাপসুল',
        unit: 'পাতা',
        purchasePrice: 10,
        sellingPrice: 13,
        stockQuantity: 120,
        minStockAlert: 20,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'p-pharma-2',
        name: 'অ্যান্টাসিড প্লাস সাসপেনশন (২০০ মিলি)',
        category: 'সিরাপ ও তরল',
        unit: 'বোতল',
        purchasePrice: 85,
        sellingPrice: 95,
        stockQuantity: 15,
        minStockAlert: 5,
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'p-pharma-3',
        name: 'সার্জিক্যাল ফেস মাস্ক (৫০ পিস বক্স)',
        category: 'চিকিৎসা সামগ্রী',
        unit: 'বক্স',
        purchasePrice: 110,
        sellingPrice: 150,
        stockQuantity: 4,
        minStockAlert: 8,
        updatedAt: new Date().toISOString(),
      },
    ],
    transactions: [
      {
        id: 'tx-pharma-1',
        partyId: 'c-pharma-1',
        partyType: 'customer',
        type: 'gave',
        amount: 3500,
        date: new Date(Date.now() - 2 * 86400000).toISOString(),
        note: 'মাসিক প্রেসক্রিপশনের ওষুধ বাকি',
      },
    ],
    cashEntries: [
      {
        id: 'cash-pharma-1',
        type: 'in',
        amount: 6200,
        category: 'নগদ বিক্রি',
        note: 'সকালের ফার্মেসি কাউন্টার বিক্রি',
        date: new Date().toISOString(),
      },
    ],
    bills: [],
  };

  const resetState: MultiBusinessState = {
    version: 2,
    activeBusinessId: DEFAULT_BUSINESS_INITIAL.id,
    businesses: [sampleStore1, sampleStore2],
  };

  saveMultiBusinessState(resetState);
  return resetState;
}
