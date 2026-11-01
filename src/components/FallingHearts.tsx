import { useMemo } from 'react';

interface FallingHeartsProps {
  density?: number;
}

export function FallingHearts({ density = 18 }: FallingHeartsProps) {
  const particles = useMemo(() => {
    const list = [];
    const symbols = ['💜', '✨', '🌸', '💜', '💜'];

    for (let i = 0; i < density; i++) {
      list.push({
        id: i,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        left: Math.random() * 98,
        duration: 7 + Math.random() * 9,
        delay: -(Math.random() * 12),
        size: 13 + Math.random() * 15,
        opacity: 0.35 + Math.random() * 0.45,
        blur: Math.random() > 0.6 ? 'blur-[0.5px]' : '',
      });
    }
    return list;
  }, [density]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <span
          key={p.id}
          className={`absolute text-purple-300 pointer-events-none select-none drop-shadow-[0_0_8px_#b44dff] ${p.blur}`}
          style={{
            top: '-30px',
            left: `${p.left}vw`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `fall ${p.duration}s linear infinite`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}
