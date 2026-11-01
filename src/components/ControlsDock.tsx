import { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Camera,
  Heart,
  Mail,
  ChevronDown,
  ChevronUp,
  Droplets,
  RotateCw,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { RoseTheme, ROSE_THEMES } from '../types';

interface ControlsDockProps {
  currentTheme: RoseTheme;
  onSelectTheme: (theme: RoseTheme) => void;
  bloom: number;
  onBloomChange: (bloom: number) => void;
  showDewDrops: boolean;
  onToggleDewDrops: () => void;
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
  onBlowKiss: () => void;
  onOpenLetter: () => void;
  onCaptureScreenshot: () => void;
  onReplayHeart: () => void;
}

export function ControlsDock({
  currentTheme,
  onSelectTheme,
  bloom,
  onBloomChange,
  showDewDrops,
  onToggleDewDrops,
  autoRotate,
  onToggleAutoRotate,
  isMusicPlaying,
  onToggleMusic,
  onBlowKiss,
  onOpenLetter,
  onCaptureScreenshot,
  onReplayHeart,
}: ControlsDockProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'bloom' | 'colors' | 'options'>('bloom');

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94vw] max-w-[840px] flex flex-col items-center pointer-events-auto">
      {/* Collapse / Expand Toggle Tab */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-[#140628]/90 border-t border-x border-[#b44dff]/40 text-[#d8b4fe] text-xs font-medium tracking-wider backdrop-blur-md hover:text-white transition-all shadow-[0_-5px_15px_rgba(180,77,255,0.25)]"
        title={isCollapsed ? 'Show Controls (H)' : 'Hide Controls (H)'}
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-[#b44dff]" />
            <span>Show Keepsake Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-[#b44dff]" />
            <span>Zen Mode (Hide Controls)</span>
          </>
        )}
      </button>

      {/* Main Dock Container */}
      {!isCollapsed && (
        <div className="w-full bg-[#120524]/92 border border-[#b44dff]/40 rounded-2xl rounded-t-none md:rounded-2xl p-3.5 md:p-4 backdrop-blur-lg shadow-[0_10px_40px_rgba(7,2,15,0.85),0_0_25px_rgba(180,77,255,0.25)] text-[#f1dcff] transition-all">
          {/* Quick Action Top Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-[#b44dff]/20">
            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={onBlowKiss}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#b44dff]/25 border border-[#b44dff]/60 text-[#f5e6ff] text-xs md:text-sm font-medium hover:bg-[#b44dff]/40 hover:shadow-[0_0_15px_#b44dff] active:scale-95 transition-all"
                title="Send floating hearts and chimes to the rose"
              >
                <Heart className="w-3.5 h-3.5 text-[#e879f9] fill-[#e879f9]" />
                <span>Blow a Kiss 💋</span>
              </button>

              <button
                onClick={onOpenLetter}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#7c3aed]/25 border border-[#a855f7]/50 text-[#f3e8ff] text-xs md:text-sm font-medium hover:bg-[#7c3aed]/40 hover:shadow-[0_0_15px_#9333ea] active:scale-95 transition-all"
                title="Read heartfelt love letter"
              >
                <Mail className="w-3.5 h-3.5 text-[#d8b4fe]" />
                <span>Letter for Crish 💌</span>
              </button>

              <button
                onClick={onCaptureScreenshot}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/20 text-[#e9d5ff] text-xs md:text-sm hover:bg-white/10 active:scale-95 transition-all"
                title="Save high-resolution photo keepsake"
              >
                <Camera className="w-3.5 h-3.5 text-[#c084fc]" />
                <span className="hidden sm:inline">Photo</span>
              </button>
            </div>

            {/* Utility Icons: Audio & Replay */}
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMusic}
                className={`p-2 rounded-full border transition-all ${
                  isMusicPlaying
                    ? 'border-[#b44dff] bg-[#b44dff]/30 text-[#f5e6ff] shadow-[0_0_12px_#b44dff]'
                    : 'border-white/20 bg-white/5 text-[#a855f7] hover:bg-white/10'
                }`}
                title={isMusicPlaying ? 'Mute Music Box' : 'Play Music Box Melody'}
              >
                {isMusicPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={onReplayHeart}
                className="p-2 rounded-full border border-white/20 bg-white/5 text-[#d8b4fe] hover:bg-white/10 active:scale-95 transition-all"
                title="Close and replay opening heart"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtabs for Customization */}
          <div className="flex items-center justify-between gap-4 flex-wrap text-xs md:text-sm">
            {/* Tab Selectors */}
            <div className="flex items-center gap-1 bg-[#090117] p-1 rounded-xl border border-[#b44dff]/25">
              <button
                onClick={() => setActiveTab('bloom')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'bloom'
                    ? 'bg-[#b44dff]/40 text-white shadow-[0_0_10px_#b44dff]'
                    : 'text-[#d8b4fe]/70 hover:text-white'
                }`}
              >
                Petal Bloom
              </button>
              <button
                onClick={() => setActiveTab('colors')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'colors'
                    ? 'bg-[#b44dff]/40 text-white shadow-[0_0_10px_#b44dff]'
                    : 'text-[#d8b4fe]/70 hover:text-white'
                }`}
              >
                Shade
              </button>
              <button
                onClick={() => setActiveTab('options')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  activeTab === 'options'
                    ? 'bg-[#b44dff]/40 text-white shadow-[0_0_10px_#b44dff]'
                    : 'text-[#d8b4fe]/70 hover:text-white'
                }`}
              >
                Details
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 flex items-center justify-end">
              {activeTab === 'bloom' && (
                <div className="flex items-center gap-3 w-full max-w-xs">
                  <span className="text-xs text-[#d8b4fe]/70 whitespace-nowrap">Bud</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={bloom}
                    onChange={(e) => onBloomChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#2a0e4d] rounded-lg appearance-none cursor-pointer accent-[#b44dff]"
                    title="Slide to bloom petals"
                  />
                  <span className="text-xs text-[#d8b4fe] font-medium whitespace-nowrap">Bloom</span>
                </div>
              )}

              {activeTab === 'colors' && (
                <div className="flex items-center gap-2 flex-wrap">
                  {ROSE_THEMES.map((theme) => {
                    const isSelected = currentTheme.id === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => onSelectTheme(theme)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs transition-all ${
                          isSelected
                            ? 'border-white bg-[#b44dff]/40 text-white shadow-[0_0_12px_#b44dff]'
                            : 'border-[#b44dff]/30 bg-black/30 text-[#d8b4fe]/70 hover:text-white'
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: theme.glowColor }}
                        />
                        <span>{theme.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {activeTab === 'options' && (
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={onToggleDewDrops}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-xs transition-all ${
                      showDewDrops
                        ? 'border-[#38bdf8] bg-[#38bdf8]/20 text-[#bae6fd]'
                        : 'border-white/20 text-white/50'
                    }`}
                    title="Toggle morning dew drops"
                  >
                    <Droplets className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Dewdrops</span>
                  </button>

                  <button
                    onClick={onToggleAutoRotate}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg border text-xs transition-all ${
                      autoRotate
                        ? 'border-[#a855f7] bg-[#a855f7]/20 text-[#f3e8ff]'
                        : 'border-white/20 text-white/50'
                    }`}
                    title="Toggle gentle spin"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-[#c084fc]" />
                    <span>Spin</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
