import {
  Business,
  Customer,
  Supplier,
  Product,
  KhataTransaction,
  CashEntry,
  Bill,
  BusinessStore,
} from '../types';
import { formatBengaliDate } from './formatters';

/**
 * Escapes a single CSV cell value and wraps in quotes if needed
 */
function escapeCSVCell(val: unknown): string {
  if (val === undefined || val === null) return '""';
  const str = String(val);
  // If string contains comma, quote, or newline, escape internal quotes and wrap
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Downloads arbitrary 2D array of cells as CSV with UTF-8 BOM for Bengali support in Excel
 */
export function downloadCSV(rows: (string | number)[][], fileName: string): void {
  const csvContent = rows
    .map((row) => row.map((cell) => escapeCSVCell(cell)).join(','))
    .join('\r\n');

  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens Bengali text cleanly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', fileName);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Downloads arbitrary object as JSON file
 */
export function downloadJSON(data: unknown, fileName: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', fileName);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

const PAYMENT_METHOD_NAMES: Record<string, string> = {
  cash: 'নগদ ক্যাশ',
  bkash: 'বিকাশ',
  nagad: 'নগদ',
  rocket: 'রকেট',
  bank: 'ব্যাংক',
  other: 'অন্যান্য',
};

/**
 * Export all Transactions (Customer & Supplier Khata) as CSV
 */
export function exportTransactionsToCSV(
  transactions: KhataTransaction[],
  customers: Customer[],
  suppliers: Supplier[],
  shop: Business
): void {
  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const supplierMap = new Map(suppliers.map((s) => [s.id, s]));

  const headers = [
    'তারিখ ও সময়',
    'খাতার ধরণ',
    'নাম (কাস্টমার / সাপ্লায়ার)',
    'মোবাইল নম্বর',
    'ঠিকানা',
    'লেনদেনের ধরণ',
    'টাকার পরিমাণ (৳)',
    'পরিশোধের মাধ্যম',
    'বিক্রিত / ক্রয়কৃত মালামাল',
    'বিবরণ / নোট',
    'মেমো / ভাউচার নং',
  ];

  const rows: (string | number)[][] = [headers];

  const sortedTx = [...transactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  sortedTx.forEach((tx) => {
    const isCustomer = tx.partyType === 'customer';
    const partyCust = isCustomer ? customerMap.get(tx.partyId) : undefined;
    const partySupp = !isCustomer ? supplierMap.get(tx.partyId) : undefined;

    const partyName = partyCust?.name || partySupp?.name || (isCustomer ? 'অজ্ঞাত কাস্টমার' : 'অজ্ঞাত সাপ্লায়ার');
    const phone = partyCust?.phone || partySupp?.phone || '';
    const address = partyCust?.address || partySupp?.address || '';

    let txTypeStr = '';
    if (isCustomer) {
      txTypeStr = tx.type === 'gave' ? 'বাকি বিক্রি (দিলাম)' : 'টাকা জমা (পেলাম)';
    } else {
      txTypeStr = tx.type === 'gave' ? 'টাকা পরিশোধ (দিলাম)' : 'চালানের মাল গ্রহণ (পেলাম)';
    }

    // Format itemized goods
    let itemsStr = '';
    if (tx.items && tx.items.length > 0) {
      itemsStr = tx.items
        .map((it) => `${it.name} (${it.quantity} ${it.unit} × ৳${it.unitPrice} = ৳${it.total})`)
        .join('; ');
    } else if (tx.itemsSummary) {
      itemsStr = tx.itemsSummary;
    }

    const paymentStr = tx.paymentMethod ? (PAYMENT_METHOD_NAMES[tx.paymentMethod] || tx.paymentMethod) : 'ক্যাশ';

    rows.push([
      formatBengaliDate(tx.date, true),
      isCustomer ? 'কাস্টমার খাতা' : 'সাপ্লায়ার খাতা',
      partyName,
      phone,
      address,
      txTypeStr,
      tx.amount,
      paymentStr,
      itemsStr,
      tx.note || '',
      tx.billNumber || '',
    ]);
  });

  const cleanShopName = shop.name.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(rows, `${cleanShopName}_Transactions_Ledger_${dateStr}.csv`);
}

/**
 * Export Inventory & Stock List as CSV
 */
export function exportInventoryToCSV(products: Product[], shop: Business): void {
  const headers = [
    'পণ্যের নাম',
    'ক্যাটাগরি',
    'বর্তমান স্টক (মজুদ)',
    'একক',
    'ক্রয়মূল্য (৳)',
    'বিক্রয়মূল্য (৳)',
    'মোট মজুদ ক্রয়মূল্য (৳)',
    'মোট সম্ভাব্য বিক্রয়মূল্য (৳)',
    'প্রত্যাশিত মোট লাভ (৳)',
    'সতর্কবার্তা লেভেল (মিনিমাম)',
    'স্টক অবস্থা',
  ];

  const rows: (string | number)[][] = [headers];

  products.forEach((p) => {
    const totalBuying = p.purchasePrice * p.stockQuantity;
    const totalSelling = p.sellingPrice * p.stockQuantity;
    const profit = totalSelling - totalBuying;

    let status = 'পর্যাপ্ত স্টক';
    if (p.stockQuantity <= 0) {
      status = 'স্টক শেষ (০)';
    } else if (p.stockQuantity <= p.minStockAlert) {
      status = 'সতর্কতা (স্টক কম)';
    }

    rows.push([
      p.name,
      p.category || 'সাধারণ',
      p.stockQuantity,
      p.unit,
      p.purchasePrice,
      p.sellingPrice,
      totalBuying,
      totalSelling,
      profit,
      p.minStockAlert,
      status,
    ]);
  });

  const cleanShopName = shop.name.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(rows, `${cleanShopName}_Inventory_Stock_${dateStr}.csv`);
}

/**
 * Export Customer Balances as CSV
 */
export function exportCustomersToCSV(customers: Customer[], shop: Business): void {
  const headers = [
    'কাস্টমারের নাম',
    'মোবাইল নম্বর',
    'ঠিকানা',
    'বর্তমান বাকি পাওনা (৳)',
    'বর্তমান অগ্রিম জমা (৳)',
    'বর্তমান স্থিতি',
  ];

  const rows: (string | number)[][] = [headers];

  customers.forEach((c) => {
    const isDue = c.totalDue > 0;
    const isAdvance = c.totalDue < 0;
    const status = isDue ? 'বাকিদার' : isAdvance ? 'অগ্রিম ক্যাশ জমা' : 'পরিশোধিত';

    rows.push([
      c.name,
      c.phone || '',
      c.address || '',
      isDue ? c.totalDue : 0,
      isAdvance ? Math.abs(c.totalDue) : 0,
      status,
    ]);
  });

  const cleanShopName = shop.name.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(rows, `${cleanShopName}_Customers_Due_List_${dateStr}.csv`);
}

/**
 * Export Supplier Balances as CSV
 */
export function exportSuppliersToCSV(suppliers: Supplier[], shop: Business): void {
  const headers = [
    'সাপ্লায়ারের নাম',
    'কোম্পানির নাম',
    'মোবাইল নম্বর',
    'ঠিকানা',
    'মোট দেনা (মহাজন পাবে) (৳)',
    'বর্তমান স্থিতি',
  ];

  const rows: (string | number)[][] = [headers];

  suppliers.forEach((s) => {
    const isPayable = s.totalPayable > 0;
    const status = isPayable ? 'দেনা আছে' : 'পরিশোধিত';

    rows.push([
      s.name,
      s.companyName || '',
      s.phone || '',
      s.address || '',
      s.totalPayable,
      status,
    ]);
  });

  const cleanShopName = shop.name.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(rows, `${cleanShopName}_Suppliers_Payables_${dateStr}.csv`);
}

/**
 * Export Complete Shop Data as a Single Comprehensive CSV
 */
export function exportMasterShopCSV(params: {
  shop: Business;
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  transactions: KhataTransaction[];
  cashEntries: CashEntry[];
  bills: Bill[];
}): void {
  const { shop, customers, suppliers, products, transactions, cashEntries, bills } = params;
  const rows: (string | number)[][] = [];

  // Title section
  rows.push(['=== প্রতিষ্ঠান তথ্য (Shop Profile) ===']);
  rows.push(['নাম', shop.name]);
  rows.push(['ব্যবসার ধরণ', shop.businessType]);
  rows.push(['প্রোপ্রাইটর', shop.proprietor]);
  rows.push(['মোবাইল', shop.phone]);
  rows.push(['ঠিকানা', shop.address]);
  rows.push(['ব্যাকআপ তৈরির তারিখ', new Date().toLocaleString('bn-BD')]);
  rows.push([]);

  // Section 1: Customers
  rows.push(['=== কাস্টমারদের তালিকা ও বাকি হিসাব (Customers Ledger) ===']);
  rows.push(['ক্রমিক', 'কাস্টমারের নাম', 'মোবাইল', 'ঠিকানা', 'বাকি পাওনা (৳)', 'অগ্রিম জমা (৳)', 'অবস্থা']);
  customers.forEach((c, idx) => {
    const isDue = c.totalDue > 0;
    const isAdvance = c.totalDue < 0;
    rows.push([
      idx + 1,
      c.name,
      c.phone || '',
      c.address || '',
      isDue ? c.totalDue : 0,
      isAdvance ? Math.abs(c.totalDue) : 0,
      isDue ? 'বাকি' : isAdvance ? 'অগ্রিম' : 'পরিশোধিত',
    ]);
  });
  rows.push([]);

  // Section 2: Suppliers
  rows.push(['=== সাপ্লায়ারদের তালিকা ও মহাজন দেনা (Suppliers Ledger) ===']);
  rows.push(['ক্রমিক', 'সাপ্লায়ারের নাম', 'কোম্পানি', 'মোবাইল', 'ঠিকানা', 'দেনা পরিমাণ (৳)', 'অবস্থা']);
  suppliers.forEach((s, idx) => {
    rows.push([
      idx + 1,
      s.name,
      s.companyName || '',
      s.phone || '',
      s.address || '',
      s.totalPayable,
      s.totalPayable > 0 ? 'দেনা আছে' : 'পরিশোধিত',
    ]);
  });
  rows.push([]);

  // Section 3: Inventory
  rows.push(['=== ইনভেন্টরি ও পণ্য স্টক (Inventory Products) ===']);
  rows.push(['ক্রমিক', 'পণ্যের নাম', 'ক্যাটাগরি', 'স্টক পরিমাণ', 'একক', 'ক্রয়মূল্য (৳)', 'বিক্রয়মূল্য (৳)', 'মোট ক্রয়মূল্য (৳)', 'সম্ভাব্য মোট বিক্রয় (৳)', 'সম্ভাব্য লাভ (৳)']);
  products.forEach((p, idx) => {
    const totalBuy = p.purchasePrice * p.stockQuantity;
    const totalSell = p.sellingPrice * p.stockQuantity;
    rows.push([
      idx + 1,
      p.name,
      p.category,
      p.stockQuantity,
      p.unit,
      p.purchasePrice,
      p.sellingPrice,
      totalBuy,
      totalSell,
      totalSell - totalBuy,
    ]);
  });
  rows.push([]);

  // Section 4: Transactions
  rows.push(['=== সকল লেনদেন ইতিহাস (Transaction History) ===']);
  rows.push(['ক্রমিক', 'তারিখ', 'খাতার ধরণ', 'ব্যক্তি/প্রতিষ্ঠান', 'লেনদেনের ধরণ', 'টাকার পরিমাণ (৳)', 'পরিশোধ মাধ্যম', 'মালামালের বিবরণ', 'নোট']);
  const customerMap = new Map(customers.map((c) => [c.id, c.name]));
  const supplierMap = new Map(suppliers.map((s) => [s.id, s.name]));

  transactions.forEach((t, idx) => {
    const isCustomer = t.partyType === 'customer';
    const partyName = isCustomer ? (customerMap.get(t.partyId) || 'কাস্টমার') : (supplierMap.get(t.partyId) || 'সাপ্লায়ার');
    let itemsStr = '';
    if (t.items && t.items.length > 0) {
      itemsStr = t.items.map((i) => `${i.name} (${i.quantity}${i.unit}×৳${i.unitPrice})`).join('; ');
    } else if (t.itemsSummary) {
      itemsStr = t.itemsSummary;
    }
    const txTypeStr = isCustomer
      ? (t.type === 'gave' ? 'বাকি দিলাম' : 'টাকা পেলাম')
      : (t.type === 'gave' ? 'টাকা পরিশোধ' : 'চালানের মাল পেলাম');

    rows.push([
      idx + 1,
      formatBengaliDate(t.date, true),
      isCustomer ? 'কাস্টমার খাতা' : 'সাপ্লায়ার খাতা',
      partyName,
      txTypeStr,
      t.amount,
      t.paymentMethod ? (PAYMENT_METHOD_NAMES[t.paymentMethod] || t.paymentMethod) : 'ক্যাশ',
      itemsStr,
      t.note || '',
    ]);
  });
  rows.push([]);

  // Section 5: Cash Book Entries
  rows.push(['=== ক্যাশ বুক ও নগদ খতিয়ান (Cash Book Entries) ===']);
  rows.push(['ক্রমিক', 'তারিখ', 'ধরণ', 'টাকা (৳)', 'ক্যাটাগরি', 'বিবরণ']);
  cashEntries.forEach((c, idx) => {
    rows.push([
      idx + 1,
      formatBengaliDate(c.date, true),
      c.type === 'in' ? 'নগদ জমা (ক্যাশ ইন)' : 'নগদ খরচ (ক্যাশ আউট)',
      c.amount,
      c.category,
      c.note || '',
    ]);
  });

  const cleanShopName = shop.name.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadCSV(rows, `${cleanShopName}_Complete_Shop_Backup_${dateStr}.csv`);
}

/**
 * Export Current Shop Complete Backup as structured JSON
 */
export function exportCurrentShopJSON(params: {
  shop: Business;
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  transactions: KhataTransaction[];
  cashEntries: CashEntry[];
  bills: Bill[];
}): void {
  const { shop, customers, suppliers, products, transactions, cashEntries, bills } = params;

  const backupData = {
    backupVersion: '2.0',
    exportType: 'single_shop_backup',
    exportedAt: new Date().toISOString(),
    shopProfile: shop,
    statistics: {
      totalCustomers: customers.length,
      totalSuppliers: suppliers.length,
      totalProducts: products.length,
      totalTransactions: transactions.length,
      totalCashEntries: cashEntries.length,
      totalBills: bills.length,
      totalCustomerDue: customers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0),
      totalSupplierPayable: suppliers.reduce((sum, s) => sum + s.totalPayable, 0),
      totalInventoryCost: products.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0),
    },
    customers,
    suppliers,
    products,
    transactions,
    cashEntries,
    bills,
  };

  const cleanShopName = shop.name.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadJSON(backupData, `${cleanShopName}_Data_Backup_${dateStr}.json`);
}
