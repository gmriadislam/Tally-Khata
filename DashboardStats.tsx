import {
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  TrendingDown,
  AlertCircle,
  Package,
} from 'lucide-react';
import { Customer, Supplier, Product, CashEntry, ShopProfile, Business } from '../types';
import { formatTaka } from '../utils/formatters';

interface DashboardStatsProps {
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  cashEntries: CashEntry[];
  shop: ShopProfile | Business;
  onNavigateTab: (tab: 'customers' | 'suppliers' | 'inventory' | 'cashbook') => void;
}

export default function DashboardStats({
  customers,
  suppliers,
  products,
  cashEntries,
  shop,
  onNavigateTab,
}: DashboardStatsProps) {
  // 1. Total Customer Due (পাব - বাকি)
  const totalCustomerDue = customers.reduce(
    (sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0),
    0
  );
  const dueCustomersCount = customers.filter((c) => c.totalDue > 0).length;

  // 2. Total Supplier Payable (দিব - দেনা)
  const totalSupplierPayable = suppliers.reduce((sum, s) => sum + s.totalPayable, 0);

  // 3. Today's Cash In & Out
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayCashEntries = cashEntries.filter((entry) => {
    try {
      const entryDate = new Date(entry.date);
      return entryDate >= todayStart;
    } catch {
      return false;
    }
  });

  const todayCashIn = todayCashEntries
    .filter((e) => e.type === 'in')
    .reduce((sum, e) => sum + e.amount, 0);

  const todayCashOut = todayCashEntries
    .filter((e) => e.type === 'out')
    .reduce((sum, e) => sum + e.amount, 0);

  // All time Cash balance
  const totalCashIn = cashEntries
    .filter((e) => e.type === 'in')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCashOut = cashEntries
    .filter((e) => e.type === 'out')
    .reduce((sum, e) => sum + e.amount, 0);
  const cashInHand = totalCashIn - totalCashOut;

  // Low stock products count
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  return (
    <div className="space-y-3 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {/* কাস্টমারদের কাছে বাকি (পাব) */}
        <div
          onClick={() => onNavigateTab('customers')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-rose-300 hover:shadow-xs transition duration-200 cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট বাকি (পাওনা)</span>
            <span className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-rose-600 mt-2 font-mono tabular-nums tracking-tight">
            {formatTaka(totalCustomerDue, shop.enableBengaliDigits)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-slate-600">{dueCustomersCount} জন</span> কাস্টমার বাকিদার
          </p>
        </div>

        {/* মহাজন বা সাপ্লায়ার দেনা (দিব) */}
        <div
          onClick={() => onNavigateTab('suppliers')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-indigo-300 hover:shadow-xs transition duration-200 cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">সাপ্লায়ার দেনা (দিতে হবে)</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-700 mt-2 font-mono tabular-nums tracking-tight">
            {formatTaka(totalSupplierPayable, shop.enableBengaliDigits)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span className="font-semibold text-slate-600">{suppliers.length} জন</span> মহাজন / কোম্পানি
          </p>
        </div>

        {/* আজকের ক্যাশ ইন / বিক্রি */}
        <div
          onClick={() => onNavigateTab('cashbook')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-xs transition duration-200 cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">আজকের ক্যাশ জমা</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-600 mt-2 font-mono tabular-nums tracking-tight">
            {formatTaka(todayCashIn, shop.enableBengaliDigits)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            আজকের নগদ বিক্রি ও আদায়
          </p>
        </div>

        {/* আজকের ক্যাশ খরচ */}
        <div
          onClick={() => onNavigateTab('cashbook')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-amber-300 hover:shadow-xs transition duration-200 cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">আজকের খরচ</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-700 mt-2 font-mono tabular-nums tracking-tight">
            {formatTaka(todayCashOut, shop.enableBengaliDigits)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            দোকান খরচ ও ব্যক্তিগত ব্যয়
          </p>
        </div>

        {/* ক্যাশবক্স ব্যালেন্স */}
        <div
          onClick={() => onNavigateTab('cashbook')}
          className="col-span-2 sm:col-span-1 bg-slate-900 text-white p-4 rounded-2xl shadow-xs hover:bg-slate-800 transition duration-200 cursor-pointer relative overflow-hidden group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">হাতে ক্যাশ জমা</span>
            <span className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center transition-transform group-hover:scale-105">
              <Wallet className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400 mt-2 font-mono tabular-nums tracking-tight">
            {formatTaka(cashInHand, shop.enableBengaliDigits)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            বর্তমান ক্যাশবক্স ব্যালেন্স
          </p>
        </div>
      </div>

      {/* Low stock notice banner if any */}
      {lowStockCount > 0 && (
        <div
          onClick={() => onNavigateTab('inventory')}
          className="flex items-center justify-between px-4 py-2.5 bg-amber-50/80 border border-amber-200/90 text-amber-900 rounded-xl cursor-pointer hover:bg-amber-100/80 transition"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs sm:text-sm font-medium">
              সতর্কতা: <strong className="font-bold">{lowStockCount}</strong> টি পণ্যের স্টক ফুরিয়ে আসছে বা কম রয়েছে!
            </span>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-800 underline">
            <Package className="w-3.5 h-3.5" />
            স্টক দেখুন
          </span>
        </div>
      )}
    </div>
  );
}
