import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Rose3D, Rose3DHandle } from './components/Rose3D';
import { HeartIntro } from './components/HeartIntro';
import { ControlsDock } from './components/ControlsDock';
import { LoveLetterModal } from './components/LoveLetterModal';
import { FallingHearts } from './components/FallingHearts';
import { ROSE_THEMES, RoseTheme } from './types';
import { soundManager } from './utils/audio';

export default function App() {
  const [isOpened, setIsOpened] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<RoseTheme>(ROSE_THEMES[0]);
  const [bloom, setBloom] = useState(0.85); // nicely bloomed by default
  const [showDewDrops, setShowDewDrops] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  const [rotationSpeed] = useState(1.0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [isLetterOpen, setIsLetterOpen] = useState(false);
  const [hasWebGlError, setHasWebGlError] = useState(false);

  const roseRef = useRef<Rose3DHandle>(null);

  // Handle opening heart transition
  const handleOpenHeart = () => {
    setIsOpened(true);
    soundManager.playHeartOpenChime();

    // Start background music box
    soundManager.start();
    setIsMusicPlaying(true);

    // Celebration burst of hearts
    try {
      confetti({
        particleCount: 45,
        spread: 60,
        origin: { y: 0.5 },
        colors: ['#b44dff', '#d946ef', '#f5d0fe', '#9333ea'],
      });
    } catch {
      // Ignored if canvas not ready
    }
  };

  // Blow a kiss interaction
  const handleBlowKiss = () => {
    roseRef.current?.triggerKissBurst();
    soundManager.playKissChime();

    try {
      confetti({
        particleCount: 35,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#e879f9', '#b44dff', '#fbcfe8', '#a855f7'],
        shapes: ['circle'],
      });
    } catch {
      // safe fallback
    }
  };

  // Toggle music
  const handleToggleMusic = () => {
    const active = soundManager.toggle();
    setIsMusicPlaying(active);
  };

  // Replay heart opening
  const handleReplayHeart = () => {
    setIsOpened(false);
    roseRef.current?.resetView();
  };

  // Capture photo
  const handleCaptureScreenshot = () => {
    const dataUrl = roseRef.current?.captureScreenshot();
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.download = `For-Crish-Purple-Rose-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Keyboard shortcut: H for hiding/showing dock, Space for kiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && isOpened && !isLetterOpen) {
        e.preventDefault();
        handleBlowKiss();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpened, isLetterOpen]);

  return (
    <main
      className="relative w-screen h-screen overflow-hidden flex flex-col items-center justify-between text-[#f1dcff] select-none transition-all duration-1000"
      style={{
        background: currentTheme.bgGradient,
      }}
    >
      {/* Intro Overlay: Split Heart */}
      <HeartIntro isOpen={isOpened} onOpen={handleOpenHeart} />

      {/* Ambient Floating Hearts in background */}
      {isOpened && <FallingHearts density={16} />}

      {/* Top Header: "Hi Crish 💜" and "flower for you" */}
      <header
        className={`relative z-20 flex flex-col items-center text-center pt-5 sm:pt-7 px-4 pointer-events-none transition-all duration-1000 ${
          isOpened ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
      >
        <h1 className="font-cormorant font-normal text-3xl sm:text-4xl md:text-5xl lg:text-6xl tracking-wide flick-text">
          Hi Crish 💜
        </h1>
        <p className="font-cormorant text-sm sm:text-base md:text-lg tracking-[0.25em] text-[#d8b4fe]/85 uppercase mt-1">
          flower for you
        </p>
      </header>

      {/* Central 3D Rose Canvas Container */}
      <div
        className={`relative z-10 w-full flex-1 max-w-[620px] max-h-[680px] my-auto flex items-center justify-center transition-all duration-1000 ${
          isOpened ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        {!hasWebGlError ? (
          <Rose3D
            ref={roseRef}
            theme={currentTheme}
            bloom={bloom}
            showDewDrops={showDewDrops}
            autoRotate={autoRotate}
            rotationSpeed={rotationSpeed}
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <img
              src="/assets/aistudio/Paste_November_01__2026_-_11_18PM_7e4df527"
              alt="Purple Rose"
              className="w-72 h-72 rounded-2xl object-cover shadow-[0_0_35px_rgba(180,77,255,0.7)]"
              onError={() => {}}
            />
            <p className="text-sm text-[#d8b4fe]">A timeless purple rose for Crish 💜</p>
          </div>
        )}

        {/* Subtle drag hint overlay */}
        {isOpened && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-40 hover:opacity-80 transition-opacity text-[11px] sm:text-xs text-[#d8b4fe] tracking-wider text-center whitespace-nowrap">
            ✦ drag to rotate • scroll to zoom ✦
          </div>
        )}
      </div>

      {/* Interactive Bottom Control Dock */}
      {isOpened && (
        <ControlsDock
          currentTheme={currentTheme}
          onSelectTheme={setCurrentTheme}
          bloom={bloom}
          onBloomChange={setBloom}
          showDewDrops={showDewDrops}
          onToggleDewDrops={() => setShowDewDrops(!showDewDrops)}
          autoRotate={autoRotate}
          onToggleAutoRotate={() => setAutoRotate(!autoRotate)}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
          onBlowKiss={handleBlowKiss}
          onOpenLetter={() => setIsLetterOpen(true)}
          onCaptureScreenshot={handleCaptureScreenshot}
          onReplayHeart={handleReplayHeart}
        />
      )}

      {/* Love Letter Modal dedicated to Crish */}
      <LoveLetterModal
        isOpen={isLetterOpen}
        onClose={() => setIsLetterOpen(false)}
        recipientName="Crish"
      />
    </main>
  );
}
