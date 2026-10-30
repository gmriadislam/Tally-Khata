import { useState } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Minus,
  Trash2,
  X,
  Calendar,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { CashEntry, ShopProfile, Business } from '../types';
import { formatTaka, formatBengaliDate, getRelativeBengaliDate, isPersonalAccount } from '../utils/formatters';

interface CashBookProps {
  cashEntries: CashEntry[];
  shop: ShopProfile | Business;
  onAddCashEntry: (entry: Omit<CashEntry, 'id'>) => void;
  onDeleteCashEntry: (id: string) => void;
  onGoBack?: () => void;
}

const BUSINESS_CASH_IN_CATEGORIES = [
  'নগদ বিক্রি',
  'কাস্টমার বাকি আদায়',
  'ব্যাংক থেকে উত্তোলন',
  'অন্যান্য আয়',
];

const BUSINESS_CASH_OUT_CATEGORIES = [
  'দোকানের মাল ক্রয়',
  'দোকান ভাড়া',
  'বিদ্যুৎ বিল',
  'কর্মচারীর বেতন',
  'চা ও নাস্তা',
  'পরিবহন খরচ',
  'ব্যক্তিগত খরচ',
  'মহাজন দেনা পরিশোধ',
  'অন্যান্য খরচ',
];

const PERSONAL_CASH_IN_CATEGORIES = [
  'মাসিক বেতন (Salary)',
  'টিউশনি ও পার্ট-টাইম আয়',
  'ধার বা ঋণ ফেরত পাওয়া',
  'উপহার ও বোনাস',
  'ব্যাংক থেকে উত্তোলন',
  'পারিবারিক আয়',
  'অন্যান্য আয়',
];

const PERSONAL_CASH_OUT_CATEGORIES = [
  'বাজার ও মুদি খরচ',
  'বাসা ভাড়া',
  'বিদ্যুৎ, পানি ও গ্যাস বিল',
  'চিকিৎসা ও ওষুধ',
  'যাতায়াত ও গাড়িভাড়া',
  'নাস্তা ও রেস্তোরাঁ',
  'সন্তানের লেখাপড়া ও টিউশন',
  'ধার বা কিস্তি পরিশোধ',
  'মোবাইল রিচার্জ ও ইন্টারনেট',
  'অন্যান্য ব্যক্তিগত খরচ',
];

export default function CashBook({
  cashEntries,
  shop,
  onAddCashEntry,
  onDeleteCashEntry,
  onGoBack,
}: CashBookProps) {
  const isPersonal = isPersonalAccount(shop);
  const inCategories = isPersonal ? PERSONAL_CASH_IN_CATEGORIES : BUSINESS_CASH_IN_CATEGORIES;
  const outCategories = isPersonal ? PERSONAL_CASH_OUT_CATEGORIES : BUSINESS_CASH_OUT_CATEGORIES;

  const [timeFilter, setTimeFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>('today');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<'in' | 'out'>('in');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(inCategories[0]);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Filter calculation
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  const filteredEntries = cashEntries
    .filter((entry) => {
      const entryTime = new Date(entry.date).getTime();
      if (timeFilter === 'today') return entryTime >= todayStart;
      if (timeFilter === 'yesterday') return entryTime >= yesterdayStart && entryTime < todayStart;
      if (timeFilter === 'week') return entryTime >= weekStart;
      if (timeFilter === 'month') return entryTime >= monthStart;
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const periodIn = filteredEntries
    .filter((e) => e.type === 'in')
    .reduce((acc, e) => acc + e.amount, 0);

  const periodOut = filteredEntries
    .filter((e) => e.type === 'out')
    .reduce((acc, e) => acc + e.amount, 0);

  const periodBalance = periodIn - periodOut;

  const handleOpenAdd = (type: 'in' | 'out') => {
    setEntryType(type);
    setCategory(type === 'in' ? inCategories[0] : outCategories[0]);
    setAmount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    onAddCashEntry({
      type: entryType,
      amount: val,
      category: category.trim(),
      note: note.trim(),
      date: new Date(date).toISOString(),
    });

    setIsModalOpen(false);
    setAmount('');
    setNote('');
  };

  const shopName = 'name' in shop ? shop.name : (shop as any).shopName || (isPersonal ? 'ব্যক্তিগত খতিয়ান' : 'বিসমিল্লাহ জেনারেল স্টোর');

  return (
    <div className="w-full min-h-screen bg-[#faf8f3] text-slate-900 flex flex-col font-sans select-none pb-28">
      {/* TOP GOLDEN HEADER */}
      <header className="bg-gradient-to-b from-[#d5b87e] via-[#c9a96b] to-[#c29f5d] px-4 pt-3 pb-7 shadow-xs">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onGoBack && (
              <button
                onClick={onGoBack}
                className="p-1.5 -ml-1 text-[#3a2707] hover:text-black hover:bg-black/10 active:scale-95 rounded-xl transition cursor-pointer"
                title="হোমে ফিরে যান"
                aria-label="হোমে ফিরে যান"
              >
                <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
            )}
            <div className="px-3.5 py-1.5 bg-white text-slate-800 rounded-full font-bold text-sm shadow-xs flex items-center gap-1.5 border border-amber-100">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="truncate max-w-[150px] sm:max-w-xs">{shopName}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                {isPersonal ? 'দৈনিক ক্যাশ' : 'ক্যাশবাক্স'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTAINER WITH ROUNDED TOP CORNERS */}
      <div className="flex-1 -mt-4 bg-[#faf8f3] rounded-t-[28px] shadow-sm max-w-xl mx-auto w-full px-3 pt-3 flex flex-col space-y-4">
        {/* Overview Cards for Cash */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-2xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট ক্যাশ জমা (ইন)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1.5 font-mono tabular-nums tracking-tight">
            {formatTaka(periodIn, shop.enableBengaliDigits)}
          </p>
          <span className="text-[11px] text-slate-400">
            {timeFilter === 'today' ? 'আজকের জমা' : 'নির্বাচিত সময়ের জমা'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 hover:border-amber-300 shadow-2xs transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">মোট ক্যাশ খরচ (আউট)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-1.5 font-mono tabular-nums tracking-tight">
            {formatTaka(periodOut, shop.enableBengaliDigits)}
          </p>
          <span className="text-[11px] text-slate-400">
            {timeFilter === 'today' ? 'আজকের খরচ' : 'নির্বাচিত সময়ের খরচ'}
          </span>
        </div>

        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">নিট ক্যাশ স্থিতি</span>
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p
            className={`text-xl sm:text-2xl font-bold mt-1.5 font-mono tabular-nums tracking-tight ${
              periodBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {formatTaka(periodBalance, shop.enableBengaliDigits)}
          </p>
          <span className="text-[11px] text-slate-400">হাতে জমা নিট ব্যালেন্স</span>
        </div>
      </div>

      {/* Control Bar & Action Buttons */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Time filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          {[
            { id: 'today', label: 'আজ' },
            { id: 'yesterday', label: 'গতকাল' },
            { id: 'week', label: 'গত ৭ দিন' },
            { id: 'month', label: 'এই মাস' },
            { id: 'all', label: 'সব হিসাব' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTimeFilter(item.id as typeof timeFilter)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                timeFilter === item.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Action Buttons: Cash In & Cash Out */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('in')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ক্যাশ ইন (জমা)</span>
          </button>

          <button
            onClick={() => handleOpenAdd('out')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Minus className="w-4 h-4" />
            <span>- ক্যাশ আউট (খরচ)</span>
          </button>
        </div>
      </div>

      {/* Cash Entries List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>ক্যাশ লেনদেন তালিকা ({filteredEntries.length} টি)</span>
          </h3>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredEntries.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">এই সময়ে কোনো ক্যাশ এন্ট্রি নেই</p>
              <p className="text-xs text-slate-400 mt-1">
                উপরে &quot;+ ক্যাশ ইন&quot; বা &quot;- ক্যাশ আউট&quot; দিয়ে হিসাব লিখুন।
              </p>
            </div>
          ) : (
            filteredEntries.map((entry) => {
              const isIn = entry.type === 'in';
              return (
                <div
                  key={entry.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50/70 transition"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isIn
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {isIn ? '↓' : '↑'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{entry.category}</span>
                        <span className="text-[11px] text-slate-400">
                          {getRelativeBengaliDate(entry.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {entry.note || (isIn ? 'নগদ জমা' : 'দোকান খরচ')}
                        {entry.relatedPartyName && (
                          <span className="ml-1 text-slate-400">({entry.relatedPartyName})</span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span
                        className={`text-base font-bold font-mono ${
                          isIn ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isIn ? '+' : '-'}
                        {formatTaka(entry.amount, shop.enableBengaliDigits)}
                      </span>
                      <span className="text-[10px] block text-slate-400">
                        {isIn ? 'ক্যাশ জমা' : 'ক্যাশ খরচ'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm('আপনি কি এই ক্যাশ এন্ট্রিটি মুছতে চান?')) {
                          onDeleteCashEntry(entry.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Cash Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div
              className={`flex items-center justify-between px-5 py-3.5 text-white ${
                entryType === 'in' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <h3 className="font-bold text-sm">
                {entryType === 'in' ? '+ নতুন ক্যাশ ইন (জমা)' : '- নতুন ক্যাশ আউট (খরচ)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEntry} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  টাকার পরিমাণ (৳) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                    ৳
                  </span>
                  <input
                    type="number"
                    autoFocus
                    required
                    step="any"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 pr-4 py-2.5 text-xl font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white font-medium"
                >
                  {(entryType === 'in' ? inCategories : outCategories).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  বিবরণ / নোট (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={
                    entryType === 'in' ? 'যেমন: সকালের ক্যাশ বিক্রি' : 'যেমন: দোকানের বিদ্যুৎ বিল পরিশোধ'
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  তারিখ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition ${
                    entryType === 'in'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
