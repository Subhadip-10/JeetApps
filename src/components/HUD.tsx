import React from 'react';
import { GamePhase, LevelConfig } from '../types/game';
import { Clock, Zap, Heart, Target, Flame } from 'lucide-react';

interface HUDProps {
  currentLevel: LevelConfig;
  phase: GamePhase;
  memorizeSecondsLeft: number;
  totalMemorizeSeconds: number;
  targetsRemaining: number;
  strikes: number;
  score: number;
  combo: number;
  recallElapsedMs: number;
}

export const HUD: React.FC<HUDProps> = ({
  currentLevel,
  phase,
  memorizeSecondsLeft,
  totalMemorizeSeconds,
  targetsRemaining,
  strikes,
  score,
  combo,
  recallElapsedMs
}) => {
  const memorizeRatio = Math.max(0, Math.min(1, memorizeSecondsLeft / totalMemorizeSeconds));

  return (
    <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 backdrop-blur-sm">
      {/* Top row: Level title and metadata (Clean unboxed text with typographic separators) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/70 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-white text-sm">Level {currentLevel.levelNumber} of 5</span>
          <span aria-hidden="true">·</span>
          <span className={currentLevel.themeText}>{currentLevel.colorName}</span>
          <span aria-hidden="true">·</span>
          <span>{currentLevel.targetCount} Target Boxes</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target: {currentLevel.targetCount} boxes</span>
          </div>
          <span aria-hidden="true">·</span>
          <div className="flex items-center gap-1.5">
            <Heart className={`w-3.5 h-3.5 ${strikes > 0 ? 'text-rose-400 fill-rose-400' : 'text-slate-400'}`} />
            <span>Strikes: {strikes} / {currentLevel.maxStrikes}</span>
          </div>
        </div>
      </div>

      {/* Main HUD metrics row */}
      <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
        {/* Metric 1: Phase / Timer Status */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            {phase === 'MEMORIZE' ? 'Memorize Window' : phase === 'RECALL' ? 'Reflex Stopwatch' : 'Status'}
          </span>
          {phase === 'MEMORIZE' ? (
            <div>
              <div className="flex items-baseline gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 self-center" />
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400 tabular-nums">
                  {memorizeSecondsLeft.toFixed(1)}s
                </span>
                <span className="text-xs text-slate-400">/ {totalMemorizeSeconds}s</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-100 ease-linear rounded-full"
                  style={{ width: `${memorizeRatio * 100}%` }}
                />
              </div>
            </div>
          ) : phase === 'RECALL' ? (
            <div className="flex items-baseline gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400 shrink-0 self-center" />
              <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                {(recallElapsedMs / 1000).toFixed(2)}s
              </span>
            </div>
          ) : (
            <span className="text-base font-semibold text-slate-300">
              {phase === 'COUNTDOWN' ? 'Preparing...' : phase === 'IDLE' ? 'Ready' : 'Completed'}
            </span>
          )}
        </div>

        {/* Metric 2: Remaining Targets */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            To Recall
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
              {targetsRemaining}
            </span>
            <span className="text-xs text-slate-400">/ {currentLevel.targetCount} left</span>
          </div>
        </div>

        {/* Metric 3: Score */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            Score
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-400 tabular-nums">
              {score.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Metric 4: Combo Multiplier */}
        <div className="space-y-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block">
            Reflex Streak
          </span>
          <div className="flex items-center gap-1.5">
            <Flame className={`w-4 h-4 ${combo > 1 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-slate-400'}`} />
            <span className="text-xl sm:text-2xl font-bold font-mono text-white tabular-nums">
              {combo > 1 ? `${combo}x` : '1.0x'}
            </span>
            {combo >= 3 && <span className="text-xs text-amber-400 font-medium">On Fire!</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
