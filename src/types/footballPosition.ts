// llf-webview/src/types/footballPosition.ts

export type FootballPosition = 0 | 1 | 2 | 3;

export type Lang = "ru" | "kk" | "en";

type PositionMeta = {
  short: Record<Lang, string>;
  label: Record<Lang, string>;
};

export const FOOTBALL_POSITIONS = {
  0: {
    short: { ru: "ВР", kk: "ҚА", en: "GK" },
    label: { ru: "Вратарь", kk: "Қақпашы", en: "Goalkeeper" },
  },
  1: {
    short: { ru: "ЗАЩ", kk: "ҚОР", en: "DEF" },
    label: { ru: "Защитник", kk: "Қорғаушы", en: "Defender" },
  },
  2: {
    short: { ru: "ПЗЩ", kk: "ЖҚР", en: "MID" },
    label: { ru: "Полузащитник", kk: "Жартылай қорғаушы", en: "Midfielder" },
  },
  3: {
    short: { ru: "НАП", kk: "ШАБ", en: "FWD" },
    label: { ru: "Нападающий", kk: "Шабуылшы", en: "Forward" },
  },
} satisfies Record<FootballPosition, PositionMeta>;
