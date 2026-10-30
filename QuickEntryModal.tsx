import { useState } from 'react';
import { X, Users, Truck, Wallet, Plus, Minus } from 'lucide-react';
import { Customer, Supplier, ShopProfile, Business } from '../types';

interface QuickEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  suppliers: Supplier[];
  shop: ShopProfile | Business;
  onCustomerTx: (customerId: string, type: 'gave' | 'received', amount: number, note: string) => void;
  onSupplierTx: (supplierId: string, type: 'gave' | 'received', amount: number, note: string) => void;
  onCashTx: (type: 'in' | 'out', amount: number, category: string, note: string) => void;
}

export default function QuickEntryModal({
  isOpen,
  onClose,
  customers,
  suppliers,
  onCustomerTx,
  onSupplierTx,
  onCashTx,
}: QuickEntryModalProps) {
  const [targetType, setTargetType] = useState<'customer' | 'supplier' | 'cash'>('customer');

  // Customer or Supplier Selected
  const [selectedPartyId, setSelectedPartyId] = useState(customers[0]?.id || '');
  const [direction, setDirection] = useState<'gave' | 'received'>('gave');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  // Cashbook Specific
  const [cashType, setCashType] = useState<'in' | 'out'>('in');
  const [cashCategory, setCashCategory] = useState('নগদ বিক্রি');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) return;

    if (targetType === 'customer') {
      if (!selectedPartyId) return;
      onCustomerTx(selectedPartyId, direction, val, note.trim());
    } else if (targetType === 'supplier') {
      if (!selectedPartyId) return;
      onSupplierTx(selectedPartyId, direction, val, note.trim());
    } else if (targetType === 'cash') {
      onCashTx(cashType, val, cashCategory, note.trim());
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <h3 className="font-bold text-sm">দ্রুত হিসাব এন্ট্রি</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setTargetType('customer');
                setSelectedPartyId(customers[0]?.id || '');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                targetType === 'customer'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>কাস্টমার</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setTargetType('supplier');
                setSelectedPartyId(suppliers[0]?.id || '');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                targetType === 'supplier'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              <span>সাপ্লায়ার</span>
            </button>

            <button
              type="button"
              onClick={() => setTargetType('cash')}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                targetType === 'cash'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-amber-600" />
              <span>ক্যাশবক্স</span>
            </button>
          </div>

          {/* Party Dropdown */}
          {targetType === 'customer' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                কাস্টমার নির্বাচন করুন
              </label>
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.totalDue > 0 ? `(বাকি: ৳${c.totalDue})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {targetType === 'supplier' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                সাপ্লায়ার নির্বাচন করুন
              </label>
              <select
                value={selectedPartyId}
                onChange={(e) => setSelectedPartyId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.companyName ? `(${s.companyName})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Direction toggle */}
          {targetType === 'customer' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('received')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                  direction === 'received'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50/50 text-emerald-700 border-emerald-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>টাকা পেলাম (জমা)</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('gave')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                  direction === 'gave'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50/50 text-rose-700 border-rose-200'
                }`}
              >
                <Minus className="w-4 h-4" />
                <span>মাল বাকি দিলাম</span>
              </button>
            </div>
          )}

          {targetType === 'supplier' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('gave')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                  direction === 'gave'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50/50 text-emerald-700 border-emerald-200'
                }`}
              >
                <Minus className="w-4 h-4" />
                <span>টাকা পরিশোধ করলাম</span>
              </button>

              <button
                type="button"
                onClick={() => setDirection('received')}
                className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                  direction === 'received'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-indigo-50/50 text-indigo-700 border-indigo-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>মাল নিলাম (চালান)</span>
              </button>
            </div>
          )}

          {targetType === 'cash' && (
            <div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setCashType('in');
                    setCashCategory('নগদ বিক্রি');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                    cashType === 'in'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50/50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>ক্যাশ ইন (জমা)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCashType('out');
                    setCashCategory('চা ও নাস্তা');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition ${
                    cashType === 'out'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-rose-50/50 text-rose-700 border-rose-200'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span>ক্যাশ আউট (খরচ)</span>
                </button>
              </div>

              <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
              <select
                value={cashCategory}
                onChange={(e) => setCashCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm bg-white font-medium"
              >
                {cashType === 'in' ? (
                  <>
                    <option value="নগদ বিক্রি">নগদ বিক্রি</option>
                    <option value="কাস্টমার বাকি আদায়">কাস্টমার বাকি আদায়</option>
                    <option value="অন্যান্য আয়">অন্যান্য আয়</option>
                  </>
                ) : (
                  <>
                    <option value="চা ও নাস্তা">চা ও নাস্তা</option>
                    <option value="দোকান ভাড়া">দোকান ভাড়া</option>
                    <option value="বিদ্যুৎ বিল">বিদ্যুৎ বিল</option>
                    <option value="পরিবহন খরচ">পরিবহন খরচ</option>
                    <option value="কর্মচারীর বেতন">কর্মচারীর বেতন</option>
                    <option value="অন্যান্য খরচ">অন্যান্য খরচ</option>
                  </>
                )}
              </select>
            </div>
          )}

          {/* Amount input */}
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

          {/* Note input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">নোট / বিবরণ</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="সংক্ষিপ্ত বিবরণ লিখুন..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs"
            >
              এন্ট্রি সেভ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
