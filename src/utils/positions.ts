// llf-webview/src/utils/positions.ts

import { SportType } from "../types/sportType";
import { VOLLEYBALL_POSITIONS } from "../types/volleyballPosition";
import { FOOTBALL_POSITIONS } from "../types/footballPosition";

export type Lang = "ru" | "kk" | "en";

type PositionMeta = {
  short: Record<Lang, string>;
  label: Record<Lang, string>;
};

type Option = {
  value: number;
  label: string;
};

const mapPositionsToOptions = (
  positions: Record<number, PositionMeta>,
  lang: Lang,
): Option[] => {
  return Object.entries(positions)
    .map(([value, meta]) => ({
      value: Number(value),
      label: meta.label[lang],
    }))
    .sort((a, b) => a.value - b.value);
};

export const getPositionOptions = (
  sportType: SportType,
  lang: Lang,
): Option[] => {
  if (sportType === SportType.Volleyball) {
    return mapPositionsToOptions(VOLLEYBALL_POSITIONS, lang);
  }

  if (sportType === SportType.Football) {
    return mapPositionsToOptions(FOOTBALL_POSITIONS, lang);
  }

  return [];
};
