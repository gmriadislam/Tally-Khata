import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Download,
  Bell,
  Info,
  X,
  Trash2,
  Share2,
  Check,
  Loader2,
  Phone,
  FileText,
  Calendar,
  CalendarRange,
  Package,
  Layers,
} from 'lucide-react';
import { Supplier, KhataTransaction, Business, ShopProfile, TransactionItem } from '../types';
import { formatTaka, formatBengaliDate, getWhatsAppShareUrl } from '../utils/formatters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface SupplierStatementPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplier: Supplier;
  transactions: KhataTransaction[];
  shop: Business | ShopProfile;
  onDeleteTransaction?: (txId: string, partyId: string, deltaToRevert: number) => void;
}

type DateFilterMode = 'all' | 'this_month' | 'last_month' | 'custom';
type StatementFormatType = 'with_balance' | 'turnover_only';

interface AggregatedGood {
  name: string;
  totalQuantity: number;
  unit: string;
  totalAmount: number;
  txCount: number;
}

export default function SupplierStatementPDFModal({
  isOpen,
  onClose,
  supplier,
  transactions,
  shop,
  onDeleteTransaction,
}: SupplierStatementPDFModalProps) {
  const [showInfoBanner, setShowInfoBanner] = useState(true);
  const [reportShare, setReportShare] = useState(false);
  const [isTagadaOpen, setIsTagadaOpen] = useState(false);
  const [tagadaCopied, setTagadaCopied] = useState(false);
  const [selectedTxForAction, setSelectedTxForAction] = useState<KhataTransaction | null>(null);
  const [showGoodsSummarySection, setShowGoodsSummarySection] = useState(true);

  // Statement Type on Screen:
  // 'with_balance' = আগে পরের মাস যের মিলিয়ে সমন্বিত দেনা স্টেটমেন্ট
  // 'turnover_only' = শুধুমাত্র ওই মাসের/সময়ের ক্রয়-পরিশোধ স্টেটমেন্ট (পূর্বের জের ছাড়া)
  const [screenStatementType, setScreenStatementType] = useState<StatementFormatType>('with_balance');

  // Date Filtering State for Screen View
  const [dateFilterMode, setDateFilterMode] = useState<DateFilterMode>('all');

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFirstDayOfMonthStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getLastMonthFirstDayStr = () => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const getLastMonthLastDayStr = () => {
    const d = new Date();
    d.setDate(0);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [customStartDate, setCustomStartDate] = useState(getFirstDayOfMonthStr());
  const [customEndDate, setCustomEndDate] = useState(getTodayStr());

  // Download Dialog & PDF Generation State
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [downloadStatementType, setDownloadStatementType] = useState<StatementFormatType>('with_balance');
  const [downloadFilterMode, setDownloadFilterMode] = useState<DateFilterMode>('this_month');
  const [downloadStartDate, setDownloadStartDate] = useState(getFirstDayOfMonthStr());
  const [downloadEndDate, setDownloadEndDate] = useState(getTodayStr());
  const [includeGoodsSummaryInPDF, setIncludeGoodsSummaryInPDF] = useState(true);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const shopName = (shop as any).name || (shop as any).shopName || 'দোকান';
  const enableBengaliDigits = shop.enableBengaliDigits || false;

  const BENGALI_MONTHS = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];

  const now = new Date();
  const currentMonthLabel = `${BENGALI_MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthLabel = `${BENGALI_MONTHS[lastMonthDate.getMonth()]} ${lastMonthDate.getFullYear()}`;

  // Bengali Time Formatter: e.g. "১০:৫৭ PM"
  const formatBengaliTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const toBn = (num: number) =>
        num
          .toString()
          .padStart(2, '0')
          .split('')
          .map((digit) => bengaliDigits[parseInt(digit, 10)] || digit)
          .join('');
      return `${toBn(hours)}:${toBn(minutes)} ${ampm}`;
    } catch {
      return '';
    }
  };

  // Bengali Date Formatter: e.g. "২৮ অক্টোবর, ২০২৬"
  const formatBengaliDateString = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
      const toBn = (num: number) =>
        num
          .toString()
          .split('')
          .map((digit) => bengaliDigits[parseInt(digit, 10)] || digit)
          .join('');

      const day = toBn(d.getDate());
      const month = BENGALI_MONTHS[d.getMonth()];
      const year = toBn(d.getFullYear());
      return `${day} ${month}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Sort chronological
  const chronologicalTx = useMemo(
    () => [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [transactions]
  );

  // Helper to resolve range dates
  const resolveRange = (mode: DateFilterMode, startCustom: string, endCustom: string) => {
    if (mode === 'this_month') {
      return {
        startStr: getFirstDayOfMonthStr(),
        endStr: getTodayStr(),
        label: `চলতি মাস (${currentMonthLabel})`,
      };
    }
    if (mode === 'last_month') {
      return {
        startStr: getLastMonthFirstDayStr(),
        endStr: getLastMonthLastDayStr(),
        label: `গত মাস (${lastMonthLabel})`,
      };
    }
    if (mode === 'custom') {
      return {
        startStr: startCustom,
        endStr: endCustom,
        label: `${formatBengaliDate(startCustom)} হতে ${formatBengaliDate(endCustom)}`,
      };
    }
    return {
      startStr: undefined,
      endStr: undefined,
      label: 'সকল লেনদেন (শুরু থেকে বর্তমান)',
    };
  };

  // Compute transactions, balances, and goods aggregation for supplier
  const computePeriodData = (
    mode: DateFilterMode,
    startCustom: string,
    endCustom: string,
    formatType: StatementFormatType
  ) => {
    const { startStr, endStr, label } = resolveRange(mode, startCustom, endCustom);

    let openingBal = 0;
    const inRangeTx: KhataTransaction[] = [];

    chronologicalTx.forEach((tx) => {
      const txDate = new Date(tx.date);
      const isBeforeStart = startStr ? txDate < new Date(startStr + 'T00:00:00') : false;
      const isAfterEnd = endStr ? txDate > new Date(endStr + 'T23:59:59.999') : false;

      if (isBeforeStart) {
        if (tx.type === 'received') {
          openingBal += tx.amount; // payable increased
        } else {
          openingBal -= tx.amount; // paid, payable decreased
        }
      } else if (!isAfterEnd) {
        inRangeTx.push(tx);
      }
    });

    // If Type 1 (turnover_only), opening balance is strictly 0 (no carry-forward)
    const effectiveOpeningBal = formatType === 'turnover_only' ? 0 : openingBal;

    let runningBal = effectiveOpeningBal;
    let periodGave = 0;
    let periodReceived = 0;

    const goodsMap = new Map<string, AggregatedGood>();

    const txWithRunning = inRangeTx.map((tx, idx) => {
      if (tx.type === 'received') {
        runningBal += tx.amount;
        periodReceived += tx.amount;
      } else {
        runningBal -= tx.amount;
        periodGave += tx.amount;
      }

      // Aggregate goods/items purchased from this supplier
      if (tx.items && tx.items.length > 0) {
        tx.items.forEach((it) => {
          const key = `${it.name.trim().toLowerCase()}_${(it.unit || 'পিস').toLowerCase()}`;
          const existing = goodsMap.get(key);
          if (existing) {
            existing.totalQuantity += it.quantity;
            existing.totalAmount += it.total;
            existing.txCount += 1;
          } else {
            goodsMap.set(key, {
              name: it.name.trim(),
              totalQuantity: it.quantity,
              unit: it.unit || 'পিস',
              totalAmount: it.total,
              txCount: 1,
            });
          }
        });
      } else if (tx.itemsSummary && tx.type === 'received') {
        const key = tx.itemsSummary.trim().toLowerCase();
        const existing = goodsMap.get(key);
        if (existing) {
          existing.totalAmount += tx.amount;
          existing.txCount += 1;
        } else {
          goodsMap.set(key, {
            name: tx.itemsSummary.trim(),
            totalQuantity: 1,
            unit: 'কার্টন',
            totalAmount: tx.amount,
            txCount: 1,
          });
        }
      }

      return {
        ...tx,
        balanceAfter: runningBal,
        isEarliest: idx === 0,
      };
    });

    const aggregatedGoods = Array.from(goodsMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
    const totalGoodsAmount = aggregatedGoods.reduce((sum, g) => sum + g.totalAmount, 0);

    return {
      label,
      formatType,
      openingBal: effectiveOpeningBal,
      rawPriorBal: openingBal,
      periodGave,
      periodReceived,
      closingBal: runningBal,
      netTurnover: periodReceived - periodGave, // net goods taken vs paid
      inRangeTx: txWithRunning,
      aggregatedGoods,
      totalGoodsAmount,
    };
  };

  // Current screen display data
  const screenData = computePeriodData(
    dateFilterMode,
    customStartDate,
    customEndDate,
    screenStatementType
  );
  const displayTx = [...screenData.inRangeTx].reverse();

  // Open download dialog with currently selected filter mode
  const handleOpenDownloadDialog = () => {
    setDownloadStatementType(screenStatementType);
    setDownloadFilterMode(dateFilterMode === 'all' ? 'this_month' : dateFilterMode);
    setDownloadStartDate(customStartDate);
    setDownloadEndDate(customEndDate);
    setIsDownloadModalOpen(true);
  };

  // Generate reminder text for supplier
  const generateSupplierNote = () => {
    return `শ্রদ্ধেয় ${supplier.name},\n"${shopName}"-এর সাথে আপনার হিসাব খতিয়ান বিবরণী। বর্তমান হিসাব স্থিতি: ${
      supplier.totalPayable > 0 ? 'আমাদের দেনা' : 'অগ্রিম দেওয়া'
    } ৳${formatTaka(Math.abs(supplier.totalPayable), enableBengaliDigits)} টাকা।\nধন্যবাদান্তে,\n${shopName}`;
  };

  // Helper to format item lines in PDF & HTML
  const formatTxItemsHTML = (tx: KhataTransaction) => {
    if (tx.items && tx.items.length > 0) {
      return `
        <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #cbd5e1;">
          <span style="font-size: 10px; font-weight: bold; color: #0284c7; display: block; margin-bottom: 2px;">📦 চালানের মালামাল:</span>
          ${tx.items
            .map(
              (it) => `
            <div style="font-size: 10px; color: #334155; line-height: 1.3;">
              • <strong>${it.name}</strong>: ${it.quantity} ${it.unit} × ৳${it.unitPrice} = <span style="font-weight: bold; color: #0f172a;">৳${it.total}</span>
            </div>
          `
            )
            .join('')}
        </div>
      `;
    }
    if (tx.itemsSummary) {
      return `<div style="font-size: 10px; color: #0369a1; margin-top: 3px;">📦 মালামাল: ${tx.itemsSummary}</div>`;
    }
    return '';
  };

  // PDF Generation
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    setDownloadSuccess(false);

    try {
      const exportData = computePeriodData(
        downloadFilterMode,
        downloadStartDate,
        downloadEndDate,
        downloadStatementType
      );

      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '-9999px';
      iframe.style.top = '0';
      iframe.style.width = '800px';
      iframe.style.height = '1150px';
      iframe.style.border = 'none';
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error('Could not access iframe document');

      const isTurnoverOnly = exportData.formatType === 'turnover_only';

      const rowsHTML = exportData.inRangeTx
        .map(
          (tx, index) => `
          <tr style="border-bottom: 1px solid #e2e8f0; background-color: ${
            index % 2 === 0 ? '#ffffff' : '#f8fafc'
          };">
            <td style="padding: 7px 8px; text-align: center; color: #64748b; font-size: 10px; vertical-align: top;">${
              index + 1
            }</td>
            <td style="padding: 7px 8px; color: #0f172a; font-weight: 600; font-size: 10px; vertical-align: top; white-space: nowrap;">
              ${formatBengaliDate(tx.date)}
              <span style="display: block; font-size: 9px; color: #64748b;">${formatBengaliTime(
                tx.date
              )}</span>
            </td>
            <td style="padding: 7px 8px; color: #334155; font-size: 10px; vertical-align: top;">
              <span style="font-weight: 600; color: #0f172a;">${
                tx.note || (tx.type === 'gave' ? 'টাকা পরিশোধ' : 'পণ্য ক্রয় / চালান')
              }</span>
              ${formatTxItemsHTML(tx)}
            </td>
            <td style="padding: 7px 8px; text-align: right; color: #be123c; font-weight: bold; font-size: 11px; background-color: #fff1f2; vertical-align: top;">
              ${tx.type === 'gave' ? formatTaka(tx.amount, enableBengaliDigits) : '-'}
            </td>
            <td style="padding: 7px 8px; text-align: right; color: #15803d; font-weight: bold; font-size: 11px; vertical-align: top;">
              ${tx.type === 'received' ? formatTaka(tx.amount, enableBengaliDigits) : '-'}
            </td>
            <td style="padding: 7px 8px; text-align: right; font-weight: bold; font-size: 11px; color: ${
              tx.balanceAfter >= 0 ? '#15803d' : '#be123c'
            }; vertical-align: top;">
              ${
                isTurnoverOnly
                  ? `৳ ${formatTaka(tx.balanceAfter, enableBengaliDigits)}`
                  : `${tx.balanceAfter >= 0 ? 'দেবো ' : 'পাবো '}${formatTaka(
                      Math.abs(tx.balanceAfter),
                      enableBengaliDigits
                    )}`
              }
            </td>
          </tr>
        `
        )
        .join('');

      // Aggregated Goods Summary HTML
      const goodsSummaryHTML =
        includeGoodsSummaryInPDF && exportData.aggregatedGoods.length > 0
          ? `
          <div style="margin-top: 20px; border: 1px solid #cbd5e1; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
            <div style="background-color: #f1f5f9; padding: 7px 12px; font-size: 11px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; display: flex; justify-content: space-between;">
              <span>📦 এই স্টেটমেন্টে মহাজন থেকে গ্রহণকৃত মালামালের সারসংক্ষেপ (${exportData.aggregatedGoods.length} প্রকার পণ্য):</span>
              <span style="color: #0284c7;">মোট মাল মূল্য: ${formatTaka(
                exportData.totalGoodsAmount,
                enableBengaliDigits
              )}</span>
            </div>
            <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
              <thead>
                <tr style="background-color: #f8fafc; color: #475569; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 6px 10px; text-align: center; width: 30px;">নং</th>
                  <th style="padding: 6px 10px; text-align: left;">পণ্যের নাম</th>
                  <th style="padding: 6px 10px; text-align: center; width: 120px;">মোট পরিমাণ</th>
                  <th style="padding: 6px 10px; text-align: right; width: 130px;">মোট মূল্য (৳)</th>
                </tr>
              </thead>
              <tbody>
                ${exportData.aggregatedGoods
                  .map(
                    (g, i) => `
                  <tr style="border-bottom: 1px solid #f1f5f9; background-color: ${
                    i % 2 === 0 ? '#ffffff' : '#fafafa'
                  };">
                    <td style="padding: 5px 10px; text-align: center; color: #64748b;">${i + 1}</td>
                    <td style="padding: 5px 10px; font-weight: 600; color: #0f172a;">${g.name}</td>
                    <td style="padding: 5px 10px; text-align: center; font-weight: bold; color: #0369a1;">
                      ${g.totalQuantity} ${g.unit}
                    </td>
                    <td style="padding: 5px 10px; text-align: right; font-weight: bold; color: #0f172a;">
                      ${formatTaka(g.totalAmount, enableBengaliDigits)}
                    </td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
          </div>
        `
          : '';

      const reportTitle = isTurnoverOnly
        ? 'মাসিক / নির্বাচিত সময়ের মহাজন হিসাব স্টেটমেন্ট (পূর্বের দেনা ব্যতীত)'
        : 'চলতি মহাজন খতিয়ান স্টেটমেন্ট (পূর্বের দেনা সহ মোট সমন্বিত হিসাব)';

      const cleanHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${reportTitle} - ${supplier.name}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background-color: #ffffff;
              color: #0f172a;
              margin: 0;
              padding: 28px;
              width: 800px;
            }
            .header-bar {
              border-bottom: 2px solid #0f172a;
              padding-bottom: 14px;
              margin-bottom: 16px;
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
            }
            .shop-title {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
            }
            .report-badge {
              display: inline-block;
              font-size: 11px;
              font-weight: 700;
              padding: 2px 8px;
              border-radius: 4px;
              margin-top: 4px;
              background-color: ${isTurnoverOnly ? '#e0f2fe' : '#f0fdf4'};
              color: ${isTurnoverOnly ? '#0369a1' : '#15803d'};
              border: 1px solid ${isTurnoverOnly ? '#bae6fd' : '#bbf7d0'};
            }
            .info-box {
              background-color: #f8fafc;
              border: 1px solid #cbd5e1;
              border-radius: 8px;
              padding: 10px 14px;
              margin-bottom: 14px;
              display: flex;
              justify-content: space-between;
            }
            .period-strip {
              background-color: #f8fafc;
              border-left: 4px solid ${isTurnoverOnly ? '#0284c7' : '#16a34a'};
              padding: 7px 12px;
              font-size: 11px;
              color: #334155;
              font-weight: bold;
              margin-bottom: 14px;
              border-radius: 4px;
              display: flex;
              justify-content: space-between;
              border-top: 1px solid #e2e8f0;
              border-right: 1px solid #e2e8f0;
              border-bottom: 1px solid #e2e8f0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            th {
              background-color: #1e293b;
              color: #ffffff;
              padding: 8px 8px;
              text-align: left;
              font-weight: 700;
            }
            .footer-sign {
              margin-top: 36px;
              padding-top: 16px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #475569;
            }
            .sign-col {
              text-align: center;
              width: 160px;
            }
            .sign-line {
              border-bottom: 1px dashed #94a3b8;
              height: 36px;
              margin-bottom: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header-bar">
            <div>
              <h1 class="shop-title">${shopName}</h1>
              <span class="report-badge">${reportTitle}</span>
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; color: #64748b;">প্রিন্ট তারিখ: ${formatBengaliDate(
                new Date().toISOString()
              )}</span>
            </div>
          </div>

          <div class="info-box">
            <div>
              <strong style="font-size: 13px; color: #0f172a;">মহাজন: ${supplier.name}</strong>
              ${
                supplier.companyName
                  ? `<div style="font-size: 10px; color: #475569; margin-top: 2px;">প্রতিষ্ঠান: ${supplier.companyName}</div>`
                  : ''
              }
              <div style="font-size: 10px; color: #475569; margin-top: 2px;">মোবাইল: ${
                supplier.phone || 'দেওয়া নেই'
              }</div>
              ${
                supplier.address
                  ? `<div style="font-size: 10px; color: #475569;">ঠিকানা: ${supplier.address}</div>`
                  : ''
              }
            </div>
            <div style="text-align: right;">
              <span style="font-size: 10px; color: #64748b;">
                ${isTurnoverOnly ? 'এই সময়সীমার নিট লেনদেন:' : 'বর্তমান মহাজন দেনা:'}
              </span>
              <div style="font-size: 16px; font-weight: 800; color: ${
                isTurnoverOnly
                  ? '#0284c7'
                  : exportData.closingBal >= 0
                  ? '#15803d'
                  : '#be123c'
              };">
                ${
                  isTurnoverOnly
                    ? `${exportData.netTurnover >= 0 ? '+' : ''}${formatTaka(
                        exportData.netTurnover,
                        enableBengaliDigits
                      )}`
                    : `${exportData.closingBal >= 0 ? 'দেবো ' : 'পাবো '}${formatTaka(
                        Math.abs(exportData.closingBal),
                        enableBengaliDigits
                      )}`
                }
              </div>
            </div>
          </div>

          <div class="period-strip">
            <span>📅 সময়কাল: ${exportData.label}</span>
            ${
              !isTurnoverOnly && exportData.openingBal !== 0
                ? `<span>প্রারম্ভিক দেনা (শুরুর জের): ${
                    exportData.openingBal >= 0 ? 'দেবো ' : 'পাবো '
                  }${formatTaka(Math.abs(exportData.openingBal), enableBengaliDigits)}</span>`
                : isTurnoverOnly
                ? `<span>* শুধুমাত্র এই সময়সীমার লেনদেন (পূর্বের দেনা অন্তর্ভুক্ত নয়)</span>`
                : ''
            }
          </div>

          <table style="border: 1px solid #cbd5e1; border-radius: 6px; overflow: hidden; margin-bottom: 14px;">
            <thead>
              <tr>
                <th style="width: 30px; text-align: center;">নং</th>
                <th style="width: 105px;">তারিখ ও সময়</th>
                <th>বিবরণ ও মালামালের তালিকা</th>
                <th style="width: 95px; text-align: right; background-color: #9f1239;">দিলাম (পরিশোধ)</th>
                <th style="width: 95px; text-align: right; background-color: #166534;">পেলাম (চালান)</th>
                <th style="width: 105px; text-align: right;">${
                  isTurnoverOnly ? 'চলতি পার্থক্য' : 'জের (দেনা)'
                }</th>
              </tr>
            </thead>
            <tbody>
              ${
                !isTurnoverOnly && exportData.openingBal !== 0
                  ? `
                <tr style="background-color: #f8fafc; font-weight: bold; border-bottom: 1px solid #cbd5e1;">
                  <td style="padding: 7px 8px; text-align: center; color: #64748b;">*</td>
                  <td style="padding: 7px 8px; color: #64748b;">পূর্বে</td>
                  <td style="padding: 7px 8px; color: #475569;">প্রারম্ভিক জের / পূর্বের দেনা বাকি</td>
                  <td style="padding: 7px 8px; text-align: right; background-color: #fff1f2;">-</td>
                  <td style="padding: 7px 8px; text-align: right;">-</td>
                  <td style="padding: 7px 8px; text-align: right; color: ${
                    exportData.openingBal >= 0 ? '#15803d' : '#be123c'
                  };">
                    ${exportData.openingBal >= 0 ? 'দেবো ' : 'পাবো '}${formatTaka(
                      Math.abs(exportData.openingBal),
                      enableBengaliDigits
                    )}
                  </td>
                </tr>
              `
                  : ''
              }
              ${
                exportData.inRangeTx.length === 0
                  ? `
                <tr>
                  <td colspan="6" style="padding: 20px; text-align: center; color: #64748b;">
                    এই সময়সীমায় কোনো লেনদেন নেই
                  </td>
                </tr>
              `
                  : rowsHTML
              }
            </tbody>
            <tfoot>
              <tr style="background-color: #f1f5f9; font-weight: bold; border-top: 2px solid #cbd5e1;">
                <td colspan="3" style="padding: 8px; text-align: right; color: #0f172a;">
                  ${isTurnoverOnly ? 'এই সময়কালের মোট লেনদেন:' : 'সর্বমোট যোগফল:'}
                </td>
                <td style="padding: 8px; text-align: right; color: #be123c; font-size: 11px; background-color: #fff1f2;">
                  ${formatTaka(exportData.periodGave, enableBengaliDigits)}
                </td>
                <td style="padding: 8px; text-align: right; color: #15803d; font-size: 11px;">
                  ${formatTaka(exportData.periodReceived, enableBengaliDigits)}
                </td>
                <td style="padding: 8px; text-align: right; color: #0f172a; font-size: 11px;">
                  ${
                    isTurnoverOnly
                      ? `নিট: ${formatTaka(exportData.netTurnover, enableBengaliDigits)}`
                      : `${exportData.closingBal >= 0 ? 'দেবো ' : 'পাবো '}${formatTaka(
                          Math.abs(exportData.closingBal),
                          enableBengaliDigits
                        )}`
                  }
                </td>
              </tr>
            </tfoot>
          </table>

          ${goodsSummaryHTML}

          <div class="footer-sign">
            <div class="sign-col">
              <div class="sign-line"></div>
              <span>সাপ্লায়ার / মহাজন স্বাক্ষর</span>
            </div>
            <div style="text-align: center; font-size: 10px; color: #94a3b8; padding-top: 12px;">
              * ডিজিটাল ট্যালি খাতা স্টেটমেন্ট রিপোর্ট
            </div>
            <div class="sign-col">
              <div class="sign-line"></div>
              <strong style="color: #0f172a;">দোকানদারের সিল ও স্বাক্ষর</strong>
            </div>
          </div>
        </body>
        </html>
      `;

      iframeDoc.open();
      iframeDoc.write(cleanHTML);
      iframeDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
      });

      iframe.remove();

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const safeSuppName = supplier.name.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const safeDate = new Date().toISOString().split('T')[0];
      const typeStr = isTurnoverOnly ? 'Turnover_Statement' : 'Ledger_Statement';
      const fileName = `${safeSuppName}_${typeStr}_${downloadFilterMode}_${safeDate}.pdf`;

      pdf.save(fileName);
      setDownloadSuccess(true);
      setIsDownloadModalOpen(false);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export error:', err);
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const isPayable = supplier.totalPayable > 0;
  const isAdvance = supplier.totalPayable < 0;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col max-w-xl mx-auto shadow-2xl overflow-hidden font-sans select-none">
      {/* =========================================================================
          TOP APP BAR (Matching Screenshot: Back arrow, Orange Avatar, Name+Status, Download)
          ========================================================================= */}
      <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button to close report and return to profile */}
          <button
            onClick={onClose}
            className="p-1.5 -ml-1 text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>

          {/* Orange round avatar */}
          <div className="w-11 h-11 rounded-full bg-[#f97316] text-white flex items-center justify-center font-bold text-sm uppercase shrink-0 shadow-xs">
            {supplier.name.slice(0, 2)}
          </div>

          {/* Name & Balance Status */}
          <div className="min-w-0">
            <h2 className="text-base font-bold text-slate-900 leading-tight truncate">
              {supplier.name}
            </h2>
            <p
              className={`text-xs font-bold font-mono mt-0.5 ${
                isPayable ? 'text-emerald-600' : isAdvance ? 'text-red-600' : 'text-emerald-600'
              }`}
            >
              {isPayable
                ? `দেবো ${formatTaka(supplier.totalPayable, enableBengaliDigits)}`
                : isAdvance
                ? `পাবো ${formatTaka(Math.abs(supplier.totalPayable), enableBengaliDigits)}`
                : 'দেবো ০.০০'}
            </p>
          </div>
        </div>

        {/* Download Button on Top Right (Opens Two-Type Statement Modal) */}
        <button
          onClick={handleOpenDownloadDialog}
          disabled={isGeneratingPDF}
          className="flex flex-col items-center justify-center p-1.5 hover:bg-slate-100 active:scale-95 rounded-xl transition cursor-pointer text-slate-700 shrink-0"
          title="স্টেটমেন্ট PDF ডাউনলোড (২ ধরণের স্টেটমেন্ট অপশন)"
          aria-label="স্টেটমেন্ট ডাউনলোড"
        >
          {isGeneratingPDF ? (
            <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
          ) : (
            <Download className="w-5 h-5 text-slate-800 stroke-[2.2]" />
          )}
          <span className="text-[10px] font-bold text-slate-800 mt-0.5">
            {isGeneratingPDF ? 'তৈরি...' : 'ডাউনলোড'}
          </span>
        </button>
      </header>

      {/* Success notification banner after download */}
      {downloadSuccess && (
        <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition">
          <Check className="w-4 h-4" />
          <span>স্টেটমেন্ট PDF সফলভাবে ডাউনলোড সম্পন্ন হয়েছে!</span>
        </div>
      )}

      {/* =========================================================================
          STATEMENT TYPE SWITCHER & DATE FILTER BAR (Two-Way Statement Mode)
          ========================================================================= */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200/80 shrink-0 space-y-2">
        {/* Toggle between Type 1 (Turnover Only) and Type 2 (Full Ledger with Prior Balance) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setScreenStatementType('with_balance')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              screenStatementType === 'with_balance'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>পূর্বের জের সহ মোট দেনা</span>
          </button>

          <button
            type="button"
            onClick={() => setScreenStatementType('turnover_only')}
            className={`flex-1 py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              screenStatementType === 'turnover_only'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>শুধু এই সময়ের মাল/পরিশোধ</span>
          </button>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
          <button
            onClick={() => setDateFilterMode('all')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 ${
              dateFilterMode === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            সব
          </button>

          <button
            onClick={() => setDateFilterMode('this_month')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              dateFilterMode === 'this_month'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>চলতি মাস ({BENGALI_MONTHS[now.getMonth()]})</span>
          </button>

          <button
            onClick={() => setDateFilterMode('last_month')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              dateFilterMode === 'last_month'
                ? 'bg-indigo-700 text-white shadow-xs'
                : 'bg-white text-indigo-800 hover:bg-indigo-50 border border-indigo-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>গত মাস ({BENGALI_MONTHS[lastMonthDate.getMonth()]})</span>
          </button>

          <button
            onClick={() => setDateFilterMode('custom')}
            className={`px-3 py-1 rounded-xl font-bold transition cursor-pointer shrink-0 flex items-center gap-1 ${
              dateFilterMode === 'custom'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-amber-800 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>ইচ্ছামতো তারিখ</span>
          </button>
        </div>

        {/* Custom Date Range Picker Fields */}
        {dateFilterMode === 'custom' && (
          <div className="bg-white p-2.5 rounded-xl border border-amber-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold text-[11px]">হতে:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-bold text-[11px]">পর্যন্ত:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md">
              {displayTx.length} টি লেনদেন
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          TAGADA ACTION CHIP (Matching Screenshot: 🔔 তাগাদা মেসেজ পাঠাই)
          ========================================================================= */}
      <div className="px-4 pt-2.5 pb-1.5 shrink-0">
        <button
          onClick={() => setIsTagadaOpen(true)}
          className="w-full py-2.5 px-4 bg-[#f1f5f9] hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer active:scale-98"
        >
          <Bell className="w-4 h-4 text-slate-500" />
          <span>যোগাযোগ ও হিসাব মেসেজ</span>
        </button>
      </div>

      {/* =========================================================================
          INFO CALLOUT BANNER (Matching Screenshot: ℹ️ লেনদেন রেকর্ড এডিট/ডিলিট...)
          ========================================================================= */}
      {showInfoBanner && (
        <div className="mx-4 mb-1.5 bg-[#f0f9ff] text-[#0369a1] border border-sky-100 rounded-xl px-3 py-2 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center shrink-0">
              <Info className="w-3.5 h-3.5" />
            </div>
            <span className="truncate">লেনদেন রেকর্ড এডিট/ডিলিট করতে লেনদেনের উপর ট্যাপ করুন।</span>
          </div>
          <button
            onClick={() => setShowInfoBanner(false)}
            className="w-5 h-5 rounded-full bg-slate-600 hover:bg-slate-800 text-white flex items-center justify-center text-xs shrink-0 cursor-pointer ml-2"
            title="লুকান"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* =========================================================================
          REPORT SHARE TOGGLE ROW (Matching Screenshot)
          ========================================================================= */}
      <div className="px-4 py-1.5 flex items-center justify-between text-xs font-bold text-slate-700 border-b border-slate-100 shrink-0">
        <span>রিপোর্ট শেয়ার</span>
        <button
          onClick={() => setReportShare(!reportShare)}
          className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
            reportShare ? 'bg-[#dc2626]' : 'bg-slate-300'
          }`}
          title="রিপোর্ট শেয়ার অন/অফ করুন"
        >
          <span
            className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
              reportShare ? 'right-1' : 'left-1'
            }`}
          />
        </button>
      </div>

      {/* Quick Share Options Bar if reportShare is toggled on */}
      {reportShare && (
        <div className="px-4 py-2 bg-rose-50 border-b border-rose-100 flex items-center justify-between gap-2 text-xs text-rose-800 shrink-0">
          <span className="font-semibold">শেয়ার করতে বেছে নিন:</span>
          <div className="flex items-center gap-2">
            {supplier.phone && (
              <a
                href={getWhatsAppShareUrl(supplier.phone, generateSupplierNote())}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg font-bold flex items-center gap-1 hover:bg-emerald-700"
              >
                <Share2 className="w-3 h-3" />
                <span>হোয়াটসঅ্যাপ</span>
              </a>
            )}
            <button
              onClick={() => {
                navigator.clipboard.writeText(generateSupplierNote());
                alert('হিসাবের বিস্তারিত টেক্সট কপি হয়েছে!');
              }}
              className="px-2.5 py-1 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900"
            >
              কপি
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
          3-COLUMN TABLE HEADER (Matching Screenshot: লেনদেনের বিবরণ | দিলাম | পেলাম)
          ========================================================================= */}
      <div className="bg-[#f3f4f6] border-y border-slate-200 grid grid-cols-12 text-xs font-bold text-slate-600 select-none shrink-0">
        <div className="col-span-5 px-3 py-2.5 text-left">লেনদেনের বিবরণ ও মালামাল</div>
        <div className="col-span-3 px-2 py-2.5 text-center bg-[#fff1f2] border-x border-slate-200 text-slate-700">
          দিলাম
        </div>
        <div className="col-span-4 px-3 py-2.5 text-right text-slate-700">পেলাম</div>
      </div>

      {/* =========================================================================
          SCROLLABLE TRANSACTION ROWS (With itemized product breakdown)
          ========================================================================= */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-200/90 bg-white">
        {/* Prior Balance Row for Type 2 (with_balance) */}
        {screenStatementType === 'with_balance' && screenData.openingBal !== 0 && (
          <div className="grid grid-cols-12 items-center bg-slate-50 px-3 py-2.5 text-xs border-b border-slate-200">
            <div className="col-span-5">
              <span className="font-bold text-slate-700 block">প্রারম্ভিক জের (পূর্বের দেনা)</span>
              <span className="text-[10px] text-slate-400">এই সময়কালের পূর্বে</span>
            </div>
            <div className="col-span-3 text-center bg-[#fff1f2] py-1 border-x border-slate-200 text-slate-400 font-mono text-xs">
              -
            </div>
            <div className="col-span-4 text-right">
              <span
                className={`font-mono font-bold text-xs ${
                  screenData.openingBal >= 0 ? 'text-[#16a34a]' : 'text-[#be123c]'
                }`}
              >
                {screenData.openingBal >= 0 ? 'দেবো ' : 'পাবো '}
                {formatTaka(Math.abs(screenData.openingBal), enableBengaliDigits)}
              </span>
            </div>
          </div>
        )}

        {displayTx.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold">এই সময়সীমায় কোনো লেনদেন রেকর্ড নেই</p>
            <p className="text-xs text-slate-400 mt-1">তারিখ বা স্টেটমেন্টের ধরন পরিবর্তন করে দেখুন</p>
          </div>
        ) : (
          displayTx.map((tx) => {
            const isGave = tx.type === 'gave';
            const isReceived = tx.type === 'received';

            return (
              <div
                key={tx.id}
                onClick={() => setSelectedTxForAction(tx)}
                className="grid grid-cols-12 items-start hover:bg-slate-50 transition cursor-pointer select-none group py-1"
              >
                {/* Col 1: Date, Time, Itemized Goods, Notes, Running Balance Pill */}
                <div className="col-span-5 px-3 py-2 text-left space-y-1">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {tx.isEarliest
                      ? `শুরু ${formatBengaliDateString(tx.date)}`
                      : formatBengaliDateString(tx.date)}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    {formatBengaliTime(tx.date)}
                  </div>

                  {/* ITEM DETAILS (মালামাল চালান তালিকা) */}
                  {tx.items && tx.items.length > 0 ? (
                    <div className="mt-1 p-1.5 bg-purple-50/70 border border-purple-200 rounded-lg space-y-0.5">
                      <span className="text-[10px] font-bold text-purple-900 flex items-center gap-1">
                        <Package className="w-3 h-3 text-purple-600 shrink-0" />
                        <span>চালানের মাল:</span>
                      </span>
                      {tx.items.map((it, idx) => (
                        <div key={idx} className="text-[10px] text-slate-700 leading-tight">
                          • <strong className="text-slate-900">{it.name}</strong> ({it.quantity} {it.unit} × ৳{it.unitPrice}) = <span className="font-mono font-bold text-purple-700">৳{it.total}</span>
                        </div>
                      ))}
                    </div>
                  ) : tx.itemsSummary ? (
                    <div className="text-[10px] text-purple-900 bg-purple-50/80 px-1.5 py-0.5 rounded border border-purple-200 mt-1">
                      📦 {tx.itemsSummary}
                    </div>
                  ) : null}

                  {tx.note && (
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{tx.note}</p>
                  )}

                  {/* Running Balance Pill */}
                  <div className="pt-0.5">
                    <span className="inline-block bg-[#f1f5f9] text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold">
                      {screenStatementType === 'turnover_only'
                        ? `চলতি: ${formatTaka(tx.balanceAfter, enableBengaliDigits)}`
                        : `${tx.balanceAfter >= 0 ? 'দেবো ' : 'পাবো '}${formatTaka(
                            Math.abs(tx.balanceAfter),
                            enableBengaliDigits
                          )}`}
                    </span>
                  </div>
                </div>

                {/* Col 2: দিলাম (Red amount in pink column) */}
                <div className="col-span-3 px-2 py-4 text-center bg-[#fff1f2] border-x border-slate-200 h-full flex items-center justify-center">
                  <span
                    className={`font-mono text-xs sm:text-sm font-extrabold ${
                      isGave ? 'text-[#be123c]' : 'text-slate-300'
                    }`}
                  >
                    {isGave ? formatTaka(tx.amount, enableBengaliDigits) : '০.০০'}
                  </span>
                </div>

                {/* Col 3: পেলাম (Green amount) */}
                <div className="col-span-4 px-3 py-4 text-right h-full flex items-center justify-end">
                  <span
                    className={`font-mono text-xs sm:text-sm font-extrabold ${
                      isReceived ? 'text-[#16a34a]' : 'text-slate-300'
                    }`}
                  >
                    {isReceived ? formatTaka(tx.amount, enableBengaliDigits) : '০.০০'}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {/* Aggregated Goods Summary Block (মহাজন থেকে ক্রয়কৃত মালামালের সারসংক্ষেপ) */}
        {showGoodsSummarySection && screenData.aggregatedGoods.length > 0 && (
          <div className="p-3 bg-gradient-to-r from-purple-50/80 via-indigo-50/60 to-slate-50 border-t-2 border-purple-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-600" />
                <span>এই সময়সীমায় গ্রহণকৃত মালামালের সারসংক্ষেপ ({screenData.aggregatedGoods.length} প্রকার পণ্য)</span>
              </span>
              <span className="text-xs font-mono font-extrabold text-purple-700 bg-white px-2 py-0.5 rounded-md border border-purple-200">
                মোট: {formatTaka(screenData.totalGoodsAmount, enableBengaliDigits)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
              {screenData.aggregatedGoods.map((g, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-purple-100 flex items-center justify-between shadow-2xs">
                  <div>
                    <span className="font-bold text-slate-800 block text-xs">{g.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      মোট চালানের মাল: {g.totalQuantity} {g.unit}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-purple-700 text-xs">
                    ৳{formatTaka(g.totalAmount, enableBengaliDigits)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          BOTTOM SUMMARY ROW (Matching Screenshot: মোট | দিলাম মোট | পেলাম মোট)
          ========================================================================= */}
      <div className="bg-white border-t-2 border-slate-300 grid grid-cols-12 text-xs sm:text-sm font-extrabold shrink-0 shadow-lg select-none">
        <div className="col-span-5 px-3 py-3 text-left text-slate-900 flex flex-col justify-center">
          <span>মোট</span>
          {screenStatementType === 'turnover_only' && (
            <span className="text-[10px] font-normal text-purple-700">
              নিট লেনদেন: {formatTaka(screenData.netTurnover, enableBengaliDigits)}
            </span>
          )}
        </div>
        <div className="col-span-3 px-2 py-3 text-center text-[#be123c] bg-[#fff1f2] border-x border-slate-200 font-mono">
          {formatTaka(screenData.periodGave, enableBengaliDigits)}
        </div>
        <div className="col-span-4 px-3 py-3 text-right text-[#16a34a] font-mono">
          {formatTaka(screenData.periodReceived, enableBengaliDigits)}
        </div>
      </div>

      {/* =========================================================================
          DOWNLOAD OPTIONS MODAL (Two-Way Statement: Isolated Month vs Comprehensive Ledger)
          ========================================================================= */}
      {isDownloadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">মহাজন স্টেটমেন্ট PDF ডাউনলোড অপশন</h3>
              </div>
              <button
                onClick={() => setIsDownloadModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SECTION 1: Two Distinct Statement Formats */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                ১. স্টেটমেন্টের ধরন নির্বাচন করুন:
              </label>

              {/* Format 1: Isolated Monthly Statement (Turnover only) */}
              <label
                onClick={() => setDownloadStatementType('turnover_only')}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                  downloadStatementType === 'turnover_only'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="suppStmtFormat"
                  checked={downloadStatementType === 'turnover_only'}
                  onChange={() => setDownloadStatementType('turnover_only')}
                  className="accent-emerald-600 w-4 h-4 mt-0.5 shrink-0"
                />
                <div>
                  <span className="block text-xs font-bold">
                    🎯 শুধুমাত্র ওই মাসের/সময়ের মহাজন হিসাব স্টেটমেন্ট
                  </span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    পূর্বের দেনা ব্যতীত; শুধুমাত্র নির্বাচিত সময়ে ওই মহাজনের কাছ থেকে কত মাল এলো ও কত পরিশোধ করা হলো।
                  </span>
                </div>
              </label>

              {/* Format 2: Full Running Ledger (With Prior Balance) */}
              <label
                onClick={() => setDownloadStatementType('with_balance')}
                className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                  downloadStatementType === 'with_balance'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <input
                  type="radio"
                  name="suppStmtFormat"
                  checked={downloadStatementType === 'with_balance'}
                  onChange={() => setDownloadStatementType('with_balance')}
                  className="accent-emerald-600 w-4 h-4 mt-0.5 shrink-0"
                />
                <div>
                  <span className="block text-xs font-bold">
                    🔄 পূর্বের জের সহ সম্পূর্ণ সমন্বিত খতিয়ান স্টেটমেন্ট
                  </span>
                  <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                    আগের মাসের দেনা/জের + বর্তমান মাসের লেনদেন মিলিয়ে সর্বশেষ সমন্বিত দেনা ও সমাপনী জের।
                  </span>
                </div>
              </label>
            </div>

            {/* SECTION 2: Period Selection */}
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                ২. সময়সীমা নির্বাচন করুন:
              </label>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDownloadFilterMode('this_month')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition ${
                    downloadFilterMode === 'this_month'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">চলতি মাস</span>
                  <span className="text-[10px] text-slate-500 font-normal">{currentMonthLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadFilterMode('last_month')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition ${
                    downloadFilterMode === 'last_month'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">গত মাস</span>
                  <span className="text-[10px] text-slate-500 font-normal">{lastMonthLabel}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadFilterMode('all')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition ${
                    downloadFilterMode === 'all'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">সকল লেনদেন</span>
                  <span className="text-[10px] text-slate-500 font-normal">শুরু থেকে আজ পর্যন্ত</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDownloadFilterMode('custom')}
                  className={`p-2.5 rounded-xl border text-left font-bold transition ${
                    downloadFilterMode === 'custom'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs">ইচ্ছামতো তারিখ</span>
                  <span className="text-[10px] text-slate-500 font-normal">কাস্টম রেঞ্জ</span>
                </button>
              </div>

              {downloadFilterMode === 'custom' && (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold text-slate-600 mb-0.5">হতে:</span>
                    <input
                      type="date"
                      value={downloadStartDate}
                      onChange={(e) => setDownloadStartDate(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-600 mb-0.5">পর্যন্ত:</span>
                    <input
                      type="date"
                      value={downloadEndDate}
                      onChange={(e) => setDownloadEndDate(e.target.value)}
                      className="w-full px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 3: Itemized Goods Option */}
            <div className="pt-1 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={includeGoodsSummaryInPDF}
                  onChange={(e) => setIncludeGoodsSummaryInPDF(e.target.checked)}
                  className="accent-emerald-600 w-4 h-4 rounded"
                />
                <span>স্টেটমেন্টে মহাজন থেকে নেওয়া মালামালের বিস্তারিত তালিকা ও মোট সারসংক্ষেপ যুক্ত রাখুন</span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDownloadModalOpen(false)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                বাতিল
              </button>

              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition cursor-pointer shadow-md disabled:bg-slate-300"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>পিডিএফ তৈরি হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>পিডিএফ স্টেটমেন্ট ডাউনলোড করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TRANSACTION ACTION MODAL (Edit / Delete on row tap)
          ========================================================================= */}
      {selectedTxForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">লেনদেন বিবরণ ও অ্যাকশন</h3>
              <button
                onClick={() => setSelectedTxForAction(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">লেনদেনের ধরন:</span>
                <span
                  className={`font-bold ${
                    selectedTxForAction.type === 'gave' ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedTxForAction.type === 'gave' ? 'দিলাম (টাকা পরিশোধ)' : 'পেলাম (চালান মাল)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">টাকার পরিমাণ:</span>
                <span className="font-bold font-mono text-sm text-slate-900">
                  ৳ {formatTaka(selectedTxForAction.amount, enableBengaliDigits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">তারিখ ও সময়:</span>
                <span className="font-medium text-slate-800">
                  {formatBengaliDateString(selectedTxForAction.date)},{' '}
                  {formatBengaliTime(selectedTxForAction.date)}
                </span>
              </div>

              {selectedTxForAction.items && selectedTxForAction.items.length > 0 && (
                <div className="pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500 block mb-1 font-bold">চালানের মালামাল:</span>
                  <div className="space-y-1">
                    {selectedTxForAction.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-800 bg-white p-1 rounded border border-slate-200">
                        <span>{it.name} ({it.quantity} {it.unit})</span>
                        <span className="font-mono font-bold">৳{it.total}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTxForAction.note && (
                <div className="pt-1 border-t border-slate-200">
                  <span className="text-slate-500 block mb-0.5">বিবরণ:</span>
                  <span className="font-medium text-slate-800">{selectedTxForAction.note}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  if (
                    confirm(
                      `আপনি কি নিশ্চিত যে ৳${selectedTxForAction.amount} টাকার এই লেনদেনটি মুছে ফেলতে চান?`
                    )
                  ) {
                    const delta =
                      selectedTxForAction.type === 'gave'
                        ? selectedTxForAction.amount
                        : -selectedTxForAction.amount;
                    onDeleteTransaction?.(selectedTxForAction.id, supplier.id, delta);
                    setSelectedTxForAction(null);
                  }
                }}
                className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>লেনদেন মুছুন</span>
              </button>

              <button
                onClick={() => setSelectedTxForAction(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                বন্ধ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAGADA / CONTACT MODAL
          ========================================================================= */}
      {isTagadaOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-sm text-slate-900">মহাজন যোগাযোগ বার্তা</h3>
              </div>
              <button
                onClick={() => setIsTagadaOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-line leading-relaxed font-sans">
              {generateSupplierNote()}
            </div>

            <div className="flex flex-col gap-2 pt-1">
              {supplier.phone && (
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${supplier.phone}`}
                    className="py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>কল করুন</span>
                  </a>
                  <a
                    href={getWhatsAppShareUrl(supplier.phone, generateSupplierNote())}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>হোয়াটসঅ্যাপ</span>
                  </a>
                </div>
              )}

              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateSupplierNote());
                  setTagadaCopied(true);
                  setTimeout(() => setTagadaCopied(false), 2000);
                }}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
              >
                {tagadaCopied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>মেসেজ কপি হয়েছে!</span>
                  </>
                ) : (
                  <span>মেসেজ টেক্সট কপি করুন (SMS)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
