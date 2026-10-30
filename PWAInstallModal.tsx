import { useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  Share2,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  Zap,
  WifiOff,
  ShieldCheck,
  Copy,
  Check,
  ExternalLink,
  FileCode,
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PWAInstallModal({ isOpen, onClose }: PWAInstallModalProps) {
  const { hasNativePrompt, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [activePlatformTab, setActivePlatformTab] = useState<'android' | 'apk' | 'ios'>(
    isIOS ? 'ios' : 'android'
  );
  const [isInstalling, setIsInstalling] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const appUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleNativeInstall = async () => {
    setIsInstalling(true);
    const success = await promptInstall();
    setIsInstalling(false);
    if (success) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white p-2 shadow-md flex items-center justify-center shrink-0">
              <img src="/pwa-192x192.png" alt="ট্যালি খাতা" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-100 text-[11px] font-semibold mb-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>মোবাইল অ্যাপ ও APK নির্দেশিকা</span>
              </div>
              <h2 className="text-xl font-bold leading-tight">মোবাইলে অ্যাপ হিসেবে ব্যবহার করুন</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                প্লে-স্টোর ছাড়াই আপনার মোবাইলে সরাসরি অ্যাপ হিসেবে ইনস্টল করুন
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* App URL Share & Copy Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-slate-500 font-semibold block">আপনার অ্যাপের সরাসরি লিংক:</span>
              <p className="text-xs font-mono font-medium text-slate-700 truncate">{appUrl}</p>
            </div>
            <button
              onClick={handleCopyLink}
              className="shrink-0 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-2xs"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>লিংক কপি</span>
                </>
              )}
            </button>
          </div>

          {/* Key Advantages */}
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <div className="w-8 h-8 mx-auto rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800">ফুল স্ক্রিন</div>
              <div className="text-[10px] text-slate-500">ব্রাউজার বার থাকবে না</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <div className="w-8 h-8 mx-auto rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-1.5">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800">অফলাইনে কাজ</div>
              <div className="text-[10px] text-slate-500">নেট ছাড়াও খুলবে</div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-center">
              <div className="w-8 h-8 mx-auto rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-1.5">
                <Zap className="w-4 h-4" />
              </div>
              <div className="text-xs font-bold text-slate-800">দ্রুত ও হালকা</div>
              <div className="text-[10px] text-slate-500">মোবাইল হ্যাং করবে না</div>
            </div>
          </div>

          {/* Already installed banner */}
          {isInstalled ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-900">অ্যাপটি ইতিমধ্যে ইনস্টল করা আছে!</p>
                <p className="text-xs text-emerald-700 mt-0.5">
                  আপনি আপনার মোবাইলের হোম স্ক্রিন থেকে যেকোনো সময় সরাসরি অ্যাপটি খুলতে পারবেন।
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Direct 1-click install button for Chrome/Edge/Android */}
              {hasNativePrompt && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-emerald-950">১-ক্লিকে ইনস্টল করুন</h4>
                      <p className="text-xs text-emerald-800">
                        নিচের বাটনে চাপ দিলে আপনার মোবাইলে সরাসরি অ্যাপ যোগ হবে
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleNativeInstall}
                    disabled={isInstalling}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isInstalling ? 'ইনস্টল হচ্ছে...' : 'অ্যাপ ইনস্টল করুন (Install App)'}</span>
                  </button>
                  {installSuccess && (
                    <p className="text-xs text-emerald-700 font-semibold text-center flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> সফলভাবে ইনস্টল সম্পন্ন হয়েছে!
                    </p>
                  )}
                </div>
              )}

              {/* Platform Selector Tabs */}
              <div>
                <div className="flex items-center p-1 bg-slate-100 rounded-xl mb-3">
                  <button
                    onClick={() => setActivePlatformTab('android')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activePlatformTab === 'android'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Android (Chrome)
                  </button>
                  <button
                    onClick={() => setActivePlatformTab('apk')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activePlatformTab === 'apk'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    আসল APK ফাইল
                  </button>
                  <button
                    onClick={() => setActivePlatformTab('ios')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition cursor-pointer ${
                      activePlatformTab === 'ios'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    iPhone (Safari)
                  </button>
                </div>

                {/* Tab 1: Android Chrome 1-Click Install */}
                {activePlatformTab === 'android' && (
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <p className="font-bold text-slate-900 mb-1 flex items-center gap-1">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>সবচেয়ে সহজ পদ্ধতি (APK ছাড়াই অ্যাপ হিসেবে ব্যবহার):</span>
                    </p>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        ১
                      </span>
                      <p>
                        মোবাইলের <b>Google Chrome</b> ব্রাউজারে অ্যাপটির লিঙ্কটি ওপেন করুন।
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        ২
                      </span>
                      <p>
                        ডানদিকের উপরে থাকা <b>তিনটি বিন্দু (⋮)</b> অপশনে চাপ দিন এবং <b>Install app</b> অথবা <b>Add to Home screen</b> সিলেক্ট করুন।
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        ৩
                      </span>
                      <p>
                        <b>Install</b> চাপলে কয়েক সেকেন্ডে আপনার ফোনের হোমস্ক্রিনে ট্যালি খাতার অ্যাপ আইকন বসে যাবে। এরপর নেট ছাড়াই নিয়মিত খুলতে পারবেন!
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab 2: Standalone .APK File Generation via PWABuilder */}
                {activePlatformTab === 'apk' && (
                  <div className="space-y-3 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-purple-600" />
                      <span>সরাসরি .APK ইনস্টলার ফাইল ডাউনলোড করার নিয়ম:</span>
                    </p>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      আমাদের অ্যাপটিতে ইতিমধ্যেই সম্পূর্ণ PWA ম্যানিফেস্ট ও সার্ভিস ওয়ার্কার কনফিগার করা আছে। তাই Microsoft-এর ফ্রি <b>PWABuilder</b> দিয়ে ২ মিনিটেই সাইন করা Android APK তৈরি করে নিতে পারবেন:
                    </p>

                    <div className="space-y-2 bg-white p-3 rounded-xl border border-slate-200">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">১</span>
                        <p>উপরের <b>"লিংক কপি"</b> বাটনে চাপ দিয়ে অ্যাপের লিংকটি কপি করুন।</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">২</span>
                        <p>
                          <a
                            href="https://www.pwabuilder.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-purple-700 underline font-bold inline-flex items-center gap-0.5"
                          >
                            pwabuilder.com <ExternalLink className="w-3 h-3" />
                          </a> সাইটে গিয়ে লিংকটি পেস্ট করে <b>Start</b> বাটনে চাপ দিন।
                        </p>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center shrink-0 text-[10px]">৩</span>
                        <p><b>Package for Android</b> বাটনে ক্লিক করলেই আপনার জন্য প্রস্তুতকৃত <b>.apk</b> ফাইল ডাউনলোড হয়ে যাবে। সেই ফাইলে ক্লিক করে মোবাইলে ইনস্টল করুন!</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab 3: iPhone Safari Instructions */}
                {activePlatformTab === 'ios' && (
                  <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <p className="font-bold text-slate-900 mb-1">
                      আইফোনে (iOS Safari) অ্যাপ যুক্ত করার নিয়ম:
                    </p>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        ১
                      </span>
                      <p className="flex items-center gap-1.5 flex-wrap">
                        সাফারি (Safari) ব্রাউজারের নিচে থাকা শেয়ার বাটন
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[10px]">
                          <Share2 className="w-3 h-3 text-blue-600" /> Share
                        </span>
                        এ ট্যাপ করুন।
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        ২
                      </span>
                      <p className="flex items-center gap-1.5 flex-wrap">
                        স্ক্রল করে নিচে যান এবং
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[10px]">
                          <PlusSquare className="w-3 h-3 text-slate-700" /> Add to Home Screen
                        </span>
                        অপশনটি নির্বাচন করুন।
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center shrink-0 text-[11px]">
                        ৩
                      </span>
                      <p>
                        ডানপাশের উপরের কোণে <b>Add</b> চাপুন। আপনার আইফোনের স্ক্রিনে ট্যালি খাতা অ্যাপ যুক্ত হয়ে যাবে।
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cloud Sync Reminder */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
            <p className="text-xs text-blue-900">
              <b>গুগল ড্রাইভ ক্লাউড ব্যাকআপ:</b> অ্যাপে যুক্ত প্রতিটি হিসাব স্বয়ংক্রিয়ভাবে ড্রাইভে ব্যাকআপ রাখা যায়, ফলে ফোন হারালেও হিসাব নিরাপদে থাকবে।
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              বুঝেছি, বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
