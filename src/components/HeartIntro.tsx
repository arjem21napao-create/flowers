import { useState, useEffect } from 'react';

interface HeartIntroProps {
  onOpen: () => void;
  isOpen: boolean;
}

export function HeartIntro({ onOpen, isOpen }: HeartIntroProps) {
  const [opening, setOpening] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    if (isOpen && !opening) {
      setOpening(true);
      const timer = setTimeout(() => {
        setGone(true);
      }, 950);
      return () => clearTimeout(timer);
    } else if (!isOpen && gone) {
      setGone(false);
      setOpening(false);
    }
  }, [isOpen]);

  const handleOpen = () => {
    if (opening || gone) return;
    setOpening(true);
    onOpen();
    setTimeout(() => {
      setGone(true);
    }, 950);
  };

  if (gone) return null;

  return (
    <div
      onClick={handleOpen}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-800 backdrop-blur-sm select-none ${
        opening ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 45%, #23083d, #07020f 80%)',
      }}
    >
      {/* Title */}
      <h2 className="font-cormorant text-2xl md:text-3xl font-light tracking-[0.25em] text-[#f1dcff] drop-shadow-[0_0_16px_#b44dff] uppercase animate-pulse">
        my heart
      </h2>

      {/* Beating Split Heart */}
      <div
        className={`relative w-[190px] h-[170px] ${
          opening ? '' : 'animate-[beat_1.3s_infinite_ease-in-out]'
        }`}
      >
        {/* Left Half */}
        <div
          className={`absolute top-0 left-0 w-1/2 h-full overflow-hidden transition-all duration-1000 ease-out origin-bottom-left ${
            opening ? '-translate-x-16 -rotate-[38deg] opacity-0' : ''
          }`}
        >
          <svg
            viewBox="0 0 100 90"
            className="absolute top-0 left-0 w-[190px] h-[170px] drop-shadow-[0_0_18px_#b44dff] drop-shadow-[0_0_40px_#8a2be2]"
          >
            <path
              d="M50 85C10 55 0 35 0 22 0 8 11 0 24 0c11 0 21 6 26 16C55 6 65 0 76 0c13 0 24 8 24 22 0 13-10 33-50 63z"
              fill="#9b30ff"
            />
          </svg>
        </div>

        {/* Right Half */}
        <div
          className={`absolute top-0 right-0 w-1/2 h-full overflow-hidden transition-all duration-1000 ease-out origin-bottom-right ${
            opening ? 'translate-x-16 rotate-[38deg] opacity-0' : ''
          }`}
        >
          <svg
            viewBox="0 0 100 90"
            className="absolute top-0 right-0 w-[190px] h-[170px] drop-shadow-[0_0_18px_#b44dff] drop-shadow-[0_0_40px_#8a2be2]"
          >
            <path
              d="M50 85C10 55 0 35 0 22 0 8 11 0 24 0c11 0 21 6 26 16C55 6 65 0 76 0c13 0 24 8 24 22 0 13-10 33-50 63z"
              fill="#9b30ff"
            />
          </svg>
        </div>
      </div>

      {/* Interactive Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleOpen();
        }}
        className="font-cormorant text-base md:text-lg tracking-wide px-7 py-3 rounded-full border border-[#b44dff] bg-[#b44dff]/15 text-[#f1dcff] shadow-[0_0_20px_rgba(180,77,255,0.6)] hover:shadow-[0_0_35px_rgba(180,77,255,0.9)] hover:bg-[#b44dff]/25 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
      >
        please open my heart 💜
      </button>

      {/* Subtle hint */}
      <p className="text-xs text-[#d8b4fe]/60 tracking-wider font-light">
        tap anywhere to open
      </p>
    </div>
  );
}
