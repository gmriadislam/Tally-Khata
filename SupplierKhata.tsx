import { useState, useRef, useEffect } from 'react';
import {
  Search,
  Truck,
  Phone,
  Trash2,
  Edit2,
  Calendar,
  Building,
  MapPin,
  Clock,
  ArrowLeft,
  FileText,
  Download,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Camera,
  Image as ImageIcon,
  CheckCircle2,
  Receipt,
  Info,
  X,
  Check,
  Plus,
  Package,
  ArrowUpDown,
  SlidersHorizontal,
  RotateCcw,
  Filter,
  UserPlus,
  Settings,
} from 'lucide-react';
import {
  Supplier,
  KhataTransaction,
  ShopProfile,
  Business,
  Product,
  PaymentMethod,
  TransactionItem,
} from '../types';
import {
  formatTaka,
  formatBengaliDate,
  getRelativeBengaliDate,
  normalizeDigits,
  toBengaliNumber,
  isPersonalAccount,
} from '../utils/formatters';
import SupplierStatementPDFModal from './SupplierStatementPDFModal';

interface DraftItem {
  id: string;
  productId?: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
  saveToInventory?: boolean;
}

interface SupplierKhataProps {
  suppliers: Supplier[];
  transactions: KhataTransaction[];
  products?: Product[];
  shop: ShopProfile | Business;
  onAddSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (id: string) => void;
  onAddTransaction: (
    tx: Omit<KhataTransaction, 'id'>,
    supplierPayableDelta: number
  ) => void;
  onDeleteTransaction: (txId: string, partyId: string, deltaToRevert: number) => void;
  onProfileOpenChange?: (isOpen: boolean) => void;
  onAdjustStock?: (productId: string, delta: number) => void;
  onAddProduct?: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialSelectedSupplierId?: string | null;
  onSelectSupplierChange?: (id: string | null) => void;
  onOpenStoreSwitcher?: () => void;
  onOpenSettings?: () => void;
  onGoBack?: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'cash', label: 'নগদ ক্যাশ', icon: '💵' },
  { id: 'bkash', label: 'বিকাশ', icon: '📱' },
  { id: 'nagad', label: 'নগদ', icon: '📱' },
  { id: 'rocket', label: 'রকেট', icon: '📱' },
  { id: 'bank', label: 'ব্যাংক', icon: '🏦' },
  { id: 'other', label: 'অন্যান্য', icon: '💳' },
];

export default function SupplierKhata({
  suppliers,
  transactions,
  products = [],
  shop,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddTransaction,
  onDeleteTransaction,
  onProfileOpenChange,
  onAdjustStock,
  onAddProduct,
  initialSelectedSupplierId,
  onSelectSupplierChange,
  onOpenStoreSwitcher,
  onOpenSettings,
  onGoBack,
}: SupplierKhataProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'payable' | 'settled' | 'high_payable'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'payable_desc' | 'name_asc'>('recent');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(initialSelectedSupplierId || null);

  useEffect(() => {
    if (initialSelectedSupplierId !== undefined) {
      setSelectedSupplierId(initialSelectedSupplierId);
    }
  }, [initialSelectedSupplierId]);

  // Inform parent when drilldown profile is opened or closed
  useEffect(() => {
    onProfileOpenChange?.(!!selectedSupplierId);
    onSelectSupplierChange?.(selectedSupplierId);
  }, [selectedSupplierId, onProfileOpenChange, onSelectSupplierChange]);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  // Direct In-Page Entry State
  // 'gave' = টাকা দিলাম (দেনা কমে), 'received' = চালানের মাল পেলাম (দেনা বাড়ে)
  const [directType, setDirectType] = useState<'gave' | 'received'>('gave');
  const [directAmount, setDirectAmount] = useState('');
  const [directNote, setDirectNote] = useState('');
  const [directDate, setDirectDate] = useState(new Date().toISOString().split('T')[0]);
  const [directTallyMessage, setDirectTallyMessage] = useState(true);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Itemized Purchase State (যখন মহাজনের থেকে চালানের মাল কেনা হবে)
  const [isItemizedOpen, setIsItemizedOpen] = useState(false);
  const [draftItems, setDraftItems] = useState<DraftItem[]>([]);

  // Payment Method State (যখন মহাজনকে টাকা পরিশোধ করা হবে)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Form State for new supplier
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [initialPayable, setInitialPayable] = useState('');

  const selectedSupplier = suppliers.find((s) => s.id === selectedSupplierId) || null;

  // Transactions for selected supplier
  const supplierTransactions = selectedSupplier
    ? transactions
        .filter((t) => t.partyId === selectedSupplier.id && t.partyType === 'supplier')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    : [];

  // Filter and sort suppliers for directory
  const normalizedQuery = normalizeDigits(searchTerm.trim().toLowerCase());
  const cleanQueryPhone = normalizedQuery.replace(/\D/g, '');

  const filteredSuppliers = suppliers
    .filter((s) => {
      // 1. Search Query Match
      if (normalizedQuery) {
        const nameMatch = s.name.toLowerCase().includes(normalizedQuery);
        const companyMatch = (s.companyName || '').toLowerCase().includes(normalizedQuery);
        const addressMatch = (s.address || '').toLowerCase().includes(normalizedQuery);

        const suppPhoneNormalized = normalizeDigits(s.phone || '').toLowerCase();
        const phoneMatch = suppPhoneNormalized.includes(normalizedQuery);

        const cleanSuppPhone = suppPhoneNormalized.replace(/\D/g, '');
        const phoneDigitsMatch = cleanQueryPhone ? cleanSuppPhone.includes(cleanQueryPhone) : false;

        if (!nameMatch && !companyMatch && !addressMatch && !phoneMatch && !phoneDigitsMatch) {
          return false;
        }
      }

      // 2. Filter Tab
      if (filterType === 'payable') return s.totalPayable > 0;
      if (filterType === 'settled') return s.totalPayable <= 0;
      if (filterType === 'high_payable') return s.totalPayable >= 5000;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'payable_desc') {
        return b.totalPayable - a.totalPayable;
      }
      if (sortBy === 'name_asc') {
        return a.name.localeCompare(b.name, 'bn');
      }
      // default: recent / updatedAt
      const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

  const totalPayableSum = suppliers.reduce(
    (sum, s) => sum + (s.totalPayable > 0 ? s.totalPayable : 0),
    0
  );
  const dueSuppliersCount = suppliers.filter((s) => s.totalPayable > 0).length;

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddSupplier({
      name: name.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      totalPayable: parseFloat(initialPayable) || 0,
    });

    setName('');
    setCompanyName('');
    setPhone('');
    setAddress('');
    setInitialPayable('');
    setIsAddModalOpen(false);
  };

  const openEditModal = () => {
    if (!selectedSupplier) return;
    setName(selectedSupplier.name);
    setCompanyName(selectedSupplier.companyName || '');
    setPhone(selectedSupplier.phone);
    setAddress(selectedSupplier.address || '');
    setIsEditModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleUpdateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    onUpdateSupplier({
      ...selectedSupplier,
      name: name.trim(),
      companyName: companyName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      updatedAt: new Date().toISOString(),
    });
    setIsEditModalOpen(false);
  };

  // Image upload handler
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- Itemized Purchase Handlers ---
  const handleAddDraftItem = () => {
    const defaultProduct = products[0];
    const newItem: DraftItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      productId: defaultProduct ? defaultProduct.id : 'custom',
      name: defaultProduct ? defaultProduct.name : '',
      quantity: 1,
      unit: defaultProduct ? defaultProduct.unit : 'পিস',
      unitPrice: defaultProduct ? defaultProduct.purchasePrice : 0,
      total: defaultProduct ? defaultProduct.purchasePrice * 1 : 0,
      saveToInventory: true,
    };

    const nextItems = [...draftItems, newItem];
    setDraftItems(nextItems);
    setIsItemizedOpen(true);
    recalculateItems(nextItems);
  };

  const handleUpdateDraftItem = (id: string, updates: Partial<DraftItem>) => {
    const nextItems = draftItems.map((item) => {
      if (item.id === id) {
        const next = { ...item, ...updates };

        if (updates.productId !== undefined && updates.productId !== item.productId) {
          if (updates.productId === 'custom') {
            next.productId = 'custom';
            next.name = '';
            next.unit = next.unit || 'পিস';
            next.unitPrice = 0;
            next.saveToInventory = true;
          } else if (updates.productId === '') {
            next.productId = '';
          } else {
            const prod = products.find((p) => p.id === updates.productId);
            if (prod) {
              next.name = prod.name;
              next.unit = prod.unit;
              next.unitPrice = prod.purchasePrice; // In supplier khata: purchase price
            }
          }
        }

        const qty = parseFloat(next.quantity.toString()) || 0;
        const price = parseFloat(next.unitPrice.toString()) || 0;
        next.total = Math.round(qty * price * 100) / 100;
        return next;
      }
      return item;
    });

    setDraftItems(nextItems);
    recalculateItems(nextItems);
  };

  const handleRemoveDraftItem = (id: string) => {
    const remaining = draftItems.filter((item) => item.id !== id);
    setDraftItems(remaining);
    recalculateItems(remaining);
  };

  const recalculateItems = (items: DraftItem[]) => {
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
    if (totalAmount > 0) {
      setDirectAmount(totalAmount.toString());
    }

    const itemsSummary = items
      .filter((i) => i.name.trim())
      .map((i) => `${i.name} (${i.quantity} ${i.unit} × ৳${i.unitPrice})`)
      .join(', ');

    if (itemsSummary) {
      setDirectNote(itemsSummary);
    }
  };

  // Direct In-Page Transaction Submission
  const handleDirectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;

    const amount = parseFloat(directAmount);
    if (!amount || amount <= 0) return;

    // In supplier khata:
    // 'received' = মাল নিলাম (goods received) -> payable increases (+amount)
    // 'gave' = টাকা দিলাম (paid cash) -> payable decreases (-amount)
    const payableDelta = directType === 'received' ? amount : -amount;

    // Build items payload if itemized purchase was used
    const validItems: TransactionItem[] =
      directType === 'received'
        ? draftItems
            .filter((i) => i.name.trim() && i.total > 0)
            .map((i) => ({
              productId: i.productId && i.productId !== 'custom' ? i.productId : undefined,
              name: i.name.trim(),
              quantity: i.quantity,
              unit: i.unit,
              unitPrice: i.unitPrice,
              total: i.total,
            }))
        : [];

    // If custom product added and requested to save to inventory
    if (onAddProduct && directType === 'received') {
      draftItems.forEach((d) => {
        if ((d.productId === 'custom' || !d.productId) && d.saveToInventory && d.name.trim()) {
          onAddProduct({
            name: d.name.trim(),
            category: 'সাধারণ',
            unit: d.unit || 'পিস',
            purchasePrice: d.unitPrice || 0,
            sellingPrice: 0,
            stockQuantity: d.quantity || 0,
            minStockAlert: 5,
          });
        }
      });
    }

    let noteText = directNote.trim();
    if (directType === 'gave' && paymentMethod !== 'cash') {
      const methodLabel = PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label || paymentMethod;
      noteText = noteText ? `[${methodLabel}] ${noteText}` : `[${methodLabel}] মহাজন দেনা পরিশোধ`;
    }

    onAddTransaction(
      {
        partyId: selectedSupplier.id,
        partyType: 'supplier',
        type: directType,
        amount,
        date: new Date(directDate).toISOString(),
        note: noteText,
        attachmentUrl: attachedImage || undefined,
        sendSms: directTallyMessage,
        paymentMethod: directType === 'gave' ? paymentMethod : undefined,
        items: validItems.length > 0 ? validItems : undefined,
        itemsSummary:
          validItems.length > 0
            ? validItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')
            : undefined,
      },
      payableDelta
    );

    // If inventory products were purchased, automatically increase stock!
    if (onAdjustStock && validItems.length > 0) {
      validItems.forEach((item) => {
        if (item.productId && item.productId !== 'custom') {
          onAdjustStock(item.productId, item.quantity);
        }
      });
    }

    // Reset direct entry fields
    setDirectAmount('');
    setDirectNote('');
    setDraftItems([]);
    setIsItemizedOpen(false);
    setAttachedImage(null);
    setPaymentMethod('cash');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 2500);
  };

  const handleDeleteTx = (tx: KhataTransaction) => {
    if (
      window.confirm(
        'আপনি কি এই লেনদেনটি খতিয়ান থেকে মুছে ফেলতে চান? দেনা ব্যালেন্স স্বয়ংক্রিয়ভাবে আগের অবস্থায় ফিরে যাবে।'
      )
    ) {
      const deltaToRevert = tx.type === 'received' ? -tx.amount : tx.amount;
      onDeleteTransaction(tx.id, tx.partyId, deltaToRevert);
    }
  };

  const handleDeleteSupp = () => {
    if (!selectedSupplier) return;
    if (
      window.confirm(
        `আপনি কি নিশ্চিত যে "${selectedSupplier.name}" সাপ্লায়ার এবং তার সমস্ত চালান ও লেনদেন মুছে ফেলবেন?`
      )
    ) {
      onDeleteSupplier(selectedSupplier.id);
      setSelectedSupplierId(null);
    }
    setIsMenuOpen(false);
  };

  const formatShortBengaliDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = [
        'জানুয়ারি',
        'ফেব্রুয়ারি',
        'মার্চ',
        'এপ্রিল',
        'মে',
        'জুন',
        'জুলাই',
        'আগস্ট',
        'সেপ্টেম্বর',
        'অক্টোবর',
        'নভেম্বর',
        'ডিসেম্বর',
      ];
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const toBn = (num: number) =>
        num
          .toString()
          .split('')
          .map((digit) => bengaliDigits[parseInt(digit, 10)] || digit)
          .join('');

      const day = toBn(d.getDate());
      const month = months[d.getMonth()];
      const year = toBn(d.getFullYear() % 100);
      return `${day} ${month}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatDayMonthBengali = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const months = [
        'জানুয়ারি',
        'ফেব্রুয়ারি',
        'মার্চ',
        'এপ্রিল',
        'মে',
        'জুন',
        'জুলাই',
        'আগস্ট',
        'সেপ্টেম্বর',
        'অক্টোবর',
        'নভেম্বর',
        'ডিসেম্বর',
      ];
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const toBn = (num: number) =>
        num
          .toString()
          .split('')
          .map((digit) => bengaliDigits[parseInt(digit, 10)] || digit)
          .join('');

      return `${toBn(d.getDate())} ${months[d.getMonth()]}`;
    } catch {
      return dateStr;
    }
  };

  // ----------------------------------------------------
  // DEDICATED FULL-SCREEN PROFILE PAGE FOR SUPPLIER
  // ----------------------------------------------------
  if (selectedSupplier) {
    const isPayable = selectedSupplier.totalPayable > 0;
    const isAdvance = selectedSupplier.totalPayable < 0;
    const lastTx = supplierTransactions[0];
    const relativeTimeStr = lastTx ? getRelativeBengaliDate(lastTx.date) : 'আজ';

    return (
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Success Toast */}
        {showSuccessToast && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-bold border border-emerald-500/40 animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {directType === 'gave'
                ? 'দেনা পরিশোধ এন্ট্রি সফল হয়েছে!'
                : 'চালানের মাল এন্ট্রি সফল হয়েছে!'}
              {directTallyMessage && ' (ট্যালি মেসেজ নোটিফিকেশন পাঠানো হয়েছে)'}
            </span>
          </div>
        )}

        {/* Top App Bar (Matching Screenshot: Back, Orange Avatar, Name, 3-dots Menu) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs px-3.5 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {/* Back Button */}
            <button
              onClick={() => {
                if (onGoBack) {
                  onGoBack();
                } else {
                  setSelectedSupplierId(null);
                }
              }}
              className="p-1.5 -ml-1 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="পিছনে ফিরে যান"
              aria-label="পিছনে ফিরে যান"
            >
              <ArrowLeft className="w-5 h-5 text-slate-800" />
            </button>

            {/* Avatar Circle in Bright Orange as in screenshot */}
            <div className="w-10 h-10 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 uppercase tracking-wider">
              {selectedSupplier.name.slice(0, 2)}
            </div>

            {/* Supplier Name */}
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                {selectedSupplier.name}
              </h2>
            </div>
          </div>

          {/* 3-dots Menu on Right */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="আরও অপশন"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-11 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                {selectedSupplier.phone && (
                  <a
                    href={`tel:${selectedSupplier.phone}`}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>কল করুন ({selectedSupplier.phone})</span>
                  </a>
                )}

                <button
                  onClick={openEditModal}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                  <span>মহাজন তথ্য পরিবর্তন</span>
                </button>

                <button
                  onClick={() => {
                    setIsStatementModalOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-medium cursor-pointer"
                >
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>হিসাব স্টেটমেন্ট (PDF)</span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                <button
                  onClick={handleDeleteSupp}
                  className="w-full text-left px-3.5 py-2.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600 font-medium cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>এই সাপ্লায়ার মুছুন</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sub-header row: Balance status on left, রিপোর্ট button on right (Matching screenshot) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs px-4 py-3 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-sm sm:text-base font-bold text-slate-700">
                {isPayable ? 'দেবেন' : isAdvance ? 'অগ্রিম দেওয়া' : 'দেবেন'}
              </span>
              <span
                className={`text-base sm:text-lg font-extrabold font-mono ${
                  isPayable ? 'text-red-600' : isAdvance ? 'text-emerald-600' : 'text-red-600'
                }`}
              >
                {formatTaka(Math.abs(selectedSupplier.totalPayable), shop.enableBengaliDigits)}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
              ({relativeTimeStr})
            </p>
          </div>

          <button
            onClick={() => setIsStatementModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            title="স্টেটমেন্ট দেখুন ও PDF ডাউনলোড করুন"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>রিপোর্ট</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* DIRECT TRANSACTION ENTRY CARD WITH ITEM-AUTO-CALCULATOR & PAYMENT METHODS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-4 sm:p-5">
          <form onSubmit={handleDirectSubmit} className="space-y-3.5">
            {/* Row 1: Side-by-side Entry Boxes (দিলাম/পরিশোধ vs পেলাম/চালান) */}
            <div className="grid grid-cols-2 gap-3">
              {/* Box 1: দিলাম (পরিশোধ) */}
              <div
                onClick={() => setDirectType('gave')}
                className={`rounded-xl transition cursor-pointer px-3.5 py-3 flex items-center gap-2 min-h-[58px] ${
                  directType === 'gave'
                    ? 'border-2 border-slate-800 bg-white shadow-xs'
                    : 'border border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <span
                  className={`text-lg sm:text-xl font-bold ${
                    directType === 'gave' ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  ৳
                </span>
                {directType === 'gave' ? (
                  <input
                    type="number"
                    step="any"
                    min="1"
                    autoFocus
                    required
                    value={directAmount}
                    onChange={(e) => setDirectAmount(e.target.value)}
                    placeholder="দিলাম/পরিশোধ"
                    className="w-full text-base sm:text-lg font-bold font-mono text-slate-900 bg-transparent border-none outline-none p-0 focus:ring-0 placeholder:text-slate-400"
                  />
                ) : (
                  <span className="text-sm sm:text-base font-medium text-slate-400 select-none">
                    দিলাম/পরিশোধ
                  </span>
                )}
              </div>

              {/* Box 2: পেলাম (চালান মাল) */}
              <div
                onClick={() => setDirectType('received')}
                className={`rounded-xl transition cursor-pointer px-3.5 py-3 flex items-center gap-2 min-h-[58px] ${
                  directType === 'received'
                    ? 'border-2 border-slate-800 bg-white shadow-xs'
                    : 'border border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <span
                  className={`text-lg sm:text-xl font-bold ${
                    directType === 'received' ? 'text-slate-900' : 'text-slate-400'
                  }`}
                >
                  ৳
                </span>
                {directType === 'received' ? (
                  <input
                    type="number"
                    step="any"
                    min="1"
                    autoFocus
                    required
                    value={directAmount}
                    onChange={(e) => setDirectAmount(e.target.value)}
                    placeholder="পেলাম/চালান"
                    className="w-full text-base sm:text-lg font-bold font-mono text-slate-900 bg-transparent border-none outline-none p-0 focus:ring-0 placeholder:text-slate-400"
                  />
                ) : (
                  <span className="text-sm sm:text-base font-medium text-slate-400 select-none">
                    পেলাম/চালান
                  </span>
                )}
              </div>
            </div>

            {/* Row 2: বিবরণ (Description) Input */}
            <div className="border border-slate-300 rounded-xl bg-white px-3.5 py-3 flex items-center gap-2.5 focus-within:border-slate-800 transition min-h-[52px]">
              <Edit2 className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={directNote}
                onChange={(e) => setDirectNote(e.target.value)}
                placeholder="বিবরণ"
                className="w-full text-sm text-slate-800 bg-transparent border-none outline-none p-0 placeholder:text-slate-400 focus:ring-0"
              />
            </div>

            {/* Row 3: Action Chips (Date & Photo) */}
            <div className="flex items-center gap-2.5 pt-0.5">
              {/* Date Chip */}
              <button
                type="button"
                onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.focus()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold transition cursor-pointer"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>{formatDayMonthBengali(directDate)}</span>
              </button>
              <input
                ref={dateInputRef}
                type="date"
                value={directDate}
                onChange={(e) => setDirectDate(e.target.value)}
                className="absolute opacity-0 pointer-events-none w-0 h-0"
              />

              {/* Photo Chip */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                  attachedImage
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-slate-500" />
                <span>{attachedImage ? 'ছবি সংযুক্ত ✔' : 'ছবি'}</span>
              </button>
            </div>

            {/* Attached Photo Preview */}
            {attachedImage && (
              <div className="relative inline-block mt-1">
                <img
                  src={attachedImage}
                  alt="চালান ছবি"
                  className="w-16 h-16 object-cover rounded-xl border border-slate-300 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    setAttachedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute -top-2 -right-2 bg-rose-600 text-white p-1 rounded-full shadow-xs hover:bg-rose-700 cursor-pointer"
                  title="ছবি মুছুন"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Collapsible Features (Item calculator & payment methods preserved) */}
            <div className="pt-0.5 space-y-2">
              {directType === 'received' && (
                <div className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setIsItemizedOpen(!isItemizedOpen)}
                      className="text-xs font-bold text-slate-700 flex items-center gap-1.5 hover:text-rose-700 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-rose-600" />
                      <span>{isItemizedOpen ? 'আইটেম তালিকা লুকান' : '+ চালানের মালের দর ও পরিমাণ যোগ করুন'}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${isItemizedOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {isItemizedOpen && (
                      <button
                        type="button"
                        onClick={handleAddDraftItem}
                        className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 hover:bg-rose-100 transition"
                      >
                        + মাল যোগ
                      </button>
                    )}
                  </div>

                  {isItemizedOpen && (
                    <div className="space-y-2 pt-1">
                    {draftItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-12 gap-2 items-center text-xs"
                      >
                        {/* Product Dropdown or Custom Name */}
                        <div className="col-span-12 sm:col-span-5">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            মালের নাম (#{idx + 1})
                          </label>
                          <select
                            value={item.productId || ''}
                            onChange={(e) =>
                              handleUpdateDraftItem(item.id, { productId: e.target.value })
                            }
                            className="w-full px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:ring-1 focus:ring-rose-500 outline-none"
                          >
                            <option value="">-- ইনভেন্টরি থেকে নির্বাচন --</option>
                            {products.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name} (ক্রয়দর: ৳{p.purchasePrice} /{p.unit}) [স্টক: {p.stockQuantity}]
                              </option>
                            ))}
                            <option value="custom" className="font-bold text-rose-700 bg-rose-50">
                              ➕ অন্যান্য (নতুন পণ্য নাম লিখুন)
                            </option>
                          </select>
                          {(item.productId === 'custom' || !item.productId) && (
                            <div className="mt-1.5 p-2 bg-rose-50/70 border border-rose-200 rounded-lg space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-rose-800 flex items-center gap-1">
                                  <Package className="w-3 h-3 text-rose-600" />
                                  নতুন মালের বিবরণ
                                </span>
                                {onAddProduct && (
                                  <label className="flex items-center gap-1 text-[10px] text-slate-700 font-semibold cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={item.saveToInventory ?? true}
                                      onChange={(e) =>
                                        handleUpdateDraftItem(item.id, {
                                          saveToInventory: e.target.checked,
                                        })
                                      }
                                      className="rounded text-rose-600 focus:ring-rose-500 w-3 h-3"
                                    />
                                    <span>স্টকে সেভ করুন</span>
                                  </label>
                                )}
                              </div>
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) =>
                                  handleUpdateDraftItem(item.id, { name: e.target.value })
                                }
                                placeholder="নতুন মালের নাম লিখুন (যেমন: সয়াবিন তেল, চিনি ইত্যাদি)"
                                className="w-full px-2 py-1.5 bg-white border border-rose-300 rounded-md text-xs font-medium text-slate-800 outline-none focus:ring-1 focus:ring-rose-500"
                                autoFocus={item.productId === 'custom'}
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-600 shrink-0">একক (ইউনিট):</span>
                                <select
                                  value={item.unit || 'পিস'}
                                  onChange={(e) =>
                                    handleUpdateDraftItem(item.id, { unit: e.target.value })
                                  }
                                  className="px-2 py-1 bg-white border border-rose-300 rounded text-xs font-medium text-slate-800 outline-none"
                                >
                                  <option value="পিস">পিস</option>
                                  <option value="কেজি">কেজি</option>
                                  <option value="লিটার">লিটার</option>
                                  <option value="প্যাকেট">প্যাকেট</option>
                                  <option value="বস্তা">বস্তা</option>
                                  <option value="গ্রাম">গ্রাম</option>
                                  <option value="ডজন">ডজন</option>
                                  <option value="হালি">হালি</option>
                                  <option value="কার্টন">কার্টন</option>
                                  <option value="মিটার">মিটার</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Unit Price (দর/ক্রয়মূল্য) */}
                        <div className="col-span-4 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            ক্রয়দর (৳)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={item.unitPrice || ''}
                            onChange={(e) =>
                              handleUpdateDraftItem(item.id, {
                                unitPrice: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="০"
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none"
                          />
                        </div>

                        {/* Quantity (পরিমাণ) */}
                        <div className="col-span-4 sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            পরিমাণ ({item.unit})
                          </label>
                          <input
                            type="number"
                            min="0.1"
                            step="any"
                            value={item.quantity || ''}
                            onChange={(e) =>
                              handleUpdateDraftItem(item.id, {
                                quantity: parseFloat(e.target.value) || 0,
                              })
                            }
                            placeholder="১"
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 outline-none"
                          />
                        </div>

                        {/* Subtotal (মোট) */}
                        <div className="col-span-3 sm:col-span-2 text-right">
                          <span className="block text-[10px] font-bold text-slate-400">মোট</span>
                          <span className="text-xs sm:text-sm font-extrabold font-mono text-rose-600">
                            ৳{item.total}
                          </span>
                        </div>

                        {/* Remove item */}
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveDraftItem(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="মুছুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                      {draftItems.length > 0 && (
                        <div className="flex items-center justify-between pt-1 px-1 text-xs">
                          <span className="text-slate-500">
                            {draftItems.length} টি চালানের মালের মোট স্বয়ংক্রিয় যোগফল:
                          </span>
                          <span className="font-extrabold font-mono text-rose-600 text-sm">
                            ৳{draftItems.reduce((sum, i) => sum + i.total, 0)} (টাকায় বসেছে)
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {directType === 'gave' && (
                <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                  <span className="text-[11px] font-bold text-slate-500 mr-1">মাধ্যম:</span>
                  {PAYMENT_METHODS.map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                        paymentMethod === pm.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{pm.icon}</span>
                      <span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Row 4: Full-width rounded-full নিশ্চিত বাটন (Matching screenshot) */}
            <button
              type="submit"
              disabled={!directAmount || parseFloat(directAmount) <= 0}
              className={`w-full py-3.5 px-6 rounded-full font-bold text-base transition-all duration-150 cursor-pointer shadow-xs ${
                directAmount && parseFloat(directAmount) > 0
                  ? 'bg-[#991b1b] hover:bg-[#831818] active:scale-98 text-white shadow-md'
                  : 'bg-[#fee2e2] text-[#fca5a5] cursor-not-allowed'
              }`}
            >
              নিশ্চিত
            </button>
          </form>
        </div>

        {/* Statement & Ledger Report Modal */}
        {isStatementModalOpen && (
          <SupplierStatementPDFModal
            isOpen={isStatementModalOpen}
            onClose={() => setIsStatementModalOpen(false)}
            supplier={selectedSupplier}
            transactions={supplierTransactions}
            shop={shop}
            onDeleteTransaction={onDeleteTransaction}
          />
        )}

        {/* Image Preview Modal */}
        {previewImageUrl && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
            <div className="relative max-w-lg w-full bg-white rounded-2xl overflow-hidden p-2">
              <button
                onClick={() => setPreviewImageUrl(null)}
                className="absolute top-4 right-4 z-10 bg-black/60 text-white p-1.5 rounded-full hover:bg-black"
              >
                <X className="w-4 h-4" />
              </button>
              <img
                src={previewImageUrl}
                alt="সংযুক্ত চালান ছবি"
                className="w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Edit Supplier Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
                <h3 className="font-bold text-sm">সাপ্লায়ার তথ্য পরিবর্তন</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateSupplier} className="p-5 space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    সাপ্লায়ার / প্রতিনিধির নাম
                  </label>
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
                    কোম্পানি / এজেন্সির নাম
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    মোবাইল নম্বর
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ঠিকানা</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                  >
                    আপডেট করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ----------------------------------------------------
  // MAIN VIEW: Supplier Directory & Listing
  // ----------------------------------------------------
  const isPersonal = isPersonalAccount(shop);
  const shopName = 'name' in shop ? shop.name : (shop as any).shopName || (isPersonal ? 'ব্যক্তিগত খতিয়ান' : 'বিসমিল্লাহ জেনারেল স্টোর');

  return (
    <div className="w-full min-h-screen bg-[#faf8f3] text-slate-900 flex flex-col font-sans select-none pb-28">
      {/* ================================================================
          TOP GOLDEN HEADER (Authentic Golden Gradient - matching Home)
          ================================================================ */}
      <header className="bg-gradient-to-b from-[#d5b87e] via-[#c9a96b] to-[#c29f5d] px-4 pt-3 pb-7 shadow-xs">
        <div className="max-w-xl mx-auto flex items-start justify-between">
          {/* Left section: Back button (if available) + Shop Selector Pill */}
          <div className="flex items-center gap-1.5">
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
            <button
              onClick={onOpenStoreSwitcher}
              className="px-3.5 py-1.5 bg-white text-slate-800 rounded-full font-bold text-sm shadow-xs flex items-center gap-1.5 hover:bg-slate-50 active:scale-98 transition cursor-pointer border border-amber-100"
              title={isPersonal ? 'অ্যাকাউন্ট পরিবর্তন করুন' : 'দোকান পরিবর্তন করুন'}
            >
              <span className="text-base leading-none">{isPersonal ? '👤' : '👑'}</span>
              <span className="truncate max-w-[150px] sm:max-w-xs">{shopName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                isPersonal ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-900'
              }`}>
                {isPersonal ? 'ব্যক্তিগত' : 'ব্যবসা'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-600 stroke-[2.5]" />
            </button>
          </div>

          {/* Top Right Action Icon: সেটিংস */}
          <div className="flex items-center">
            <button
              onClick={onOpenSettings}
              className="flex flex-col items-center text-[#3a2707] hover:text-black transition cursor-pointer group px-2 py-0.5 rounded-xl hover:bg-black/5 active:scale-95"
              title="দোকানের সেটিংস ও প্রোফাইল"
              aria-label="দোকানের সেটিংস"
            >
              <div className="p-1">
                <Settings className="w-6 h-6 stroke-[2] group-hover:rotate-45 transition duration-300" />
              </div>
              <span className="text-[11px] font-bold mt-0.5">সেটিংস</span>
            </button>
          </div>
        </div>
      </header>

      {/* ================================================================
          MAIN BODY CONTAINER WITH ROUNDED TOP CORNERS
          ================================================================ */}
      <div className="flex-1 -mt-4 bg-[#faf8f3] rounded-t-[28px] shadow-sm max-w-xl mx-auto w-full px-3 pt-3 flex flex-col space-y-3">
        {/* Title and Filter Pills */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-amber-800" />
            <h2 className="text-base font-bold text-slate-900">
              {isPersonal ? 'দেনা দেবো (ব্যক্তি ও ব্যাংক তালিকা)' : 'সাপ্লায়ার তালিকা'} ({shop.enableBengaliDigits ? toBengaliNumber(filteredSuppliers.length) : filteredSuppliers.length})
            </h2>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              সব
            </button>
            <button
              onClick={() => setFilterType('payable')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterType === 'payable'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-white text-purple-700 border border-purple-200'
              }`}
            >
              {isPersonal ? 'দেনা বাকি' : 'দেনা'}
            </button>
            <button
              onClick={() => setFilterType('settled')}
              className={`px-3 py-1 rounded-full font-bold transition cursor-pointer ${
                filterType === 'settled'
                  ? 'bg-slate-700 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              পরিশোধিত
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={isPersonal ? 'দেনা বা ব্যক্তির নাম দিয়ে খুঁজুন...' : 'সাপ্লায়ারের নাম বা ফোন দিয়ে খুঁজুন...'}
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Supplier Cards List */}
        <div className="space-y-2">
          {filteredSuppliers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
              <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-600">
                {isPersonal ? 'কোনো দেনাদারের হিসাব পাওয়া যায়নি' : 'কোনো সাপ্লায়ার পাওয়া যায়নি'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {isPersonal ? 'নতুন দেনাদার বা লোনদাতা যোগ করতে নিচের + বাটনে চাপুন' : 'নতুন সাপ্লায়ার যোগ করতে নিচের + বাটনে চাপুন'}
              </p>
            </div>
          ) : (
            filteredSuppliers.map((supp) => {
              const isPayable = supp.totalPayable > 0;

              return (
                <div
                  key={supp.id}
                  onClick={() => setSelectedSupplierId(supp.id)}
                  className="bg-white rounded-2xl p-3.5 border border-amber-100/70 shadow-xs flex items-center justify-between hover:border-amber-400 active:scale-98 transition cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-full bg-purple-100 text-purple-900 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-200 uppercase">
                      {supp.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm truncate">{supp.name}</h3>
                      <p className="text-xs text-slate-500 font-mono flex items-center gap-1 mt-0.5 truncate">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{supp.phone || supp.companyName || 'নম্বর নেই'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span
                      className={`text-[11px] font-bold block ${
                        isPayable ? 'text-red-600' : 'text-slate-400'
                      }`}
                    >
                      {isPayable ? (isPersonal ? 'দেনা শোধ করতে হবে' : 'দেনা পাবেন') : 'পরিশোধিত'}
                    </span>
                    <span
                      className={`text-sm sm:text-base font-extrabold font-mono ${
                        isPayable ? 'text-red-600' : 'text-slate-700'
                      }`}
                    >
                      ৳ {formatTaka(Math.abs(supp.totalPayable), shop.enableBengaliDigits)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Floating Action Button (FAB) at bottom-right corner for adding supplier */}
      <button
        onClick={() => {
          if (searchTerm.trim()) {
            const isPhone = /^[0-9০-৯+ -]+$/.test(searchTerm.trim());
            if (isPhone) {
              setPhone(searchTerm.trim());
              setName('');
            } else {
              setName(searchTerm.trim());
              setPhone('');
            }
          }
          setIsAddModalOpen(true);
        }}
        className="fixed bottom-20 right-4 sm:right-6 w-14 h-14 bg-[#991b1b] hover:bg-[#7f1d1d] active:scale-95 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition z-20 border-2 border-white/60"
        title={isPersonal ? 'টাকা ধার দেওয়া ব্যক্তি বা মহাজন যোগ করুন' : 'নতুন সাপ্লায়ার যোগ করুন'}
        aria-label={isPersonal ? 'নতুন দেনাদার যোগ করুন' : 'নতুন সাপ্লায়ার যোগ করুন'}
      >
        <Truck className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Add Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
              <h3 className="font-bold text-sm">
                {isPersonal ? 'নতুন দেনাদার / লোনদাতা যোগ করুন' : 'নতুন সাপ্লায়ার যোগ করুন'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSupplier} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  সাপ্লায়ার / প্রতিনিধির নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="যেমন: হাজী মতিন ট্রেডার্স"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  কোম্পানি / এজেন্সির নাম
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="যেমন: সিটি গ্রুপ, রূপচান্দা"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  মোবাইল নম্বর
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="যেমন: 01812345678"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ঠিকানা / গোডাউন</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="যেমন: মৌলভীবাজার, ঢাকা"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  পূর্বের দেনা বাকি থাকলে (ঐচ্ছিক)
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialPayable}
                  onChange={(e) => setInitialPayable(e.target.value)}
                  placeholder="টাকার পরিমাণ (৳)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs"
                >
                  সাপ্লায়ার সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
