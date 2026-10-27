import React from 'react';
import { LevelConfig, LevelResult } from '../types/game';
import { getCognitiveArchetype } from '../utils/scoring';
import { CheckCircle2, AlertOctagon, Zap, Target, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface LevelSummaryModalProps {
  isOpen: boolean;
  result: LevelResult;
  currentLevel: LevelConfig;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetryLevel: () => void;
}

export const LevelSummaryModal: React.FC<LevelSummaryModalProps> = ({
  isOpen,
  result,
  currentLevel,
  hasNextLevel,
  onNextLevel,
  onRetryLevel
}) => {
  if (!isOpen) return null;

  const archetype = getCognitiveArchetype(result.accuracyPercent, result.averageReflexMs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 overflow-hidden relative">
        {/* Top Status Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              result.cleared ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {result.cleared ? <CheckCircle2 className="w-6 h-6" /> : <AlertOctagon className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {result.cleared ? `${currentLevel.title} Cleared!` : `${currentLevel.title} Failed`}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{result.cleared ? 'Imprint successfully recalled' : 'Too many strikes recorded'}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{currentLevel.colorName}</span>
            </div>
          </div>
        </div>

        {/* Cognitive Archetype Badge */}
        <div className="my-5 p-4 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Award className="w-4 h-4" />
            <span>Cognitive Rating</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">{archetype.title}</h3>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{archetype.summary}</p>
        </div>

        {/* Key Reflex & Memory Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Target className="w-3.5 h-3.5 text-sky-400" />
              <span>Memory Recall</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white tabular-nums">
              {result.accuracyPercent}%
            </div>
            <span className="text-[11px] text-slate-400">
              {result.targetsFound} of {result.targetsTotal} correct · {result.mistakesCount} strikes
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Reflex Speed</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
              {result.averageReflexMs}
              <span className="text-sm font-normal text-slate-400 ml-1">ms avg</span>
            </div>
            <span className="text-[11px] text-slate-400">
              Peak: {result.fastestReflexMs}ms reaction
            </span>
          </div>
        </div>

        {/* Score Breakdown Table */}
        <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 mb-6 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-400">
            <span>Base Memory Points ({result.targetsFound} × {currentLevel.basePointsPerBox})</span>
            <span className="font-mono text-slate-200">+{result.baseScore}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Reflex Reaction Bonus</span>
            <span className="font-mono text-emerald-400">+{result.speedBonus}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Consecutive Combo Bonus</span>
            <span className="font-mono text-amber-400">+{result.comboBonus}</span>
          </div>
          {result.penaltyScore > 0 && (
            <div className="flex justify-between text-rose-400">
              <span>Mistake Penalties ({result.mistakesCount} strikes)</span>
              <span className="font-mono">-{result.penaltyScore}</span>
            </div>
          )}
          <div className="border-t border-slate-800 pt-2 flex justify-between font-semibold text-sm text-white">
            <span>Round Total Score</span>
            <span className="font-mono text-indigo-400 text-base">{result.roundTotalScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onRetryLevel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/80 text-xs font-semibold text-slate-200 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Level</span>
          </button>

          {result.cleared && (
            <button
              onClick={onNextLevel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>{hasNextLevel ? `Advance to Level ${currentLevel.levelNumber + 1}` : 'View Final Results'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
