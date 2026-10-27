import { LevelConfig } from '../types/game';

export const GAME_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    title: 'Level 1: Neural Ignition',
    subtitle: '5 target boxes · 6 seconds to imprint',
    targetCount: 5,
    memorizeSeconds: 6,
    maxStrikes: 3,
    basePointsPerBox: 100,
    colorName: 'Emerald Matrix',
    themeColor: '#10b981', // emerald-500
    themeBorder: 'border-emerald-500/50',
    themeGlow: 'shadow-[0_0_24px_rgba(16,185,129,0.45)]',
    themeBg: 'bg-emerald-500',
    themeText: 'text-emerald-400'
  },
  {
    levelNumber: 2,
    title: 'Level 2: Cobalt Stream',
    subtitle: '7 target boxes · 6 seconds to imprint',
    targetCount: 7,
    memorizeSeconds: 6,
    maxStrikes: 3,
    basePointsPerBox: 140,
    colorName: 'Cobalt Flux',
    themeColor: '#0284c7', // sky-600
    themeBorder: 'border-sky-500/50',
    themeGlow: 'shadow-[0_0_24px_rgba(2,132,199,0.45)]',
    themeBg: 'bg-sky-500',
    themeText: 'text-sky-400'
  },
  {
    levelNumber: 3,
    title: 'Level 3: Amber Surge',
    subtitle: '9 target boxes · 6 seconds to imprint',
    targetCount: 9,
    memorizeSeconds: 6,
    maxStrikes: 3,
    basePointsPerBox: 180,
    colorName: 'Amber Flare',
    themeColor: '#f59e0b', // amber-500
    themeBorder: 'border-amber-500/50',
    themeGlow: 'shadow-[0_0_24px_rgba(245,158,11,0.45)]',
    themeBg: 'bg-amber-500',
    themeText: 'text-amber-400'
  },
  {
    levelNumber: 4,
    title: 'Level 4: Violet Overdrive',
    subtitle: '11 target boxes · 6 seconds to imprint · 2 strikes only',
    targetCount: 11,
    memorizeSeconds: 6,
    maxStrikes: 2,
    basePointsPerBox: 230,
    colorName: 'Violet Pulse',
    themeColor: '#8b5cf6', // violet-500
    themeBorder: 'border-violet-500/50',
    themeGlow: 'shadow-[0_0_24px_rgba(139,92,246,0.45)]',
    themeBg: 'bg-violet-500',
    themeText: 'text-violet-400'
  },
  {
    levelNumber: 5,
    title: 'Level 5: Crimson Apex',
    subtitle: '14 target boxes · 6 seconds to imprint · Master tier',
    targetCount: 14,
    memorizeSeconds: 6,
    maxStrikes: 2,
    basePointsPerBox: 300,
    colorName: 'Crimson Core',
    themeColor: '#f43f5e', // rose-500
    themeBorder: 'border-rose-500/50',
    themeGlow: 'shadow-[0_0_24px_rgba(244,63,94,0.45)]',
    themeBg: 'bg-rose-500',
    themeText: 'text-rose-400'
  }
];

export const GRID_SIZE = 5;
export const TOTAL_CELLS = GRID_SIZE * GRID_SIZE; // 25
