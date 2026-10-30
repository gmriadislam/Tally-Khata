import { useState, useEffect } from 'react';
import {
  X,
  Store,
  Plus,
  Check,
  Trash2,
  Edit2,
  Building2,
  Phone,
  MapPin,
  Tag,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Package,
  User,
  Wallet,
  Sparkles,
} from 'lucide-react';
import { Business, BusinessStore, AccountCategory } from '../types';
import { formatTaka, isPersonalAccount } from '../utils/formatters';
import { COMMERCIAL_BUSINESS_TYPES, PERSONAL_ACCOUNT_TYPES } from '../data/initialData';

interface BusinessSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessStore[];
  activeBusinessId: string;
  onSwitchBusiness: (businessId: string) => void;
  onCreateBusiness: (
    newBusiness: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
    useSampleData: boolean
  ) => void;
  onUpdateBusiness: (updated: Business) => void;
  onDeleteBusiness: (businessId: string) => void;
}

const COLOR_THEMES: {
  id: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple';
  label: string;
  bgClass: string;
  borderClass: string;
}[] = [
  { id: 'emerald', label: 'সবুজ', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-500' },
  { id: 'blue', label: 'নীল', bgClass: 'bg-blue-600', borderClass: 'border-blue-500' },
  { id: 'indigo', label: 'ইন্ডিগো', bgClass: 'bg-indigo-600', borderClass: 'border-indigo-500' },
  { id: 'purple', label: 'বেগুনী', bgClass: 'bg-purple-600', borderClass: 'border-purple-500' },
  { id: 'rose', label: 'গোলাপি/লাল', bgClass: 'bg-rose-600', borderClass: 'border-rose-500' },
  { id: 'amber', label: 'হলুদ/সোনালী', bgClass: 'bg-amber-600', borderClass: 'border-amber-500' },
  { id: 'teal', label: 'টিয়াল', bgClass: 'bg-teal-600', borderClass: 'border-teal-500' },
];

export default function BusinessSwitcherModal({
  isOpen,
  onClose,
  businesses,
  activeBusinessId,
  onSwitchBusiness,
  onCreateBusiness,
  onUpdateBusiness,
  onDeleteBusiness,
}: BusinessSwitcherModalProps) {
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'edit'>('list');
  const [listCategoryFilter, setListCategoryFilter] = useState<'all' | 'business' | 'personal'>('all');
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);

  // Form Fields
  const [accountCategory, setAccountCategory] = useState<AccountCategory>('business');
  const [name, setName] = useState('');
  const [businessType, setBusinessType] = useState(COMMERCIAL_BUSINESS_TYPES[0]);
  const [proprietor, setProprietor] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [tagline, setTagline] = useState('');
  const [colorTheme, setColorTheme] = useState<
    'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple'
  >('emerald');
  const [useSampleData, setUseSampleData] = useState(false);

  if (!isOpen) return null;

  const openCreateMode = (initialCategory: AccountCategory = 'business') => {
    setAccountCategory(initialCategory);
    setName('');
    setBusinessType(initialCategory === 'personal' ? PERSONAL_ACCOUNT_TYPES[0] : COMMERCIAL_BUSINESS_TYPES[0]);
    setProprietor('');
    setPhone('');
    setAddress('');
    setTagline('');
    setColorTheme(initialCategory === 'personal' ? 'indigo' : 'emerald');
    setUseSampleData(false);
    setViewMode('create');
  };

  const openEditMode = (biz: Business) => {
    const isPers = biz.accountCategory === 'personal' || isPersonalAccount(biz);
    setEditingBiz(biz);
    setAccountCategory(isPers ? 'personal' : 'business');
    setName(biz.name);
    setBusinessType(biz.businessType || (isPers ? PERSONAL_ACCOUNT_TYPES[0] : COMMERCIAL_BUSINESS_TYPES[0]));
    setProprietor(biz.proprietor);
    setPhone(biz.phone);
    setAddress(biz.address);
    setTagline(biz.tagline || '');
    setColorTheme(biz.colorTheme || (isPers ? 'indigo' : 'emerald'));
    setViewMode('edit');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreateBusiness(
      {
        name: name.trim(),
        businessType,
        accountCategory,
        proprietor: proprietor.trim(),
        phone: phone.trim(),
        address: address.trim(),
        tagline: tagline.trim(),
        currencySymbol: '৳',
        enableBengaliDigits: false,
        colorTheme,
      },
      useSampleData
    );

    setViewMode('list');
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBiz || !name.trim()) return;

    onUpdateBusiness({
      ...editingBiz,
      name: name.trim(),
      businessType,
      accountCategory,
      proprietor: proprietor.trim(),
      phone: phone.trim(),
      address: address.trim(),
      tagline: tagline.trim(),
      colorTheme,
      updatedAt: new Date().toISOString(),
    });

    setViewMode('list');
    setEditingBiz(null);
  };

  const handleDelete = (biz: Business) => {
    if (businesses.length <= 1) {
      alert('ন্যূনতম একটি ব্যবসা প্রোফাইল অবশ্যই থাকতে হবে!');
      return;
    }
    if (
      window.confirm(
        `আপনি কি নিশ্চিত যে "${biz.name}" ব্যবসা এবং এর সমস্ত কাস্টমার, স্টক ও হিসাব মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা যাবে না!`
      )
    ) {
      onDeleteBusiness(biz.id);
    }
  };

  const getColorBg = (theme?: string) => {
    switch (theme) {
      case 'blue':
        return 'bg-blue-600 text-white';
      case 'indigo':
        return 'bg-indigo-600 text-white';
      case 'purple':
        return 'bg-purple-600 text-white';
      case 'rose':
        return 'bg-rose-600 text-white';
      case 'amber':
        return 'bg-amber-600 text-white';
      case 'teal':
        return 'bg-teal-600 text-white';
      default:
        return 'bg-emerald-600 text-white';
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">
                {viewMode === 'list'
                  ? 'আমার ব্যবসা প্রোফাইল সমূহ'
                  : viewMode === 'create'
                  ? 'নতুন ব্যবসা প্রোফাইল যোগ করুন'
                  : 'ব্যবসার তথ্য সংশোধন'}
              </h2>
              <p className="text-xs text-slate-400">
                এক আইডি থেকে যত খুশি তত ব্যবসা পরিচালনা করুন (লগইন-লগআউট ছাড়া)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {viewMode === 'list' && (
            <div className="space-y-4">
              {/* Header with Title and Create Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setListCategoryFilter('all')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                      listCategoryFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    সকল অ্যাকাউন্ট ({businesses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setListCategoryFilter('business')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      listCategoryFilter === 'business'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>ব্যবসা ({businesses.filter((s) => !isPersonalAccount(s.business)).length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setListCategoryFilter('personal')}
                    className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                      listCategoryFilter === 'personal'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>ব্যক্তিগত হিসাব ({businesses.filter((s) => isPersonalAccount(s.business)).length})</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCreateMode('personal')}
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
                    title="নতুন ব্যক্তিগত হিসাব যোগ করুন"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>+ ব্যক্তিগত হিসাব</span>
                  </button>

                  <button
                    onClick={() => openCreateMode('business')}
                    className="flex items-center gap-1 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                    title="নতুন দোকান বা ব্যবসা যোগ করুন"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ ব্যবসা যোগ</span>
                  </button>
                </div>
              </div>

              {/* Businesses & Accounts Cards */}
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {businesses
                  .filter((store) => {
                    const isPers = isPersonalAccount(store.business);
                    if (listCategoryFilter === 'business') return !isPers;
                    if (listCategoryFilter === 'personal') return isPers;
                    return true;
                  })
                  .map((store) => {
                  const b = store.business;
                  const isActive = b.id === activeBusinessId;
                  const isPersonal = isPersonalAccount(b);

                  // Stats calculation for this business
                  const totalCustomerDue = store.customers.reduce(
                    (sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0),
                    0
                  );
                  const totalSupplierPayable = store.suppliers.reduce(
                    (sum, s) => sum + s.totalPayable,
                    0
                  );
                  const totalStockCount = store.products.length;

                  return (
                    <div
                      key={b.id}
                      className={`p-4 rounded-2xl border transition ${
                        isActive
                          ? isPersonal
                            ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-400/40 shadow-sm'
                            : 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/40 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3.5 min-w-0">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm shrink-0 ${
                              isPersonal ? 'bg-indigo-600 text-white' : getColorBg(b.colorTheme)
                            }`}
                          >
                            {isPersonal ? <User className="w-6 h-6" /> : <Store className="w-6 h-6" />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-bold text-slate-900 text-base">
                                {b.name}
                              </h3>

                              {/* Category Badge */}
                              {isPersonal ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                                  👤 ব্যক্তিগত হিসাব
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                                  🏪 ব্যবসা প্রতিষ্ঠান
                                </span>
                              )}

                              {isActive && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                                  <Check className="w-3 h-3" />
                                  বর্তমান খোলা
                                </span>
                              )}
                            </div>
                            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5 text-xs text-slate-500 mt-1">
                              <span className="font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                                {b.businessType || (isPersonal ? 'ব্যক্তিগত দৈনন্দিন হিসাব' : 'সাধারণ ব্যবসা')}
                              </span>
                              {b.proprietor && (
                                <span>{isPersonal ? `নাম: ${b.proprietor}` : `প্রো: ${b.proprietor}`}</span>
                              )}
                              {b.phone && <span>• {b.phone}</span>}
                            </div>
                            {b.address && (
                              <p className="text-xs text-slate-400 mt-1 truncate">
                                {b.address}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick Metrics */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <div className="text-right px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                              <TrendingDown className="w-3 h-3 text-rose-500" />
                              <span>{isPersonal ? 'ধার পাবো:' : 'বাকি:'}</span>
                            </div>
                            <span className="text-xs font-bold text-rose-600 font-mono">
                              {formatTaka(totalCustomerDue, b.enableBengaliDigits)}
                            </span>
                          </div>

                          <div className="text-right px-3 py-1 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                              <TrendingUp className="w-3 h-3 text-indigo-500" />
                              <span>{isPersonal ? 'দেনা দিতে হবে:' : 'দেনা:'}</span>
                            </div>
                            <span className="text-xs font-bold text-indigo-600 font-mono">
                              {formatTaka(totalSupplierPayable, b.enableBengaliDigits)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom action bar */}
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100">
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          {isPersonal ? (
                            <>
                              <User className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{store.customers.length} জন পরিচিত ব্যক্তি</span>
                              <span>•</span>
                              <span>{store.cashEntries.length} টি খরচ ও আয় রেকর্ড</span>
                            </>
                          ) : (
                            <>
                              <Package className="w-3.5 h-3.5 text-amber-500" />
                              <span>{totalStockCount} টি পণ্য</span>
                              <span>•</span>
                              <span>{store.customers.length} জন কাস্টমার</span>
                            </>
                          )}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditMode(b)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs transition cursor-pointer"
                            title="তথ্য পরিবর্তন করুন"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {businesses.length > 1 && (
                            <button
                              onClick={() => handleDelete(b)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs transition cursor-pointer"
                              title="অ্যাকাউন্ট মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {!isActive ? (
                            <button
                              onClick={() => {
                                onSwitchBusiness(b.id);
                                onClose();
                              }}
                              className={`flex items-center gap-1 px-3.5 py-1.5 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer ml-1 ${
                                isPersonal ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-900 hover:bg-slate-800'
                              }`}
                            >
                              <span>{isPersonal ? 'ব্যক্তিগত হিসাবে যান' : 'এই ব্যবসায় যান'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={onClose}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${
                                isPersonal ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              বর্তমানে সক্রিয়
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create or Edit Form */}
          {(viewMode === 'create' || viewMode === 'edit') && (
            <form
              onSubmit={viewMode === 'create' ? handleCreateSubmit : handleEditSubmit}
              className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
            >
              {/* Account Category Selector Toggle */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  অ্যাকাউন্টের ধরন বেছে নিন:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAccountCategory('business');
                      setBusinessType(COMMERCIAL_BUSINESS_TYPES[0]);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      accountCategory === 'business'
                        ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-300 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">ব্যবসা / দোকান</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        দোকানের বিক্রি, স্টক ও কাস্টমার বাকি খাতা
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccountCategory('personal');
                      setBusinessType(PERSONAL_ACCOUNT_TYPES[0]);
                    }}
                    className={`p-3 rounded-2xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                      accountCategory === 'personal'
                        ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-300 text-slate-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-slate-900">ব্যক্তিগত হিসাব</span>
                      <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                        দৈনন্দিন সংসার খরচ, বেতন ও ধার-দেনা
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  {accountCategory === 'personal' ? (
                    <>
                      <User className="w-3.5 h-3.5 text-indigo-600" />
                      <span>ব্যক্তিগত হিসাবের নাম</span>
                    </>
                  ) : (
                    <>
                      <Store className="w-3.5 h-3.5 text-amber-600" />
                      <span>ব্যবসার নাম</span>
                    </>
                  )}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    accountCategory === 'personal'
                      ? 'যেমন: আমার ব্যক্তিগত হিসাব / সংসার খরচ'
                      : 'যেমন: বিসমিল্লাহ জেনারেল স্টোর / আল-মদিনা ক্লথ'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-semibold text-slate-900"
                />
              </div>

              {/* Category / Type & Proprietor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-amber-600" />
                    <span>{accountCategory === 'personal' ? 'হিসাবের ক্যাটাগরি' : 'ব্যবসার ধরন'}</span>
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm bg-white font-medium"
                  >
                    {(accountCategory === 'personal' ? PERSONAL_ACCOUNT_TYPES : COMMERCIAL_BUSINESS_TYPES).map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {accountCategory === 'personal' ? 'আপনার নাম' : 'মালিক / স্বত্বাধিকারীর নাম'}
                  </label>
                  <input
                    type="text"
                    value={proprietor}
                    onChange={(e) => setProprietor(e.target.value)}
                    placeholder={accountCategory === 'personal' ? 'যেমন: মো: রিয়াদ' : 'যেমন: মো: আব্দুল করিম'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-amber-600" />
                    <span>মোবাইল নম্বর</span> <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600" />
                    <span>ঠিকানা</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={accountCategory === 'personal' ? 'বাসা/এলাকার নাম' : 'দোকান নং, বাজার বা রাস্তার নাম'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {accountCategory === 'personal' ? 'ব্যক্তিগত বিবরণ বা নোট (ঐচ্ছিক)' : 'স্লোগান বা মেমো ফুটার (ঐচ্ছিক)'}
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder={
                    accountCategory === 'personal'
                      ? 'যেমন: দৈনন্দিন আয়-ব্যয় ও ধার-দেনার নিরাপদ ডিজিটাল খাতা'
                      : 'যেমন: সততা ও নিষ্ঠাই আমাদের ব্যবসার মূলধন'
                  }
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                />
              </div>

              {/* Theme Color Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  থিম কালার পছন্দ করুন
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_THEMES.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setColorTheme(theme.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        colorTheme === theme.id
                          ? 'border-slate-800 bg-slate-900 text-white shadow-xs'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${theme.bgClass}`} />
                      <span>{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sample Data vs Empty for new business */}
              {viewMode === 'create' && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-800 block">
                    প্রাথমিক ডেটা অপশন:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setUseSampleData(false)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        !useSampleData
                          ? 'bg-white border-amber-500 ring-2 ring-amber-400/40 font-bold'
                          : 'border-slate-200 bg-white/50 text-slate-500'
                      }`}
                    >
                      <span className="font-bold block text-slate-900">
                        সম্পূর্ণ খালি খাতা (নতুন)
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        শূন্য থেকে শুরু হবে, কোনো পরীক্ষামূলক হিসাব থাকবে না
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setUseSampleData(true)}
                      className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                        useSampleData
                          ? 'bg-white border-amber-500 ring-2 ring-amber-400/40 font-bold'
                          : 'border-slate-200 bg-white/50 text-slate-500'
                      }`}
                    >
                      <span className="font-bold block text-slate-900">
                        স্যাম্পল ডেটা সহ শুরু করুন
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal">
                        {accountCategory === 'personal'
                          ? 'পরিচিতদের ধার-দেনা ও পারিবারিক খরচের ডেমো ডেটা থাকবে'
                          : 'কিছু পরীক্ষামূলক কাস্টমার, স্টক পণ্য ও লেনদেন থাকবে'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  ফিরে যান
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                >
                  {viewMode === 'create'
                    ? accountCategory === 'personal'
                      ? 'ব্যক্তিগত হিসাব তৈরি করুন'
                      : 'ব্যবসা প্রোফাইল তৈরি করুন'
                    : 'পরিবর্তন সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
