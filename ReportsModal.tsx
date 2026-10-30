import { useState, useRef } from 'react';
import {
  X,
  FileText,
  Download,
  Upload,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  Users,
  CheckCircle2,
  Building2,
  FileSpreadsheet,
  FileCode,
  Package,
  Clock,
  Truck,
  Check,
  Cloud,
  Eye,
} from 'lucide-react';
import ReportPreviewModal, { ReportType } from './ReportPreviewModal';
import SalesTrendsChart from './SalesTrendsChart';
import {
  Customer,
  Supplier,
  Product,
  KhataTransaction,
  CashEntry,
  Business,
  Bill,
  BusinessStore,
  MultiBusinessState,
} from '../types';
import { formatTaka } from '../utils/formatters';
import {
  exportMultiBusinessBackupJSON,
  resetAllToSampleData,
  saveMultiBusinessState,
} from '../utils/storage';
import {
  exportTransactionsToCSV,
  exportInventoryToCSV,
  exportCustomersToCSV,
  exportSuppliersToCSV,
  exportMasterShopCSV,
  exportCurrentShopJSON,
} from '../utils/exportUtils';

interface ReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeBusiness: Business;
  businesses: BusinessStore[];
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  transactions?: KhataTransaction[];
  cashEntries: CashEntry[];
  bills: Bill[];
  onDataRestored: () => void;
  onOpenGoogleDriveBackup?: () => void;
}

export default function ReportsModal({
  isOpen,
  onClose,
  activeBusiness,
  businesses,
  customers,
  suppliers,
  products,
  transactions = [],
  cashEntries,
  bills,
  onDataRestored,
  onOpenGoogleDriveBackup,
}: ReportsModalProps) {
  const [restoreSuccess, setRestoreSuccess] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState<string | null>(null);
  const [activeExportFormat, setActiveExportFormat] = useState<'csv' | 'json'>('csv');
  const [previewReportType, setPreviewReportType] = useState<ReportType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Ensure we have current active business transactions
  const effectiveTransactions =
    transactions && transactions.length > 0
      ? transactions
      : businesses.find((b) => b.business.id === activeBusiness.id)?.transactions || [];

  const showDownloadNotice = (message: string) => {
    setDownloadSuccessToast(message);
    setTimeout(() => {
      setDownloadSuccessToast(null);
    }, 3500);
  };

  // Active Business Analytics
  const totalCustomerDue = customers.reduce(
    (acc, c) => acc + (c.totalDue > 0 ? c.totalDue : 0),
    0
  );
  const totalCustomerAdvance = customers.reduce(
    (acc, c) => acc + (c.totalDue < 0 ? Math.abs(c.totalDue) : 0),
    0
  );
  const totalSupplierPayable = suppliers.reduce((acc, s) => acc + s.totalPayable, 0);

  const totalStockBuyingValue = products.reduce(
    (acc, p) => acc + p.purchasePrice * p.stockQuantity,
    0
  );
  const totalStockSellingValue = products.reduce(
    (acc, p) => acc + p.sellingPrice * p.stockQuantity,
    0
  );
  const estimatedPotentialProfit = totalStockSellingValue - totalStockBuyingValue;

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  // Top Debtors
  const topDebtors = [...customers]
    .filter((c) => c.totalDue > 0)
    .sort((a, b) => b.totalDue - a.totalDue)
    .slice(0, 5);

  // Cross-business Combined Totals (All Businesses)
  const allBusinessesDue = businesses.reduce((total, b) => {
    return total + b.customers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  }, 0);

  const allBusinessesPayable = businesses.reduce((total, b) => {
    return total + b.suppliers.reduce((sum, s) => sum + s.totalPayable, 0);
  }, 0);

  // 1. Export Current Shop JSON
  const handleExportCurrentShopJSON = () => {
    exportCurrentShopJSON({
      shop: activeBusiness,
      customers,
      suppliers,
      products,
      transactions: effectiveTransactions,
      cashEntries,
      bills,
    });
    showDownloadNotice(`"${activeBusiness.name}"-এর সম্পূর্ণ ব্যাকআপ (JSON) ডাউনলোড হয়েছে!`);
  };

  // 2. Export Multi-Business Backup JSON
  const handleExportAllBusinessesJSON = () => {
    const updatedBusinesses = businesses.map((b) => {
      if (b.business.id === activeBusiness.id) {
        return {
          business: activeBusiness,
          customers,
          suppliers,
          products,
          transactions: effectiveTransactions,
          cashEntries,
          bills,
        };
      }
      return b;
    });

    const fullMultiState: MultiBusinessState = {
      version: 2,
      activeBusinessId: activeBusiness.id,
      businesses: updatedBusinesses,
    };

    exportMultiBusinessBackupJSON(fullMultiState);
    showDownloadNotice('সকল ব্যবসার সমন্বিত ব্যাকআপ (JSON) ডাউনলোড হয়েছে!');
  };

  // 3. Export Master Complete Shop CSV
  const handleExportMasterCSV = () => {
    exportMasterShopCSV({
      shop: activeBusiness,
      customers,
      suppliers,
      products,
      transactions: effectiveTransactions,
      cashEntries,
      bills,
    });
    showDownloadNotice('দোকানের সমস্ত তথ্যের সমন্বিত মাস্টার CSV ফাইল ডাউনলোড হয়েছে!');
  };

  // 4. Export Transactions & Sales History CSV
  const handleExportTransactionsCSV = () => {
    exportTransactionsToCSV(effectiveTransactions, customers, suppliers, activeBusiness);
    showDownloadNotice('লেনদেন ও বিক্রয় খতিয়ানের CSV ফাইল ডাউনলোড হয়েছে!');
  };

  // 5. Export Inventory & Stock CSV
  const handleExportInventoryCSV = () => {
    exportInventoryToCSV(products, activeBusiness);
    showDownloadNotice('ইনভেন্টরি ও পণ্য মজুদের CSV ফাইল ডাউনলোড হয়েছে!');
  };

  // 6. Export Customers Due CSV
  const handleExportCustomersCSV = () => {
    exportCustomersToCSV(customers, activeBusiness);
    showDownloadNotice('কাস্টমার বাকি খতিয়ানের CSV ফাইল ডাউনলোড হয়েছে!');
  };

  // 7. Export Suppliers Payables CSV
  const handleExportSuppliersCSV = () => {
    exportSuppliersToCSV(suppliers, activeBusiness);
    showDownloadNotice('সাপ্লায়ার দেনা খতিয়ানের CSV ফাইল ডাউনলোড হয়েছে!');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.businesses && Array.isArray(parsed.businesses)) {
          saveMultiBusinessState(parsed);
          setRestoreSuccess(true);
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 800);
        } else if (parsed.customers && parsed.products) {
          // Legacy single business import
          const legacyBiz: Business = {
            id: 'biz-' + Date.now(),
            name: parsed.shopProfile?.shopName || 'আমদানিকৃত ব্যবসা',
            businessType: 'সাধারণ ব্যবসা',
            proprietor: parsed.shopProfile?.proprietor || '',
            phone: parsed.shopProfile?.phone || '',
            address: parsed.shopProfile?.address || '',
            tagline: parsed.shopProfile?.tagline || '',
            currencySymbol: '৳',
            enableBengaliDigits: false,
            colorTheme: 'emerald',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          const singleStore: BusinessStore = {
            business: legacyBiz,
            customers: parsed.customers,
            suppliers: parsed.suppliers || [],
            products: parsed.products,
            transactions: parsed.transactions || [],
            cashEntries: parsed.cashEntries || [],
            bills: parsed.bills || [],
          };

          saveMultiBusinessState({
            version: 2,
            activeBusinessId: legacyBiz.id,
            businesses: [singleStore],
          });

          setRestoreSuccess(true);
          setTimeout(() => {
            onDataRestored();
            onClose();
          }, 800);
        } else {
          alert('ফাইলের ফরম্যাট সঠিক নয়!');
        }
      } catch (err) {
        console.error(err);
        alert('ফাইলটি পড়া সম্ভব হয়নি। সঠিক ব্যাকআপ JSON ফাইল সিলেক্ট করুন।');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = () => {
    if (
      window.confirm(
        'আপনি কি সব ব্যবসা রিসেট করে মাল্টি-বিজনেস ডেমো ডেটা (যেমন: মুদি স্টোর ও ফার্মেসি) লোড করতে চান?'
      )
    ) {
      resetAllToSampleData();
      onDataRestored();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden my-6 border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base sm:text-lg font-bold">ব্যবসায়িক রিপোর্ট ও ব্যাকআপ</h2>
              <p className="text-xs text-slate-400">
                প্রতিষ্ঠান: <strong className="text-white">{activeBusiness.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {downloadSuccessToast && (
            <div className="p-3.5 bg-emerald-700 text-white rounded-xl shadow-md flex items-center justify-between text-xs sm:text-sm font-bold border border-emerald-500 animate-fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
                <span>{downloadSuccessToast}</span>
              </div>
              <button
                onClick={() => setDownloadSuccessToast(null)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {restoreSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              সকল ব্যবসার ডেটা সফলভাবে রিস্টোর হয়েছে!
            </div>
          )}

          {/* Multi-business Combined Banner if user has > 1 business */}
          {businesses.length > 1 && (
            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  সকল ব্যবসার সমন্বিত অবস্থা ({businesses.length} টি প্রতিষ্ঠান)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-slate-500">সব ব্যবসা মিলিয়ে মোট কাস্টমার বাকি:</span>
                  <p className="text-base font-bold text-rose-600 mt-0.5">
                    {formatTaka(allBusinessesDue, activeBusiness.enableBengaliDigits)}
                  </p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <span className="text-slate-500">সব ব্যবসা মিলিয়ে মোট মহাজন দেনা:</span>
                  <p className="text-base font-bold text-indigo-600 mt-0.5">
                    {formatTaka(allBusinessesPayable, activeBusiness.enableBengaliDigits)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Business Summary Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              বর্তমান ব্যবসা ({activeBusiness.name}) এর স্থিতি
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-red-50/70 border border-red-200">
                <span className="text-xs font-semibold text-red-700">কাস্টমারদের কাছে বাকি</span>
                <p className="text-xl font-bold text-red-700 mt-1">
                  {formatTaka(totalCustomerDue, activeBusiness.enableBengaliDigits)}
                </p>
                <p className="text-[11px] text-red-600/80 mt-0.5">
                  বাকি কাস্টমার: {customers.filter((c) => c.totalDue > 0).length} জন
                </p>
              </div>

              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <span className="text-xs font-semibold text-purple-700">মহাজন বা সাপ্লায়ার দেনা</span>
                <p className="text-xl font-bold text-purple-700 mt-1">
                  {formatTaka(totalSupplierPayable, activeBusiness.enableBengaliDigits)}
                </p>
                <p className="text-[11px] text-purple-600/80 mt-0.5">
                  সাপ্লায়ার: {suppliers.length} টি
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <span className="text-xs font-semibold text-emerald-700">অগ্রিম জমা</span>
                <p className="text-xl font-bold text-emerald-700 mt-1">
                  {formatTaka(totalCustomerAdvance, activeBusiness.enableBengaliDigits)}
                </p>
                <p className="text-[11px] text-emerald-600/80 mt-0.5">
                  অগ্রিম জমার কাস্টমার
                </p>
              </div>
            </div>
          </div>

          {/* Sales Trends Chart (Visualizing daily total sales volume over last 30 days via Recharts) */}
          <SalesTrendsChart
            bills={bills}
            cashEntries={cashEntries}
            transactions={effectiveTransactions}
            enableBengaliDigits={activeBusiness.enableBengaliDigits}
          />

          {/* Inventory Valuation */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              বর্তমান স্টক ও ইনভেন্টরি মূল্যায়ন
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-xs text-slate-500">মোট মজুদ ক্রয়মূল্য:</span>
                <p className="text-base font-bold text-slate-800">
                  {formatTaka(totalStockBuyingValue, activeBusiness.enableBengaliDigits)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">বিক্রয় সম্ভাব্য মূল্য:</span>
                <p className="text-base font-bold text-slate-800">
                  {formatTaka(totalStockSellingValue, activeBusiness.enableBengaliDigits)}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500">প্রত্যাশিত মোট লাভ:</span>
                <p className="text-base font-bold text-emerald-600">
                  +{formatTaka(estimatedPotentialProfit, activeBusiness.enableBengaliDigits)}
                </p>
              </div>
            </div>

            {lowStockCount > 0 && (
              <div className="mt-2 flex items-center gap-2 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  সতর্কতা: {lowStockCount} টি পণ্যের স্টক ফুরিয়ে আসছে বা কম রয়েছে।
                </span>
              </div>
            )}
          </div>

          {/* Top Debtors */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-700" />
              সর্বোচ্চ বাকি থাকা কাস্টমারবৃন্দ
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3 text-left">নাম</th>
                    <th className="py-2 px-3 text-left">মোবাইল</th>
                    <th className="py-2 px-3 text-right">বাকি পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topDebtors.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-500">
                        কারো কাছে বাকি নেই!
                      </td>
                    </tr>
                  ) : (
                    topDebtors.map((c, i) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {i + 1}. {c.name}
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-mono">{c.phone}</td>
                        <td className="py-2 px-3 text-right font-bold text-red-600 font-mono">
                          {formatTaka(c.totalDue, activeBusiness.enableBengaliDigits)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Export Shop Data & Local Backup Section */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            {/* Google Drive Cloud Sync Banner */}
            {onOpenGoogleDriveBackup && (
              <div className="p-4 bg-gradient-to-r from-cyan-50 via-teal-50 to-emerald-50 border border-cyan-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <span>গুগল ড্রাইভ ক্লাউড ব্যাকআপ ও রিস্টোর</span>
                      <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full border border-cyan-200">
                        ১০০% নিরাপদ ক্লাউড
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      মোবাইল পরিবর্তন বা হারালেও কোনো চিন্তা নেই! সরাসরি আপনার নিজস্ব Google Drive-এ হিসাব ক্লাউড ব্যাকআপ রাখুন।
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onOpenGoogleDriveBackup}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Cloud className="w-4 h-4" />
                  <span>ড্রাইভ ব্যাকআপ খুলুন</span>
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>ডেটা এক্সপোর্ট ও লোকাল ব্যাকআপ (Export & Backup)</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                  আপনার লেনদেন খতিয়ান, পণ্য মজুদ এবং কাস্টমার-সাপ্লায়ার হিসাব এক্সেল (CSV) অথবা ব্যাকআপ (JSON) ফাইলে সংরক্ষণ করুন।
                </p>
              </div>

              {/* Format Switcher Pills */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-start sm:self-auto border border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveExportFormat('csv')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeExportFormat === 'csv'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Excel / CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveExportFormat('json')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    activeExportFormat === 'json'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-600" />
                  <span>JSON ব্যাকআপ</span>
                </button>
              </div>
            </div>

            {/* TAB 1: CSV EXPORT OPTIONS */}
            {activeExportFormat === 'csv' && (
              <div className="space-y-3 animate-fade-in">
                {/* Visual Report Preview Hero Banner */}
                <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-700 to-cyan-800 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-emerald-500/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold flex items-center gap-1.5">
                        <span>লাইভ রিপোর্ট প্রিভিউ ও নিশ্চিতকরণ (Visual Preview)</span>
                        <span className="text-[10px] bg-emerald-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
                          ইন্টারেক্টিভ
                        </span>
                      </h4>
                      <p className="text-[11px] text-emerald-100 mt-0.5">
                        ডাউনলোডের পূর্বে স্ক্রিনে ফিল্টার করুন, ডেটা যাচাই করুন এবং নিশ্চিত হয়ে CSV ফাইল ডাউনলোড করুন।
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPreviewReportType('transactions')}
                    className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white text-emerald-900 hover:bg-emerald-50 active:scale-95 rounded-xl text-xs font-bold shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Eye className="w-4 h-4 text-emerald-700" />
                    <span>ভিজ্যুয়াল প্রিভিউ খুলুন</span>
                  </button>
                </div>

                {/* Master CSV Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white mb-1">
                      সর্বোত্তম ব্যাকআপ
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      📦 সম্পূর্ণ দোকানের সমন্বিত মাস্টার CSV ফাইল
                    </h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">
                      এক ফাইলে কাস্টমার ও মহাজন খাতা, সকল লেনদেনের আইটেম ও ক্যাশ বুক সহ ইনভেন্টরি স্টক।
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPreviewReportType('master')}
                      className="flex items-center justify-center gap-1 px-3 py-2 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold shadow-2xs transition cursor-pointer"
                      title="ডাউনলোডের পূর্বে স্ক্রিনে দেখুন"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>প্রিভিউ</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleExportMasterCSV}
                      className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>মাস্টার CSV</span>
                    </button>
                  </div>
                </div>

                {/* Specific Modules CSV Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* 1. Transactions CSV */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          লেনদেন ও বিক্রয় খতিয়ান (CSV)
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {effectiveTransactions.length} টি লেনদেন • মালামাল ও দর সহ
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewReportType('transactions')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="প্রিভিউ ও নিশ্চিতকরণ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>প্রিভিউ</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportTransactionsCSV}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 2. Inventory CSV */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          ইনভেন্টরি ও পণ্য স্টক (CSV)
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {products.length} টি পণ্য • ক্রয়/বিক্রয় ও লাভ
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewReportType('inventory')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-100 text-indigo-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="প্রিভিউ ও নিশ্চিতকরণ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>প্রিভিউ</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportInventoryCSV}
                        className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 3. Customers Due CSV */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          কাস্টমার বাকি তালিকা (CSV)
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {customers.length} জন কাস্টমার • বাকি ও অগ্রিম
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewReportType('customers')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-100 text-rose-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="প্রিভিউ ও নিশ্চিতকরণ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>প্রিভিউ</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportCustomersCSV}
                        className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* 4. Suppliers Payable CSV */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition flex items-center justify-between gap-2 shadow-2xs">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <h5 className="font-bold text-xs text-slate-900 truncate">
                          সাপ্লায়ার দেনা তালিকা (CSV)
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {suppliers.length} টি মহাজন • মোট দায়দেনা
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewReportType('suppliers')}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="প্রিভিউ ও নিশ্চিতকরণ"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>প্রিভিউ</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExportSuppliersCSV}
                        className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓ বাংলা টেক্সট সাপোর্ট:</span>
                  <span>
                    Excel বা Google Sheets-এ বাংলা লেখা যাতে সুন্দরভাবে প্রদর্শিত হয়, সেজন্য প্রতিটি CSV ফাইলে স্বয়ংক্রিয়ভাবে UTF-8 BOM যুক্ত রয়েছে।
                  </span>
                </div>
              </div>
            )}

            {/* TAB 2: JSON BACKUP OPTIONS */}
            {activeExportFormat === 'json' && (
              <div className="space-y-3 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Current Shop Backup JSON */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        বর্তমান প্রতিষ্ঠান
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">
                        {activeBusiness.name} ব্যাকআপ (JSON)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        বর্তমান দোকানের সকল কাস্টমার, স্টক, ট্রানজেকশন ও ক্যাশ হিস্ট্রির সম্পূর্ণ ডেটা।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportCurrentShopJSON}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>দোকান ব্যাকআপ (JSON) ডাউনলোড</span>
                    </button>
                  </div>

                  {/* All Businesses Multi-Store Backup JSON */}
                  <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {businesses.length} টি প্রতিষ্ঠান
                      </span>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 mt-1">
                        সকল ব্যবসার সমন্বিত ব্যাকআপ (JSON)
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        সিস্টেমের সবকটি ব্যবসা ও তাদের খাতা-ইনভেন্টরির সম্পূর্ণ ডেটাসেট এক ফাইলে সংরক্ষণ।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleExportAllBusinessesJSON}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>সকল ব্যবসার JSON ডাউনলোড</span>
                    </button>
                  </div>
                </div>

                {/* Restore & Sample Data Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-600" />
                      <span>পূর্বের JSON ব্যাকআপ রিস্টোর করুন</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportFile}
                      accept=".json"
                      className="hidden"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleResetSample}
                    className="flex items-center gap-1 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-medium transition cursor-pointer"
                    title="মাল্টি-বিজনেস ডেমো লোড করুন"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>মাল্টি-বিজনেস ডেমো রিসেট</span>
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

      {/* Visual Report Preview & Confirmation Modal */}
      {previewReportType && (
        <ReportPreviewModal
          isOpen={Boolean(previewReportType)}
          onClose={() => setPreviewReportType(null)}
          initialReportType={previewReportType}
          shop={activeBusiness}
          customers={customers}
          suppliers={suppliers}
          products={products}
          transactions={effectiveTransactions}
          cashEntries={cashEntries}
          bills={bills}
        />
      )}
    </div>
  );
}
