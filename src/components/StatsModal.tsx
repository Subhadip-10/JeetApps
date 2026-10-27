import React from 'react';
import { CampaignStats } from '../types/game';
import { Trophy, Zap, Target, History, X, Trash2 } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CampaignStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  onResetStats
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden relative text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">Reflex & Memory Records</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* High-level stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-5">
          <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-medium uppercase text-slate-400 block mb-1">High Score</span>
            <span className="text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {stats.highScore.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-medium uppercase text-slate-400 block mb-1">Best Avg Reflex</span>
            <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {stats.bestAverageReflexMs > 0 ? `${stats.bestAverageReflexMs}ms` : '—'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-medium uppercase text-slate-400 block mb-1">Fastest Single Click</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
              {stats.fastestSingleReflexMs > 0 ? `${stats.fastestSingleReflexMs}ms` : '—'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-medium uppercase text-slate-400 block mb-1">Highest Accuracy</span>
            <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
              {stats.highestAccuracyPercent > 0 ? `${stats.highestAccuracyPercent}%` : '—'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-medium uppercase text-slate-400 block mb-1">Games Played</span>
            <span className="text-2xl font-bold font-mono text-white tabular-nums">
              {stats.gamesPlayed}
            </span>
          </div>

          <div className="p-3.5 bg-slate-800/40 border border-slate-800 rounded-xl">
            <span className="text-[11px] font-medium uppercase text-slate-400 block mb-1">Campaigns Won</span>
            <span className="text-2xl font-bold font-mono text-amber-300 tabular-nums">
              {stats.campaignsCompleted}
            </span>
          </div>
        </div>

        {/* Recent Runs History */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <History className="w-3.5 h-3.5" />
            <span>Recent Level Logs</span>
          </div>

          {stats.recentRuns.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-slate-950/40">
              No game history recorded yet. Complete your first level to record data!
            </div>
          ) : (
            <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950/40 divide-y divide-slate-800/70 text-xs">
              {stats.recentRuns.map((run, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 px-3 hover:bg-slate-900/60 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-slate-200">Level {run.levelNumber}</span>
                    <span className={`text-[11px] ${run.cleared ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {run.cleared ? 'Cleared' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400 font-mono">
                    <span>{run.accuracyPercent}% acc</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-amber-400">{run.averageReflexMs}ms avg</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-indigo-400 font-semibold">+{run.roundTotalScore}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset your local records?')) {
                onResetStats();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset Stats</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
