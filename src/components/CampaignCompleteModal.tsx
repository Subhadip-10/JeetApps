import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { LevelResult } from '../types/game';
import { getCognitiveArchetype } from '../utils/scoring';
import { Trophy, Zap, Target, Flame, RotateCcw, BarChart3 } from 'lucide-react';

interface CampaignCompleteModalProps {
  isOpen: boolean;
  results: LevelResult[];
  onRestartCampaign: () => void;
  onOpenStats: () => void;
}

export const CampaignCompleteModal: React.FC<CampaignCompleteModalProps> = ({
  isOpen,
  results,
  onRestartCampaign,
  onOpenStats
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // canvas-confetti fallback
      }
    }
  }, [isOpen]);

  if (!isOpen || results.length === 0) return null;

  const totalScore = results.reduce((acc, r) => acc + r.roundTotalScore, 0);
  const totalTargets = results.reduce((acc, r) => acc + r.targetsTotal, 0);
  const totalFound = results.reduce((acc, r) => acc + r.targetsFound, 0);
  const overallAccuracy = Math.round((totalFound / Math.max(1, totalTargets)) * 100);
  const avgReflex = Math.round(
    results.reduce((acc, r) => acc + r.averageReflexMs, 0) / Math.max(1, results.length)
  );
  const bestSingleClick = Math.min(...results.map((r) => r.fastestReflexMs).filter((n) => n > 0));
  const perfectRounds = results.filter((r) => r.mistakesCount === 0).length;

  const archetype = getCognitiveArchetype(overallAccuracy, avgReflex);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden relative text-white">
        {/* Glow ambient background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-3 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
            <Trophy className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Campaign Complete!</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            You successfully conquered all 5 levels of the 5×5 NeuroGrid challenge.
          </p>
        </div>

        {/* Cognitive Master Archetype */}
        <div className="p-4 sm:p-5 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span>Assigned Cognitive Classification</span>
          </div>
          <h3 className="text-xl font-bold text-white">{archetype.title}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{archetype.summary}</p>
        </div>

        {/* Campaign Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-slate-400 block mb-1">Final Score</span>
            <span className="text-xl font-bold font-mono text-indigo-400 tabular-nums">
              {totalScore.toLocaleString()}
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-slate-400 block mb-1">Avg Reflex</span>
            <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
              {avgReflex}ms
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-slate-400 block mb-1">Accuracy</span>
            <span className="text-xl font-bold font-mono text-emerald-400 tabular-nums">
              {overallAccuracy}%
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-center">
            <span className="text-[10px] uppercase font-medium text-slate-400 block mb-1">Peak Click</span>
            <span className="text-xl font-bold font-mono text-sky-400 tabular-nums">
              {bestSingleClick === Infinity ? '—' : `${bestSingleClick}ms`}
            </span>
          </div>
        </div>

        {/* Level-by-level recap */}
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
            Level Progression Breakdown
          </span>
          <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-950/40 text-xs">
            {results.map((r) => (
              <div key={r.levelNumber} className="flex items-center justify-between p-2.5 px-3">
                <span className="font-medium text-slate-300">Level {r.levelNumber}</span>
                <div className="flex items-center gap-3 text-slate-400 font-mono">
                  <span>{r.accuracyPercent}% recall</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-400">{r.averageReflexMs}ms</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-indigo-400">+{r.roundTotalScore}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-[11px] text-slate-400">
            {perfectRounds} flawless {perfectRounds === 1 ? 'round' : 'rounds'} with zero strikes
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={onOpenStats}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Lifetime Stats</span>
          </button>
          <button
            onClick={onRestartCampaign}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Play Campaign Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
