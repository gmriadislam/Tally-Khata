import React, { useState } from 'react';
import { X, UserPlus, Phone, MapPin, Building2, User, Wallet } from 'lucide-react';
import { Customer, Supplier } from '../types';

interface AddPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: 'customer' | 'supplier';
  onAddCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export default function AddPartyModal({
  isOpen,
  onClose,
  defaultType = 'customer',
  onAddCustomer,
  onAddSupplier,
}: AddPartyModalProps) {
  const [partyType, setPartyType] = useState<'customer' | 'supplier'>(defaultType);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [openingBalance, setOpeningBalance] = useState('');
  const [balanceDirection, setBalanceDirection] = useState<'due' | 'advance'>('due');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const rawBal = parseFloat(openingBalance) || 0;

    if (partyType === 'customer') {
      const finalDue = balanceDirection === 'due' ? rawBal : -rawBal;
      onAddCustomer({
        name: name.trim(),
        phone: phone.trim() || '01700000000',
        address: address.trim(),
        totalDue: finalDue,
      });
    } else {
      onAddSupplier({
        name: name.trim(),
        phone: phone.trim() || '01700000000',
        companyName: companyName.trim(),
        address: address.trim(),
        totalPayable: rawBal,
      });
    }

    onClose();
    // Reset form
    setName('');
    setPhone('');
    setAddress('');
    setCompanyName('');
    setOpeningBalance('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#991b1b] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">নতুন কাস্টমার / সাপ্লায়ার যোগ</h2>
              <p className="text-xs text-red-100">হিসাব খাতায় নতুন পরিচিতি যুক্ত করুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="p-3 bg-red-50/50 border-b border-red-100 flex gap-2">
          <button
            type="button"
            onClick={() => setPartyType('customer')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              partyType === 'customer'
                ? 'bg-[#991b1b] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            কাস্টমার (খদ্দের)
          </button>
          <button
            type="button"
            onClick={() => setPartyType('supplier')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
              partyType === 'supplier'
                ? 'bg-[#991b1b] text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            সাপ্লায়ার (মহাজন)
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {partyType === 'customer' ? 'কাস্টমারের নাম *' : 'সাপ্লায়ার / ডিলারের নাম *'}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={partyType === 'customer' ? 'যেমন: মোহাম্মদ রহিম' : 'যেমন: মেসার্স আলম ট্রেডার্স'}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              মোবাইল নম্বর
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017xxxxxxxx"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {partyType === 'supplier' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                প্রতিষ্ঠান বা কোম্পানির নাম
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="যেমন: স্কয়ার ফুড অ্যান্ড বেভারেজ"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ঠিকানা / এলাকা
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="যেমন: চকবাজার, ঢাকা"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          <div className="pt-1 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-red-600" />
              {partyType === 'customer'
                ? 'পূর্বের বাকি বা অগ্রিম টাকা (যদি থাকে)'
                : 'পূর্বের বকেয়া দেনা টাকা (যদি থাকে)'}
            </label>

            {partyType === 'customer' && (
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setBalanceDirection('due')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    balanceDirection === 'due'
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  কাস্টমারের কাছে বাকি পাওনা
                </button>
                <button
                  type="button"
                  onClick={() => setBalanceDirection('advance')}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    balanceDirection === 'advance'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  কাস্টমারের অগ্রিম জমা
                </button>
              </div>
            )}

            <div className="relative">
              <span className="text-slate-400 text-sm font-bold absolute left-3 top-1/2 -translate-y-1/2">
                ৳
              </span>
              <input
                type="number"
                min="0"
                step="any"
                value={openingBalance}
                onChange={(e) => setOpeningBalance(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-sm transition cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-[#991b1b] hover:bg-[#831818] text-white font-bold rounded-2xl text-sm shadow-md transition cursor-pointer"
            >
              সংরক্ষণ করুন
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
