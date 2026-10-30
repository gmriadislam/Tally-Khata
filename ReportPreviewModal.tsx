import { useState, useMemo } from 'react';
import {
  X,
  Download,
  Search,
  Filter,
  Calendar,
  CalendarRange,
  Users,
  Truck,
  Package,
  Clock,
  FileSpreadsheet,
  Copy,
  Printer,
  Check,
  Eye,
  FileText,
} from 'lucide-react';
import {
  Customer,
  Supplier,
  Product,
  KhataTransaction,
  CashEntry,
  Bill,
  Business,
} from '../types';
import { formatTaka, formatBengaliDate } from '../utils/formatters';
import { downloadCSV } from '../utils/exportUtils';

export type ReportType = 'transactions' | 'customers' | 'suppliers' | 'inventory' | 'master';
type DateRangeMode = 'all' | 'this_month' | 'last_month' | 'custom';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReportType?: ReportType;
  shop: Business;
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  transactions: KhataTransaction[];
  cashEntries: CashEntry[];
  bills: Bill[];
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  initialReportType = 'transactions',
  shop,
  customers,
  suppliers,
  products,
  transactions,
  cashEntries,
  bills,
}: ReportPreviewModalProps) {
  const [activeReportType, setActiveReportType] = useState<ReportType>(initialReportType);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeMode, setDateRangeMode] = useState<DateRangeMode>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'advance' | 'low_stock' | 'out_of_stock' | 'gave' | 'received'>('all');

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFirstDayOfMonthStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getLastMonthFirstDayStr = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getLastMonthLastDayStr = () => {
    const d = new Date();
    d.setDate(0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [customStartDate, setCustomStartDate] = useState(getFirstDayOfMonthStr());
  const [customEndDate, setCustomEndDate] = useState(getTodayStr());
  const [copied, setCopied] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);

  const BENGALI_MONTHS = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const now = new Date();
  const currentMonthLabel = BENGALI_MONTHS[now.getMonth()];
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthLabel = BENGALI_MONTHS[lastMonthDate.getMonth()];

  const customerMap = useMemo(() => new Map(customers.map((c) => [c.id, c])), [customers]);
  const supplierMap = useMemo(() => new Map(suppliers.map((s) => [s.id, s])), [suppliers]);

  // Date boundary check
  const isDateInFilter = (dateStr: string) => {
    if (dateRangeMode === 'all') return true;
    const txDate = new Date(dateStr);
    let start: Date;
    let end: Date;

    if (dateRangeMode === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (dateRangeMode === 'last_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    } else {
      start = new Date(customStartDate + 'T00:00:00');
      end = new Date(customEndDate + 'T23:59:59.999');
    }

    return txDate >= start && txDate <= end;
  };

  // Generate Table Data for active report type
  const reportData = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    // 1. TRANSACTIONS REPORT
    if (activeReportType === 'transactions') {
      const headers = [
        'তারিখ ও সময়',
        'খাতার ধরণ',
        'নাম (কাস্টমার / সাপ্লায়ার)',
        'মোবাইল নম্বর',
        'লেনদেনের ধরণ',
        'টাকার পরিমাণ (৳)',
        'পরিশোধের মাধ্যম',
        'মালামাল / বিবরণ',
        'ভাউচার / মেমো',
      ];

      const filtered = transactions
        .filter((tx) => isDateInFilter(tx.date))
        .filter((tx) => {
          if (statusFilter === 'gave' && tx.type !== 'gave') return false;
          if (statusFilter === 'received' && tx.type !== 'received') return false;
          return true;
        })
        .filter((tx) => {
          if (!q) return true;
          const isCustomer = tx.partyType === 'customer';
          const party = isCustomer ? customerMap.get(tx.partyId) : supplierMap.get(tx.partyId);
          const name = party?.name?.toLowerCase() || '';
          const phone = party?.phone || '';
          const note = tx.note?.toLowerCase() || '';
          const amount = tx.amount.toString();
          return name.includes(q) || phone.includes(q) || note.includes(q) || amount.includes(q);
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const rows = filtered.map((tx) => {
        const isCustomer = tx.partyType === 'customer';
        const party = isCustomer ? customerMap.get(tx.partyId) : supplierMap.get(tx.partyId);
        const partyName = party?.name || (isCustomer ? 'কাস্টমার' : 'সাপ্লায়ার');
        const phone = party?.phone || '';

        let txTypeStr = '';
        if (isCustomer) {
          txTypeStr = tx.type === 'gave' ? 'বাকি বিক্রি (দিলাম)' : 'টাকা জমা (পেলাম)';
        } else {
          txTypeStr = tx.type === 'gave' ? 'টাকা পরিশোধ (দিলাম)' : 'চালানের মাল (পেলাম)';
        }

        let itemsStr = tx.note || '';
        if (tx.items && tx.items.length > 0) {
          itemsStr = tx.items.map((i) => `${i.name} (x${i.quantity})`).join(', ');
        }

        return [
          formatBengaliDate(tx.date, true),
          isCustomer ? 'কাস্টমার খাতা' : 'সাপ্লায়ার খাতা',
          partyName,
          phone,
          txTypeStr,
          tx.amount,
          tx.paymentMethod === 'bkash' ? 'বিকাশ' : tx.paymentMethod === 'nagad' ? 'নগদ' : 'ক্যাশ',
          itemsStr,
          tx.billNumber || '-',
        ];
      });

      const totalAmount = filtered.reduce((sum, tx) => sum + tx.amount, 0);

      return {
        headers,
        rows,
        count: filtered.length,
        totalSummary: `মোট লেনদেনের অংক: ${formatTaka(totalAmount, shop.enableBengaliDigits)}`,
        rawRows: [headers, ...rows],
        fileName: `${shop.name}_Transactions_Preview.csv`,
      };
    }

    // 2. CUSTOMERS DUE REPORT
    if (activeReportType === 'customers') {
      const headers = [
        'কাস্টমারের নাম',
        'মোবাইল নম্বর',
        'ঠিকানা',
        'বাকি পাওনা (৳)',
        'অগ্রিম জমা (৳)',
        'বর্তমান স্থিতি',
      ];

      const filtered = customers
        .filter((c) => {
          if (statusFilter === 'due') return c.totalDue > 0;
          if (statusFilter === 'advance') return c.totalDue < 0;
          return true;
        })
        .filter((c) => {
          if (!q) return true;
          return (
            c.name.toLowerCase().includes(q) ||
            (c.phone && c.phone.includes(q)) ||
            (c.address && c.address.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => b.totalDue - a.totalDue);

      const rows = filtered.map((c) => {
        const isDue = c.totalDue > 0;
        const isAdvance = c.totalDue < 0;
        const status = isDue ? 'বাকিদার' : isAdvance ? 'অগ্রিম ক্যাশ জমা' : 'পরিশোধিত';

        return [
          c.name,
          c.phone || '-',
          c.address || '-',
          isDue ? c.totalDue : 0,
          isAdvance ? Math.abs(c.totalDue) : 0,
          status,
        ];
      });

      const totalDue = filtered.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);

      return {
        headers,
        rows,
        count: filtered.length,
        totalSummary: `মোট বকেয়া পাওনা: ${formatTaka(totalDue, shop.enableBengaliDigits)}`,
        rawRows: [headers, ...rows],
        fileName: `${shop.name}_Customers_Due_Preview.csv`,
      };
    }

    // 3. SUPPLIERS PAYABLE REPORT
    if (activeReportType === 'suppliers') {
      const headers = [
        'মহাজন / সাপ্লায়ারের নাম',
        'কোম্পানি',
        'মোবাইল নম্বর',
        'ঠিকানা',
        'দেনা পরিমাণ (৳)',
        'অগ্রিম দেওয়া (৳)',
        'বর্তমান স্থিতি',
      ];

      const filtered = suppliers
        .filter((s) => {
          if (statusFilter === 'due') return s.totalPayable > 0;
          if (statusFilter === 'advance') return s.totalPayable < 0;
          return true;
        })
        .filter((s) => {
          if (!q) return true;
          return (
            s.name.toLowerCase().includes(q) ||
            (s.companyName && s.companyName.toLowerCase().includes(q)) ||
            (s.phone && s.phone.includes(q))
          );
        })
        .sort((a, b) => b.totalPayable - a.totalPayable);

      const rows = filtered.map((s) => {
        const isPayable = s.totalPayable > 0;
        const isAdvance = s.totalPayable < 0;
        const status = isPayable ? 'দেনা আছে' : isAdvance ? 'অগ্রিম প্রদান' : 'পরিশোধিত';

        return [
          s.name,
          s.companyName || '-',
          s.phone || '-',
          s.address || '-',
          isPayable ? s.totalPayable : 0,
          isAdvance ? Math.abs(s.totalPayable) : 0,
          status,
        ];
      });

      const totalPayable = filtered.reduce((sum, s) => sum + (s.totalPayable > 0 ? s.totalPayable : 0), 0);

      return {
        headers,
        rows,
        count: filtered.length,
        totalSummary: `মোট মহাজন দেনা: ${formatTaka(totalPayable, shop.enableBengaliDigits)}`,
        rawRows: [headers, ...rows],
        fileName: `${shop.name}_Suppliers_Payable_Preview.csv`,
      };
    }

    // 4. INVENTORY & STOCK REPORT
    if (activeReportType === 'inventory') {
      const headers = [
        'পণ্যের নাম',
        'ক্যাটাগরি',
        'বর্তমান মজুদ (স্টক)',
        'একক',
        'ক্রয়মূল্য (৳)',
        'বিক্রয়মূল্য (৳)',
        'মোট ক্রয়মূল্য (৳)',
        'মোট বিক্রয়মূল্য (৳)',
        'প্রত্যাশিত মোট লাভ (৳)',
        'স্টক অবস্থা',
      ];

      const filtered = products
        .filter((p) => {
          if (statusFilter === 'low_stock') return p.stockQuantity <= p.minStockAlert && p.stockQuantity > 0;
          if (statusFilter === 'out_of_stock') return p.stockQuantity <= 0;
          return true;
        })
        .filter((p) => {
          if (!q) return true;
          return (
            p.name.toLowerCase().includes(q) ||
            (p.category && p.category.toLowerCase().includes(q))
          );
        })
        .sort((a, b) => a.stockQuantity - b.stockQuantity);

      const rows = filtered.map((p) => {
        const totalBuying = p.purchasePrice * p.stockQuantity;
        const totalSelling = p.sellingPrice * p.stockQuantity;
        const profit = totalSelling - totalBuying;

        let status = 'পর্যাপ্ত স্টক';
        if (p.stockQuantity <= 0) {
          status = 'স্টক শেষ (০)';
        } else if (p.stockQuantity <= p.minStockAlert) {
          status = 'সতর্কতা (স্টক কম)';
        }

        return [
          p.name,
          p.category || 'সাধারণ',
          p.stockQuantity,
          p.unit,
          p.purchasePrice,
          p.sellingPrice,
          totalBuying,
          totalSelling,
          profit,
          status,
        ];
      });

      const totalStockVal = filtered.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0);

      return {
        headers,
        rows,
        count: filtered.length,
        totalSummary: `মোট মজুদ মূল্য: ${formatTaka(totalStockVal, shop.enableBengaliDigits)}`,
        rawRows: [headers, ...rows],
        fileName: `${shop.name}_Inventory_Stock_Preview.csv`,
      };
    }

    // 5. MASTER REPORT
    const headers = [
      'বিভাগ',
      'আইটেম / নাম / নম্বর',
      'বিবরণ / তথ্য',
      'অংক / মূল্য / স্থিতি',
      'তারিখ / সময়',
    ];

    const rows: (string | number)[][] = [];

    // Customers summary
    customers.slice(0, 50).forEach((c) => {
      rows.push([
        'কাস্টমার বাকি খাতা',
        c.name,
        c.phone || c.address || 'কাস্টমার',
        c.totalDue >= 0 ? `বাকি ৳${c.totalDue}` : `অগ্রিম ৳${Math.abs(c.totalDue)}`,
        c.updatedAt ? formatBengaliDate(c.updatedAt) : '-',
      ]);
    });

    // Suppliers summary
    suppliers.slice(0, 50).forEach((s) => {
      rows.push([
        'সাপ্লায়ার দেনা খাতা',
        s.name,
        s.companyName || s.phone || 'মহাজন',
        s.totalPayable >= 0 ? `দেনা ৳${s.totalPayable}` : `অগ্রিম ৳${Math.abs(s.totalPayable)}`,
        s.updatedAt ? formatBengaliDate(s.updatedAt) : '-',
      ]);
    });

    // Inventory sample
    products.slice(0, 50).forEach((p) => {
      rows.push([
        'পণ্য ইনভেন্টরি',
        p.name,
        `স্টক: ${p.stockQuantity} ${p.unit} (দর: ৳${p.sellingPrice})`,
        `মোট মজুদ মূল্য ৳${p.purchasePrice * p.stockQuantity}`,
        '-',
      ]);
    });

    // Transactions sample
    transactions.slice(0, 50).forEach((tx) => {
      rows.push([
        'লেনদেন খতিয়ান',
        tx.partyType === 'customer' ? 'কাস্টমার লেনদেন' : 'সাপ্লায়ার লেনদেন',
        tx.note || (tx.type === 'gave' ? 'দিলাম' : 'পেলাম'),
        `৳${tx.amount}`,
        formatBengaliDate(tx.date, true),
      ]);
    });

    const filteredRows = rows.filter((r) => {
      if (!q) return true;
      return r.some((cell) => String(cell).toLowerCase().includes(q));
    });

    return {
      headers,
      rows: filteredRows,
      count: filteredRows.length,
      totalSummary: `দোকানের মাস্টার তথ্যের সারসংক্ষেপ (${filteredRows.length} টি রেকর্ড)`,
      rawRows: [headers, ...filteredRows],
      fileName: `${shop.name}_Master_Complete_Preview.csv`,
    };
  }, [
    activeReportType,
    searchTerm,
    dateRangeMode,
    customStartDate,
    customEndDate,
    statusFilter,
    transactions,
    customers,
    suppliers,
    products,
    shop,
    customerMap,
    supplierMap,
  ]);

  if (!isOpen) return null;

  // Final Confirmation Download
  const handleConfirmDownload = () => {
    downloadCSV(reportData.rawRows, reportData.fileName);
    setDownloadSuccessToast(true);
    setTimeout(() => setDownloadSuccessToast(false), 3000);
  };

  // Copy Preview Table as TSV/Text
  const handleCopyTable = () => {
    const tsv = reportData.rawRows.map((row) => row.join('\t')).join('\n');
    navigator.clipboard.writeText(tsv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-4 border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <span>রিপোর্ট ভিজ্যুয়াল প্রিভিউ ও নিশ্চিতকরণ</span>
                <span className="text-[11px] font-normal text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                  লাইভ প্রিভিউ
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                প্রতিষ্ঠান: <strong className="text-white">{shop.name}</strong> • ডাউনলোডের পূর্বে ফিল্টারকৃত ডেটা নিশ্চিত করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {downloadSuccessToast && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>নির্বাচিত ডেটা সফলভাবে CSV ফাইলে ডাউনলোড হয়েছে!</span>
            </div>
            <button onClick={() => setDownloadSuccessToast(false)} className="text-emerald-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Report Type Selector Tabs */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 text-xs">
          <button
            onClick={() => {
              setActiveReportType('transactions');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeReportType === 'transactions'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>লেনদেন ও বিক্রয় খতিয়ান</span>
          </button>

          <button
            onClick={() => {
              setActiveReportType('customers');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeReportType === 'customers'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>কাস্টমার বাকি খতিয়ান</span>
          </button>

          <button
            onClick={() => {
              setActiveReportType('suppliers');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeReportType === 'suppliers'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>সাপ্লায়ার দেনা খতিয়ান</span>
          </button>

          <button
            onClick={() => {
              setActiveReportType('inventory');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeReportType === 'inventory'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>ইনভেন্টরি স্টক খতিয়ান</span>
          </button>

          <button
            onClick={() => {
              setActiveReportType('master');
              setStatusFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
              activeReportType === 'master'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>সম্পূর্ণ মাস্টার রিপোর্ট</span>
          </button>
        </div>

        {/* Interactive Filter Bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 shrink-0 space-y-2.5 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="নাম, ফোন বা বিবরণ দিয়ে ফিল্টার করুন..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Quick Status Sub-filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-slate-400 text-[11px] font-bold flex items-center gap-1 shrink-0">
                <Filter className="w-3 h-3" />
                <span>ফিল্টার:</span>
              </span>

              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                সব
              </button>

              {(activeReportType === 'customers' || activeReportType === 'suppliers') && (
                <>
                  <button
                    onClick={() => setStatusFilter('due')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      statusFilter === 'due'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                    }`}
                  >
                    বাকিদার / দেনা
                  </button>
                  <button
                    onClick={() => setStatusFilter('advance')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      statusFilter === 'advance'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    অগ্রিম জমা
                  </button>
                </>
              )}

              {activeReportType === 'inventory' && (
                <>
                  <button
                    onClick={() => setStatusFilter('low_stock')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      statusFilter === 'low_stock'
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-700 hover:bg-amber-50 border border-amber-200'
                    }`}
                  >
                    কম স্টক
                  </button>
                  <button
                    onClick={() => setStatusFilter('out_of_stock')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      statusFilter === 'out_of_stock'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                    }`}
                  >
                    স্টক শেষ (০)
                  </button>
                </>
              )}

              {activeReportType === 'transactions' && (
                <>
                  <button
                    onClick={() => setStatusFilter('gave')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      statusFilter === 'gave'
                        ? 'bg-rose-600 text-white'
                        : 'bg-white text-rose-700 hover:bg-rose-50 border border-rose-200'
                    }`}
                  >
                    শুধু দিলাম (বাকি)
                  </button>
                  <button
                    onClick={() => setStatusFilter('received')}
                    className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer shrink-0 ${
                      statusFilter === 'received'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    শুধু পেলাম (জমা)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Date Range Selector (for Transactions & Master) */}
          {(activeReportType === 'transactions' || activeReportType === 'master') && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/80">
              <span className="text-slate-500 font-bold text-[11px] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>সময়কাল:</span>
              </span>

              <button
                onClick={() => setDateRangeMode('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  dateRangeMode === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                সব সময়
              </button>

              <button
                onClick={() => setDateRangeMode('this_month')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  dateRangeMode === 'this_month'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                }`}
              >
                চলতি মাস ({currentMonthLabel})
              </button>

              <button
                onClick={() => setDateRangeMode('last_month')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                  dateRangeMode === 'last_month'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-white text-indigo-800 hover:bg-indigo-50 border border-indigo-200'
                }`}
              >
                গত মাস ({lastMonthLabel})
              </button>

              <button
                onClick={() => setDateRangeMode('custom')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  dateRangeMode === 'custom'
                    ? 'bg-amber-700 text-white'
                    : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                }`}
              >
                <CalendarRange className="w-3 h-3" />
                <span>ইচ্ছামতো তারিখ</span>
              </button>

              {dateRangeMode === 'custom' && (
                <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-lg border border-amber-200">
                  <span className="text-[10px] text-slate-400 font-bold">হতে:</span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="text-[11px] font-mono border-none outline-none text-slate-700 bg-transparent"
                  />
                  <span className="text-[10px] text-slate-400 font-bold">পর্যন্ত:</span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="text-[11px] font-mono border-none outline-none text-slate-700 bg-transparent"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Filter Metric Strip */}
        <div className="px-5 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              📊 মোট রেকর্ড: <span className="font-mono text-emerald-700 font-extrabold">{reportData.count}</span> টি
            </span>
            <span className="font-bold text-slate-700 bg-emerald-50 text-emerald-900 px-2.5 py-1 rounded-lg border border-emerald-200">
              {reportData.totalSummary}
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            নিচে প্রিভিউ দেখে নিশ্চিত করে ডাউনলোড করুন
          </span>
        </div>

        {/* Visual Table Preview (Scrollable) */}
        <div className="flex-1 overflow-auto bg-slate-50/50 p-3 sm:p-5">
          {reportData.rows.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300" />
              <h4 className="font-bold text-slate-700">কোনো রেকর্ড পাওয়া যায়নি</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                আপনার বর্তমান অনুসন্ধান বা তারিখ ফিল্টারে কোনো তথ্য মেলেনি। ফিল্টার রিসেট বা পরিবর্তন করে দেখুন।
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                {/* Table Header */}
                <thead>
                  <tr className="bg-slate-900 text-white font-bold select-none sticky top-0 z-10 shadow-xs">
                    <th className="py-2.5 px-3 w-10 text-center font-mono">#</th>
                    {reportData.headers.map((h, idx) => (
                      <th key={idx} className="py-2.5 px-3 whitespace-nowrap text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-slate-100">
                  {reportData.rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className={`hover:bg-slate-50/80 transition ${
                        rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-[11px] text-slate-400 font-mono">
                        {rIdx + 1}
                      </td>
                      {row.map((cell, cIdx) => {
                        const cellStr = String(cell);
                        const isNum = typeof cell === 'number';
                        const isMoneyCol =
                          reportData.headers[cIdx]?.includes('(৳)') ||
                          reportData.headers[cIdx]?.includes('পরিমাণ');

                        return (
                          <td
                            key={cIdx}
                            className={`py-2 px-3 text-slate-800 text-xs whitespace-nowrap ${
                              isNum || isMoneyCol ? 'font-mono text-right' : ''
                            } ${
                              cellStr.includes('বাকি') || cellStr.includes('দেনা') || cellStr.includes('দিলাম')
                                ? 'text-red-700 font-semibold'
                                : cellStr.includes('জমা') || cellStr.includes('পরিশোধ') || cellStr.includes('পেলাম')
                                ? 'text-emerald-700 font-semibold'
                                : ''
                            }`}
                          >
                            {isNum ? cell.toLocaleString('en-IN') : cellStr}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Confirmation Bar */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold">
              নির্বাচিত <strong className="text-slate-900">{reportData.count}</strong> টি সারির ডেটা নিশ্চিত করুন।
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Copy Table to Clipboard */}
            <button
              type="button"
              onClick={handleCopyTable}
              className="flex-1 sm:flex-none px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              title="এক্সেল বা শিটসে পেস্ট করার জন্য কপি করুন"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>কপি করুন</span>
                </>
              )}
            </button>

            {/* Print Preview */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-3 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>প্রিন্ট</span>
            </button>

            {/* Final Confirmation Download Button */}
            <button
              type="button"
              onClick={handleConfirmDownload}
              disabled={reportData.rows.length === 0}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:bg-slate-300"
            >
              <Download className="w-4 h-4" />
              <span>নিশ্চিত করে CSV ডাউনলোড</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
