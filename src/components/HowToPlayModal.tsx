import React from 'react';
import { X, Clock, Brain, Zap, Target, Layers } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Brain className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">Rules & Mechanics</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Breakdown */}
        <div className="space-y-4 my-5 text-xs text-slate-300">
          <div className="p-3.5 bg-slate-800/40 border border-slate-800/80 rounded-xl flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 font-bold font-mono">
              01
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">The 5×5 Matrix & 6-Second Imprint</h3>
              <p className="mt-1 leading-relaxed text-slate-400">
                At the start of each level, a set of random boxes will illuminate in the level's signature color.
                You have exactly <span className="text-amber-400 font-semibold">6.0 seconds</span> to memorize their positions before they disappear.
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800/80 rounded-xl flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold font-mono">
              02
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Reflex Recall & Speed Scoring</h3>
              <p className="mt-1 leading-relaxed text-slate-400">
                Once the boxes disappear, click the exact same locations from memory. Points are determined by two core factors:
              </p>
              <div className="mt-2 space-y-1 font-mono text-[11px] text-slate-300">
                <div>• <span className="text-white">Spatial Memory:</span> Earn base points per correct box revealed.</div>
                <div>• <span className="text-amber-400">Reflex Speed Bonus:</span> Fast clicks (&lt; 800ms) award lightning reflex multipliers.</div>
                <div>• <span className="text-emerald-400">Combo Multiplier:</span> Consecutive correct clicks multiply your score up to 2.5x.</div>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800/80 rounded-xl flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold font-mono">
              03
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">5 Progressive Levels</h3>
              <p className="mt-1 leading-relaxed text-slate-400">
                Cognitive load increases with each level:
              </p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-[10px] font-mono">
                <div className="p-1.5 rounded bg-slate-900 border border-emerald-500/30 text-emerald-300">L1: 5 Boxes</div>
                <div className="p-1.5 rounded bg-slate-900 border border-sky-500/30 text-sky-300">L2: 7 Boxes</div>
                <div className="p-1.5 rounded bg-slate-900 border border-amber-500/30 text-amber-300">L3: 9 Boxes</div>
                <div className="p-1.5 rounded bg-slate-900 border border-violet-500/30 text-violet-300">L4: 11 Boxes</div>
                <div className="p-1.5 rounded bg-slate-900 border border-rose-500/30 text-rose-300">L5: 14 Boxes</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition-colors"
          >
            Got It, Let's Play
          </button>
        </div>
      </div>
    </div>
  );
};
