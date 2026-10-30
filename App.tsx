/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Customer,
  Supplier,
  Product,
  KhataTransaction,
  CashEntry,
  Bill,
  Business,
  BusinessStore,
  MultiBusinessState,
  ActiveTab,
} from './types';
import {
  loadMultiBusinessState,
  saveMultiBusinessState,
} from './utils/storage';
import {
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_CASH_ENTRIES,
  INITIAL_PERSONAL_CUSTOMERS,
  INITIAL_PERSONAL_SUPPLIERS,
  INITIAL_PERSONAL_PRODUCTS,
  INITIAL_PERSONAL_TRANSACTIONS,
  INITIAL_PERSONAL_CASH_ENTRIES,
} from './data/initialData';
import { isPersonalAccount } from './utils/formatters';
import Header from './components/Header';
import DashboardStats from './components/DashboardStats';
import CustomerKhata from './components/CustomerKhata';
import SupplierKhata from './components/SupplierKhata';
import InventoryManager from './components/InventoryManager';
import CashBook from './components/CashBook';
import QuickSaleModal from './components/QuickSaleModal';
import QuickEntryModal from './components/QuickEntryModal';
import CalculatorModal from './components/CalculatorModal';
import ShopProfileModal from './components/ShopProfileModal';
import ReportsModal from './components/ReportsModal';
import BusinessSwitcherModal from './components/BusinessSwitcherModal';
import CashMemoView from './components/CashMemoView';
import PWAInstallModal from './components/PWAInstallModal';
import GoogleDriveBackupModal from './components/GoogleDriveBackupModal';
import MobileHomeScreen from './components/MobileHomeScreen';
import BusinessNotesModal from './components/BusinessNotesModal';
import GroupDueReminderModal from './components/GroupDueReminderModal';
import ShopQRCodeModal from './components/ShopQRCodeModal';
import TallyMessageModal from './components/TallyMessageModal';
import InboxModal from './components/InboxModal';
import SupportModal from './components/SupportModal';
import AddPartyModal from './components/AddPartyModal';
import { ShoppingCart, Users, Truck, Wallet, Store } from 'lucide-react';

export type ModalType =
  | 'businessSwitcher'
  | 'quickSale'
  | 'quickEntry'
  | 'calculator'
  | 'settings'
  | 'reports'
  | 'driveBackup'
  | 'pwaInstall'
  | 'cashMemo'
  | 'notes'
  | 'tagada'
  | 'qrCode'
  | 'tallyMessage'
  | 'inbox'
  | 'support'
  | 'addParty';

export interface NavState {
  tab: ActiveTab;
  customerId: string | null;
  supplierId: string | null;
  modal: ModalType | null;
}

const INITIAL_NAV_STATE: NavState = {
  tab: 'home',
  customerId: null,
  supplierId: null,
  modal: null,
};

export default function App() {
  const [initialLoaded, setInitialLoaded] = useState(false);

  // Multi-business root state
  const [multiState, setMultiState] = useState<MultiBusinessState>(() => loadMultiBusinessState());

  // UI Navigation & Modals
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [isViewingProfile, setIsViewingProfile] = useState(false);
  const [targetCustomerId, setTargetCustomerId] = useState<string | null>(null);
  const [targetSupplierId, setTargetSupplierId] = useState<string | null>(null);
  const [inventorySearchTerm, setInventorySearchTerm] = useState('');

  const [isBusinessSwitcherOpen, setIsBusinessSwitcherOpen] = useState(false);
  const [isQuickSaleOpen, setIsQuickSaleOpen] = useState(false);
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isDriveBackupOpen, setIsDriveBackupOpen] = useState(false);
  const [isPWAInstallOpen, setIsPWAInstallOpen] = useState(false);

  // Dokan Shortcuts Modals
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isTagadaOpen, setIsTagadaOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isTallyMessageOpen, setIsTallyMessageOpen] = useState(false);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const [addPartyDefaultType, setAddPartyDefaultType] = useState<'customer' | 'supplier'>('customer');
  const [activeCashMemoBill, setActiveCashMemoBill] = useState<Bill | null>(null);

  // Full-featured Step-by-Step Back Navigation History Stack
  const navHistoryRef = useRef<NavState[]>([INITIAL_NAV_STATE]);

  const applyNavState = useCallback((state: NavState) => {
    setActiveTab(state.tab);
    setTargetCustomerId(state.customerId);
    setTargetSupplierId(state.supplierId);
    setIsViewingProfile(Boolean(state.customerId || state.supplierId));

    setIsBusinessSwitcherOpen(state.modal === 'businessSwitcher');
    setIsQuickSaleOpen(state.modal === 'quickSale');
    setIsQuickEntryOpen(state.modal === 'quickEntry');
    setIsCalculatorOpen(state.modal === 'calculator');
    setIsSettingsOpen(state.modal === 'settings');
    setIsReportsOpen(state.modal === 'reports');
    setIsDriveBackupOpen(state.modal === 'driveBackup');
    setIsPWAInstallOpen(state.modal === 'pwaInstall');
    setIsNotesOpen(state.modal === 'notes');
    setIsTagadaOpen(state.modal === 'tagada');
    setIsQRCodeOpen(state.modal === 'qrCode');
    setIsTallyMessageOpen(state.modal === 'tallyMessage');
    setIsInboxOpen(state.modal === 'inbox');
    setIsSupportOpen(state.modal === 'support');
    setIsAddPartyOpen(state.modal === 'addParty');
    if (state.modal !== 'cashMemo') {
      setActiveCashMemoBill(null);
    }
  }, []);

  const pushNav = useCallback(
    (nextPartial: Partial<NavState>) => {
      const currentState = navHistoryRef.current[navHistoryRef.current.length - 1] || INITIAL_NAV_STATE;
      const nextState: NavState = {
        ...currentState,
        ...nextPartial,
      };

      // If identical state, avoid duplicating stack frame
      if (
        currentState.tab === nextState.tab &&
        currentState.customerId === nextState.customerId &&
        currentState.supplierId === nextState.supplierId &&
        currentState.modal === nextState.modal
      ) {
        return;
      }

      navHistoryRef.current.push(nextState);
      try {
        window.history.pushState({ stepIndex: navHistoryRef.current.length - 1 }, '');
      } catch {
        // Fallback for isolated iframe environments
      }
      applyNavState(nextState);
    },
    [applyNavState]
  );

  const navigateToTab = useCallback(
    (tab: ActiveTab) => {
      pushNav({
        tab,
        customerId: null,
        supplierId: null,
        modal: null,
      });
    },
    [pushNav]
  );

  const openModal = useCallback(
    (modal: ModalType) => {
      pushNav({ modal });
    },
    [pushNav]
  );

  const handleGoBack = useCallback(() => {
    if (navHistoryRef.current.length > 1) {
      try {
        window.history.back();
      } catch {
        navHistoryRef.current.pop();
        const prev = navHistoryRef.current[navHistoryRef.current.length - 1];
        if (prev) applyNavState(prev);
      }
    } else {
      const rootState: NavState = { tab: 'home', customerId: null, supplierId: null, modal: null };
      navHistoryRef.current = [rootState];
      applyNavState(rootState);
    }
  }, [applyNavState]);

  useEffect(() => {
    try {
      window.history.replaceState({ stepIndex: 0 }, '');
    } catch {
      // ignore
    }

    const handlePopState = () => {
      if (navHistoryRef.current.length > 1) {
        navHistoryRef.current.pop();
        const previousState = navHistoryRef.current[navHistoryRef.current.length - 1];
        if (previousState) {
          applyNavState(previousState);
        }
      } else {
        const rootState: NavState = { tab: 'home', customerId: null, supplierId: null, modal: null };
        navHistoryRef.current = [rootState];
        applyNavState(rootState);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [applyNavState]);

  const handleCustomerSelectChange = useCallback(
    (id: string | null) => {
      if (id) {
        const curr = navHistoryRef.current[navHistoryRef.current.length - 1];
        if (!curr || curr.customerId !== id) {
          pushNav({ tab: 'customers', customerId: id, supplierId: null, modal: null });
        }
      } else {
        setTargetCustomerId(null);
        setIsViewingProfile(false);
      }
    },
    [pushNav]
  );

  const handleSupplierSelectChange = useCallback(
    (id: string | null) => {
      if (id) {
        const curr = navHistoryRef.current[navHistoryRef.current.length - 1];
        if (!curr || curr.supplierId !== id) {
          pushNav({ tab: 'suppliers', supplierId: id, customerId: null, modal: null });
        }
      } else {
        setTargetSupplierId(null);
        setIsViewingProfile(false);
      }
    },
    [pushNav]
  );

  // Mark loaded
  useEffect(() => {
    setInitialLoaded(true);
  }, []);

  // Save to localStorage whenever multiState changes
  useEffect(() => {
    if (!initialLoaded) return;
    saveMultiBusinessState(multiState);
  }, [multiState, initialLoaded]);

  // Active Store helper
  const activeStore: BusinessStore =
    multiState.businesses.find((b) => b.business.id === multiState.activeBusinessId) ||
    multiState.businesses[0];

  const activeBusiness = activeStore.business;
  const customers = activeStore.customers;
  const suppliers = activeStore.suppliers;
  const products = activeStore.products;
  const transactions = activeStore.transactions;
  const cashEntries = activeStore.cashEntries;
  const bills = activeStore.bills;

  // Helper to mutate active business store data
  const updateActiveStore = (updater: (prevStore: BusinessStore) => BusinessStore) => {
    setMultiState((prev) => {
      const updatedBusinesses = prev.businesses.map((store) => {
        if (store.business.id === prev.activeBusinessId) {
          return updater(store);
        }
        return store;
      });
      return {
        ...prev,
        businesses: updatedBusinesses,
      };
    });
  };

  // --- Business Management Handlers ---
  const handleSwitchBusiness = (businessId: string) => {
    setMultiState((prev) => ({
      ...prev,
      activeBusinessId: businessId,
    }));
    handleGoBack();
  };

  const handleCreateBusiness = (
    newBusinessData: Omit<Business, 'id' | 'createdAt' | 'updatedAt'>,
    useSampleData: boolean
  ) => {
    const newBizId = `biz-${Date.now()}`;
    const newBusiness: Business = {
      ...newBusinessData,
      id: newBizId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const isPersonal = newBusinessData.accountCategory === 'personal' || isPersonalAccount(newBusinessData);

    const newStore: BusinessStore = {
      business: newBusiness,
      customers: useSampleData
        ? isPersonal
          ? INITIAL_PERSONAL_CUSTOMERS
          : INITIAL_CUSTOMERS
        : [],
      suppliers: useSampleData
        ? isPersonal
          ? INITIAL_PERSONAL_SUPPLIERS
          : INITIAL_SUPPLIERS
        : [],
      products: useSampleData
        ? isPersonal
          ? INITIAL_PERSONAL_PRODUCTS
          : INITIAL_PRODUCTS
        : [],
      transactions: useSampleData
        ? isPersonal
          ? INITIAL_PERSONAL_TRANSACTIONS
          : INITIAL_TRANSACTIONS
        : [],
      cashEntries: useSampleData
        ? isPersonal
          ? INITIAL_PERSONAL_CASH_ENTRIES
          : INITIAL_CASH_ENTRIES
        : [],
      bills: [],
    };

    setMultiState((prev) => ({
      ...prev,
      activeBusinessId: newBizId,
      businesses: [...prev.businesses, newStore],
    }));

    handleGoBack();
  };

  const handleUpdateBusiness = (updatedBiz: Business) => {
    setMultiState((prev) => {
      const updatedBusinesses = prev.businesses.map((store) => {
        if (store.business.id === updatedBiz.id) {
          return {
            ...store,
            business: updatedBiz,
          };
        }
        return store;
      });
      return {
        ...prev,
        businesses: updatedBusinesses,
      };
    });
  };

  const handleDeleteBusiness = (businessId: string) => {
    setMultiState((prev) => {
      const remaining = prev.businesses.filter((b) => b.business.id !== businessId);
      if (remaining.length === 0) return prev;
      const newActiveId =
        prev.activeBusinessId === businessId ? remaining[0].business.id : prev.activeBusinessId;

      return {
        ...prev,
        activeBusinessId: newActiveId,
        businesses: remaining,
      };
    });
  };

  const reloadDataFromStorage = () => {
    const fresh = loadMultiBusinessState();
    setMultiState(fresh);
  };

  // --- Customer Handlers ---
  const handleAddCustomer = (customerData: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newCust: Customer = {
      ...customerData,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateActiveStore((store) => {
      let nextTx = store.transactions;
      if (customerData.totalDue !== 0) {
        const isDue = customerData.totalDue > 0;
        const initialTx: KhataTransaction = {
          id: `tx-${Date.now()}`,
          partyId: newCust.id,
          partyType: 'customer',
          type: isDue ? 'gave' : 'received',
          amount: Math.abs(customerData.totalDue),
          date: new Date().toISOString(),
          note: isDue ? 'পূর্বের বাকি হিসাব' : 'পূর্বের অগ্রিম জমা',
        };
        nextTx = [initialTx, ...nextTx];
      }
      return {
        ...store,
        customers: [newCust, ...store.customers],
        transactions: nextTx,
      };
    });
  };

  const handleUpdateCustomer = (updated: Customer) => {
    updateActiveStore((store) => ({
      ...store,
      customers: store.customers.map((c) => (c.id === updated.id ? updated : c)),
    }));
  };

  const handleDeleteCustomer = (id: string) => {
    updateActiveStore((store) => ({
      ...store,
      customers: store.customers.filter((c) => c.id !== id),
      transactions: store.transactions.filter((t) => t.partyId !== id),
    }));
  };

  const handleAddCustomerTransaction = (
    txData: Omit<KhataTransaction, 'id'>,
    dueDelta: number
  ) => {
    const newTx: KhataTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };

    updateActiveStore((store) => {
      const nextCustomers = store.customers.map((c) => {
        if (c.id === txData.partyId) {
          return {
            ...c,
            totalDue: c.totalDue + dueDelta,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      });

      let nextCash = store.cashEntries;
      if (txData.type === 'received') {
        const targetCust = store.customers.find((c) => c.id === txData.partyId);
        const newCashEntry: CashEntry = {
          id: `cash-${Date.now()}`,
          type: 'in',
          amount: txData.amount,
          category: 'কাস্টমার বাকি আদায়',
          note: txData.note || 'বাকি আদায়',
          relatedPartyName: targetCust?.name,
          date: txData.date,
        };
        nextCash = [newCashEntry, ...nextCash];
      }

      return {
        ...store,
        customers: nextCustomers,
        transactions: [newTx, ...store.transactions],
        cashEntries: nextCash,
      };
    });
  };

  const handleDeleteCustomerTransaction = (
    txId: string,
    partyId: string,
    deltaToRevert: number
  ) => {
    updateActiveStore((store) => ({
      ...store,
      transactions: store.transactions.filter((t) => t.id !== txId),
      customers: store.customers.map((c) => {
        if (c.id === partyId) {
          return {
            ...c,
            totalDue: c.totalDue + deltaToRevert,
            updatedAt: new Date().toISOString(),
          };
        }
        return c;
      }),
    }));
  };

  // --- Supplier Handlers ---
  const handleAddSupplier = (suppData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSupp: Supplier = {
      ...suppData,
      id: `supp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    updateActiveStore((store) => {
      let nextTx = store.transactions;
      if (suppData.totalPayable > 0) {
        const initialTx: KhataTransaction = {
          id: `tx-${Date.now()}`,
          partyId: newSupp.id,
          partyType: 'supplier',
          type: 'received',
          amount: suppData.totalPayable,
          date: new Date().toISOString(),
          note: 'পূর্বের দেনা হিসাব',
        };
        nextTx = [initialTx, ...nextTx];
      }
      return {
        ...store,
        suppliers: [newSupp, ...store.suppliers],
        transactions: nextTx,
      };
    });
  };

  const handleUpdateSupplier = (updated: Supplier) => {
    updateActiveStore((store) => ({
      ...store,
      suppliers: store.suppliers.map((s) => (s.id === updated.id ? updated : s)),
    }));
  };

  const handleDeleteSupplier = (id: string) => {
    updateActiveStore((store) => ({
      ...store,
      suppliers: store.suppliers.filter((s) => s.id !== id),
      transactions: store.transactions.filter((t) => t.partyId !== id),
    }));
  };

  const handleAddSupplierTransaction = (
    txData: Omit<KhataTransaction, 'id'>,
    payableDelta: number
  ) => {
    const newTx: KhataTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
    };

    updateActiveStore((store) => {
      const nextSuppliers = store.suppliers.map((s) => {
        if (s.id === txData.partyId) {
          return {
            ...s,
            totalPayable: s.totalPayable + payableDelta,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      });

      let nextCash = store.cashEntries;
      if (txData.type === 'gave') {
        const targetSupp = store.suppliers.find((s) => s.id === txData.partyId);
        const newCashEntry: CashEntry = {
          id: `cash-${Date.now()}`,
          type: 'out',
          amount: txData.amount,
          category: 'মহাজন দেনা পরিশোধ',
          note: txData.note || 'সাপ্লায়ার দেনা পরিশোধ',
          relatedPartyName: targetSupp?.name,
          date: txData.date,
        };
        nextCash = [newCashEntry, ...nextCash];
      }

      return {
        ...store,
        suppliers: nextSuppliers,
        transactions: [newTx, ...store.transactions],
        cashEntries: nextCash,
      };
    });
  };

  const handleDeleteSupplierTransaction = (
    txId: string,
    partyId: string,
    deltaToRevert: number
  ) => {
    updateActiveStore((store) => ({
      ...store,
      transactions: store.transactions.filter((t) => t.id !== txId),
      suppliers: store.suppliers.map((s) => {
        if (s.id === partyId) {
          return {
            ...s,
            totalPayable: s.totalPayable + deltaToRevert,
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      }),
    }));
  };

  // --- Inventory Handlers ---
  const handleAddProduct = (prodData: Omit<Product, 'id' | 'updatedAt'>) => {
    const newProd: Product = {
      ...prodData,
      id: `prod-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    updateActiveStore((store) => ({
      ...store,
      products: [newProd, ...store.products],
    }));
  };

  const handleUpdateProduct = (updated: Product) => {
    updateActiveStore((store) => ({
      ...store,
      products: store.products.map((p) => (p.id === updated.id ? updated : p)),
    }));
  };

  const handleDeleteProduct = (id: string) => {
    updateActiveStore((store) => ({
      ...store,
      products: store.products.filter((p) => p.id !== id),
    }));
  };

  const handleAdjustStock = (id: string, delta: number) => {
    updateActiveStore((store) => ({
      ...store,
      products: store.products.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, p.stockQuantity + delta);
          return { ...p, stockQuantity: newQty, updatedAt: new Date().toISOString() };
        }
        return p;
      }),
    }));
  };

  // --- CashBook Handlers ---
  const handleAddCashEntry = (entryData: Omit<CashEntry, 'id'>) => {
    const newEntry: CashEntry = {
      ...entryData,
      id: `cash-${Date.now()}`,
    };
    updateActiveStore((store) => ({
      ...store,
      cashEntries: [newEntry, ...store.cashEntries],
    }));
  };

  const handleDeleteCashEntry = (id: string) => {
    updateActiveStore((store) => ({
      ...store,
      cashEntries: store.cashEntries.filter((e) => e.id !== id),
    }));
  };

  // --- Quick Sale POS Completion ---
  const handleCompleteSale = (
    bill: Bill,
    stockDeductions: { productId: string; quantity: number }[],
    customerDueDelta: number,
    cashInAmount: number
  ) => {
    updateActiveStore((store) => {
      // 1. Deduct Stock
      let nextProducts = store.products;
      if (stockDeductions.length > 0) {
        nextProducts = store.products.map((prod) => {
          const deduction = stockDeductions.find((d) => d.productId === prod.id);
          if (deduction) {
            return {
              ...prod,
              stockQuantity: Math.max(0, prod.stockQuantity - deduction.quantity),
              updatedAt: new Date().toISOString(),
            };
          }
          return prod;
        });
      }

      // 2. Customer Due Log
      let nextTransactions = store.transactions;
      let nextCustomers = store.customers;
      if (bill.customerId && customerDueDelta > 0) {
        const itemsSummary = bill.items
          .map((i) => `${i.productName} (${i.quantity} ${i.unit})`)
          .join(', ');
        const newTx: KhataTransaction = {
          id: `tx-${Date.now()}`,
          partyId: bill.customerId,
          partyType: 'customer',
          type: 'gave',
          amount: customerDueDelta,
          date: bill.date,
          note: `বিল #${bill.billNumber}: ${itemsSummary}`,
          billNumber: bill.billNumber,
        };
        nextTransactions = [newTx, ...nextTransactions];
        nextCustomers = store.customers.map((c) => {
          if (c.id === bill.customerId) {
            return {
              ...c,
              totalDue: c.totalDue + customerDueDelta,
              updatedAt: new Date().toISOString(),
            };
          }
          return c;
        });
      }

      // 3. Cash Payment Log
      let nextCash = store.cashEntries;
      if (cashInAmount > 0) {
        const newCashEntry: CashEntry = {
          id: `cash-${Date.now()}`,
          type: 'in',
          amount: cashInAmount,
          category: 'নগদ বিক্রি',
          note: `বিক্রি মেমো #${bill.billNumber} (${bill.customerName})`,
          relatedPartyName: bill.customerName,
          date: bill.date,
        };
        nextCash = [newCashEntry, ...nextCash];
      }

      return {
        ...store,
        products: nextProducts,
        customers: nextCustomers,
        transactions: nextTransactions,
        cashEntries: nextCash,
        bills: [bill, ...store.bills],
      };
    });

    const curr = navHistoryRef.current[navHistoryRef.current.length - 1];
    if (curr && curr.modal === 'quickSale') {
      curr.modal = 'cashMemo';
    } else {
      navHistoryRef.current.push({
        ...(curr || INITIAL_NAV_STATE),
        modal: 'cashMemo',
      });
      try {
        window.history.pushState({ stepIndex: navHistoryRef.current.length - 1 }, '');
      } catch {
        // ignore
      }
    }
    setIsQuickSaleOpen(false);
    setActiveCashMemoBill(bill);
  };

  // --- Quick Entry Actions ---
  const handleQuickCustomerTx = (
    customerId: string,
    type: 'gave' | 'received',
    amount: number,
    note: string
  ) => {
    const dueDelta = type === 'gave' ? amount : -amount;
    handleAddCustomerTransaction(
      {
        partyId: customerId,
        partyType: 'customer',
        type,
        amount,
        date: new Date().toISOString(),
        note,
      },
      dueDelta
    );
  };

  const handleQuickSupplierTx = (
    supplierId: string,
    type: 'gave' | 'received',
    amount: number,
    note: string
  ) => {
    const payableDelta = type === 'received' ? amount : -amount;
    handleAddSupplierTransaction(
      {
        partyId: supplierId,
        partyType: 'supplier',
        type,
        amount,
        date: new Date().toISOString(),
        note,
      },
      payableDelta
    );
  };

  const handleQuickCashTx = (
    type: 'in' | 'out',
    amount: number,
    category: string,
    note: string
  ) => {
    handleAddCashEntry({
      type,
      amount,
      category,
      note,
      date: new Date().toISOString(),
    });
  };

  return (
    <div className={`min-h-screen ${isViewingProfile ? 'bg-[#faf8f3]' : 'bg-slate-100'} flex flex-col font-sans ${isViewingProfile ? 'pb-3' : 'pb-16 sm:pb-8'}`}>
      {/* App Header with Multi-Business Switcher */}
      {/* Hidden on home, customers, and suppliers tabs where authentic Golden Header is used, and in profile view */}
      {!isViewingProfile && activeTab !== 'home' && activeTab !== 'customers' && activeTab !== 'suppliers' && (
        <div className="hidden sm:block">
          <Header
            activeBusiness={activeBusiness}
            businesses={multiState.businesses}
            activeTab={activeTab}
            onTabChange={(tab) => navigateToTab(tab)}
            onSwitchBusiness={handleSwitchBusiness}
            onOpenBusinessSwitcher={() => openModal('businessSwitcher')}
            onOpenQuickSale={() => openModal('quickSale')}
            onOpenQuickEntry={() => openModal('quickEntry')}
            onOpenCalculator={() => openModal('calculator')}
            onOpenSettings={() => openModal('settings')}
            onOpenReports={() => openModal('reports')}
            onOpenDriveBackup={() => openModal('driveBackup')}
            onOpenPWAInstall={() => openModal('pwaInstall')}
            isViewingProfile={isViewingProfile}
          />
        </div>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${(activeTab === 'home' || activeTab === 'customers' || activeTab === 'suppliers') ? 'p-0' : isViewingProfile ? 'p-2 sm:py-3 max-w-xl mx-auto' : 'max-w-7xl mx-auto px-4 sm:px-6 py-5'}`}>
        {/* KPI Dashboard Stats Bar - Only shown on inventory/cashbook desktop */}
        {!isViewingProfile && activeTab !== 'home' && activeTab !== 'customers' && activeTab !== 'suppliers' && (
          <DashboardStats
            customers={customers}
            suppliers={suppliers}
            products={products}
            cashEntries={cashEntries}
            shop={activeBusiness}
            onNavigateTab={(tab) => navigateToTab(tab)}
          />
        )}

        {/* Tab Views */}
        {activeTab === 'home' && (
          <div className="sm:max-w-xl sm:mx-auto sm:shadow-xl sm:rounded-3xl sm:overflow-hidden sm:border sm:border-amber-200/60 sm:bg-white">
            <MobileHomeScreen
              shop={activeBusiness}
              customers={customers}
              suppliers={suppliers}
              products={products}
              totalBusinesses={multiState.businesses.length}
              onOpenStoreSwitcher={() => openModal('businessSwitcher')}
              onOpenInventory={() => navigateToTab('inventory')}
              onOpenNotes={() => openModal('notes')}
              onOpenTagada={() => openModal('tagada')}
              onOpenQRCode={() => openModal('qrCode')}
              onOpenBackup={() => openModal('driveBackup')}
              onOpenTallyMessage={() => openModal('tallyMessage')}
              onOpenCashbox={() => navigateToTab('cashbook')}
              onOpenSettings={() => openModal('settings')}
              onOpenAddParty={(type) => {
                setAddPartyDefaultType(type || 'customer');
                openModal('addParty');
              }}
              onSelectCustomer={(cust) => {
                pushNav({ tab: 'customers', customerId: cust.id, supplierId: null, modal: null });
              }}
              onSelectSupplier={(supp) => {
                pushNav({ tab: 'suppliers', supplierId: supp.id, customerId: null, modal: null });
              }}
              onSelectProduct={(prod) => {
                setInventorySearchTerm(prod.name);
                navigateToTab('inventory');
              }}
              onOpenSalesMemo={() => openModal('quickSale')}
              onOpenQuickEntry={() => openModal('quickEntry')}
              onOpenCalculator={() => openModal('calculator')}
              onOpenReports={() => openModal('reports')}
              onOpenPWAInstall={() => openModal('pwaInstall')}
            />
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="sm:max-w-xl sm:mx-auto sm:shadow-xl sm:rounded-3xl sm:overflow-hidden sm:border sm:border-amber-200/60 sm:bg-white">
            <CustomerKhata
              customers={customers}
              transactions={transactions}
              products={products}
              shop={activeBusiness}
              onAddCustomer={handleAddCustomer}
              onUpdateCustomer={handleUpdateCustomer}
              onDeleteCustomer={handleDeleteCustomer}
              onAddTransaction={handleAddCustomerTransaction}
              onDeleteTransaction={handleDeleteCustomerTransaction}
              onProfileOpenChange={setIsViewingProfile}
              onAdjustStock={handleAdjustStock}
              onAddProduct={handleAddProduct}
              initialSelectedCustomerId={targetCustomerId}
              onSelectCustomerChange={handleCustomerSelectChange}
              onOpenStoreSwitcher={() => openModal('businessSwitcher')}
              onOpenSettings={() => openModal('settings')}
              onGoBack={handleGoBack}
            />
          </div>
        )}

        {activeTab === 'suppliers' && (
          <div className="sm:max-w-xl sm:mx-auto sm:shadow-xl sm:rounded-3xl sm:overflow-hidden sm:border sm:border-amber-200/60 sm:bg-white">
            <SupplierKhata
              suppliers={suppliers}
              transactions={transactions}
              products={products}
              shop={activeBusiness}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              onDeleteSupplier={handleDeleteSupplier}
              onAddTransaction={handleAddSupplierTransaction}
              onDeleteTransaction={handleDeleteSupplierTransaction}
              onProfileOpenChange={setIsViewingProfile}
              onAdjustStock={handleAdjustStock}
              onAddProduct={handleAddProduct}
              initialSelectedSupplierId={targetSupplierId}
              onSelectSupplierChange={handleSupplierSelectChange}
              onOpenStoreSwitcher={() => openModal('businessSwitcher')}
              onOpenSettings={() => openModal('settings')}
              onGoBack={handleGoBack}
            />
          </div>
        )}

        {activeTab === 'inventory' && (
          <InventoryManager
            products={products}
            shop={activeBusiness}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAdjustStock={handleAdjustStock}
            initialSearchTerm={inventorySearchTerm}
            onClearInitialSearchTerm={() => setInventorySearchTerm('')}
            onGoBack={handleGoBack}
          />
        )}

        {activeTab === 'cashbook' && (
          <CashBook
            cashEntries={cashEntries}
            shop={activeBusiness}
            onAddCashEntry={handleAddCashEntry}
            onDeleteCashEntry={handleDeleteCashEntry}
            onGoBack={handleGoBack}
          />
        )}
      </main>

      {/* Mobile Touch-First Fixed Bottom Navigation Bar - Hidden in Profile view so 'নিশ্চিত' button is unobstructed */}
      {!isViewingProfile && (
        <nav
          aria-label="মোবাইল নেভিগেশন"
          className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/90 z-30 shadow-lg px-2 py-1 flex items-center justify-around"
        >
          <button
            onClick={() => navigateToTab('home')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] rounded-xl transition cursor-pointer ${
              activeTab === 'home'
                ? 'text-amber-800 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">হোম</span>
          </button>

          <button
            onClick={() => navigateToTab('customers')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] rounded-xl transition cursor-pointer ${
              activeTab === 'customers' && !isViewingProfile
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">কাস্টমার</span>
          </button>

          {/* Center Floating Elevated Action Button */}
          <div className="flex flex-col items-center justify-center -mt-5">
            <button
              onClick={() => openModal('quickSale')}
              className="w-12 h-12 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 transition cursor-pointer"
              title="নতুন বিক্রি মেমো"
              aria-label="নতুন বিক্রি মেমো"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            <span className="text-[10px] font-bold text-emerald-800 mt-1">বিক্রি মেমো</span>
          </div>

          <button
            onClick={() => navigateToTab('suppliers')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] rounded-xl transition cursor-pointer ${
              activeTab === 'suppliers' && !isViewingProfile
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Truck className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">সাপ্লায়ার</span>
          </button>

          <button
            onClick={() => navigateToTab('cashbook')}
            className={`flex flex-col items-center justify-center min-w-[50px] min-h-[46px] rounded-xl transition cursor-pointer ${
              activeTab === 'cashbook' && !isViewingProfile
                ? 'text-emerald-700 font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-5 h-5" />
            <span className="text-[10px] mt-0.5">ক্যাশবক্স</span>
          </button>
        </nav>
      )}

      {/* Business Switcher & Manager Modal */}
      {isBusinessSwitcherOpen && (
        <BusinessSwitcherModal
          isOpen={isBusinessSwitcherOpen}
          onClose={handleGoBack}
          businesses={multiState.businesses}
          activeBusinessId={multiState.activeBusinessId}
          onSwitchBusiness={handleSwitchBusiness}
          onCreateBusiness={handleCreateBusiness}
          onUpdateBusiness={handleUpdateBusiness}
          onDeleteBusiness={handleDeleteBusiness}
        />
      )}

      {/* Sale Modal */}
      {isQuickSaleOpen && (
        <QuickSaleModal
          isOpen={isQuickSaleOpen}
          onClose={handleGoBack}
          customers={customers}
          products={products}
          shop={activeBusiness}
          onCompleteSale={handleCompleteSale}
        />
      )}

      {/* Quick Entry Modal */}
      {isQuickEntryOpen && (
        <QuickEntryModal
          isOpen={isQuickEntryOpen}
          onClose={handleGoBack}
          customers={customers}
          suppliers={suppliers}
          shop={activeBusiness}
          onCustomerTx={handleQuickCustomerTx}
          onSupplierTx={handleQuickSupplierTx}
          onCashTx={handleQuickCashTx}
        />
      )}

      {/* Calculator Modal */}
      {isCalculatorOpen && (
        <CalculatorModal
          isOpen={isCalculatorOpen}
          onClose={handleGoBack}
        />
      )}

      {/* Shop / Business Settings Modal */}
      {isSettingsOpen && (
        <ShopProfileModal
          isOpen={isSettingsOpen}
          onClose={handleGoBack}
          business={activeBusiness}
          onSave={handleUpdateBusiness}
          onOpenPWAInstall={() => openModal('pwaInstall')}
          onOpenGoogleDriveBackup={() => openModal('driveBackup')}
        />
      )}

      {/* Reports and Backup Modal */}
      {isReportsOpen && (
        <ReportsModal
          isOpen={isReportsOpen}
          onClose={handleGoBack}
          activeBusiness={activeBusiness}
          businesses={multiState.businesses}
          customers={customers}
          suppliers={suppliers}
          products={products}
          transactions={transactions}
          cashEntries={cashEntries}
          bills={bills}
          onDataRestored={reloadDataFromStorage}
          onOpenGoogleDriveBackup={() => openModal('driveBackup')}
        />
      )}

      {/* Google Drive Cloud Backup & Restore Modal */}
      {isDriveBackupOpen && (
        <GoogleDriveBackupModal
          isOpen={isDriveBackupOpen}
          onClose={handleGoBack}
          multiState={multiState}
          onRestoreState={(restored) => {
            setMultiState(restored);
            saveMultiBusinessState(restored);
          }}
        />
      )}

      {/* PWA Mobile App Install Modal */}
      {isPWAInstallOpen && (
        <PWAInstallModal
          isOpen={isPWAInstallOpen}
          onClose={handleGoBack}
        />
      )}

      {/* Printable Cash Memo Slip */}
      {activeCashMemoBill && (
        <CashMemoView
          bill={activeCashMemoBill}
          shop={activeBusiness}
          onClose={handleGoBack}
        />
      )}

      {/* Business Notes Modal (ব্যবসার নোট) */}
      {isNotesOpen && (
        <BusinessNotesModal
          isOpen={isNotesOpen}
          onClose={handleGoBack}
          businessId={activeBusiness.id}
        />
      )}

      {/* Group Due Reminder Modal (গ্রুপ তাগাদা) */}
      {isTagadaOpen && (
        <GroupDueReminderModal
          isOpen={isTagadaOpen}
          onClose={handleGoBack}
          customers={customers}
          shop={activeBusiness}
        />
      )}

      {/* Shop Payment QR Code Modal (QR কোড) */}
      {isQRCodeOpen && (
        <ShopQRCodeModal
          isOpen={isQRCodeOpen}
          onClose={handleGoBack}
          shop={activeBusiness}
        />
      )}

      {/* Tally Message / Broadcast Modal (টালি-মেসেজ) */}
      {isTallyMessageOpen && (
        <TallyMessageModal
          isOpen={isTallyMessageOpen}
          onClose={handleGoBack}
          customers={customers}
          shop={activeBusiness}
        />
      )}

      {/* Inbox & Notifications Modal (ইনবক্স) */}
      {isInboxOpen && (
        <InboxModal
          isOpen={isInboxOpen}
          onClose={handleGoBack}
          shopName={activeBusiness.name}
        />
      )}

      {/* Support & Helpline Modal (সাপোর্ট) */}
      {isSupportOpen && (
        <SupportModal
          isOpen={isSupportOpen}
          onClose={handleGoBack}
          shop={activeBusiness}
        />
      )}

      {/* Add Party Modal (+ নতুন কাস্টমার/সাপ্লায়ার) */}
      {isAddPartyOpen && (
        <AddPartyModal
          isOpen={isAddPartyOpen}
          onClose={handleGoBack}
          defaultType={addPartyDefaultType}
          onAddCustomer={handleAddCustomer}
          onAddSupplier={handleAddSupplier}
        />
      )}
    </div>
  );
}
