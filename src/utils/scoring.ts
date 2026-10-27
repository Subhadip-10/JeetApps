import { CampaignStats, LevelResult } from '../types/game';

const STATS_STORAGE_KEY = 'neurogrid_player_stats_v1';

export const INITIAL_STATS: CampaignStats = {
  gamesPlayed: 0,
  campaignsCompleted: 0,
  highScore: 0,
  bestAverageReflexMs: 0,
  fastestSingleReflexMs: 0,
  highestAccuracyPercent: 0,
  recentRuns: []
};

export function loadSavedStats(): CampaignStats {
  if (typeof window === 'undefined') return INITIAL_STATS;
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return INITIAL_STATS;
    return { ...INITIAL_STATS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_STATS;
  }
}

export function saveStats(stats: CampaignStats) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

/**
 * Calculates reflex speed bonus for a single click based on elapsed milliseconds.
 * Fast reflexes (< 800ms) receive substantial bonus points.
 */
export function calculateReflexBonus(reactionMs: number): { bonus: number; rating: string } {
  if (reactionMs <= 600) {
    return { bonus: 150, rating: 'Lightning! ⚡⚡' };
  } else if (reactionMs <= 1000) {
    return { bonus: 100, rating: 'Super Fast! ⚡' };
  } else if (reactionMs <= 1800) {
    return { bonus: 60, rating: 'Quick Pace' };
  } else if (reactionMs <= 3000) {
    return { bonus: 30, rating: 'Steady' };
  } else {
    return { bonus: 10, rating: 'Deliberate' };
  }
}

/**
 * Computes player cognitive rank based on accuracy and average reaction time.
 */
export function getCognitiveArchetype(accuracy: number, avgReflexMs: number): { title: string; summary: string } {
  if (accuracy >= 95 && avgReflexMs <= 850) {
    return {
      title: 'Neural Grandmaster',
      summary: 'Exceptional combination of photographic spatial recall and millisecond twitch reflexes.'
    };
  }
  if (avgReflexMs <= 700) {
    return {
      title: 'Kinetic Reflex Prodigy',
      summary: 'Blistering motor speed and decisive instinctual selections under pressure.'
    };
  }
  if (accuracy >= 95) {
    return {
      title: 'Photographic Mind',
      summary: 'Flawless visual encoding and spatial layout retention with zero wasted moves.'
    };
  }
  if (accuracy >= 80 && avgReflexMs <= 1300) {
    return {
      title: 'Tactical Strategist',
      summary: 'Balanced performance maintaining strong visual pattern recognition and brisk reaction pacing.'
    };
  }
  return {
    title: 'Adaptive Analyst',
    summary: 'Methodical memory search with steady room for rapid reflex conditioning.'
  };
}

export function updateStatsWithResult(
  currentStats: CampaignStats,
  result: LevelResult,
  campaignFinished: boolean
): CampaignStats {
  const gamesPlayed = currentStats.gamesPlayed + 1;
  const campaignsCompleted = campaignFinished ? currentStats.campaignsCompleted + 1 : currentStats.campaignsCompleted;
  const highScore = Math.max(currentStats.highScore, result.roundTotalScore);

  const bestAverageReflexMs =
    currentStats.bestAverageReflexMs === 0
      ? result.averageReflexMs
      : Math.min(currentStats.bestAverageReflexMs, result.averageReflexMs);

  const fastestSingleReflexMs =
    currentStats.fastestSingleReflexMs === 0
      ? result.fastestReflexMs
      : Math.min(currentStats.fastestSingleReflexMs, result.fastestReflexMs);

  const highestAccuracyPercent = Math.max(currentStats.highestAccuracyPercent, result.accuracyPercent);

  const recentRuns = [result, ...(currentStats.recentRuns || [])].slice(0, 15);

  const updated: CampaignStats = {
    gamesPlayed,
    campaignsCompleted,
    highScore,
    bestAverageReflexMs,
    fastestSingleReflexMs,
    highestAccuracyPercent,
    recentRuns
  };

  saveStats(updated);
  return updated;
}
