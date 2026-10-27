import React from 'react';
import { GAME_LEVELS } from '../utils/levels';
import { LevelConfig } from '../types/game';
import { X, Play, Clock, Sparkles } from 'lucide-react';

interface LevelSelectDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevelNumber: number;
  onSelectLevel: (levelIndex: number, customMemorizeTime?: number) => void;
  customMemorizeTime: number;
  setCustomMemorizeTime: (seconds: number) => void;
}

export const LevelSelectDrawer: React.FC<LevelSelectDrawerProps> = ({
  isOpen,
  onClose,
  currentLevelNumber,
  onSelectLevel,
  customMemorizeTime,
  setCustomMemorizeTime
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold">Select Level (1 – 5)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose a level to practice or jump into</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Practice Timer Setting (Interactive filter tabs) */}
        <div className="my-4 p-3 bg-slate-950/50 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-medium">Memorization Window:</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
            {[3, 6, 9].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setCustomMemorizeTime(sec)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors ${
                  customMemorizeTime === sec
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sec}s {sec === 6 ? '(Standard)' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Levels List */}
        <div className="space-y-2.5 my-4">
          {GAME_LEVELS.map((lvl, index) => {
            const isCurrent = currentLevelNumber === lvl.levelNumber;
            return (
              <div
                key={lvl.levelNumber}
                className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                  isCurrent
                    ? 'bg-slate-800/90 border-indigo-500/50 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-white text-base shrink-0 shadow-sm"
                    style={{ backgroundColor: lvl.themeColor }}
                  >
                    L{lvl.levelNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm text-white">{lvl.title}</h3>
                      {isCurrent && (
                        <span className="text-[10px] font-mono text-indigo-400 font-bold">Active</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{lvl.targetCount} targets</span>
                      <span aria-hidden="true">·</span>
                      <span className={lvl.themeText}>{lvl.colorName}</span>
                      <span aria-hidden="true">·</span>
                      <span>Max {lvl.maxStrikes} strikes</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectLevel(index, customMemorizeTime);
                    onClose();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-indigo-600 text-xs font-semibold text-white transition-colors shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Start L{lvl.levelNumber}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
