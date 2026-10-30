import { useState } from 'react';
import {
  X,
  ShoppingCart,
  Plus,
  Trash2,
  AlertTriangle,
  User,
  CheckCircle2,
} from 'lucide-react';
import { Customer, Product, Bill, BillItem, ShopProfile, Business } from '../types';
import { formatTaka } from '../utils/formatters';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  products: Product[];
  shop: ShopProfile | Business;
  onCompleteSale: (
    bill: Bill,
    stockDeductions: { productId: string; quantity: number }[],
    customerDueDelta: number,
    cashInAmount: number
  ) => void;
}

export default function QuickSaleModal({
  isOpen,
  onClose,
  customers,
  products,
  shop,
  onCompleteSale,
}: QuickSaleModalProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [walkInName, setWalkInName] = useState('নগদ ক্রেতা');
  const [walkInPhone, setWalkInPhone] = useState('');

  // Cart items
  const [cartItems, setCartItems] = useState<BillItem[]>([
    {
      productId: products[0]?.id,
      productName: products[0]?.name || 'চাল',
      unit: products[0]?.unit || 'কেজি',
      unitPrice: products[0]?.sellingPrice || 60,
      quantity: 1,
      total: products[0]?.sellingPrice || 60,
    },
  ]);

  const [discount, setDiscount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleProductSelect = (index: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;

    const newCart = [...cartItems];
    const qty = newCart[index].quantity || 1;
    newCart[index] = {
      productId: prod.id,
      productName: prod.name,
      unit: prod.unit,
      unitPrice: prod.sellingPrice,
      quantity: qty,
      total: prod.sellingPrice * qty,
    };
    setCartItems(newCart);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    if (qty < 0.1) return;
    const newCart = [...cartItems];
    newCart[index].quantity = qty;
    newCart[index].total = newCart[index].unitPrice * qty;
    setCartItems(newCart);
  };

  const handlePriceChange = (index: number, price: number) => {
    if (price < 0) return;
    const newCart = [...cartItems];
    newCart[index].unitPrice = price;
    newCart[index].total = price * newCart[index].quantity;
    setCartItems(newCart);
  };

  const handleAddItem = () => {
    const firstProd = products[0];
    if (firstProd) {
      setCartItems([
        ...cartItems,
        {
          productId: firstProd.id,
          productName: firstProd.name,
          unit: firstProd.unit,
          unitPrice: firstProd.sellingPrice,
          quantity: 1,
          total: firstProd.sellingPrice,
        },
      ]);
    } else {
      setCartItems([
        ...cartItems,
        {
          productName: 'পণ্য ' + (cartItems.length + 1),
          unit: 'পিস',
          unitPrice: 100,
          quantity: 1,
          total: 100,
        },
      ]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (cartItems.length === 1) return;
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  // Calculations
  const subTotal = cartItems.reduce((acc, item) => acc + item.total, 0);
  const discountVal = Math.min(subTotal, parseFloat(discount) || 0);
  const grandTotal = Math.max(0, subTotal - discountVal);

  // If paid is not explicitly touched, default to grandTotal
  const finalPaid = paidAmount === '' ? grandTotal : parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, grandTotal - finalPaid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || grandTotal <= 0) return;

    let customerName = walkInName.trim();
    let customerPhone = walkInPhone.trim();

    if (selectedCustomerId) {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      if (cust) {
        customerName = cust.name;
        customerPhone = cust.phone;
      }
    }

    const billNumber = `${Date.now().toString().slice(-6)}`;

    const newBill: Bill = {
      id: `bill-${Date.now()}`,
      billNumber,
      date: new Date().toISOString(),
      customerId: selectedCustomerId || undefined,
      customerName,
      customerPhone,
      items: cartItems,
      subTotal,
      discount: discountVal,
      grandTotal,
      paidAmount: finalPaid,
      dueAmount,
      paymentType: dueAmount === 0 ? 'cash' : finalPaid === 0 ? 'due' : 'partial',
      note: note.trim(),
    };

    // Calculate stock deductions
    const stockDeductions: { productId: string; quantity: number }[] = [];
    cartItems.forEach((item) => {
      if (item.productId) {
        stockDeductions.push({
          productId: item.productId,
          quantity: item.quantity,
        });
      }
    });

    onCompleteSale(newBill, stockDeductions, dueAmount, finalPaid);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 my-6">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">নতুন বিক্রি ও ক্যাশ মেমো তৈরি</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Customer Selection */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              ক্রেতা / কাস্টমার নির্বাচন করুন
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="">সাধারণ ক্যাশ কাস্টমার (খাতা নেই)</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.totalDue > 0 ? `(বাকি: ৳${c.totalDue})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedCustomerId ? (
                <div>
                  <input
                    type="text"
                    value={walkInName}
                    onChange={(e) => setWalkInName(e.target.value)}
                    placeholder="ক্রেতার নাম (যেমন: নগদ খদ্দের)"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              ) : (
                <div className="flex items-center text-xs text-slate-600 bg-white px-3 py-2 rounded-xl border border-slate-200">
                  <span className="font-medium">
                    বাকি থাকলে স্বয়ংক্রিয়ভাবে তার বাকি খাতায় যোগ হবে
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cart Items Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                পণ্যের তালিকা
              </span>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                আরেকটি পণ্য যোগ করুন
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 text-left">পণ্য নির্বাচন</th>
                    <th className="py-2.5 px-2 text-center w-24">পরিমাণ</th>
                    <th className="py-2.5 px-2 text-right w-24">দর (৳)</th>
                    <th className="py-2.5 px-3 text-right w-24">মোট</th>
                    <th className="py-2.5 px-2 text-center w-8"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {cartItems.map((item, idx) => {
                    const matchedProd = products.find((p) => p.id === item.productId);
                    const isOverStock =
                      matchedProd && item.quantity > matchedProd.stockQuantity;

                    return (
                      <tr key={idx} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3">
                          <select
                            value={item.productId || ''}
                            onChange={(e) => handleProductSelect(idx, e.target.value)}
                            className="w-full p-1.5 border border-slate-200 rounded-lg text-xs bg-white font-medium"
                          >
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (মজুদ: {p.stockQuantity} {p.unit})
                              </option>
                            ))}
                          </select>
                          {isOverStock && (
                            <span className="text-[10px] text-amber-600 flex items-center gap-1 mt-0.5">
                              <AlertTriangle className="w-3 h-3" />
                              মজুদের চেয়ে বেশি (মজুদ: {matchedProd?.stockQuantity})
                            </span>
                          )}
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity}
                            onChange={(e) =>
                              handleQuantityChange(idx, parseFloat(e.target.value) || 0)
                            }
                            className="w-full text-center p-1.5 border border-slate-200 rounded-lg font-mono font-bold"
                          />
                        </td>

                        <td className="py-2.5 px-2 text-right">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice}
                            onChange={(e) =>
                              handlePriceChange(idx, parseFloat(e.target.value) || 0)
                            }
                            className="w-full text-right p-1.5 border border-slate-200 rounded-lg font-mono font-medium"
                          />
                        </td>

                        <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                          {formatTaka(item.total, shop.enableBengaliDigits)}
                        </td>

                        <td className="py-2.5 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            disabled={cartItems.length === 1}
                            className="text-slate-300 hover:text-rose-600 disabled:opacity-20 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Payment Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Left Column: Note & Discount */}
              <div className="space-y-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ছাড় / ডিসকাউন্ট (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    নোট / বিক্রয় বিবরণ
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="যেমন: খুচরা নগদ বিক্রি"
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Right Column: Paid amount and Due */}
              <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>মোট বিল:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {formatTaka(subTotal, shop.enableBengaliDigits)}
                  </span>
                </div>

                {discountVal > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>ডিসকাউন্ট:</span>
                    <span className="font-bold font-mono">
                      -{formatTaka(discountVal, shop.enableBengaliDigits)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold text-slate-950 pt-1 border-t border-slate-200">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span className="font-mono">{formatTaka(grandTotal, shop.enableBengaliDigits)}</span>
                </div>

                {/* Paid amount */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800">নগদ প্রদান (টাকা):</label>
                    <button
                      type="button"
                      onClick={() => setPaidAmount(grandTotal.toString())}
                      className="text-[11px] text-emerald-700 font-semibold hover:underline"
                    >
                      সম্পূর্ণ পরিশোধ
                    </button>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    placeholder={grandTotal.toString()}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-sm font-bold font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Due amount warning */}
                {dueAmount > 0 && (
                  <div className="flex justify-between font-bold text-rose-600 pt-1 border-t border-dashed border-slate-200">
                    <span>বাকি থাকবে:</span>
                    <span className="font-mono">{formatTaka(dueAmount, shop.enableBengaliDigits)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
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
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>বিক্রি সম্পন্ন করুন ও মেমো দেখুন</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
