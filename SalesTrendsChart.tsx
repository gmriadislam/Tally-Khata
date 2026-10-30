import React, { useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp, Calendar, ShoppingBag, Award, BarChart3, LineChart } from 'lucide-react';
import { Bill, CashEntry, KhataTransaction } from '../types';
import { formatTaka, toBengaliNumber } from '../utils/formatters';

interface SalesTrendsChartProps {
  bills?: Bill[];
  cashEntries?: CashEntry[];
  transactions?: KhataTransaction[];
  enableBengaliDigits?: boolean;
}

interface DailyPoint {
  dateStr: string;
  displayDay: string;
  fullDateLabel: string;
  totalSales: number;
  cashSales: number;
  creditSales: number;
  orderCount: number;
}

export default function SalesTrendsChart({
  bills = [],
  cashEntries = [],
  transactions = [],
  enableBengaliDigits = false,
}: SalesTrendsChartProps) {
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  // Compute daily sales volume for the last 30 days
  const { chartData, total30DaySales, avgDailySales, peakSales, peakDayLabel, activeDaysCount, totalOrders } =
    useMemo(() => {
      const today = new Date();
      const points: DailyPoint[] = [];

      // Generate 30 days backwards up to today
      for (let i = 29; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        const monthNamesBn = [
          'জানু',
          'ফেব্রু',
          'মার্চ',
          'এপ্রিল',
          'মে',
          'জুন',
          'জুলাই',
          'আগস্ট',
          'সেপ্টে',
          'অক্টো',
          'নভে',
          'ডিসে',
        ];
        const monthNamesEn = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];

        const dayNum = d.getDate();
        const mIdx = d.getMonth();
        const displayDay = enableBengaliDigits
          ? `${toBengaliNumber(dayNum)} ${monthNamesBn[mIdx]}`
          : `${dayNum} ${monthNamesEn[mIdx]}`;

        const fullDateLabel = d.toLocaleDateString(enableBengaliDigits ? 'bn-BD' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        points.push({
          dateStr,
          displayDay,
          fullDateLabel,
          totalSales: 0,
          cashSales: 0,
          creditSales: 0,
          orderCount: 0,
        });
      }

      const pointMap = new Map<string, DailyPoint>();
      points.forEach((p) => pointMap.set(p.dateStr, p));

      // 1. Process Bills (Sales Memos)
      bills.forEach((b) => {
        if (!b.date) return;
        const dKey = b.date.slice(0, 10);
        const p = pointMap.get(dKey);
        if (p) {
          const grandTotal = b.grandTotal || 0;
          p.totalSales += grandTotal;
          p.cashSales += b.paidAmount || 0;
          p.creditSales += b.dueAmount || 0;
          p.orderCount += 1;
        }
      });

      // 2. Process Cash Entries (Cash Sales not already created by bills)
      cashEntries.forEach((c) => {
        if (!c.date || c.type !== 'in') return;
        const isSaleCategory =
          c.category === 'নগদ বিক্রি' ||
          c.category.includes('বিক্রি') ||
          c.category.includes('বেতন') ||
          c.category.includes('আয়');

        if (!isSaleCategory) return;

        // Skip if generated from a bill memo to avoid duplication
        const isFromBill =
          c.note && (c.note.includes('বিক্রি মেমো') || c.note.includes('বিল #'));
        if (isFromBill) return;

        const dKey = c.date.slice(0, 10);
        const p = pointMap.get(dKey);
        if (p) {
          p.totalSales += c.amount;
          p.cashSales += c.amount;
          p.orderCount += 1;
        }
      });

      // 3. Process Khata Transactions (Credit sales given to customers not in bills)
      transactions.forEach((tx) => {
        if (!tx.date || tx.partyType !== 'customer' || tx.type !== 'gave') return;

        // Skip if generated from a bill memo
        const isFromBill = tx.billNumber || (tx.note && tx.note.includes('বিল #'));
        if (isFromBill) return;

        const dKey = tx.date.slice(0, 10);
        const p = pointMap.get(dKey);
        if (p) {
          p.totalSales += tx.amount;
          p.creditSales += tx.amount;
          p.orderCount += 1;
        }
      });

      // Calculate aggregates
      let total = 0;
      let orders = 0;
      let activeDays = 0;
      let maxSale = 0;
      let maxPoint: DailyPoint | null = null;

      points.forEach((p) => {
        total += p.totalSales;
        orders += p.orderCount;
        if (p.totalSales > 0) {
          activeDays++;
          if (p.totalSales > maxSale) {
            maxSale = p.totalSales;
            maxPoint = p;
          }
        }
      });

      const avg = total / 30;

      return {
        chartData: points,
        total30DaySales: total,
        avgDailySales: avg,
        peakSales: maxSale,
        peakDayLabel: maxPoint ? (maxPoint as DailyPoint).displayDay : '',
        activeDaysCount: activeDays,
        totalOrders: orders,
      };
    }, [bills, cashEntries, transactions, enableBengaliDigits]);

  // Custom sleek Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: DailyPoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs min-w-[170px] z-50">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium mb-1.5 pb-1 border-b border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{data.fullDateLabel}</span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-semibold">মোট বিক্রয়:</span>
              <span className="font-bold text-emerald-400 font-mono text-sm">
                {formatTaka(data.totalSales, enableBengaliDigits)}
              </span>
            </div>

            {data.cashSales > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>নগদ বিক্রি:</span>
                <span className="font-mono text-emerald-300">
                  {formatTaka(data.cashSales, enableBengaliDigits)}
                </span>
              </div>
            )}

            {data.creditSales > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>বাকি বিক্রি:</span>
                <span className="font-mono text-amber-300">
                  {formatTaka(data.creditSales, enableBengaliDigits)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">
              <span>অর্ডার/এন্ট্রি:</span>
              <span className="font-bold text-white">
                {enableBengaliDigits ? toBengaliNumber(data.orderCount) : data.orderCount} টি
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200/80 shadow-xs p-4 sm:p-5 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-2xs">
              <TrendingUp className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>বিক্রয় ট্রেন্ড (Sales Trends)</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold border border-amber-200">
                  গত ৩০ দিন
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                দৈনিক মোট বিক্রয়ের পরিমাণ (Daily Total Sales Volume)
              </p>
            </div>
          </div>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setChartType('area')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              chartType === 'area'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>এরিয়া চার্ট</span>
          </button>
          <button
            type="button"
            onClick={() => setChartType('bar')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>বার চার্ট</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Mini-Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-100">
          <span className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
            <ShoppingBag className="w-3 h-3 text-amber-600" />
            <span>৩০ দিনের মোট বিক্রি</span>
          </span>
          <p className="text-base sm:text-lg font-extrabold text-amber-900 font-mono mt-0.5">
            {formatTaka(total30DaySales, enableBengaliDigits)}
          </p>
        </div>

        <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
          <span className="text-[11px] font-semibold text-emerald-900 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-600" />
            <span>দৈনিক গড় বিক্রি</span>
          </span>
          <p className="text-base sm:text-lg font-extrabold text-emerald-800 font-mono mt-0.5">
            {formatTaka(Math.round(avgDailySales), enableBengaliDigits)}
          </p>
        </div>

        <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100">
          <span className="text-[11px] font-semibold text-indigo-900 flex items-center gap-1">
            <Award className="w-3 h-3 text-indigo-600" />
            <span>সর্বোচ্চ বিক্রি দিন</span>
          </span>
          <p className="text-base sm:text-lg font-extrabold text-indigo-900 font-mono mt-0.5 truncate">
            {peakSales > 0 ? formatTaka(peakSales, enableBengaliDigits) : '৳ ০'}
          </p>
          {peakDayLabel && (
            <span className="text-[10px] text-indigo-600 block mt-0.5 truncate">
              {peakDayLabel}
            </span>
          )}
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>সক্রিয় বিক্রয় দিন</span>
          </span>
          <p className="text-base sm:text-lg font-extrabold text-slate-800 font-mono mt-0.5">
            {enableBengaliDigits ? toBengaliNumber(activeDaysCount) : activeDaysCount} /{' '}
            {enableBengaliDigits ? toBengaliNumber(30) : '30'} দিন
          </p>
        </div>
      </div>

      {/* Main Recharts Visualization */}
      <div className="w-full h-64 sm:h-72 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#d97706" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#d97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="displayDay"
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval={4}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(val) => {
                  if (val >= 1000) return `${Math.round(val / 1000)}k`;
                  return `${val}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="totalSales"
                stroke="#d97706"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#salesGradient)"
                activeDot={{ r: 6, fill: '#b45309', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="displayDay"
                tick={{ fontSize: 10, fill: '#64748b' }}
                interval={4}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#64748b' }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
                tickFormatter={(val) => {
                  if (val >= 1000) return `${Math.round(val / 1000)}k`;
                  return `${val}`;
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="totalSales"
                fill="#d97706"
                radius={[4, 4, 0, 0]}
                maxBarSize={18}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
          <span>দৈনিক বিক্রয় ভলিউম (নগদ ও বাকি বিক্রয় মিলিয়ে)</span>
        </span>
        <span>
          মোট অর্ডার: <strong className="text-slate-800 font-mono">{enableBengaliDigits ? toBengaliNumber(totalOrders) : totalOrders}</strong> টি
        </span>
      </div>
    </div>
  );
}
