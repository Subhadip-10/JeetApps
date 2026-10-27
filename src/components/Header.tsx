import React from 'react';
import { Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  onNewRun: () => void;
  onOpenLevels: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  activeTab: 'game' | 'levels' | 'stats' | 'help';
  setActiveTab: (tab: 'game' | 'levels' | 'stats' | 'help') => void;
  isMuted: boolean;
  setIsMuted: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({
  onNewRun,
  onOpenLevels,
  onOpenStats,
  onOpenHelp,
  activeTab,
  setActiveTab,
  isMuted,
  setIsMuted
}) => {
  const handleToggleMute = () => {
    const next = soundEngine.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand wordmark (single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('game')}
            className="text-left text-lg font-bold tracking-tight text-white hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5"
          >
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] inline-block" />
            <span>NeuroGrid</span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('game')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'game' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Play Game
          </button>
          <button
            onClick={onOpenLevels}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'levels' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Levels (1–5)
          </button>
          <button
            onClick={onOpenStats}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'stats' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            Performance & Records
          </button>
          <button
            onClick={onOpenHelp}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'help' ? 'text-white border-b-2 border-indigo-500 pb-0.5' : 'hover:text-slate-200'
            }`}
          >
            How to Play
          </button>
        </nav>

        {/* Zone 3: Primary Action & Audio Mute */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            title={isMuted ? 'Unmute audio effects' : 'Mute audio effects'}
            className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-lg hover:border-slate-700 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onNewRun}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-200 active:scale-95 transition-all whitespace-nowrap shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>
    </header>
  );
};
