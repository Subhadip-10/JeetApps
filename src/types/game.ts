export type GamePhase =
  | 'IDLE'
  | 'COUNTDOWN'
  | 'MEMORIZE'
  | 'RECALL'
  | 'LEVEL_CLEARED'
  | 'LEVEL_FAILED'
  | 'CAMPAIGN_WON';

export interface LevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  targetCount: number;
  memorizeSeconds: number; // default 6s
  maxStrikes: number;
  basePointsPerBox: number;
  colorName: string;
  themeColor: string; // hex
  themeBorder: string;
  themeGlow: string;
  themeBg: string;
  themeText: string;
}

export interface BoxState {
  index: number;
  row: number;
  col: number;
  isTarget: boolean;
  isRevealedDuringMemorize: boolean;
  isGuessedCorrectly: boolean;
  isGuessedIncorrectly: boolean;
  guessTimestamp?: number;
  reactionTimeMs?: number;
}

export interface LevelResult {
  levelNumber: number;
  targetsTotal: number;
  targetsFound: number;
  mistakesCount: number;
  accuracyPercent: number;
  totalTimeMs: number;
  averageReflexMs: number;
  fastestReflexMs: number;
  baseScore: number;
  speedBonus: number;
  comboBonus: number;
  penaltyScore: number;
  roundTotalScore: number;
  cleared: boolean;
}

export interface CampaignStats {
  gamesPlayed: number;
  campaignsCompleted: number;
  highScore: number;
  bestAverageReflexMs: number;
  fastestSingleReflexMs: number;
  highestAccuracyPercent: number;
  recentRuns: LevelResult[];
}
