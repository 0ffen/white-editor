type Level = 1 | 2 | 3 | 4 | 5 | 6;

interface HeadingOption {
  label: string;
  level: Level | null;
}

export type { Level, HeadingOption };
