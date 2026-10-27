import React from 'react';
import { BoxState, GamePhase, LevelConfig } from '../types/game';
import { Check, X, Sparkles } from 'lucide-react';

interface Grid5x5Props {
  boxes: BoxState[];
  currentLevel: LevelConfig;
  phase: GamePhase;
  onBoxClick: (index: number) => void;
  lastFeedback: { index: number; text: string; isCorrect: boolean } | null;
}

export const Grid5x5: React.FC<Grid5x5Props> = ({
  boxes,
  currentLevel,
  phase,
  onBoxClick,
  lastFeedback
}) => {
  const isInteractive = phase === 'RECALL';

  return (
    <div className="relative w-full max-w-[500px] mx-auto aspect-square">
      {/* 5x5 Grid Container */}
      <div
        role="grid"
        aria-label="5 by 5 memory game grid"
        className="w-full h-full grid grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-4 bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md"
      >
        {boxes.map((box) => {
          const isTargetShown = phase === 'MEMORIZE' && box.isTarget;
          const isCorrectlyFound = box.isGuessedCorrectly;
          const isIncorrectlyGuessed = box.isGuessedIncorrectly;

          // Feedback overlay for this specific box
          const isCurrentFeedback = lastFeedback?.index === box.index;

          let cellBg = 'bg-slate-800/70 hover:bg-slate-750 border-slate-700/60 text-slate-400';
          let borderStyle = 'border';

          if (isTargetShown) {
            cellBg = `${currentLevel.themeBg} ${currentLevel.themeGlow} text-white border-white/60`;
          } else if (isCorrectlyFound) {
            cellBg = `${currentLevel.themeBg} text-white ${currentLevel.themeGlow} border-white/50`;
          } else if (isIncorrectlyGuessed) {
            cellBg = 'bg-rose-600/90 text-white shadow-[0_0_18px_rgba(225,29,72,0.5)] border-rose-400/80 animate-[wiggle_0.2s_ease-in-out]';
          }

          const canClick = isInteractive && !isCorrectlyFound && !isIncorrectlyGuessed;

          return (
            <button
              key={box.index}
              role="gridcell"
              type="button"
              tabIndex={canClick ? 0 : -1}
              disabled={!canClick}
              onClick={() => onBoxClick(box.index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  if (canClick) onBoxClick(box.index);
                }
              }}
              aria-label={`Box row ${box.row + 1}, column ${box.col + 1}${
                isCorrectlyFound ? ', correct match' : isIncorrectlyGuessed ? ', incorrect' : ''
              }`}
              className={`relative rounded-xl flex items-center justify-center transition-all duration-150 select-none ${borderStyle} ${cellBg} ${
                canClick
                  ? 'cursor-pointer hover:border-slate-500 hover:scale-[1.03] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900'
                  : 'cursor-default'
              }`}
            >
              {/* Subtle row/col coordinate indicator for spatial precision */}
              <span className="absolute top-1 left-1.5 text-[9px] font-mono opacity-25 tabular-nums pointer-events-none">
                {box.row + 1},{box.col + 1}
              </span>

              {/* During Memorize: target glyph */}
              {isTargetShown && (
                <div className="flex flex-col items-center justify-center transition-transform scale-110">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-md animate-pulse" />
                </div>
              )}

              {/* During Recall: Correct Guess Indicator */}
              {isCorrectlyFound && (
                <div className="flex flex-col items-center justify-center text-white scale-100 transition-transform">
                  <Check className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] drop-shadow-md" />
                  {box.reactionTimeMs && (
                    <span className="text-[10px] font-mono font-bold tracking-tight text-white/95 mt-0.5 tabular-nums">
                      {box.reactionTimeMs}ms
                    </span>
                  )}
                </div>
              )}

              {/* During Recall: Incorrect Guess Indicator */}
              {isIncorrectlyGuessed && (
                <div className="flex flex-col items-center justify-center text-white">
                  <X className="w-6 h-6 sm:w-7 sm:h-7 stroke-[3] drop-shadow-md" />
                  <span className="text-[10px] font-mono font-bold text-rose-200 mt-0.5">Miss</span>
                </div>
              )}

              {/* Popover feedback animation on click */}
              {isCurrentFeedback && (
                <div
                  className={`absolute -top-7 left-1/2 -translate-x-1/2 pointer-events-none z-30 whitespace-nowrap text-xs font-mono font-bold px-2 py-0.5 rounded shadow-lg animate-bounce ${
                    lastFeedback.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                  }`}
                >
                  {lastFeedback.text}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
