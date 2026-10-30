import { useState, useEffect } from 'react';
import { X, Store, User, Phone, MapPin, Tag, Cloud, Smartphone, Sparkles, Building2 } from 'lucide-react';
import { Business, AccountCategory } from '../types';
import { isPersonalAccount } from '../utils/formatters';
import { COMMERCIAL_BUSINESS_TYPES, PERSONAL_ACCOUNT_TYPES } from '../data/initialData';

interface ShopProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  business: Business;
  onSave: (updated: Business) => void;
  onOpenPWAInstall?: () => void;
  onOpenGoogleDriveBackup?: () => void;
}

const COLOR_THEMES: {
  id: 'emerald' | 'blue' | 'indigo' | 'amber' | 'rose' | 'teal' | 'purple';
  label: string;
  bgClass: string;
}[] = [
  { id: 'emerald', label: 'সবুজ', bgClass: 'bg-emerald-600' },
  { id: 'blue', label: 'নীল', bgClass: 'bg-blue-600' },
  { id: 'indigo', label: 'ইন্ডিগো', bgClass: 'bg-indigo-600' },
  { id: 'purple', label: 'বেগুনী', bgClass: 'bg-purple-600' },
  { id: 'rose', label: 'গোলাপি', bgClass: 'bg-rose-600' },
  { id: 'amber', label: 'হলুদ', bgClass: 'bg-amber-600' },
  { id: 'teal', label: 'টিয়াল', bgClass: 'bg-teal-600' },
];

export default function ShopProfileModal({
  isOpen,
  onClose,
  business,
  onSave,
  onOpenPWAInstall,
  onOpenGoogleDriveBackup,
}: ShopProfileModalProps) {
  const [formData, setFormData] = useState<Business>({ ...business });
  const isPersonal = formData.accountCategory === 'personal' || isPersonalAccount(formData);

  useEffect(() => {
    setFormData({ ...business });
  }, [business]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      updatedAt: new Date().toISOString(),
    });
    onClose();
  };

  const handleCategoryChange = (cat: AccountCategory) => {
    const defaultType = cat === 'personal' ? PERSONAL_ACCOUNT_TYPES[0] : COMMERCIAL_BUSINESS_TYPES[0];
    setFormData((prev) => ({
      ...prev,
      accountCategory: cat,
      businessType: defaultType,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 my-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            {isPersonal ? <User className="w-5 h-5 text-indigo-600" /> : <Store className="w-5 h-5 text-amber-600" />}
            <h2 className="text-lg font-bold text-slate-900">
              {isPersonal ? 'ব্যক্তিগত হিসাবের তথ্য ও সেটিংস' : 'ব্যবসার তথ্য ও সেটিংস'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Account Category Switcher Toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              অ্যাকাউন্টের ধরন:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleCategoryChange('business')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  !isPersonal
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-300 text-amber-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Store className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="block text-xs font-bold">দোকান / ব্যবসা</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleCategoryChange('personal')}
                className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 cursor-pointer ${
                  isPersonal
                    ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-300 text-indigo-950 font-bold'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <User className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="block text-xs font-bold">ব্যক্তিগত হিসাব</span>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              {isPersonal ? <User className="w-4 h-4 text-indigo-600" /> : <Store className="w-4 h-4 text-amber-600" />}
              <span>{isPersonal ? 'ব্যক্তিগত হিসাবের নাম' : 'ব্যবসার নাম'}</span> <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 font-semibold"
              placeholder={isPersonal ? 'যেমন: আমার ব্যক্তিগত হিসাব / সংসার খরচ' : 'যেমন: বিসমিল্লাহ জেনারেল স্টোর'}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-600" />
                <span>{isPersonal ? 'হিসাবের ধরন' : 'ব্যবসার ধরন'}</span>
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm bg-white"
              >
                {(isPersonal ? PERSONAL_ACCOUNT_TYPES : COMMERCIAL_BUSINESS_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <User className="w-4 h-4 text-amber-600" />
                <span>{isPersonal ? 'আপনার নাম' : 'স্বত্বাধিকারীর নাম'}</span>
              </label>
              <input
                type="text"
                value={formData.proprietor}
                onChange={(e) => setFormData({ ...formData, proprietor: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm"
                placeholder={isPersonal ? 'যেমন: মো: রিয়াদ' : 'যেমন: মো: আব্দুল করিম'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-emerald-600" />
                মোবাইল নম্বর <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm font-mono"
                placeholder="যেমন: 01712-345678"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                কারেন্সি প্রতীক
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
                placeholder="৳"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              দোকানের ঠিকানা
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
              placeholder="দোকান নং, বাজার বা রাস্তার নাম, এলাকা"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              স্লোগান বা মেমো ফুটার
            </label>
            <input
              type="text"
              value={formData.tagline || ''}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 text-sm"
              placeholder="যেমন: সততাই ব্যবসার মূলধন / আবার আসবেন"
            />
          </div>

          {/* Color theme */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              থিম কালার
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLOR_THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, colorTheme: theme.id })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    formData.colorTheme === theme.id
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

          {/* Bengali digits toggle */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-800">বাংলা সংখ্যা প্রদর্শন করুন</div>
              <div className="text-[11px] text-slate-500">টাকার অংক বাংলায় (যেমন: ৳ ১,২৫০) রূপান্তর করবে</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableBengaliDigits}
                onChange={(e) => setFormData({ ...formData, enableBengaliDigits: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Mobile App & Cloud Sync Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="text-xs font-bold text-slate-800">মোবাইল অ্যাপ ও ক্লাউড ডেটা</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {onOpenPWAInstall && (
                <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">মোবাইল অ্যাপ ইনস্টল</h4>
                      <p className="text-[10px] text-slate-500">হোম স্ক্রিনে অ্যাপ আইকন রাখুন</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPWAInstall();
                    }}
                    className="w-full py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    অ্যাপ হিসেবে ইনস্টল করুন
                  </button>
                </div>
              )}

              {onOpenGoogleDriveBackup && (
                <div className="p-3 bg-cyan-50/70 border border-cyan-200/80 rounded-2xl flex flex-col justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
                      <Cloud className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">গুগল ড্রাইভ ব্যাকআপ</h4>
                      <p className="text-[10px] text-slate-500">ক্লাউডে নিরাপদে সেভ রাখুন</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGoogleDriveBackup();
                    }}
                    className="w-full py-1.5 px-2.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-[11px] font-bold transition cursor-pointer"
                  >
                    ড্রাইভ সিঙ্ক খুলুন
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
