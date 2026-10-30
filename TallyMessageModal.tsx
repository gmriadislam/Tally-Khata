import React, { useState } from 'react';
import { X, MessageSquareShare, Send, Copy, Check, Users, Sparkles } from 'lucide-react';
import { Customer, ShopProfile, Business } from '../types';
import { getWhatsAppShareUrl } from '../utils/formatters';

interface TallyMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  shop: ShopProfile | Business;
}

const TEMPLATES = [
  {
    title: 'সাধারণ শুভেচ্ছা ও ধন্যবাদ',
    text: 'সম্মানিত গ্রাহক, আমাদের দোকানে কেনাকাটা করার জন্য আপনাকে আন্তরিক ধন্যবাদ। সর্বদা আপনার সেবায় নিয়োজিত। - {SHOP_NAME}',
  },
  {
    title: 'হালখাতা ও হিসাব আপডেট',
    text: 'সম্মানিত গ্রাহক, আমাদের দোকানের নতুন বছরের শুভ হালখাতা অনুষ্ঠিত হতে যাচ্ছে। আপনার হিসাব সমন্বয় করে মিষ্টান্ন গ্রহণ করতে সাদর আমন্ত্রণ। - {SHOP_NAME}',
  },
  {
    title: 'নতুন পণ্যের স্টক আগমন',
    text: 'সম্মানিত গ্রাহক, আমাদের দোকানে নতুন ও টাটকা পণ্যের সমাহার এসেছে। সাশ্রয়ী মূল্যে সেরা পণ্য পেতে আজই যোগাযোগ করুন। - {SHOP_NAME}',
  },
  {
    title: 'জরুরি নোটিশ',
    text: 'সম্মানিত গ্রাহক, বিশেষ কারণে আগামী পরশু আমাদের দোকান সাময়িক বন্ধ থাকবে। প্রয়োজনীয় কেনাকাটা আগেই সম্পন্ন করার অনুরোধ রইল। - {SHOP_NAME}',
  },
];

export default function TallyMessageModal({
  isOpen,
  onClose,
  customers,
  shop,
}: TallyMessageModalProps) {
  const shopName = 'name' in shop ? shop.name : shop.shopName;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    customers[0]?.id || ''
  );
  const [customPhone, setCustomPhone] = useState(customers[0]?.phone || '');
  const [messageText, setMessageText] = useState(
    TEMPLATES[0].text.replace('{SHOP_NAME}', shopName)
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const found = customers.find((c) => c.id === id);
    if (found) {
      setCustomPhone(found.phone);
    }
  };

  const handleApplyTemplate = (tmpl: string) => {
    setMessageText(tmpl.replace('{SHOP_NAME}', shopName));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const url = getWhatsAppShareUrl(customPhone, messageText);
    window.open(url, '_blank');
  };

  const handleSendSMS = () => {
    const encoded = encodeURIComponent(messageText);
    window.location.href = `sms:${customPhone}?body=${encoded}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-rose-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageSquareShare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">টালি-মেসেজ (মেসেজ পাঠান)</h2>
              <p className="text-xs text-red-100">কাস্টমারকে শুভেচ্ছা, অফার বা নোটিশ এসএমএস পাঠান</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {/* Customer select */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              প্রাপক কাস্টমার নির্বাচন:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={selectedCustomerId}
                onChange={(e) => handleSelectCustomer(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="মোবাইল নম্বর"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Quick Templates */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>তৈরি মেসেজ টেমপ্লেট:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyTemplate(tmpl.text)}
                  className="p-2 text-left bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 transition cursor-pointer line-clamp-2"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মেসেজের বিবরণ:
            </label>
            <textarea
              rows={4}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="মেসেজ লিখুন..."
            />
            <div className="flex justify-between items-center text-xs text-slate-400 mt-1">
              <span>{messageText.length} অক্ষর</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs text-slate-600 hover:text-red-600 flex items-center gap-1 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'কপি হয়েছে' : 'কপি করুন'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            type="button"
            onClick={handleSendSMS}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            সাধারণ SMS
          </button>
          <button
            type="button"
            onClick={handleSendWhatsApp}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            হোয়াটসঅ্যাপে পাঠান
          </button>
        </div>
      </div>
    </div>
  );
}
