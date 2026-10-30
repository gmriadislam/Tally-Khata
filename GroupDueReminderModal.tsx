import React, { useState, useEffect } from 'react';
import { X, BellRing, Phone, Send, MessageSquare, Check, Search, AlertCircle } from 'lucide-react';
import { Customer, ShopProfile, Business } from '../types';
import { formatTaka, toBengaliNumber, generateReminderText, getWhatsAppShareUrl } from '../utils/formatters';

interface GroupDueReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  shop: ShopProfile | Business;
}

export default function GroupDueReminderModal({
  isOpen,
  onClose,
  customers,
  shop,
}: GroupDueReminderModalProps) {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const shopName = 'name' in shop ? shop.name : shop.shopName;

  // Customers with positive due (কাস্টমারের কাছে টাকা পাওনা)
  const dueCustomers = customers.filter((c) => c.totalDue > 0);
  const totalDueAmount = dueCustomers.reduce((acc, c) => acc + c.totalDue, 0);

  const filtered = dueCustomers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  const handleCopy = (customer: Customer) => {
    const text = generateReminderText(
      shopName,
      customer.name,
      customer.totalDue,
      shop.phone
    );
    navigator.clipboard.writeText(text);
    setCopiedId(customer.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendWhatsApp = (customer: Customer) => {
    const text = generateReminderText(
      shopName,
      customer.name,
      customer.totalDue,
      shop.phone
    );
    const url = getWhatsAppShareUrl(customer.phone, text);
    window.open(url, '_blank');
  };

  const handleSendSMS = (customer: Customer) => {
    const text = encodeURIComponent(
      generateReminderText(shopName, customer.name, customer.totalDue, shop.phone)
    );
    window.location.href = `sms:${customer.phone}?body=${text}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">গ্রুপ তাগাদা (বাকি পাওনা রিমাইন্ডার)</h2>
              <p className="text-xs text-emerald-100">কাস্টমারদের এসএমএস বা হোয়াটসঅ্যাপে তাগাদা পাঠান</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Banner */}
        <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-emerald-800 font-medium">মোট বাকি পাওনা কাস্টমার</p>
            <p className="text-xl font-bold text-emerald-950 mt-0.5">
              {toBengaliNumber(dueCustomers.length)} জন
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-emerald-800 font-medium">মোট বকেয়া পাওনা</p>
            <p className="text-xl font-bold text-red-600 mt-0.5">
              {formatTaka(totalDueAmount)}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="কাস্টমারের নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Customer Due List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <AlertCircle className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-base font-medium text-slate-700">কোনো বকেয়া কাস্টমার পাওয়া যায়নি</p>
              <p className="text-xs text-slate-400 mt-1">সব কাস্টমারের হিসাব পরিশোধ রয়েছে</p>
            </div>
          ) : (
            filtered.map((cust) => (
              <div
                key={cust.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-emerald-300 shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{cust.name}</span>
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                      বাকি: {formatTaka(cust.totalDue)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {cust.phone}
                    </span>
                    {cust.address && <span>• {cust.address}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopy(cust)}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
                    title="মেসেজ কপি করুন"
                  >
                    {copiedId === cust.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>কপি</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleSendWhatsApp(cust)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium flex items-center gap-1 transition shadow-xs cursor-pointer"
                    title="WhatsApp এ তাগাদা পাঠান"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>হোয়াটসঅ্যাপ</span>
                  </button>

                  <button
                    onClick={() => handleSendSMS(cust)}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium flex items-center gap-1 transition shadow-xs cursor-pointer"
                    title="সরাসরি SMS পাঠান"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>SMS</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>মোট {toBengaliNumber(filtered.length)} জন প্রদর্শিত</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
