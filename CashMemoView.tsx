import { X, Printer } from 'lucide-react';
import { Bill, ShopProfile, Business } from '../types';
import { formatTaka, formatBengaliDate } from '../utils/formatters';

interface CashMemoViewProps {
  bill: Bill;
  shop: ShopProfile | Business;
  onClose: () => void;
}

export default function CashMemoView({ bill, shop, onClose }: CashMemoViewProps) {
  const shopDisplayName = (shop as any).shopName || (shop as any).name || 'ব্যবসা প্রতিষ্ঠান';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 border border-slate-200">
        {/* Top Control Bar (Non-printable) */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">ক্যাশ মেমো / বিক্রয় রসিদ</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              #{bill.billNumber}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট করুন</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-900 font-sans">
          {/* Shop Header */}
          <div className="text-center pb-4 border-b-2 border-dashed border-slate-300">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{shopDisplayName}</h1>
            {shop.proprietor && (
              <p className="text-xs text-slate-600 mt-0.5 font-medium">প্রো: {shop.proprietor}</p>
            )}
            <p className="text-xs text-slate-600 mt-0.5">{shop.address}</p>
            <p className="text-xs font-semibold text-slate-800 mt-0.5 font-mono">মোবাইল: {shop.phone}</p>
            <div className="inline-block mt-2 px-3 py-0.5 bg-slate-100 rounded text-xs font-bold uppercase tracking-wider text-slate-800 border border-slate-300">
              ক্যাশ মেমো / বিক্রয় রশিদ
            </div>
          </div>

          {/* Bill Meta */}
          <div className="flex justify-between items-start text-xs py-3 border-b border-slate-200">
            <div>
              <p className="font-semibold text-slate-800">
                ক্রেতার নাম: <span className="font-bold text-slate-950 text-sm">{bill.customerName}</span>
              </p>
              {bill.customerPhone && (
                <p className="text-slate-600 mt-0.5">মোবাইল: {bill.customerPhone}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-slate-600">
                মেমো নং: <span className="font-bold font-mono text-slate-900">{bill.billNumber}</span>
              </p>
              <p className="text-slate-600 mt-0.5">
                তারিখ: <span className="text-slate-900 font-medium">{formatBengaliDate(bill.date)}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-4">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-800 font-bold uppercase">
                  <th className="py-2 w-8">নং</th>
                  <th className="py-2">বিবরণ / পণ্যের নাম</th>
                  <th className="py-2 text-center w-16">পরিমাণ</th>
                  <th className="py-2 text-right w-20">দর (৳)</th>
                  <th className="py-2 text-right w-24">মোট (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {bill.items.map((item, index) => (
                  <tr key={index} className="py-2">
                    <td className="py-2 text-slate-500 font-medium">{index + 1}</td>
                    <td className="py-2 font-medium text-slate-900">{item.productName}</td>
                    <td className="py-2 text-center font-medium">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 text-right font-medium">
                      {item.unitPrice.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 text-right font-bold text-slate-900">
                      {item.total.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="mt-4 pt-3 border-t-2 border-dashed border-slate-300">
            <div className="flex justify-end">
              <div className="w-56 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>মোট বিল:</span>
                  <span className="font-medium text-slate-900">{formatTaka(bill.subTotal, shop.enableBengaliDigits)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>ছাড় / ডিসকাউন্ট:</span>
                    <span>- {formatTaka(bill.discount, shop.enableBengaliDigits)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-300">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span>{formatTaka(bill.grandTotal, shop.enableBengaliDigits)}</span>
                </div>
                <div className="flex justify-between text-slate-800 pt-1">
                  <span>পরিশোধিত নগদ:</span>
                  <span className="font-semibold text-emerald-700">{formatTaka(bill.paidAmount, shop.enableBengaliDigits)}</span>
                </div>
                {bill.dueAmount > 0 && (
                  <div className="flex justify-between font-bold text-red-600 pt-1 border-t border-dashed border-slate-300">
                    <span>বকেয়া / বাকি:</span>
                    <span>{formatTaka(bill.dueAmount, shop.enableBengaliDigits)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 pt-4 border-t border-slate-200 text-center">
            {shop.tagline && (
              <p className="text-xs text-slate-500 italic mb-4">{shop.tagline}</p>
            )}
            <div className="flex justify-between items-end pt-6 text-xs text-slate-500">
              <div className="text-center">
                <div className="w-28 border-b border-slate-400 mb-1"></div>
                <span>ক্রেতার স্বাক্ষর</span>
              </div>
              <div className="text-center">
                <div className="w-28 border-b border-slate-400 mb-1"></div>
                <span className="font-semibold text-slate-700">বিক্রেতার স্বাক্ষর</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
