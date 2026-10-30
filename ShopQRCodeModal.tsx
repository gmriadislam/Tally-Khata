import React, { useState } from 'react';
import { X, QrCode, Download, Printer, Copy, Check, Smartphone, Share2 } from 'lucide-react';
import { ShopProfile, Business } from '../types';

interface ShopQRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: ShopProfile | Business;
}

export default function ShopQRCodeModal({ isOpen, onClose, shop }: ShopQRCodeModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [paymentNumber, setPaymentNumber] = useState(shop.phone || '01700000000');
  const [paymentProvider, setPaymentProvider] = useState<'all' | 'bkash' | 'nagad' | 'rocket'>('all');

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const shopName = 'name' in shop ? shop.name : shop.shopName;

  // QR SVG Data or QR Image generator url
  // Using an encoded SVG QR pattern or standard QR image API
  const qrData = `BD-PAY:${paymentProvider}:${paymentNumber}:${encodeURIComponent(shopName)}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrData
  )}&color=000000&bgcolor=FFFFFF&margin=1`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">দোকানের পেমেন্ট QR কোড</h2>
              <p className="text-xs text-rose-100">কাস্টমারকে স্ক্যান করিয়ে ডিজিটাল পেমেন্ট নিন</p>
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
        <div className="p-5 flex-1 overflow-y-auto flex flex-col items-center">
          {/* QR Stand Card */}
          <div
            id="qr-stand-card"
            className="w-full max-w-xs bg-gradient-to-b from-amber-50 via-white to-amber-50 border-2 border-amber-300 rounded-3xl p-5 shadow-lg flex flex-col items-center text-center relative"
          >
            {/* Top Badge */}
            <div className="bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 shadow-xs">
              ডিজিটাল পেমেন্ট কিউআর
            </div>

            <h3 className="text-lg font-extrabold text-slate-900 mt-1">{shopName}</h3>
            <p className="text-xs text-slate-500 font-medium">প্রোঃ {shop.proprietor || 'দোকানদার'}</p>

            {/* QR Box */}
            <div className="w-48 h-48 bg-white p-3 rounded-2xl border-2 border-slate-800 shadow-inner my-4 flex items-center justify-center relative">
              <img
                src={qrImageUrl}
                alt="Shop Payment QR Code"
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback vector icon if network blocked
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-0">
                <QrCode className="w-32 h-32 text-slate-800" />
              </div>
            </div>

            {/* Supported Wallets */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="px-2 py-0.5 rounded bg-pink-100 text-pink-700 text-[11px] font-bold">
                বিকাশ
              </span>
              <span className="px-2 py-0.5 rounded bg-orange-100 text-orange-700 text-[11px] font-bold">
                নগদ
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[11px] font-bold">
                রকেট
              </span>
            </div>

            <p className="text-xs text-slate-600">
              পেমেন্ট নাম্বার:{' '}
              <span className="font-bold text-slate-900">{paymentNumber}</span>
            </p>
          </div>

          {/* Quick Number Edit & Copy */}
          <div className="w-full mt-4 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              পেমেন্ট রিসিভ নাম্বার পরিবর্তন:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={paymentNumber}
                onChange={(e) => setPaymentNumber(e.target.value)}
                placeholder="017xxxxxxxx"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(paymentNumber, 'phone')}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
              >
                {copiedType === 'phone' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>কপি!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>কপি</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            প্রিন্ট করুন
          </button>
          <a
            href={qrImageUrl}
            download={`QR-${shopName}.png`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            ডাউনলোড
          </a>
        </div>
      </div>
    </div>
  );
}
