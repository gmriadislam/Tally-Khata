import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2, Circle, Calendar, StickyNote } from 'lucide-react';
import { toBengaliNumber } from '../utils/formatters';

export interface BusinessNote {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

interface BusinessNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
}

export default function BusinessNotesModal({ isOpen, onClose, businessId }: BusinessNotesModalProps) {
  const [notes, setNotes] = useState<BusinessNote[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const storageKey = `tally_notes_${businessId}`;

  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        // default starter note
        const defaultNotes: BusinessNote[] = [
          {
            id: 'note-1',
            text: 'আজকের পাইকারি দোকানের বাকি আদায় তাগাদা পাঠাতে হবে',
            completed: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: 'note-2',
            text: 'মোকাম থেকে সরিষার তেল ও ডালের স্টক আনতে হবে',
            completed: true,
            createdAt: new Date().toISOString(),
          },
        ];
        setNotes(defaultNotes);
        localStorage.setItem(storageKey, JSON.stringify(defaultNotes));
      }
    } catch {
      // fallback
    }
  }, [isOpen, businessId, storageKey]);

  const saveNotes = (updated: BusinessNote[]) => {
    setNotes(updated);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const newNote: BusinessNote = {
      id: `note-${Date.now()}`,
      text: newNoteText.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    saveNotes([newNote, ...notes]);
    setNewNoteText('');
  };

  const handleToggle = (id: string) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, completed: !n.completed } : n));
    saveNotes(updated);
  };

  const handleDelete = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    saveNotes(updated);
  };

  if (!isOpen) return null;

  const filteredNotes = notes.filter((n) => {
    if (filter === 'pending') return !n.completed;
    if (filter === 'completed') return n.completed;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <StickyNote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">ব্যবসার নোট ও রিমাইন্ডার</h2>
              <p className="text-xs text-amber-100">দোকানের জরুরি বিষয় ও টু-ডু লিস্ট লিখে রাখুন</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Add Note Form */}
        <form onSubmit={handleAddNote} className="p-4 bg-amber-50/50 border-b border-amber-100">
          <div className="flex gap-2">
            <input
              type="text"
              value={newNoteText}
              onChange={(e) => setNewNoteText(e.target.value)}
              placeholder="নতুন নোট বা জরুরি কাজের তালিকা লিখুন..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-amber-200 bg-white text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              disabled={!newNoteText.trim()}
              className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              যোগ করুন
            </button>
          </div>
        </form>

        {/* Filters */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 border-b border-slate-200 text-xs">
          <span className="text-slate-500 font-medium">ফিল্টার:</span>
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              filter === 'all'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            সব ({toBengaliNumber(notes.length)})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              filter === 'pending'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            বাকি কাজ ({toBengaliNumber(notes.filter((n) => !n.completed).length)})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
              filter === 'completed'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            সম্পন্ন ({toBengaliNumber(notes.filter((n) => n.completed).length)})
          </button>
        </div>

        {/* Note List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <StickyNote className="w-12 h-12 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="text-sm font-medium">কোনো নোট নেই</p>
              <p className="text-xs text-slate-400 mt-0.5">নতুন নোট লিখে সেভ করুন</p>
            </div>
          ) : (
            filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`p-3 rounded-xl border transition flex items-start gap-3 ${
                  note.completed
                    ? 'bg-slate-50/80 border-slate-200 text-slate-400'
                    : 'bg-white border-amber-200/80 shadow-xs text-slate-800'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(note.id)}
                  className="mt-0.5 text-slate-400 hover:text-amber-600 transition cursor-pointer shrink-0"
                >
                  {note.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-amber-500" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-relaxed ${
                      note.completed ? 'line-through text-slate-400' : 'text-slate-800'
                    }`}
                  >
                    {note.text}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleDateString('bn-BD', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(note.id)}
                  className="p-1 text-slate-300 hover:text-red-500 transition cursor-pointer shrink-0"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-xl text-sm transition cursor-pointer"
          >
            বন্ধ করুন
          </button>
        </div>
      </div>
    </div>
  );
}
