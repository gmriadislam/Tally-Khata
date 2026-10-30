import { useState } from 'react';
import { X, Delete, Copy, Check } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUseValue?: (val: number) => void;
}

export default function CalculatorModal({ isOpen, onClose, onUseValue }: CalculatorModalProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (d: string) => {
    if (display === '0' || display === 'ত্রুটি') {
      setDisplay(d);
    } else {
      setDisplay(display + d);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpr = equation + display;
      // Sanitize expression
      const cleanExpr = fullExpr.replace(/×/g, '*').replace(/÷/g, '/');
      if (!/^[\d\s+\-*/.]+$/.test(cleanExpr)) {
        setDisplay('ত্রুটি');
        return;
      }
      // Simple evaluator
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${cleanExpr})`)();
      const finalVal = Math.round(result * 100) / 100;
      setDisplay(finalVal.toString());
      setEquation('');
    } catch {
      setDisplay('ত্রুটি');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const applyValue = () => {
    const num = parseFloat(display);
    if (!isNaN(num) && onUseValue) {
      onUseValue(num);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-base">দোকানদার ক্যালকুলেটর</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 p-5 text-right">
          <div className="h-5 text-xs text-emerald-400 font-mono tracking-wider overflow-hidden">
            {equation || ' '}
          </div>
          <div className="text-3xl font-bold text-white font-mono tracking-tight overflow-x-auto whitespace-nowrap mt-1">
            {display}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-200 text-xs">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 px-2.5 py-1 text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 font-medium"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
          </button>

          {onUseValue && (
            <button
              onClick={applyValue}
              className="px-3 py-1 bg-emerald-600 text-white rounded-md font-medium hover:bg-emerald-700 shadow-xs"
            >
              টাকা হিসাবে বসান
            </button>
          )}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-2 p-4 bg-slate-50">
          <button
            onClick={handleClear}
            className="py-3 text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl text-lg border border-red-200 transition"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="py-3 flex items-center justify-center text-slate-700 bg-white hover:bg-slate-100 font-bold rounded-xl text-lg border border-slate-200 transition"
          >
            <Delete className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOperator('%')}
            className="py-3 text-slate-700 bg-white hover:bg-slate-100 font-bold rounded-xl text-lg border border-slate-200 transition"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className="py-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-xl text-xl border border-indigo-200 transition"
          >
            ÷
          </button>

          {['7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="py-3.5 text-slate-800 bg-white hover:bg-slate-100 font-semibold rounded-xl text-xl border border-slate-200 shadow-xs transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperator('×')}
            className="py-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-xl text-xl border border-indigo-200 transition"
          >
            ×
          </button>

          {['4', '5', '6'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="py-3.5 text-slate-800 bg-white hover:bg-slate-100 font-semibold rounded-xl text-xl border border-slate-200 shadow-xs transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperator('-')}
            className="py-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-xl text-xl border border-indigo-200 transition"
          >
            -
          </button>

          {['1', '2', '3'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="py-3.5 text-slate-800 bg-white hover:bg-slate-100 font-semibold rounded-xl text-xl border border-slate-200 shadow-xs transition"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperator('+')}
            className="py-3 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold rounded-xl text-xl border border-indigo-200 transition"
          >
            +
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="py-3.5 text-slate-800 bg-white hover:bg-slate-100 font-semibold rounded-xl text-xl border border-slate-200 shadow-xs transition"
          >
            0
          </button>
          <button
            onClick={() => handleDigit('00')}
            className="py-3.5 text-slate-800 bg-white hover:bg-slate-100 font-semibold rounded-xl text-base border border-slate-200 shadow-xs transition"
          >
            00
          </button>
          <button
            onClick={() => handleDigit('.')}
            className="py-3.5 text-slate-800 bg-white hover:bg-slate-100 font-bold rounded-xl text-xl border border-slate-200 shadow-xs transition"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="py-3 text-white bg-emerald-600 hover:bg-emerald-700 font-bold rounded-xl text-2xl shadow-md transition"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
