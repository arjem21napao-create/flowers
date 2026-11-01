export interface RoseTheme {
  id: string;
  name: string;
  petalColor: [number, number, number]; // RGB 0-1 for shader vertex color
  glowColor: string; // hex
  ambientColor: number;
  lightColor: number;
  bgGradient: string;
}

export const ROSE_THEMES: RoseTheme[] = [
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    petalColor: [0.55, 0.12, 0.95],
    glowColor: '#b44dff',
    ambientColor: 0x7a3ac0,
    lightColor: 0xe6c0ff,
    bgGradient: 'radial-gradient(circle at 50% 40%, #2a0a4a, #07020f 70%)',
  },
  {
    id: 'midnight-amethyst',
    name: 'Midnight Amethyst',
    petalColor: [0.42, 0.08, 0.78],
    glowColor: '#9333ea',
    ambientColor: 0x581c87,
    lightColor: 0xd8b4fe,
    bgGradient: 'radial-gradient(circle at 50% 40%, #1e0936, #05010a 70%)',
  },
  {
    id: 'velvet-magenta',
    name: 'Velvet Magenta',
    petalColor: [0.72, 0.08, 0.65],
    glowColor: '#d946ef',
    ambientColor: 0x86198f,
    lightColor: 0xf5d0fe,
    bgGradient: 'radial-gradient(circle at 50% 40%, #3b0730, #090107 70%)',
  },
  {
    id: 'lavender-mist',
    name: 'Lavender Mist',
    petalColor: [0.65, 0.35, 0.95],
    glowColor: '#c084fc',
    ambientColor: 0x6b21a8,
    lightColor: 0xf3e8ff,
    bgGradient: 'radial-gradient(circle at 50% 40%, #2e1065, #080314 70%)',
  },
  {
    id: 'mystic-indigo',
    name: 'Deep Twilight',
    petalColor: [0.3, 0.15, 0.9],
    glowColor: '#818cf8',
    ambientColor: 0x3730a3,
    lightColor: 0xe0e7ff,
    bgGradient: 'radial-gradient(circle at 50% 40%, #1e1b4b, #040310 70%)',
  },
];
