import React from 'react';
import { X, Headphones, Phone, MessageSquare, BookOpen, ShieldCheck, HelpCircle } from 'lucide-react';
import { ShopProfile, Business } from '../types';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopProfile | Business;
}

export default function SupportModal({ isOpen, onClose, shop }: SupportModalProps) {
  if (!isOpen) return null;

  const handleCall = () => {
    window.location.href = 'tel:+8801700000000';
  };

  const shopName = 'name' in shop ? shop.name : shop.shopName;

  const handleWhatsApp = () => {
    const text = encodeURIComponent(
      `আসসালামু আলাইকুম, আমি ${shopName} এর পক্ষ থেকে ট্যালি খাতা অ্যাপ সংক্রান্ত বিষয়ে সহায়তা চাই।`
    );
    window.open(`https://wa.me/8801700000000?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">কাস্টমার সাপোর্ট ও হেল্প</h2>
              <p className="text-xs text-amber-100">ট্যালি খাতা ব্যবহারে যেকোনো সহযোগিতায় আমরা আছি</p>
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
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Direct contact cards */}
          <div className="space-y-2.5">
            <button
              onClick={handleWhatsApp}
              className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl flex items-center gap-3.5 text-left transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-950">হোয়াটসঅ্যাপে সরাসরি সাহায্য</p>
                <p className="text-xs text-emerald-700 mt-0.5">তাৎক্ষণিক সমাধান পেতে চ্যাট করুন</p>
              </div>
            </button>

            <button
              onClick={handleCall}
              className="w-full p-3.5 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-2xl flex items-center gap-3.5 text-left transition cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-blue-950">হটলাইন হেল্পলাইন (সকাল ৯টা - রাত ১০টা)</p>
                <p className="text-xs text-blue-700 mt-0.5">কল করুন: 01700-000000</p>
              </div>
            </button>
          </div>

          {/* Quick FAQ / Guide */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              সাধারণ জিজ্ঞাসা (FAQ)
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">১. ডেটা কি আমার মোবাইলে নিরাপদ?</p>
                <p className="text-slate-600 mt-1">
                  হ্যাঁ, আপনার সমস্ত হিসাব আপনার ফোনে সম্পূর্ণ এনক্রিপ্টেড থাকে এবং গুগল ড্রাইভে স্বয়ংক্রিয় ব্যাকআপ রাখা যায়।
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-800">২. অফলাইনে কি অ্যাপ ব্যবহার করা যাবে?</p>
                <p className="text-slate-600 mt-1">
                  হ্যাঁ! ইন্টারনেট সংযোগ ছাড়াও সব ধরনের বাকি-জমা, ক্যাশ ও স্টক হিসাব সম্পূর্ণ অফলাইনে ব্যবহার করা যায়।
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-xs transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
