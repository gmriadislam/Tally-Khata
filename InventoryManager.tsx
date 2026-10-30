import { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Package,
  Plus,
  AlertTriangle,
  TrendingUp,
  Edit2,
  Trash2,
  X,
  PlusCircle,
  MinusCircle,
  Tag,
  Barcode,
  ArrowUpDown,
  ArrowLeft,
} from 'lucide-react';
import { Product, ShopProfile, Business } from '../types';
import { formatTaka, formatNumber, normalizeDigits, toBengaliNumber, isPersonalAccount } from '../utils/formatters';

interface InventoryManagerProps {
  products: Product[];
  shop: ShopProfile | Business;
  onAddProduct: (prod: Omit<Product, 'id' | 'updatedAt'>) => void;
  onUpdateProduct: (prod: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAdjustStock: (id: string, delta: number) => void;
  initialSearchTerm?: string;
  onClearInitialSearchTerm?: () => void;
  onGoBack?: () => void;
}

const COMMON_CATEGORIES = [
  'চাল ও আটা',
  'তেল ও ঘি',
  'মুদি মালামাল',
  'ডিম ও দুগ্ধজাত',
  'প্রসাধন ও টয়লেট্রিজ',
  'মসলাপাতি',
  'স্ন্যাক্স ও বেকারি',
  'পানীয় ও চা-কফি',
  'অন্যান্য',
];

const COMMON_UNITS = ['কেজি', 'লিটার', 'পিস', 'প্যাকেট', 'বস্তা', 'কার্টন', 'ডজন', 'গ্রাম'];

export default function InventoryManager({
  products,
  shop,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAdjustStock,
  initialSearchTerm,
  onClearInitialSearchTerm,
  onGoBack,
}: InventoryManagerProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm || '');

  useEffect(() => {
    if (initialSearchTerm !== undefined) {
      setSearchTerm(initialSearchTerm);
    }
  }, [initialSearchTerm]);
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [sortBy, setSortBy] = useState<'name_asc' | 'stock_asc' | 'stock_desc' | 'price_desc' | 'recent'>('name_asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [adjustQty, setAdjustQty] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('মুদি মালামাল');
  const [unit, setUnit] = useState('কেজি');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [minStockAlert, setMinStockAlert] = useState('5');

  const filteredProducts = useMemo(() => {
    const rawTerm = searchTerm.trim().toLowerCase();
    const normalizedTerm = normalizeDigits(rawTerm);

    const result = products.filter((p) => {
      if (rawTerm) {
        const prodName = p.name.toLowerCase();
        const prodBarcode = (p.barcode || '').toLowerCase();
        const normBarcode = normalizeDigits(prodBarcode).toLowerCase();
        const prodCat = p.category.toLowerCase();
        const prodId = p.id.toLowerCase();

        const matchesName = prodName.includes(rawTerm) || prodName.includes(normalizedTerm);
        const matchesBarcode =
          prodBarcode.includes(rawTerm) ||
          prodBarcode.includes(normalizedTerm) ||
          normBarcode.includes(normalizedTerm);
        const matchesCat = prodCat.includes(rawTerm);
        const matchesId = prodId.includes(rawTerm) || normalizeDigits(prodId).includes(normalizedTerm);

        if (!matchesName && !matchesBarcode && !matchesCat && !matchesId) {
          return false;
        }
      }

      const matchesCategory = selectedCategory === 'সব' || p.category === selectedCategory;
      const matchesLowStock = onlyLowStock ? p.stockQuantity <= p.minStockAlert : true;

      return matchesCategory && matchesLowStock;
    });

    return result.sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'bn');
        case 'stock_asc':
          return a.stockQuantity - b.stockQuantity;
        case 'stock_desc':
          return b.stockQuantity - a.stockQuantity;
        case 'price_desc':
          return b.sellingPrice - a.sellingPrice;
        case 'recent':
          return new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime();
        default:
          return 0;
      }
    });
  }, [products, searchTerm, selectedCategory, onlyLowStock, sortBy]);

  // Inventory Totals
  const totalStockItems = products.reduce((acc, p) => acc + p.stockQuantity, 0);
  const totalPurchaseValue = products.reduce((acc, p) => acc + p.purchasePrice * p.stockQuantity, 0);
  const totalSalesValue = products.reduce((acc, p) => acc + p.sellingPrice * p.stockQuantity, 0);
  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProduct({
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      category: category.trim(),
      unit: unit.trim(),
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stockQuantity: parseFloat(stockQuantity) || 0,
      minStockAlert: parseFloat(minStockAlert) || 5,
    });

    setName('');
    setBarcode('');
    setPurchasePrice('');
    setSellingPrice('');
    setStockQuantity('');
    setMinStockAlert('5');
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setName(p.name);
    setBarcode(p.barcode || '');
    setCategory(p.category);
    setUnit(p.unit);
    setPurchasePrice(p.purchasePrice ? p.purchasePrice.toString() : '');
    setSellingPrice(p.sellingPrice ? p.sellingPrice.toString() : '');
    setStockQuantity(p.stockQuantity.toString());
    setMinStockAlert(p.minStockAlert.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !name.trim()) return;

    onUpdateProduct({
      ...editingProduct,
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      category: category.trim(),
      unit: unit.trim(),
      purchasePrice: parseFloat(purchasePrice) || 0,
      sellingPrice: parseFloat(sellingPrice) || 0,
      stockQuantity: parseFloat(stockQuantity) || 0,
      minStockAlert: parseFloat(minStockAlert) || 5,
      updatedAt: new Date().toISOString(),
    });

    setIsEditModalOpen(false);
    setEditingProduct(null);
  };

  const handleOpenAdjust = (p: Product, type: 'add' | 'remove') => {
    setAdjustingProduct(p);
    setAdjustType(type);
    setAdjustQty('');
    setIsAdjustModalOpen(true);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;
    const qty = parseFloat(adjustQty);
    if (!qty || qty <= 0) return;

    const delta = adjustType === 'add' ? qty : -qty;
    onAdjustStock(adjustingProduct.id, delta);
    setIsAdjustModalOpen(false);
    setAdjustingProduct(null);
  };

  const handleDelete = (p: Product) => {
    if (window.confirm(`আপনি কি "${p.name}" পণ্যটি স্টক থেকে মুছে ফেলতে চান?`)) {
      onDeleteProduct(p.id);
    }
  };

  const isPersonal = isPersonalAccount(shop);
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
              <Package className="w-4 h-4 text-rose-600" />
              <span className="truncate max-w-[150px] sm:max-w-xs">{shopName}</span>
              <span className="text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full font-bold">
                {isPersonal ? 'বাজেট ও সম্পদ' : 'স্টক হিসাব'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN BODY CONTAINER WITH ROUNDED TOP CORNERS */}
      <div className="flex-1 -mt-4 bg-[#faf8f3] rounded-t-[28px] shadow-sm max-w-xl mx-auto w-full px-3 pt-3 flex flex-col space-y-4">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">মোট পণ্য প্রকার</span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5 font-mono">
            {shop.enableBengaliDigits ? toBengaliNumber(products.length) : products.length} টি
          </p>
          <span className="text-[11px] text-slate-400">
            মোট মজুদ: {formatNumber(totalStockItems, shop.enableBengaliDigits)} একক
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500">মোট স্টক ক্রয়মূল্য</span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {formatTaka(totalPurchaseValue, shop.enableBengaliDigits)}
          </p>
          <span className="text-[11px] text-slate-400">ক্রয়কৃত মূলধন</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700">সম্ভাব্য বিক্রয় মূল্য</span>
          <p className="text-xl sm:text-2xl font-bold text-emerald-700 mt-0.5">
            {formatTaka(totalSalesValue, shop.enableBengaliDigits)}
          </p>
          <span className="text-[11px] text-emerald-600">
            লাভ: +{formatTaka(totalSalesValue - totalPurchaseValue, shop.enableBengaliDigits)}
          </span>
        </div>

        <div
          onClick={() => setOnlyLowStock(!onlyLowStock)}
          className={`p-3.5 sm:p-4 rounded-2xl border shadow-2xs cursor-pointer transition ${
            onlyLowStock
              ? 'bg-amber-100/70 border-amber-400 ring-1 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">কম স্টক সতর্কতা</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-700 mt-0.5 font-mono">
            {shop.enableBengaliDigits ? toBengaliNumber(lowStockCount) : lowStockCount} টি
          </p>
          <span className="text-[11px] text-amber-600 underline">
            {onlyLowStock ? 'ফিল্টার ছাড়ুন' : 'ক্লিক করে শুধু এগুলো দেখুন'}
          </span>
        </div>
      </div>

      {/* Control Bar: Search Input, Sorting, Categories */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Search Input with Clear Button */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="পণ্যের নাম বা SKU / বারকোড দিয়ে খুঁজুন (যেমন: মিনিকেট চাল বা SKU-101)..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition cursor-pointer"
                title="সার্চ মুছে ফেলুন"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-600">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="পণ্য সাজান"
                className="bg-transparent border-none text-xs font-medium text-slate-700 outline-none cursor-pointer pr-1"
              >
                <option value="name_asc">নাম (ক-হ / A-Z)</option>
                <option value="stock_asc">মজুদ কম থেকে বেশি</option>
                <option value="stock_desc">মজুদ বেশি থেকে কম</option>
                <option value="price_desc">বিক্রয়মূল্য বেশি থেকে কম</option>
                <option value="recent">সর্বশেষ আপডেট</option>
              </select>
            </div>

            <button
              onClick={() => {
                if (searchTerm.trim()) {
                  setName(searchTerm.trim());
                }
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন পণ্য যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Categories Bar & Active Filter Status */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            {['সব', ...COMMON_CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {(searchTerm || selectedCategory !== 'সব' || onlyLowStock) && (
            <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 shrink-0">
              <span>
                খুঁজে পাওয়া গেছে:{' '}
                <strong className="text-slate-800 font-mono">
                  {shop.enableBengaliDigits ? toBengaliNumber(filteredProducts.length) : filteredProducts.length}
                </strong> টি পণ্য
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('সব');
                  setOnlyLowStock(false);
                }}
                className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
              >
                সব রিসেট
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product List Table / Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">পণ্যের নাম ও ক্যাটাগরি</th>
                <th className="py-3 px-4 text-right">ক্রয়মূল্য</th>
                <th className="py-3 px-4 text-right">বিক্রয়মূল্য</th>
                <th className="py-3 px-4 text-right">সম্ভাব্য লাভ</th>
                <th className="py-3 px-4 text-center">বর্তমান মজুদ</th>
                <th className="py-3 px-4 text-center">স্টক সমন্বয়</th>
                <th className="py-3 px-4 text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <Package className="w-10 h-10 text-slate-300 mx-auto mb-2.5" />
                    {searchTerm ? (
                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <p className="font-semibold text-slate-800 text-sm">
                          "{searchTerm}" দিয়ে কোনো পণ্য বা SKU পাওয়া যায়নি
                        </p>
                        <p className="text-xs text-slate-400">
                          বানান অথবা SKU/বারকোড সঠিক আছে কিনা মিলিয়ে দেখুন
                        </p>
                        <div className="pt-2.5 flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSearchTerm('')}
                            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            সার্চ মুছে ফেলুন
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setName(searchTerm);
                              setIsAddModalOpen(true);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                          >
                            নতুন পণ্য হিসেবে যোগ করুন
                          </button>
                        </div>
                      </div>
                    ) : selectedCategory !== 'সব' || onlyLowStock ? (
                      <div className="space-y-1.5">
                        <p className="font-semibold text-slate-800 text-sm">
                          নির্বাচিত ফিল্টারে কোনো পণ্য মেলেনি
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory('সব');
                            setOnlyLowStock(false);
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer mt-1"
                        >
                          সকল ফিল্টার রিসেট করুন
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="font-semibold text-slate-800 text-sm">কোনো পণ্য তালিকাভুক্ত নেই</p>
                        <p className="text-xs text-slate-400">নতুন পণ্য যোগ করতে উপরের বাটনে চাপুন</p>
                        <button
                          type="button"
                          onClick={() => setIsAddModalOpen(true)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition cursor-pointer mt-1"
                        >
                          প্রথম পণ্য যোগ করুন
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stockQuantity <= p.minStockAlert;
                  const profit = p.sellingPrice - p.purchasePrice;
                  const profitPercent =
                    p.purchasePrice > 0 ? Math.round((profit / p.purchasePrice) * 100) : 0;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isLow ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{p.name}</span>
                          {p.barcode && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-normal">
                              <Barcode className="w-3 h-3 text-slate-400" />
                              <span>{p.barcode}</span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap">
                          <span className="inline-flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>{p.category}</span>
                          </span>
                          <span>•</span>
                          <span>একক: {p.unit}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-medium text-slate-700 font-mono">
                        {formatTaka(p.purchasePrice, shop.enableBengaliDigits)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 font-mono">
                        {formatTaka(p.sellingPrice, shop.enableBengaliDigits)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="font-semibold text-emerald-600 font-mono">
                          +{formatTaka(profit, shop.enableBengaliDigits)}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          ({profitPercent}%)
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                            isLow
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {isLow && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                          <span>
                            {shop.enableBengaliDigits ? toBengaliNumber(p.stockQuantity) : p.stockQuantity} {p.unit}
                          </span>
                        </div>
                        {isLow && (
                          <span className="block text-[10px] text-amber-600 font-medium mt-0.5">
                            স্টক কম!
                          </span>
                        )}
                      </td>

                      {/* Quick stock adjustment buttons */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenAdjust(p, 'add')}
                            className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-md transition cursor-pointer"
                            title="স্টক যোগ করুন"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenAdjust(p, 'remove')}
                            disabled={p.stockQuantity <= 0}
                            className="p-1 text-rose-600 hover:bg-rose-100 rounded-md transition disabled:opacity-30 cursor-pointer"
                            title="স্টক কমান"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                            title="সম্পাদনা করুন"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 my-6">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">নতুন পণ্য ইনভেন্টরিতে যোগ করুন</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পণ্যের নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: মিনিকেট চাল (৫০ কেজি বস্তা)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SKU / বারকোড <span className="text-slate-400 font-normal">(ঐচ্ছিক - সহজে খোঁজার জন্য)</span>
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="যেমন: SKU-101 বা 890123"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {COMMON_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">একক (Unit)</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্রয়মূল্য (৳) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিক্রয়মূল্য (৳) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বর্তমান মজুদ পরিমাণ
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    কম স্টক সতর্কতা সীমা
                  </label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    placeholder="5"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                >
                  পণ্য সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {isEditModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200 my-6">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">পণ্য সম্পাদনা</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">পণ্যের নাম</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  SKU / বারকোড <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                </label>
                <div className="relative">
                  <Barcode className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="যেমন: SKU-101 বা 890123"
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ক্যাটাগরি</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {COMMON_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">একক</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                  >
                    {COMMON_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ক্রয়মূল্য (৳) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    বিক্রয়মূল্য (৳) <span className="text-slate-400 font-normal">(ঐচ্ছিক)</span>
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">মজুদ পরিমাণ</label>
                  <input
                    type="number"
                    step="any"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">সতর্কতা সীমা</label>
                  <input
                    type="number"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs cursor-pointer"
                >
                  আপডেট সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {isAdjustModalOpen && adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div
              className={`flex items-center justify-between px-5 py-3.5 text-white ${
                adjustType === 'add' ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              <h3 className="font-bold text-sm">
                {adjustType === 'add' ? 'স্টক বৃদ্ধি (Stock In)' : 'স্টক হ্রাস (Stock Out)'}
              </h3>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded-lg text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAdjust} className="p-5 space-y-4">
              <div>
                <p className="text-xs text-slate-500">পণ্য:</p>
                <p className="font-bold text-slate-900 text-sm">{adjustingProduct.name}</p>
                <p className="text-xs text-slate-600 mt-1">
                  বর্তমান মজুদ: <span className="font-bold">{adjustingProduct.stockQuantity}</span>{' '}
                  {adjustingProduct.unit}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {adjustType === 'add' ? 'কতটুকু যোগ করবেন?' : 'কতটুকু কমাবেন?'} ({adjustingProduct.unit})
                </label>
                <input
                  type="number"
                  autoFocus
                  required
                  step="any"
                  min="0.1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2.5 text-lg font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs cursor-pointer ${
                    adjustType === 'add'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  নিশ্চিত করুন
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
