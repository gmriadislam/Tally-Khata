import { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CloudUpload,
  CloudDownload,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  LogOut,
  LogIn,
  HardDrive,
  Calendar,
  FileText,
} from 'lucide-react';
import { MultiBusinessState } from '../types';
import {
  loginWithGoogle,
  logoutGoogle,
  subscribeToAuthState,
  getStoredAccessToken,
} from '../services/firebaseAuth';
import {
  DriveBackupFile,
  listGoogleDriveBackups,
  backupStateToGoogleDrive,
  restoreStateFromGoogleDrive,
  deleteGoogleDriveBackup,
  getLastDriveSyncTime,
} from '../services/googleDriveService';
import { formatBengaliDate, toBengaliNumber } from '../utils/formatters';
import type { User } from 'firebase/auth';

interface GoogleDriveBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  multiState: MultiBusinessState;
  onRestoreState: (restored: MultiBusinessState) => void;
}

export default function GoogleDriveBackupModal({
  isOpen,
  onClose,
  multiState,
  onRestoreState,
}: GoogleDriveBackupModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [backups, setBackups] = useState<DriveBackupFile[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoringId, setIsRestoringId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(getLastDriveSyncTime());
  const [confirmRestoreFile, setConfirmRestoreFile] = useState<DriveBackupFile | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((currentUser) => {
      setUser(currentUser);
      if (currentUser && getStoredAccessToken()) {
        loadBackups();
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLastSyncTime(getLastDriveSyncTime());
      if (user && getStoredAccessToken()) {
        loadBackups();
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadBackups = async () => {
    setIsLoadingBackups(true);
    setMessage(null);
    try {
      const files = await listGoogleDriveBackups();
      setBackups(files);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'ফাইল তালিকা লোড করা যায়নি';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleLogin = async () => {
    setMessage(null);
    try {
      const res = await loginWithGoogle();
      setUser(res.user);
      loadBackups();
      setMessage({
        type: 'success',
        text: `স্বাগতম, ${res.user.displayName || 'দোকানদার'}! গুগল ড্রাইভ সফলভাবে সংযুক্ত হয়েছে।`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'লগইন সফল হয়নি';
      setMessage({ type: 'error', text: msg });
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setBackups([]);
    setMessage({ type: 'success', text: 'গুগল অ্যাকাউন্ট সাইন-আউট করা হয়েছে।' });
  };

  const handleBackupNow = async () => {
    setIsBackingUp(true);
    setMessage(null);
    try {
      const result = await backupStateToGoogleDrive(multiState);
      const syncNow = new Date().toISOString();
      setLastSyncTime(syncNow);
      setMessage({
        type: 'success',
        text: `গুগল ড্রাইভে ব্যাকআপ সফলভাবে সংরক্ষিত হয়েছে! (${result.fileName})`,
      });
      await loadBackups();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ব্যাকআপ তৈরি করা সম্ভব হয়নি';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleConfirmRestore = async () => {
    if (!confirmRestoreFile) return;
    setIsRestoringId(confirmRestoreFile.id);
    setMessage(null);
    try {
      const res = await restoreStateFromGoogleDrive(confirmRestoreFile.id);
      onRestoreState(res.state);
      setMessage({
        type: 'success',
        text: 'গুগল ড্রাইভ ব্যাকআপ থেকে সফলভাবে সকল হিসাব ও স্টক রিস্টোর করা হয়েছে!',
      });
      setConfirmRestoreFile(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'রিস্টোর করা ব্যর্থ হয়েছে';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsRestoringId(null);
    }
  };

  const handleDelete = async (file: DriveBackupFile) => {
    if (!window.confirm(`আপনি কি "${file.name}" ব্যাকআপ ফাইলটি ড্রাইভ থেকে মুছে ফেলতে চান?`)) {
      return;
    }
    setIsDeletingId(file.id);
    setMessage(null);
    try {
      await deleteGoogleDriveBackup(file.id);
      setBackups((prev) => prev.filter((b) => b.id !== file.id));
      setMessage({ type: 'success', text: 'ফাইলটি গুগল ড্রাইভ থেকে মুছে ফেলা হয়েছে।' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ফাইল মুছতে ব্যর্থ হয়েছে';
      setMessage({ type: 'error', text: msg });
    } finally {
      setIsDeletingId(null);
    }
  };

  const formatFileSize = (bytesStr?: string) => {
    if (!bytesStr) return '';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return '';
    if (bytes < 1024) return `${toBengaliNumber(bytes)} B`;
    if (bytes < 1024 * 1024) return `${toBengaliNumber((bytes / 1024).toFixed(1))} KB`;
    return `${toBengaliNumber((bytes / (1024 * 1024)).toFixed(1))} MB`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight">গুগল ড্রাইভ ক্লাউড ব্যাকআপ ও রিস্টোর</h2>
              <p className="text-xs text-emerald-100">
                আপনার দোকানের হিসাব নিরাপদ রাখতে ব্যক্তিগত Google Drive-এ সিঙ্ক করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Notification Message */}
          {message && (
            <div
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs font-semibold ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">{message.text}</div>
            </div>
          )}

          {/* Account Connection Card */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            {user ? (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      className="w-10 h-10 rounded-full border border-slate-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                      {(user.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'সংযুক্ত অ্যাকাউন্ট'}
                      </span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                        সংযুক্ত
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono truncate">{user.email}</div>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>সাইন-আউট</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0">
                    <Cloud className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">গুগল অ্যাকাউন্ট সংযুক্ত নেই</h4>
                    <p className="text-[11px] text-slate-500">
                      আপনার নিজস্ব Google Drive-এ ফাইল সংরক্ষণ করতে সাইন-ইন করুন
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogin}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-4 h-4 text-emerald-400" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Backup Action Banner */}
          <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                  <CloudUpload className="w-4 h-4 text-emerald-700" />
                  <span>বর্তমান হিসাব ড্রাইভে ব্যাকআপ নিন</span>
                </h3>
                <p className="text-xs text-emerald-800 mt-0.5">
                  সকল ব্যবসা ({toBengaliNumber(multiState.businesses.length)}টি), কাস্টমার, সাপ্লায়ার, ক্যাশ ও ইনভেন্টরির হালনাগাদ হিসাব সংরক্ষণ হবে
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-emerald-800 font-medium">
                {lastSyncTime ? (
                  <span>
                    সর্বশেষ সিঙ্ক:{' '}
                    <span className="font-bold text-emerald-900 font-mono">
                      {formatBengaliDate(lastSyncTime)}
                    </span>
                  </span>
                ) : (
                  <span className="text-slate-500">এখনও গুগল ড্রাইভে ব্যাকআপ নেওয়া হয়নি</span>
                )}
              </div>

              <button
                onClick={handleBackupNow}
                disabled={isBackingUp}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-60 shrink-0"
              >
                {isBackingUp ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>আপলোড হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-4 h-4" />
                    <span>এখনই ব্যাকআপ সংরক্ষণ করুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Restore Confirmation Dialog */}
          {confirmRestoreFile && (
            <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-amber-900">
                    আপনি কি এই ব্যাকআপ ফাইলটি রিস্টোর করতে চান?
                  </p>
                  <p className="text-amber-800 mt-1">
                    ফাইল: <b className="font-mono">{confirmRestoreFile.name}</b>
                    <br />
                    সতর্কতা: এটি বর্তমান অ্যাপের সকল তথ্য এই ব্যাকআপ ফাইলের ডেটা দিয়ে প্রতিস্থাপন
                    করবে।
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-1">
                <button
                  onClick={() => setConfirmRestoreFile(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-amber-100 rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleConfirmRestore}
                  disabled={isRestoringId !== null}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isRestoringId ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>রিস্টোর হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <CloudDownload className="w-3.5 h-3.5" />
                      <span>হ্যাঁ, রিস্টোর নিশ্চিত করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Stored Backups List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                <span>ড্রাইভে সংরক্ষিত ব্যাকআপ তালিকা ({toBengaliNumber(backups.length)})</span>
              </h3>
              {user && (
                <button
                  onClick={loadBackups}
                  disabled={isLoadingBackups}
                  className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                  <span>রিফ্রেশ</span>
                </button>
              )}
            </div>

            {!user ? (
              <div className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-500">
                গুগল ড্রাইভের ব্যাকআপ ফাইল দেখতে ও রিস্টোর করতে উপরের "Sign in with Google" বাটনে চাপুন।
              </div>
            ) : isLoadingBackups ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
                <span>গুগল ড্রাইভ স্ক্যান করা হচ্ছে...</span>
              </div>
            ) : backups.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">এখনও কোনো ব্যাকআপ ফাইল পাওয়া যায়নি</p>
                <p>উপরের বাটনে চাপ দিয়ে এই মুহূর্তের হিসাবের প্রথম ব্যাকআপ সংরক্ষণ করুন।</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {backups.map((file) => (
                  <div
                    key={file.id}
                    className="p-3 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{file.name}</p>
                        <p className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3" />
                            {formatBengaliDate(file.modifiedTime || file.createdTime)}
                          </span>
                          {file.size && (
                            <>
                              <span>•</span>
                              <span>{formatFileSize(file.size)}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setConfirmRestoreFile(file)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition cursor-pointer"
                        title="এই ফাইল থেকে ডেটা রিস্টোর করুন"
                      >
                        <CloudDownload className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">রিস্টোর</span>
                      </button>

                      <button
                        onClick={() => handleDelete(file)}
                        disabled={isDeletingId === file.id}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                        title="ফাইল মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy & Security Note */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <b>১০০% গোপনীয় ও নিরাপদ:</b> এই ব্যাকআপ ফাইলগুলো সরাসরি আপনার নিজস্ব ব্যক্তিগত গুগল
              ড্রাইভে জমা থাকে। অন্য কেউ বা কোনো থার্ড পার্টি এটি দেখতে বা অ্যাক্সেস করতে পারবে না।
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
