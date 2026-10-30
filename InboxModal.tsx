import React from 'react';
import { X, Inbox, Bell, CheckCircle2, Cloud, Sparkles, Clock } from 'lucide-react';
import { formatBengaliDate } from '../utils/formatters';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
}

export default function InboxModal({ isOpen, onClose, shopName }: InboxModalProps) {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'গোল্ড ট্রায়াল সক্রিয় হয়েছে',
      desc: 'আপনার দোকানের জন্য প্রিমিয়াম গোল্ড সুবিধা বর্তমানে ফ্রি ট্রায়ালে চালু আছে।',
      time: 'আজ সকালে',
      icon: <Sparkles className="w-4 h-4 text-amber-600" />,
      bg: 'bg-amber-50 border-amber-200',
    },
    {
      id: 'notif-2',
      title: 'গুগল ড্রাইভ ক্লাউড ব্যাকআপ রেডি',
      desc: 'আপনার সব দোকানের খাতা ও লেনদেনের নিরাপদ ব্যাকআপ ড্রাইভে সেভ করে রাখুন।',
      time: 'গতকাল',
      icon: <Cloud className="w-4 h-4 text-emerald-600" />,
      bg: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'notif-3',
      title: 'ট্যালি খাতা সিস্টেমে স্বাগতম',
      desc: `${shopName} সফলভাবে কনফিগার হয়েছে। হিসাব রাখা শুরু করতে কাস্টমার যোগ করুন।`,
      time: '২ দিন আগে',
      icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
      bg: 'bg-blue-50 border-blue-200',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Inbox className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ইনবক্স ও নোটিফিকেশন</h2>
              <p className="text-xs text-slate-300">গুরুত্বপূর্ণ আপডেট ও নোটিশ</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {notifications.map((n) => (
            <div key={n.id} className={`p-3.5 rounded-xl border ${n.bg} transition`}>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-white shadow-xs shrink-0 mt-0.5">{n.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {n.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.desc}</p>
                </div>
              </div>
            </div>
          ))}
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
