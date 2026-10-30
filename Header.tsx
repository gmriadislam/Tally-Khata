import { useState, useEffect, useRef } from 'react';
import {
  Store,
  Calculator,
  Settings,
  PlusCircle,
  ShoppingCart,
  Users,
  Truck,
  Package,
  Wallet,
  BarChart3,
  ChevronDown,
  Plus,
  Check,
  Building2,
  FileSpreadsheet,
  Cloud,
  Smartphone,
} from 'lucide-react';
import { Business, BusinessStore, ActiveTab } from '../types';
import { formatBengaliDate } from '../utils/formatters';

interface HeaderProps {
  activeBusiness: Business;
  businesses: BusinessStore[];
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onSwitchBusiness: (businessId: string) => void;
  onOpenBusinessSwitcher: () => void;
  onOpenQuickSale: () => void;
  onOpenQuickEntry: () => void;
  onOpenCalculator: () => void;
  onOpenSettings: () => void;
  onOpenReports: () => void;
  onOpenDriveBackup?: () => void;
  onOpenPWAInstall?: () => void;
  isViewingProfile?: boolean;
}

export default function Header({
  activeBusiness,
  businesses,
  activeTab,
  onTabChange,
  onSwitchBusiness,
  onOpenBusinessSwitcher,
  onOpenQuickSale,
  onOpenQuickEntry,
  onOpenCalculator,
  onOpenSettings,
  onOpenReports,
  onOpenDriveBackup,
  onOpenPWAInstall,
  isViewingProfile = false,
}: HeaderProps) {
  const [currentDateStr, setCurrentDateStr] = useState(new Date().toISOString());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateStr(new Date().toISOString());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'হোম ড্যাশবোর্ড', icon: <Store className="w-4 h-4" /> },
    { id: 'customers', label: 'কাস্টমার খাতা', icon: <Users className="w-4 h-4" /> },
    { id: 'suppliers', label: 'সাপ্লায়ার খাতা', icon: <Truck className="w-4 h-4" /> },
    { id: 'inventory', label: 'স্টক ও ইনভেন্টরি', icon: <Package className="w-4 h-4" /> },
    { id: 'cashbook', label: 'ক্যাশ খাতা (ক্যাশবক্স)', icon: <Wallet className="w-4 h-4" /> },
    { id: 'reports', label: 'রিপোর্ট ও বিশ্লেষণ', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  const getColorClasses = (theme?: string) => {
    switch (theme) {
      case 'blue':
        return { bg: 'bg-blue-600', text: 'text-blue-600', light: 'bg-blue-50 text-blue-700' };
      case 'indigo':
        return { bg: 'bg-indigo-600', text: 'text-indigo-600', light: 'bg-indigo-50 text-indigo-700' };
      case 'purple':
        return { bg: 'bg-purple-600', text: 'text-purple-600', light: 'bg-purple-50 text-purple-700' };
      case 'rose':
        return { bg: 'bg-rose-600', text: 'text-rose-600', light: 'bg-rose-50 text-rose-700' };
      case 'amber':
        return { bg: 'bg-amber-600', text: 'text-amber-600', light: 'bg-amber-50 text-amber-700' };
      case 'teal':
        return { bg: 'bg-teal-600', text: 'text-teal-600', light: 'bg-teal-50 text-teal-700' };
      default:
        return { bg: 'bg-emerald-600', text: 'text-emerald-600', light: 'bg-emerald-50 text-emerald-700' };
    }
  };

  const activeColor = getColorClasses(activeBusiness.colorTheme);

  return (
    <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs backdrop-blur-md">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Business Switcher Dropdown Trigger */}
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 p-1 rounded-2xl hover:bg-slate-50 cursor-pointer transition select-none group"
            >
              <div
                className={`w-10 h-10 rounded-2xl ${activeColor.bg} flex items-center justify-center text-white shadow-xs transition group-hover:scale-105 shrink-0`}
              >
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    {activeBusiness.name}
                  </h1>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-slate-700' : ''
                    }`}
                  />
                  <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-full border border-slate-200">
                    {businesses.length}টি ব্যবসা
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-0.5">
                  <span className="font-semibold text-slate-700">
                    {activeBusiness.businessType || 'ব্যবসা'}
                  </span>
                  {activeBusiness.proprietor && (
                    <>
                      <span>•</span>
                      <span>প্রো: {activeBusiness.proprietor}</span>
                    </>
                  )}
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline text-slate-400">
                    {formatBengaliDate(currentDateStr)}
                  </span>
                </p>
              </div>
            </div>

            {/* Quick Switch Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    ব্যবসা নির্বাচন করুন ({businesses.length} টি)
                  </span>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenBusinessSwitcher();
                    }}
                    className="text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer"
                  >
                    ব্যবস্থাপনা
                  </button>
                </div>

                {/* Businesses list */}
                <div className="py-1 max-h-64 overflow-y-auto space-y-1">
                  {businesses.map((store) => {
                    const b = store.business;
                    const isCurrent = b.id === activeBusiness.id;
                    const itemTheme = getColorClasses(b.colorTheme);

                    return (
                      <div
                        key={b.id}
                        onClick={() => {
                          onSwitchBusiness(b.id);
                          setIsDropdownOpen(false);
                        }}
                        className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                          isCurrent
                            ? 'bg-slate-100 border border-slate-200'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl ${itemTheme.bg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                          >
                            <Store className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">
                              {b.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {b.businessType || 'ব্যবসা'} {b.phone ? `• ${b.phone}` : ''}
                            </p>
                          </div>
                        </div>

                        {isCurrent ? (
                          <span className="p-1 rounded-full bg-emerald-600 text-white shrink-0">
                            <Check className="w-3 h-3" />
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 group-hover:text-slate-700 font-medium shrink-0">
                            খুলুন
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer action button */}
                <div className="pt-2 border-t border-slate-100 mt-1">
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenBusinessSwitcher();
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ নতুন ব্যবসা প্রোফাইল যোগ করুন</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={onOpenQuickSale}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>নতুন বিক্রি (মেমো)</span>
            </button>

            <button
              onClick={onOpenQuickEntry}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>হিসাব যোগ</span>
            </button>

            <div className="flex items-center gap-1.5 border-l border-slate-200 pl-2">
              {onOpenDriveBackup && (
                <button
                  onClick={onOpenDriveBackup}
                  className="flex items-center gap-1 px-2.5 py-2 text-cyan-800 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200/80 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                  title="গুগল ড্রাইভ ক্লাউড ব্যাকআপ ও রিস্টোর"
                >
                  <Cloud className="w-4 h-4 text-cyan-600" />
                  <span className="hidden sm:inline">ড্রাইভ সিঙ্ক</span>
                </button>
              )}

              {onOpenPWAInstall && (
                <button
                  onClick={onOpenPWAInstall}
                  className="flex items-center gap-1 px-2.5 py-2 text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                  title="মোবাইলে আলাদা অ্যাপ হিসেবে ইনস্টল করুন"
                >
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="hidden sm:inline">মোবাইল অ্যাপ</span>
                </button>
              )}

              <button
                onClick={onOpenReports}
                className="flex items-center gap-1 px-2.5 py-2 text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
                title="Excel / CSV ডাউনলোড ও রিপোর্ট"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">Excel ব্যাকআপ</span>
              </button>

              <button
                onClick={onOpenCalculator}
                className="flex items-center justify-center p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium transition cursor-pointer shrink-0"
                title="ক্যালকুলেটর"
              >
                <Calculator className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenSettings}
                className="flex items-center justify-center p-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-medium transition cursor-pointer shrink-0"
                title="দোকানের সেটিংস"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar - Segmented pill layout on desktop */}
      {!isViewingProfile && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar border-t border-slate-100 py-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'reports') {
                      onOpenReports();
                    } else {
                      onTabChange(item.id);
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition shrink-0 cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
