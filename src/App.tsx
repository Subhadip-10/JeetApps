/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, BoxState, LevelResult, CampaignStats } from './types/game';
import { GAME_LEVELS, GRID_SIZE, TOTAL_CELLS } from './utils/levels';
import { soundEngine } from './utils/audio';
import {
  calculateReflexBonus,
  loadSavedStats,
  saveStats,
  updateStatsWithResult
} from './utils/scoring';
import { Header } from './components/Header';
import { HUD } from './components/HUD';
import { Grid5x5 } from './components/Grid5x5';
import { LevelSummaryModal } from './components/LevelSummaryModal';
import { CampaignCompleteModal } from './components/CampaignCompleteModal';
import { StatsModal } from './components/StatsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { LevelSelectDrawer } from './components/LevelSelectDrawer';
import { Play, RotateCcw, Brain, Zap, HelpCircle, Layers, Award } from 'lucide-react';

export default function App() {
  // Navigation & Modals
  const [activeTab, setActiveTab] = useState<'game' | 'levels' | 'stats' | 'help'>('game');
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());

  // Game Configuration & State
  const [levelIndex, setLevelIndex] = useState(0); // 0..4 (Level 1 to 5)
  const [phase, setPhase] = useState<GamePhase>('IDLE');
  const [customMemorizeTime, setCustomMemorizeTime] = useState(6); // 6s user specification
  const [memorizeSecondsLeft, setMemorizeSecondsLeft] = useState(6);
  const [countdownNumber, setCountdownNumber] = useState(3);

  // Active Round Data
  const [boxes, setBoxes] = useState<BoxState[]>(() => generateInitialBoxes());
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lastFeedback, setLastFeedback] = useState<{
    index: number;
    text: string;
    isCorrect: boolean;
  } | null>(null);

  // Reaction & Reflex Timers
  const [recallElapsedMs, setRecallElapsedMs] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const recallStartTimeRef = useRef<number>(0);
  const lastClickTimeRef = useRef<number>(0);

  // Campaign History & Stats
  const [campaignResults, setCampaignResults] = useState<LevelResult[]>([]);
  const [currentLevelResult, setCurrentLevelResult] = useState<LevelResult | null>(null);
  const [playerStats, setPlayerStats] = useState<CampaignStats>(() => loadSavedStats());

  // Timer References
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recallRafRef = useRef<number | null>(null);

  const currentLevel = GAME_LEVELS[levelIndex];

  // Helper to initialize 5x5 boxes
  function generateInitialBoxes(): BoxState[] {
    const cells: BoxState[] = [];
    for (let i = 0; i < TOTAL_CELLS; i++) {
      cells.push({
        index: i,
        row: Math.floor(i / GRID_SIZE),
        col: i % GRID_SIZE,
        isTarget: false,
        isRevealedDuringMemorize: false,
        isGuessedCorrectly: false,
        isGuessedIncorrectly: false
      });
    }
    return cells;
  }

  // Clear all running timers safely
  const clearAllTimers = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (recallRafRef.current) {
      cancelAnimationFrame(recallRafRef.current);
      recallRafRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  // Start a new round / level
  const startLevel = useCallback(
    (lvlIdx: number = levelIndex, memDuration: number = customMemorizeTime) => {
      clearAllTimers();
      setLevelIndex(lvlIdx);
      const lvlConfig = GAME_LEVELS[lvlIdx];

      // Pick random distinct target indices
      const allIndices = Array.from({ length: TOTAL_CELLS }, (_, i) => i);
      // Shuffle indices
      for (let i = allIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
      }
      const targetIndices = new Set(allIndices.slice(0, lvlConfig.targetCount));

      const newBoxes: BoxState[] = [];
      for (let i = 0; i < TOTAL_CELLS; i++) {
        newBoxes.push({
          index: i,
          row: Math.floor(i / GRID_SIZE),
          col: i % GRID_SIZE,
          isTarget: targetIndices.has(i),
          isRevealedDuringMemorize: false,
          isGuessedCorrectly: false,
          isGuessedIncorrectly: false
        });
      }

      setBoxes(newBoxes);
      setStrikes(0);
      setCombo(1);
      setLastFeedback(null);
      setCurrentLevelResult(null);
      setReactionTimes([]);
      setRecallElapsedMs(0);

      // Start with quick 2s countdown before the 6s memorization starts
      setPhase('COUNTDOWN');
      setCountdownNumber(2);
      soundEngine.playTick(false);

      let count = 2;
      const countInterval = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setCountdownNumber(count);
          soundEngine.playTick(false);
        } else {
          clearInterval(countInterval);
          // Transition directly into 6s MEMORIZE Phase!
          beginMemorizePhase(memDuration, newBoxes);
        }
      }, 700);
    },
    [levelIndex, customMemorizeTime, clearAllTimers]
  );

  // Memorize phase (runs for exactly 6.00 seconds)
  const beginMemorizePhase = useCallback(
    (durationSeconds: number, activeBoxes: BoxState[]) => {
      setPhase('MEMORIZE');
      setMemorizeSecondsLeft(durationSeconds);
      soundEngine.playTick(true);

      const startTime = Date.now();
      const endTime = startTime + durationSeconds * 1000;
      let lastReportedSec = Math.ceil(durationSeconds);

      timerIntervalRef.current = setInterval(() => {
        const now = Date.now();
        const remainingMs = Math.max(0, endTime - now);
        const remainingSec = remainingMs / 1000;
        setMemorizeSecondsLeft(remainingSec);

        // Sound tick on last 3, 2, 1 seconds
        const currentCeilSec = Math.ceil(remainingSec);
        if (currentCeilSec <= 3 && currentCeilSec > 0 && currentCeilSec < lastReportedSec) {
          soundEngine.playTick(currentCeilSec === 1);
          lastReportedSec = currentCeilSec;
        }

        if (remainingMs <= 0) {
          clearAllTimers();
          // Timer finished! Transition to RECALL phase!
          beginRecallPhase();
        }
      }, 50);
    },
    [clearAllTimers]
  );

  // Recall & Reflex Phase begins!
  const beginRecallPhase = useCallback(() => {
    setPhase('RECALL');
    soundEngine.playRecallStart();
    const now = Date.now();
    recallStartTimeRef.current = now;
    lastClickTimeRef.current = now;

    // Run high-precision animation frame stopwatch for reflex measurement
    const updateStopwatch = () => {
      const elapsed = Date.now() - recallStartTimeRef.current;
      setRecallElapsedMs(elapsed);
      recallRafRef.current = requestAnimationFrame(updateStopwatch);
    };
    recallRafRef.current = requestAnimationFrame(updateStopwatch);
  }, []);

  // Handle Box Click during RECALL
  const handleBoxClick = useCallback(
    (index: number) => {
      if (phase !== 'RECALL') return;

      const box = boxes[index];
      if (!box || box.isGuessedCorrectly || box.isGuessedIncorrectly) return;

      const clickTime = Date.now();
      const reactionMs = Math.max(50, clickTime - lastClickTimeRef.current);
      lastClickTimeRef.current = clickTime; // reset for next reflex calculation

      if (box.isTarget) {
        // CORRECT GUESS!
        const reflex = calculateReflexBonus(reactionMs);
        const currentCombo = combo;
        soundEngine.playCorrect(currentCombo);

        const earnedPoints =
          currentLevel.basePointsPerBox +
          Math.round(reflex.bonus * (currentCombo > 1 ? 1 + currentCombo * 0.25 : 1));

        setScore((prev) => prev + earnedPoints);
        setCombo((prev) => Math.min(prev + 1, 5));
        setReactionTimes((prev) => [...prev, reactionMs]);

        setLastFeedback({
          index,
          text: `+${earnedPoints} · ${reactionMs}ms ⚡`,
          isCorrect: true
        });

        // Update Box state
        const updatedBoxes = boxes.map((b) =>
          b.index === index
            ? {
                ...b,
                isGuessedCorrectly: true,
                reactionTimeMs: reactionMs,
                guessTimestamp: clickTime
              }
            : b
        );
        setBoxes(updatedBoxes);

        // Check victory condition
        const correctlyFoundCount = updatedBoxes.filter((b) => b.isGuessedCorrectly).length;
        if (correctlyFoundCount >= currentLevel.targetCount) {
          // LEVEL CLEARED!
          clearAllTimers();
          handleLevelComplete(true, updatedBoxes, strikes);
        }
      } else {
        // INCORRECT GUESS / STRIKE!
        soundEngine.playWrong();
        const newStrikes = strikes + 1;
        setStrikes(newStrikes);
        setCombo(1); // combo reset

        const penalty = 50;
        setScore((prev) => Math.max(0, prev - penalty));

        setLastFeedback({
          index,
          text: `Strike! -${penalty}`,
          isCorrect: false
        });

        const updatedBoxes = boxes.map((b) =>
          b.index === index
            ? {
                ...b,
                isGuessedIncorrectly: true,
                guessTimestamp: clickTime
              }
            : b
        );
        setBoxes(updatedBoxes);

        // Check if exceeded max strikes
        if (newStrikes >= currentLevel.maxStrikes) {
          // LEVEL FAILED!
          clearAllTimers();
          soundEngine.playLevelFailed();
          handleLevelComplete(false, updatedBoxes, newStrikes);
        }
      }
    },
    [phase, boxes, combo, currentLevel, strikes, clearAllTimers]
  );

  // Finalize Level results and compute reflex / memory metrics
  const handleLevelComplete = useCallback(
    (cleared: boolean, finalBoxes: BoxState[], finalStrikes: number) => {
      const totalElapsed = Date.now() - recallStartTimeRef.current;
      const foundCount = finalBoxes.filter((b) => b.isGuessedCorrectly).length;
      const targetCount = currentLevel.targetCount;

      const accuracy = Math.round((foundCount / Math.max(1, foundCount + finalStrikes)) * 100);

      const recordedReflexes = finalBoxes
        .filter((b) => b.isGuessedCorrectly && b.reactionTimeMs)
        .map((b) => b.reactionTimeMs as number);

      const avgReflex =
        recordedReflexes.length > 0
          ? Math.round(recordedReflexes.reduce((a, b) => a + b, 0) / recordedReflexes.length)
          : Math.round(totalElapsed / Math.max(1, foundCount));

      const fastestReflex =
        recordedReflexes.length > 0 ? Math.min(...recordedReflexes) : avgReflex;

      const baseScore = foundCount * currentLevel.basePointsPerBox;
      const speedBonus = recordedReflexes.reduce(
        (acc, ms) => acc + calculateReflexBonus(ms).bonus,
        0
      );
      const comboBonus = Math.max(0, score - baseScore - speedBonus);
      const penaltyScore = finalStrikes * 50;
      const roundTotalScore = Math.max(0, baseScore + speedBonus + comboBonus - penaltyScore);

      const result: LevelResult = {
        levelNumber: currentLevel.levelNumber,
        targetsTotal: targetCount,
        targetsFound: foundCount,
        mistakesCount: finalStrikes,
        accuracyPercent: accuracy,
        totalTimeMs: totalElapsed,
        averageReflexMs: avgReflex,
        fastestReflexMs: fastestReflex,
        baseScore,
        speedBonus,
        comboBonus,
        penaltyScore,
        roundTotalScore,
        cleared
      };

      setCurrentLevelResult(result);
      const updatedCampaign = [...campaignResults, result];
      setCampaignResults(updatedCampaign);

      const isLastLevel = levelIndex >= GAME_LEVELS.length - 1;
      const campaignWon = cleared && isLastLevel;

      if (campaignWon) {
        setPhase('CAMPAIGN_WON');
        soundEngine.playCampaignWon();
      } else if (cleared) {
        setPhase('LEVEL_CLEARED');
        soundEngine.playLevelCleared();
      } else {
        setPhase('LEVEL_FAILED');
      }

      // Update and persist lifetime stats
      const nextStats = updateStatsWithResult(playerStats, result, campaignWon);
      setPlayerStats(nextStats);
    },
    [currentLevel, levelIndex, campaignResults, playerStats, score]
  );

  // Advance to next level
  const handleNextLevel = () => {
    if (levelIndex < GAME_LEVELS.length - 1) {
      const nextIdx = levelIndex + 1;
      startLevel(nextIdx, customMemorizeTime);
    } else {
      setPhase('CAMPAIGN_WON');
    }
  };

  // Retry current level
  const handleRetryLevel = () => {
    startLevel(levelIndex, customMemorizeTime);
  };

  // Start fresh campaign from Level 1
  const handleNewCampaign = () => {
    setScore(0);
    setCampaignResults([]);
    startLevel(0, customMemorizeTime);
  };

  // Global keyboard shortcuts (Space / Enter to advance, R to restart)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === ' ' || e.key === 'Enter') {
        if (phase === 'IDLE') {
          e.preventDefault();
          startLevel(0);
        } else if (phase === 'LEVEL_CLEARED') {
          e.preventDefault();
          handleNextLevel();
        } else if (phase === 'LEVEL_FAILED') {
          e.preventDefault();
          handleRetryLevel();
        }
      } else if (e.key.toLowerCase() === 'r') {
        if (phase !== 'MEMORIZE') {
          e.preventDefault();
          handleRetryLevel();
        }
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        const nextMute = soundEngine.toggleMute();
        setIsMuted(nextMute);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleNextLevel, handleRetryLevel, startLevel]);

  const targetsFound = boxes.filter((b) => b.isGuessedCorrectly).length;
  const targetsRemaining = Math.max(0, currentLevel.targetCount - targetsFound);

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewRun={handleNewCampaign}
        onOpenLevels={() => setShowLevelSelect(true)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
      />

      {/* Main Game Stage */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col items-center justify-between gap-6">
        {/* Top Unobtrusive HUD */}
        <HUD
          currentLevel={currentLevel}
          phase={phase}
          memorizeSecondsLeft={memorizeSecondsLeft}
          totalMemorizeSeconds={customMemorizeTime}
          targetsRemaining={targetsRemaining}
          strikes={strikes}
          score={score}
          combo={combo}
          recallElapsedMs={recallElapsedMs}
        />

        {/* Center Game Arena */}
        <div className="w-full flex flex-col items-center justify-center my-auto py-2 relative">
          {/* Phase Guidance Banner (clean unboxed typographic indicator) */}
          <div className="mb-4 text-center">
            {phase === 'IDLE' && (
              <div className="space-y-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  5×5 Neural Memory & Reflex
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  {currentLevel.targetCount} random boxes will illuminate in {currentLevel.colorName} for {customMemorizeTime} seconds. Imprint their locations, then tap them as fast as possible.
                </p>
              </div>
            )}

            {phase === 'COUNTDOWN' && (
              <div className="flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-1">
                  Prepare Imprint
                </span>
                <span className="text-4xl font-extrabold font-mono text-indigo-400 animate-ping">
                  {countdownNumber}
                </span>
              </div>
            )}

            {phase === 'MEMORIZE' && (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                  <Brain className="w-4 h-4 animate-pulse" />
                  <span>Memorize Pattern Now · Disappears in {memorizeSecondsLeft.toFixed(1)}s</span>
                </div>
                <p className="text-xs text-slate-400">
                  Observe the illuminated {currentLevel.colorName} boxes. Do not touch yet!
                </p>
              </div>
            )}

            {phase === 'RECALL' && (
              <div className="flex flex-col items-center space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  <Zap className="w-4 h-4" />
                  <span>Reflex Recall · Click the {currentLevel.targetCount} Imprinted Boxes</span>
                </div>
                <p className="text-xs text-slate-400">
                  Fast reflexes earn bonus multipliers · {targetsRemaining} remaining · Max {currentLevel.maxStrikes} strikes
                </p>
              </div>
            )}
          </div>

          {/* The 5x5 Grid */}
          <Grid5x5
            boxes={boxes}
            currentLevel={currentLevel}
            phase={phase}
            onBoxClick={handleBoxClick}
            lastFeedback={lastFeedback}
          />

          {/* Idle / Start Call to Action */}
          {phase === 'IDLE' && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => startLevel(0)}
                className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Level 1 ({currentLevel.memorizeSeconds}s Imprint)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
                <span>How to Play</span>
              </button>
            </div>
          )}

          {/* In-game quick restart control if player wants to abort */}
          {phase === 'RECALL' && (
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
              <button
                type="button"
                onClick={handleRetryLevel}
                className="flex items-center gap-1.5 hover:text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restart Level (Press R)</span>
              </button>
            </div>
          )}
        </div>

        {/* Level Progression Indicator Bar (Bottom) */}
        <div className="w-full max-w-xl mx-auto py-2 border-t border-slate-900/80">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-slate-300">Level Progression</span>
            <span>
              {levelIndex + 1} of {GAME_LEVELS.length} Completed / Active
            </span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {GAME_LEVELS.map((lvl, idx) => {
              const isPast = idx < levelIndex;
              const isCurrent = idx === levelIndex;
              return (
                <button
                  key={lvl.levelNumber}
                  type="button"
                  onClick={() => {
                    if (phase !== 'MEMORIZE') {
                      startLevel(idx);
                    }
                  }}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'bg-slate-900 border-indigo-500 text-white shadow-sm'
                      : isPast
                      ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600 hover:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold">L{lvl.levelNumber}</span>
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: lvl.themeColor }}
                    />
                  </div>
                  <span className="text-[11px] font-medium block truncate mt-0.5">
                    {lvl.targetCount} targets
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modals and Overlays */}
      {currentLevelResult && (
        <LevelSummaryModal
          isOpen={phase === 'LEVEL_CLEARED' || phase === 'LEVEL_FAILED'}
          result={currentLevelResult}
          currentLevel={currentLevel}
          hasNextLevel={levelIndex < GAME_LEVELS.length - 1}
          onNextLevel={handleNextLevel}
          onRetryLevel={handleRetryLevel}
        />
      )}

      <CampaignCompleteModal
        isOpen={phase === 'CAMPAIGN_WON'}
        results={campaignResults}
        onRestartCampaign={handleNewCampaign}
        onOpenStats={() => {
          setPhase('IDLE');
          setShowStatsModal(true);
        }}
      />

      <StatsModal
        isOpen={showStatsModal || activeTab === 'stats'}
        onClose={() => {
          setShowStatsModal(false);
          setActiveTab('game');
        }}
        stats={playerStats}
        onResetStats={() => {
          const fresh: CampaignStats = {
            gamesPlayed: 0,
            campaignsCompleted: 0,
            highScore: 0,
            bestAverageReflexMs: 0,
            fastestSingleReflexMs: 0,
            highestAccuracyPercent: 0,
            recentRuns: []
          };
          saveStats(fresh);
          setPlayerStats(fresh);
        }}
      />

      <HowToPlayModal
        isOpen={showHelpModal || activeTab === 'help'}
        onClose={() => {
          setShowHelpModal(false);
          setActiveTab('game');
        }}
      />

      <LevelSelectDrawer
        isOpen={showLevelSelect || activeTab === 'levels'}
        onClose={() => {
          setShowLevelSelect(false);
          setActiveTab('game');
        }}
        currentLevelNumber={currentLevel.levelNumber}
        onSelectLevel={(idx, memTime) => {
          startLevel(idx, memTime || customMemorizeTime);
        }}
        customMemorizeTime={customMemorizeTime}
        setCustomMemorizeTime={setCustomMemorizeTime}
      />
    </div>
  );
}
