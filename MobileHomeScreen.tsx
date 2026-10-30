import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Settings,
  Plus,
  UserPlus,
  Search,
  Phone,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Check,
  Building2,
  Users,
  Truck,
  RotateCcw,
  Store,
  ShoppingCart,
  PlusCircle,
  Cloud,
  Smartphone,
  FileSpreadsheet,
  Calculator,
  Package,
  X,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Layers,
} from 'lucide-react';
import { Customer, Supplier, ShopProfile, Business, Product } from '../types';
import { formatTaka, toBengaliNumber, normalizeDigits, formatNumber, isPersonalAccount } from '../utils/formatters';

interface MobileHomeScreenProps {
  shop: ShopProfile | Business;
  customers: Customer[];
  suppliers: Supplier[];
  products?: Product[];
  totalBusinesses?: number;
  onOpenStoreSwitcher: () => void;
  onOpenInventory: () => void;
  onOpenNotes: () => void;
  onOpenTagada: () => void;
  onOpenQRCode: () => void;
  onOpenBackup: () => void;
  onOpenTallyMessage: () => void;
  onOpenCashbox: () => void;
  onOpenSettings: () => void;
  onOpenAddParty: (type?: 'customer' | 'supplier') => void;
  onSelectCustomer: (customer: Customer) => void;
  onSelectSupplier: (supplier: Supplier) => void;
  onSelectProduct?: (product: Product) => void;
  onOpenSalesMemo?: () => void;
  onOpenQuickEntry?: () => void;
  onOpenCalculator?: () => void;
  onOpenReports?: () => void;
  onOpenPWAInstall?: () => void;
}

/* ==========================================================================
   SVG ICONS - Styled identically to the reference screenshot
   ========================================================================== */

function MultiBusinessIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 36V13a3 3 0 0 1 3-3h12a2 2 0 0 1 2 2v24a2 2 0 0 0-2-2H10a3 3 0 0 0-3 2z" />
      <path d="M41 36V13a3 3 0 0 0-3-3H26a2 2 0 0 0-2 2v24a2 2 0 0 1 2-2h12a3 3 0 0 1 3 2z" />
      <line x1="12" y1="17" x2="20" y2="17" />
      <line x1="12" y1="23" x2="19" y2="23" />
      <line x1="12" y1="29" x2="18" y2="29" />
      <line x1="28" y1="17" x2="36" y2="17" />
      <line x1="29" y1="23" x2="36" y2="23" />
      <line x1="30" y1="29" x2="36" y2="29" />
    </svg>
  );
}

function StockInventoryIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#dc2626" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 7 L39 15 L24 23 L9 15 Z" />
      <path d="M9 15 V33 L24 41 V23" />
      <path d="M39 15 V33 L24 41" />
      <line x1="24" y1="7" x2="24" y2="15" />
      <line x1="16" y1="11" x2="32" y2="19" strokeWidth="1.8" />
    </svg>
  );
}

function BusinessNotesIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#ea580c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="11" y="9" width="26" height="32" rx="6" />
      <path d="M19 6 H29" strokeWidth="2.8" />
      <circle cx="18" cy="18" r="1.5" fill="#ea580c" />
      <line x1="23" y1="18" x2="31" y2="18" />
      <circle cx="18" cy="25" r="1.5" fill="#ea580c" />
      <line x1="23" y1="25" x2="31" y2="25" />
      <circle cx="18" cy="32" r="1.5" fill="#ea580c" />
      <line x1="23" y1="32" x2="29" y2="32" />
    </svg>
  );
}

function GroupTagadaIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 26 C14 18 18 11 24 11 C30 11 34 18 34 26 C34 29 36 32 38 34 H10 C12 32 14 29 14 26 Z" />
      <path d="M21 38 C21 40 22.5 42 24 42 C25.5 42 27 40 27 38" />
      {/* Sound waves matching demo icon */}
      <path d="M8 18 C6 21 6 25 8 28" strokeWidth="2" />
      <path d="M40 18 C42 21 42 25 40 28" strokeWidth="2" />
    </svg>
  );
}

function QRCodeIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="3" />
      <rect x="13" y="13" width="4" height="4" fill="#e11d48" stroke="none" />
      <rect x="27" y="9" width="12" height="12" rx="3" />
      <rect x="31" y="13" width="4" height="4" fill="#e11d48" stroke="none" />
      <rect x="9" y="27" width="12" height="12" rx="3" />
      <rect x="13" y="31" width="4" height="4" fill="#e11d48" stroke="none" />
      {/* Bottom right QR clusters */}
      <circle cx="29" cy="29" r="1.8" fill="#e11d48" stroke="none" />
      <circle cx="36" cy="29" r="1.8" fill="#e11d48" stroke="none" />
      <circle cx="33" cy="33" r="1.8" fill="#e11d48" stroke="none" />
      <circle cx="29" cy="37" r="1.8" fill="#e11d48" stroke="none" />
      <circle cx="37" cy="37" r="1.8" fill="#e11d48" stroke="none" />
    </svg>
  );
}

function DataBackupIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#16a34a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 34 C8.7 34 6 31.3 6 28 C6 24.9 8.3 22.3 11.4 22.1 C12.2 16.4 17.1 12 23 12 C29.4 12 34.6 17 35 23.3 C38.4 24 41 27 41 30.5 C41 34.1 38.1 37 34.5 37 H14" />
      <line x1="23.5" y1="21" x2="23.5" y2="33" strokeWidth="2.8" />
      <path d="M18.5 26 L23.5 21 L28.5 26" strokeWidth="2.8" />
    </svg>
  );
}

function TallyMessageIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="10" width="30" height="23" rx="7" />
      <path d="M17 33 L13 39 L22 33" strokeWidth="2.4" fill="none" />
      <line x1="24" y1="17" x2="24" y2="27" strokeWidth="2.8" />
      <path d="M19.5 21.5 L24 17 L28.5 21.5" strokeWidth="2.8" />
    </svg>
  );
}

function CashboxIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-9 h-9" fill="none" stroke="#ea580c" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22 C8 17 12 14 18 14 H30 C36 14 40 17 40 22 V34 C40 38 37 40 33 40 H15 C11 40 8 38 8 34 Z" />
      <path d="M14 20 L20 26 H28 L34 20" strokeWidth="2.2" />
      <circle cx="24" cy="27" r="1.5" fill="#ea580c" />
    </svg>
  );
}

/* ==========================================================================
   EMPTY STATE ILLUSTRATION - Matching the young shopkeeper with smartphone
   ========================================================================== */

function ShopkeeperIllustration() {
  return (
    <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
      {/* Background Soft Circle */}
      <div className="absolute inset-4 rounded-full bg-slate-100/90 -z-0" />

      {/* Floating Badges */}
      {/* Green Shield Badge (Top Left) */}
      <div className="absolute top-10 left-8 z-10 w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md border-2 border-white">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>

      {/* Orange Book Badge (Mid Right) */}
      <div className="absolute top-20 right-6 z-10 w-9 h-9 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-md border-2 border-white">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
          <path d="M6 6h10" />
          <path d="M6 10h10" />
        </svg>
      </div>

      {/* Shopkeeper Vector SVG */}
      <svg
        viewBox="0 0 200 200"
        className="w-52 h-52 relative z-5"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Head / Hair */}
        <path
          d="M85 70 C85 50 115 50 115 70 C115 88 85 88 85 70 Z"
          fill="#334155"
        />
        {/* Face */}
        <ellipse cx="102" cy="74" rx="14" ry="16" fill="#fed7aa" />
        {/* Hair style */}
        <path
          d="M88 68 C88 54 94 50 106 50 C118 50 119 58 116 66 C112 60 102 58 92 64 Z"
          fill="#1e293b"
        />
        {/* Eyes & Smile */}
        <ellipse cx="98" cy="72" rx="1.5" ry="1.8" fill="#0f172a" />
        <ellipse cx="107" cy="72" rx="1.5" ry="1.8" fill="#0f172a" />
        <path d="M99 79 Q103 83 107 79" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />

        {/* Neck */}
        <rect x="99" y="88" width="7" height="8" fill="#fed7aa" />

        {/* Salmon / Peach Shirt */}
        <path
          d="M86 94 L76 135 H130 L120 94 C115 97 93 97 86 94 Z"
          fill="#fca5a5"
        />
        {/* Collar */}
        <path d="M96 94 L103 104 L110 94" stroke="#e11d48" strokeWidth="1.5" fill="none" />
        <path d="M86 94 L96 98 M120 94 L110 98" stroke="#e11d48" strokeWidth="1.5" />
        <path d="M103 104 V135" stroke="#f43f5e" strokeWidth="1.2" strokeDasharray="2 2" />

        {/* Shirt Pocket */}
        <rect x="110" y="106" width="9" height="11" rx="1.5" fill="#f87171" stroke="#e11d48" strokeWidth="1" />

        {/* Arms and Hands */}
        {/* Left Arm holding phone */}
        <path
          d="M86 96 L76 114 L73 125 L78 126 L86 112 Z"
          fill="#fed7aa"
        />
        {/* Hand */}
        <path d="M72 124 C69 122 67 127 70 131 C72 133 76 133 77 129 Z" fill="#fed7aa" />

        {/* Smartphone */}
        <rect
          x="68"
          y="108"
          width="16"
          height="30"
          rx="3"
          fill="#ffffff"
          stroke="#334155"
          strokeWidth="1.6"
        />
        {/* Phone screen header */}
        <rect x="69" y="110" width="14" height="6" fill="#e11d48" />
        <line x1="71" y1="120" x2="81" y2="120" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="71" y1="124" x2="79" y2="124" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="71" y1="128" x2="77" y2="128" stroke="#cbd5e1" strokeWidth="1" />

        {/* Right Arm resting forward */}
        <path
          d="M118 96 L128 116 L124 134 C120 137 110 137 106 133 L108 126 L118 112 Z"
          fill="#fed7aa"
        />
      </svg>
    </div>
  );
}

/* ==========================================================================
   MOBILE HOME SCREEN MAIN COMPONENT
   ========================================================================== */

export default function MobileHomeScreen({
  shop,
  customers,
  suppliers,
  products = [],
  totalBusinesses = 1,
  onOpenStoreSwitcher,
  onOpenInventory,
  onOpenNotes,
  onOpenTagada,
  onOpenQRCode,
  onOpenBackup,
  onOpenTallyMessage,
  onOpenCashbox,
  onOpenSettings,
  onOpenAddParty,
  onSelectCustomer,
  onSelectSupplier,
  onSelectProduct,
  onOpenSalesMemo,
  onOpenQuickEntry,
  onOpenCalculator,
  onOpenReports,
  onOpenPWAInstall,
}: MobileHomeScreenProps) {
  const [activeFilterTab, setActiveFilterTab] = useState<'customers' | 'suppliers'>('customers');
  const [searchTerm, setSearchTerm] = useState('');

  // -------------------------------------------------------------
  // GLOBAL SEARCH STATE (কাস্টমার, সাপ্লায়ার ও মালামাল সার্বজনীন অনুসন্ধান)
  // -------------------------------------------------------------
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [isGlobalSearchActive, setIsGlobalSearchActive] = useState(false);
  const [globalFilterTab, setGlobalFilterTab] = useState<'all' | 'customers' | 'suppliers' | 'products'>('all');
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsGlobalSearchActive(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Esc to close search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsGlobalSearchActive(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Global search filtering across all 3 entities
  const rawQuery = globalSearchTerm.trim().toLowerCase();
  const normalizedQuery = normalizeDigits(rawQuery);
  const queryDigitsOnly = normalizedQuery.replace(/\D/g, '');

  const matchedCustomers = useMemo(() => {
    if (!rawQuery) return [];
    return customers.filter((c) => {
      const nameMatch = c.name.toLowerCase().includes(rawQuery);
      const addrMatch = (c.address || '').toLowerCase().includes(rawQuery);
      const phoneNorm = normalizeDigits(c.phone || '').toLowerCase();
      const phoneMatch = phoneNorm.includes(normalizedQuery) || (queryDigitsOnly ? phoneNorm.replace(/\D/g, '').includes(queryDigitsOnly) : false);
      return nameMatch || addrMatch || phoneMatch;
    });
  }, [customers, rawQuery, normalizedQuery, queryDigitsOnly]);

  const matchedSuppliers = useMemo(() => {
    if (!rawQuery) return [];
    return suppliers.filter((s) => {
      const nameMatch = s.name.toLowerCase().includes(rawQuery);
      const companyMatch = (s.companyName || '').toLowerCase().includes(rawQuery);
      const addrMatch = (s.address || '').toLowerCase().includes(rawQuery);
      const phoneNorm = normalizeDigits(s.phone || '').toLowerCase();
      const phoneMatch = phoneNorm.includes(normalizedQuery) || (queryDigitsOnly ? phoneNorm.replace(/\D/g, '').includes(queryDigitsOnly) : false);
      return nameMatch || companyMatch || addrMatch || phoneMatch;
    });
  }, [suppliers, rawQuery, normalizedQuery, queryDigitsOnly]);

  const matchedProducts = useMemo(() => {
    if (!rawQuery) return [];
    const prodList = products || [];
    return prodList.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(rawQuery);
      const catMatch = (p.category || '').toLowerCase().includes(rawQuery);
      const barcodeNorm = normalizeDigits(p.barcode || '').toLowerCase();
      const barcodeMatch = barcodeNorm.includes(normalizedQuery) || (queryDigitsOnly ? barcodeNorm.replace(/\D/g, '').includes(queryDigitsOnly) : false);
      return nameMatch || catMatch || barcodeMatch;
    });
  }, [products, rawQuery, normalizedQuery, queryDigitsOnly]);

  const totalMatchesCount = matchedCustomers.length + matchedSuppliers.length + matchedProducts.length;

  // Quick shortcut suggestions for empty search query
  const topDueCustomers = useMemo(() => {
    return [...customers].filter((c) => c.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue).slice(0, 3);
  }, [customers]);

  const topPayableSuppliers = useMemo(() => {
    return [...suppliers].filter((s) => s.totalPayable > 0).sort((a, b) => b.totalPayable - a.totalPayable).slice(0, 3);
  }, [suppliers]);

  const lowStockProducts = useMemo(() => {
    return [...(products || [])].filter((p) => p.stockQuantity <= (p.minStockAlert || 5)).slice(0, 3);
  }, [products]);

  // Tab-specific list in standard bottom contact list
  const currentList = activeFilterTab === 'customers' ? customers : suppliers;

  const filteredItems = currentList.filter((item) => {
    const q = searchTerm.toLowerCase();
    const nameMatch = item.name.toLowerCase().includes(q);
    const phoneMatch = item.phone.includes(q);
    const addrMatch = item.address?.toLowerCase().includes(q);
    return nameMatch || phoneMatch || addrMatch;
  });

  const isPersonal = isPersonalAccount(shop);
  const shopName = 'name' in shop ? shop.name : shop.shopName;
  const shopCategory = (shop as any).category || (shop as any).businessType || (isPersonal ? 'ব্যক্তিগত খতিয়ান' : 'মুদি ও জেনারেল স্টোর');
  const shopOwner = (shop as any).proprietor || (shop as any).ownerName || 'মো: আব্দুল করিম';

  return (
    <div className="w-full min-h-screen bg-[#faf8f3] text-slate-900 flex flex-col font-sans select-none pb-28">
      {/* ================================================================
          TOP GOLDEN HEADER (Authentic Golden Gradient)
          ================================================================ */}
      <header className="bg-gradient-to-b from-[#d5b87e] via-[#c9a96b] to-[#c29f5d] px-4 pt-3 pb-7 shadow-xs">
        <div className="max-w-xl mx-auto flex items-start justify-between">
          {/* Shop Selector Pill */}
          <div>
            <button
              onClick={onOpenStoreSwitcher}
              className="px-3.5 py-1.5 bg-white text-slate-800 rounded-full font-bold text-sm shadow-xs flex items-center gap-1.5 hover:bg-slate-50 active:scale-98 transition cursor-pointer border border-amber-100"
              title={isPersonal ? 'অ্যাকাউন্ট পরিবর্তন করুন' : 'দোকান পরিবর্তন করুন'}
            >
              <span className="text-base leading-none">{isPersonal ? '👤' : '👑'}</span>
              <span className="truncate max-w-[150px] sm:max-w-xs">{shopName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                isPersonal ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {isPersonal ? 'ব্যক্তিগত' : 'ব্যবসা'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-600 stroke-[2.5]" />
            </button>
          </div>

          {/* Top Right Action Icons: অ্যাপ APK ও সেটিংস */}
          <div className="flex items-center gap-1">
            {onOpenPWAInstall && (
              <button
                onClick={onOpenPWAInstall}
                className="flex flex-col items-center text-[#3a2707] hover:text-black transition cursor-pointer group px-2 py-0.5 rounded-xl hover:bg-black/5 active:scale-95"
                title="মোবাইলে অ্যাপ (APK) ইনস্টল করুন"
                aria-label="অ্যাপ ইনস্টল"
              >
                <div className="p-1 relative">
                  <Smartphone className="w-6 h-6 stroke-[2] text-[#3a2707]" />
                  <span className="absolute 0 top-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                </div>
                <span className="text-[11px] font-bold mt-0.5">অ্যাপ APK</span>
              </button>
            )}

            <button
              onClick={onOpenSettings}
              className="flex flex-col items-center text-[#3a2707] hover:text-black transition cursor-pointer group px-2 py-0.5 rounded-xl hover:bg-black/5 active:scale-95"
              title="দোকানের সেটিংস ও প্রোফাইল"
              aria-label="দোকানের সেটিংস"
            >
              <div className="p-1">
                <Settings className="w-6 h-6 stroke-[2] group-hover:rotate-45 transition duration-300" />
              </div>
              <span className="text-[11px] font-bold mt-0.5">সেটিংস</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================
          MAIN BODY CONTAINER WITH ROUNDED TOP CORNERS
          ================================================================ */}
      <div className="flex-1 -mt-4 bg-[#faf8f3] rounded-t-[28px] shadow-sm max-w-xl mx-auto w-full px-3 pt-3 flex flex-col">
        {/* ================================================================
            GLOBAL SEARCH BAR (কাস্টমার, সাপ্লায়ার ও মালামাল সার্বজনীন সার্চ)
            ================================================================ */}
        <div ref={searchContainerRef} className="relative mb-3 z-30">
          <div
            className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs ${
              isGlobalSearchActive || globalSearchTerm
                ? 'border-amber-500 ring-2 ring-amber-300/60 shadow-md bg-white'
                : 'border-amber-200/90 hover:border-amber-400 bg-white'
            }`}
          >
            <div className="flex items-center px-3.5 py-2.5 gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Search className="w-4 h-4 stroke-[2.5]" />
              </div>

              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  value={globalSearchTerm}
                  onChange={(e) => {
                    setGlobalSearchTerm(e.target.value);
                    if (!isGlobalSearchActive) setIsGlobalSearchActive(true);
                  }}
                  onFocus={() => setIsGlobalSearchActive(true)}
                  placeholder={
                    isPersonal
                      ? 'ব্যক্তি, দেনাদার ও খরচ হিসাব খুঁজুন...'
                      : 'কাস্টমার, সাপ্লায়ার ও মালামাল খুঁজুন...'
                  }
                  className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {globalSearchTerm && (
                <button
                  type="button"
                  onClick={() => setGlobalSearchTerm('')}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  title="মুছুন"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {isGlobalSearchActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsGlobalSearchActive(false);
                    setGlobalSearchTerm('');
                  }}
                  className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition cursor-pointer shrink-0 border border-amber-200/80"
                >
                  বন্ধ
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200/80 shrink-0">
                  সার্বজনীন সার্চ
                </span>
              )}
            </div>
          </div>

          {/* ================================================================
              SEARCH RESULTS DROPDOWN PANEL
              ================================================================ */}
          {isGlobalSearchActive && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 max-h-[75vh] flex flex-col">
              {/* Category Filter Pills inside Search Dropdown */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setGlobalFilterTab('all')}
                  className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                    globalFilterTab === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>সব ({toBengaliNumber(totalMatchesCount)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGlobalFilterTab('customers')}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                    globalFilterTab === 'customers'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{isPersonal ? 'ধার পাবো' : 'কাস্টমার'} ({toBengaliNumber(matchedCustomers.length)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGlobalFilterTab('suppliers')}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                    globalFilterTab === 'suppliers'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white text-indigo-800 hover:bg-indigo-50 border border-indigo-200'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>{isPersonal ? 'দেনা দিতে হবে' : 'সাপ্লায়ার'} ({toBengaliNumber(matchedSuppliers.length)})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGlobalFilterTab('products')}
                  className={`px-2.5 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
                    globalFilterTab === 'products'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>{isPersonal ? 'সম্পদ/মাল' : 'মালামাল'} ({toBengaliNumber(matchedProducts.length)})</span>
                </button>
              </div>

              {/* Scrollable Results Container */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-3.5 max-h-[60vh]">
                {/* CASE 1: Query typed, but 0 matches */}
                {rawQuery && totalMatchesCount === 0 && (
                  <div className="py-8 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                      <Search className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      "{globalSearchTerm}" দিয়ে কোনো ফলাফল পাওয়া যায়নি
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      নামের বানান যাচাই করুন অথবা নতুন হিসেবে যুক্ত করুন
                    </p>

                    {/* Quick Add Buttons */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setIsGlobalSearchActive(false);
                          onOpenAddParty('customer');
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নতুন কাস্টমার</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsGlobalSearchActive(false);
                          onOpenAddParty('supplier');
                        }}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নতুন সাপ্লায়ার</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setIsGlobalSearchActive(false);
                          onOpenInventory();
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>নতুন মালামাল</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE 2: Query empty -> Show Quick Navigation Suggestions */}
                {!rawQuery && (
                  <div className="space-y-3 p-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>দ্রুত অ্যাক্সেস ও গুরুত্বপূর্ণ তালিকা</span>
                    </div>

                    {/* Top Due Customers */}
                    {topDueCustomers.length > 0 && (
                      <div className="bg-amber-50/60 rounded-xl p-2.5 border border-amber-200/80">
                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                          <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                            <Users className="w-3 h-3 text-amber-600" />
                            <span>শীর্ষ বাকিদার কাস্টমার</span>
                          </span>
                          <span className="text-[10px] text-amber-700 font-semibold">পাওনা টাকা</span>
                        </div>
                        <div className="space-y-1.5">
                          {topDueCustomers.map((c) => (
                            <div
                              key={c.id}
                              onClick={() => {
                                setIsGlobalSearchActive(false);
                                onSelectCustomer(c);
                              }}
                              className="bg-white p-2 rounded-lg border border-amber-100 flex items-center justify-between hover:bg-amber-50 transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                                  {c.name.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{c.name}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">{c.phone}</p>
                                </div>
                              </div>
                              <span className="text-xs font-extrabold text-red-600 font-mono shrink-0">
                                পাবো {formatTaka(c.totalDue, shop.enableBengaliDigits)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Top Payable Suppliers */}
                    {topPayableSuppliers.length > 0 && (
                      <div className="bg-indigo-50/60 rounded-xl p-2.5 border border-indigo-200/80">
                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                          <span className="text-[11px] font-bold text-indigo-900 flex items-center gap-1">
                            <Truck className="w-3 h-3 text-indigo-600" />
                            <span>শীর্ষ দেনাদার সাপ্লায়ার</span>
                          </span>
                          <span className="text-[10px] text-indigo-700 font-semibold">দেনা টাকা</span>
                        </div>
                        <div className="space-y-1.5">
                          {topPayableSuppliers.map((s) => (
                            <div
                              key={s.id}
                              onClick={() => {
                                setIsGlobalSearchActive(false);
                                onSelectSupplier(s);
                              }}
                              className="bg-white p-2 rounded-lg border border-indigo-100 flex items-center justify-between hover:bg-indigo-50 transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                                  {s.name.slice(0, 2)}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{s.name}</p>
                                  <p className="text-[10px] text-slate-500 font-mono">{s.companyName || s.phone}</p>
                                </div>
                              </div>
                              <span className="text-xs font-extrabold text-red-600 font-mono shrink-0">
                                দেনা {formatTaka(s.totalPayable, shop.enableBengaliDigits)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Low Stock Items */}
                    {lowStockProducts.length > 0 && (
                      <div className="bg-rose-50/60 rounded-xl p-2.5 border border-rose-200/80">
                        <div className="flex items-center justify-between mb-1.5 px-0.5">
                          <span className="text-[11px] font-bold text-rose-900 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            <span>কম স্টকের মালামাল</span>
                          </span>
                          <span className="text-[10px] text-rose-700 font-semibold">স্টক রিফিল দরকার</span>
                        </div>
                        <div className="space-y-1.5">
                          {lowStockProducts.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setIsGlobalSearchActive(false);
                                if (onSelectProduct) {
                                  onSelectProduct(p);
                                } else {
                                  onOpenInventory();
                                }
                              }}
                              className="bg-white p-2 rounded-lg border border-rose-100 flex items-center justify-between hover:bg-rose-50 transition cursor-pointer"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                                  <Package className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-900 truncate">{p.name}</p>
                                  <p className="text-[10px] text-slate-500">{p.category}</p>
                                </div>
                              </div>
                              <span className="text-xs font-extrabold text-rose-600 shrink-0">
                                স্টক: {p.stockQuantity} {p.unit}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* CASE 3: Active Results by Category */}
                {rawQuery && (
                  <>
                    {/* CUSTOMER MATCHES */}
                    {(globalFilterTab === 'all' || globalFilterTab === 'customers') && matchedCustomers.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1 px-1">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-amber-600" />
                            <span>কাস্টমার ({toBengaliNumber(matchedCustomers.length)})</span>
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {matchedCustomers.map((cust) => {
                            const isDue = cust.totalDue > 0;
                            const isAdvance = cust.totalDue < 0;

                            return (
                              <div
                                key={cust.id}
                                onClick={() => {
                                  setIsGlobalSearchActive(false);
                                  onSelectCustomer(cust);
                                }}
                                className="p-2.5 bg-slate-50 hover:bg-amber-50/70 border border-slate-200/90 rounded-xl flex items-center justify-between transition cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-full bg-orange-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                    {cust.name.slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-amber-900 truncate">
                                      {cust.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                      <span className="flex items-center gap-0.5">
                                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                                        {cust.phone}
                                      </span>
                                      {cust.address && (
                                        <span className="truncate max-w-[120px] text-slate-400">
                                          • {cust.address}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    {isDue ? (
                                      <>
                                        <span className="text-[10px] font-bold text-red-600 block">বাকি পাবো</span>
                                        <span className="text-xs font-extrabold text-red-600 font-mono">
                                          {formatTaka(cust.totalDue, shop.enableBengaliDigits)}
                                        </span>
                                      </>
                                    ) : isAdvance ? (
                                      <>
                                        <span className="text-[10px] font-bold text-emerald-600 block">অগ্রিম জমা</span>
                                        <span className="text-xs font-extrabold text-emerald-600 font-mono">
                                          {formatTaka(Math.abs(cust.totalDue), shop.enableBengaliDigits)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[11px] font-bold text-slate-400">হিসাব মিল</span>
                                    )}
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* SUPPLIER MATCHES */}
                    {(globalFilterTab === 'all' || globalFilterTab === 'suppliers') && matchedSuppliers.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1 px-1">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>সাপ্লায়ার / মহাজন ({toBengaliNumber(matchedSuppliers.length)})</span>
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {matchedSuppliers.map((supp) => {
                            const hasPayable = supp.totalPayable > 0;

                            return (
                              <div
                                key={supp.id}
                                onClick={() => {
                                  setIsGlobalSearchActive(false);
                                  onSelectSupplier(supp);
                                }}
                                className="p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/90 rounded-xl flex items-center justify-between transition cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                    {supp.name.slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-900 group-hover:text-indigo-900 truncate">
                                      {supp.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                                      {supp.companyName && (
                                        <span className="font-semibold text-slate-700 truncate max-w-[110px]">
                                          🏢 {supp.companyName}
                                        </span>
                                      )}
                                      <span className="flex items-center gap-0.5">
                                        <Phone className="w-2.5 h-2.5 text-slate-400" />
                                        {supp.phone}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    {hasPayable ? (
                                      <>
                                        <span className="text-[10px] font-bold text-red-600 block">দেনা দেবেন</span>
                                        <span className="text-xs font-extrabold text-red-600 font-mono">
                                          {formatTaka(supp.totalPayable, shop.enableBengaliDigits)}
                                        </span>
                                      </>
                                    ) : (
                                      <span className="text-[11px] font-bold text-slate-400">পরিশোধ</span>
                                    )}
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* PRODUCT MATCHES */}
                    {(globalFilterTab === 'all' || globalFilterTab === 'products') && matchedProducts.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-1 px-1">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                            <Package className="w-3.5 h-3.5 text-emerald-600" />
                            <span>দোকানের মালামাল ও পণ্য ({toBengaliNumber(matchedProducts.length)})</span>
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {matchedProducts.map((prod) => {
                            const isLowStock = prod.stockQuantity <= (prod.minStockAlert || 5);

                            return (
                              <div
                                key={prod.id}
                                onClick={() => {
                                  setIsGlobalSearchActive(false);
                                  if (onSelectProduct) {
                                    onSelectProduct(prod);
                                  } else {
                                    onOpenInventory();
                                  }
                                }}
                                className="p-2.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200/90 rounded-xl flex items-center justify-between transition cursor-pointer group"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                                      isLowStock
                                        ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    }`}
                                  >
                                    <Package className="w-4 h-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 truncate">
                                        {prod.name}
                                      </p>
                                      {isLowStock && (
                                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded text-[9px] font-bold">
                                          কম স্টক
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                                      <span className="bg-slate-200/70 px-1.5 py-0.2 rounded text-slate-700 font-medium">
                                        {prod.category}
                                      </span>
                                      <span>
                                        বিক্রয়: <strong className="text-slate-800">৳{prod.sellingPrice}</strong>/{prod.unit}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    <span
                                      className={`text-xs font-bold block ${
                                        isLowStock ? 'text-rose-600 font-extrabold' : 'text-slate-800'
                                      }`}
                                    >
                                      {prod.stockQuantity} {prod.unit}
                                    </span>
                                    <span className="text-[9px] text-slate-400">বর্তমান স্টক</span>
                                  </div>
                                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Bottom Quick Action Bar inside dropdown */}
              <div className="px-3 py-2 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-600">
                <span>
                  মোট অনুসন্ধান ফলাফল: <strong>{toBengaliNumber(totalMatchesCount)}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsGlobalSearchActive(false);
                    setGlobalSearchTerm('');
                  }}
                  className="font-bold text-slate-700 hover:text-slate-950 cursor-pointer"
                >
                  সার্চ বন্ধ করুন ✕
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 8-GRID SERVICES SHORTCUTS */}
        <section
          aria-label="সেবা ও শর্টকাট"
          className="bg-white rounded-2xl p-3 shadow-xs border border-amber-100/60 mb-3"
        >
          <div className="grid grid-cols-4 gap-y-4 gap-x-1">
            {/* 1. মাল্টি ব্যবসা / অ্যাকাউন্ট */}
            <button
              onClick={onOpenStoreSwitcher}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#f0fdf4] border border-emerald-100 flex items-center justify-center shadow-xs group-hover:bg-[#dcfce7] transition">
                <MultiBusinessIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                {isPersonal ? 'অ্যাকাউন্ট' : 'মাল্টি ব্যবসা'}
              </span>
            </button>

            {/* 2. স্টক হিসাব / বাজেট ও সম্পদ */}
            <button
              onClick={onOpenInventory}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#fff1f2] border border-rose-100 flex items-center justify-center shadow-xs group-hover:bg-[#ffe4e6] transition">
                <StockInventoryIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                {isPersonal ? 'বাজেট ও সম্পদ' : 'স্টক হিসাব'}
              </span>
            </button>

            {/* 3. ব্যবসার নোট / ব্যক্তিগত নোট */}
            <button
              onClick={onOpenNotes}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#fff7ed] border border-orange-100 flex items-center justify-center shadow-xs group-hover:bg-[#ffedd5] transition">
                <BusinessNotesIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                {isPersonal ? 'ব্যক্তিগত নোট' : 'ব্যবসার নোট'}
              </span>
            </button>

            {/* 4. গ্রুপ তাগাদা / বন্ধু তাগাদা */}
            <button
              onClick={onOpenTagada}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#f0fdf4] border border-emerald-100 flex items-center justify-center shadow-xs group-hover:bg-[#dcfce7] transition">
                <GroupTagadaIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                {isPersonal ? 'বন্ধু তাগাদা' : 'গ্রুপ তাগাদা'}
              </span>
            </button>

            {/* 5. QR কোড */}
            <button
              onClick={onOpenQRCode}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#fff1f2] border border-rose-100 flex items-center justify-center shadow-xs group-hover:bg-[#ffe4e6] transition">
                <QRCodeIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                QR কোড
              </span>
            </button>

            {/* 6. ডাটা ব্যাকআপ */}
            <button
              onClick={onOpenBackup}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#f0fdf4] border border-emerald-100 flex items-center justify-center shadow-xs group-hover:bg-[#dcfce7] transition">
                <DataBackupIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                ডাটা ব্যাকআপ
              </span>
            </button>

            {/* 7. টালি-মেসেজ */}
            <button
              onClick={onOpenTallyMessage}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#fff1f2] border border-rose-100 flex items-center justify-center shadow-xs group-hover:bg-[#ffe4e6] transition">
                <TallyMessageIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                টালি-মেসেজ
              </span>
            </button>

            {/* 8. ক্যাশবাক্স / দৈনিক ক্যাশ */}
            <button
              onClick={onOpenCashbox}
              className="flex flex-col items-center text-center group cursor-pointer active:scale-95 transition"
            >
              <div className="w-13 h-13 rounded-2xl bg-[#fff7ed] border border-orange-100 flex items-center justify-center shadow-xs group-hover:bg-[#ffedd5] transition">
                <CashboxIcon />
              </div>
              <span className="text-[11.5px] font-bold text-slate-800 mt-1.5 leading-tight">
                {isPersonal ? 'দৈনিক ক্যাশ' : 'ক্যাশবাক্স'}
              </span>
            </button>
          </div>
        </section>

        {/* ================================================================
            CONTACT COUNTER & TAB SELECTOR (কাস্টমার / সাপ্লায়ার or ধার পাবো / দেনা দিতে হবে)
            ================================================================ */}
        <section className="bg-white rounded-2xl p-3 shadow-xs border border-amber-100/60 flex-1 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            {/* Counter display */}
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-slate-800">
                {isPersonal ? (
                  <>ধার পাবো {toBengaliNumber(customers.length)} / দেনা {toBengaliNumber(suppliers.length)}</>
                ) : (
                  <>কাস্টমার {toBengaliNumber(customers.length)} / সাপ্লায়ার {toBengaliNumber(suppliers.length)}</>
                )}
              </span>
            </div>

            {/* Tab switch pills */}
            <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveFilterTab('customers')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  activeFilterTab === 'customers'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isPersonal ? 'ধার পাবো' : 'কাস্টমার'}
              </button>
              <button
                onClick={() => setActiveFilterTab('suppliers')}
                className={`px-3 py-1 rounded-md transition cursor-pointer ${
                  activeFilterTab === 'suppliers'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {isPersonal ? 'দেনা দেবো' : 'সাপ্লায়ার'}
              </button>
            </div>
          </div>

          {/* List Content OR Empty State */}
          {currentList.length === 0 ? (
            /* EMPTY STATE ILLUSTRATION */
            <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
              <ShopkeeperIllustration />
              <p className="text-base font-bold text-slate-800 mt-3 px-4 leading-relaxed">
                {isPersonal
                  ? 'হিসাব শুরু করতে পরিচিত ব্যক্তি বা দেনাদার যোগ করুন।'
                  : 'ব্যবহার শুরু করতে কাস্টমার/সাপ্লায়ার যোগ করুন।'}
              </p>
              <button
                onClick={() => onOpenAddParty(activeFilterTab === 'customers' ? 'customer' : 'supplier')}
                className="mt-3.5 px-4 py-2 bg-[#991b1b] hover:bg-[#831818] active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>
                  {isPersonal
                    ? (activeFilterTab === 'customers' ? 'টাকা পাবো এমন ব্যক্তি যোগ' : 'দেনা শোধ করতে হবে এমন ব্যক্তি যোগ')
                    : `নতুন ${activeFilterTab === 'customers' ? 'কাস্টমার' : 'সাপ্লায়ার'} যোগ করুন`}
                </span>
              </button>
            </div>
          ) : (
            /* CONTACT LIST WITH SEARCH */
            <div className="flex-1 flex flex-col pt-3">
              {/* Search input */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={
                    isPersonal
                      ? (activeFilterTab === 'customers' ? 'ব্যক্তির নাম বা ফোন দিয়ে খুঁজুন...' : 'দেনা বা মহাজনের নাম দিয়ে খুঁজুন...')
                      : (activeFilterTab === 'customers' ? 'কাস্টমারের নাম বা ফোন দিয়ে খুঁজুন...' : 'সাপ্লায়ারের নাম বা ফোন দিয়ে খুঁজুন...')
                  }
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Items */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-0.5">
                {filteredItems.map((item) => {
                  const isCust = activeFilterTab === 'customers';
                  const cust = item as Customer;
                  const supp = item as Supplier;
                  const due = isCust ? cust.totalDue : supp.totalPayable;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isCust) {
                          onSelectCustomer(cust);
                        } else {
                          onSelectSupplier(supp);
                        }
                      }}
                      className="p-3 bg-[#fbfbfa] hover:bg-amber-50/50 border border-slate-200/80 rounded-xl flex items-center justify-between cursor-pointer transition shadow-2xs active:scale-99"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isCust
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                          }`}
                        >
                          {item.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {item.phone}
                          </p>
                        </div>
                      </div>

                      {/* Due / Balance info */}
                      <div className="text-right shrink-0">
                        {isCust ? (
                          cust.totalDue > 0 ? (
                            <div>
                              <span className="text-[10px] text-red-600 font-bold block">
                                {isPersonal ? 'ধার পাবেন' : 'বাকি পাবেন'}
                              </span>
                              <span className="text-xs font-extrabold text-red-600">
                                {formatTaka(cust.totalDue)}
                              </span>
                            </div>
                          ) : cust.totalDue < 0 ? (
                            <div>
                              <span className="text-[10px] text-emerald-600 font-bold block">
                                {isPersonal ? 'আগাম নিয়েছেন' : 'অগ্রিম জমা'}
                              </span>
                              <span className="text-xs font-extrabold text-emerald-600">
                                {formatTaka(Math.abs(cust.totalDue))}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] font-semibold text-slate-400">
                              পরিশোধ
                            </span>
                          )
                        ) : supp.totalPayable > 0 ? (
                          <div>
                            <span className="text-[10px] text-red-600 font-bold block">
                              {isPersonal ? 'দেনা শোধ করবেন' : 'দেনা দেবেন'}
                            </span>
                            <span className="text-xs font-extrabold text-red-600">
                              {formatTaka(supp.totalPayable)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">
                            পরিশোধ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ================================================================
          BOTTOM CORNER FLOATING PLUS BUTTON (+)
          নিচে ডান কোনায় গোল প্লাস বাটন (নেভিগেশন বার না ঢেকে)
          ================================================================ */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-40">
        <button
          onClick={() => onOpenAddParty(activeFilterTab === 'customers' ? 'customer' : 'supplier')}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-[#991b1b] to-rose-700 hover:from-[#831818] hover:to-rose-800 active:scale-90 text-white shadow-xl shadow-red-950/30 flex items-center justify-center transition-all duration-150 cursor-pointer border-2 border-white group"
          title={
            isPersonal
              ? (activeFilterTab === 'customers' ? 'টাকা ধার দেওয়া ব্যক্তি যোগ করুন' : 'টাকা ধার নেওয়া ব্যক্তি যোগ করুন')
              : (activeFilterTab === 'customers' ? 'নতুন কাস্টমার যোগ করুন' : 'নতুন সাপ্লায়ার যোগ করুন')
          }
          aria-label={activeFilterTab === 'customers' ? 'নতুন কাস্টমার যোগ করুন' : 'নতুন সাপ্লায়ার যোগ করুন'}
        >
          <Plus className="w-7 h-7 stroke-[2.8] group-hover:rotate-90 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
}
