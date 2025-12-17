// llf-webview/src/types/sportType.ts

export const SportType = {
  Football: 1, // Футбол
  Volleyball: 2, // Волейбол
} as const;

export type SportType = (typeof SportType)[keyof typeof SportType];

// Полные названия видов спорта
export const SportTypeName: Record<SportType, string> = {
  [SportType.Football]: "Футбол",
  [SportType.Volleyball]: "Волейбол",
};
