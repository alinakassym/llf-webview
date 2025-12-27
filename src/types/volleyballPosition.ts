// llf-webview/src/types/volleyballPosition.ts

export type VolleyballPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Lang = "ru" | "kk" | "en";

type PositionMeta = {
  short: Record<Lang, string>;
  label: Record<Lang, string>;
};

export const VOLLEYBALL_POSITIONS = {
  0: {
    short: { ru: "?", kk: "?", en: "?" },
    label: { ru: "Не указана", kk: "Көрсетілмеген", en: "Unknown" },
  },
  1: {
    short: { ru: "СВ", kk: "БС", en: "S" },
    label: { ru: "Связующий", kk: "Байланыстырушы", en: "Setter" },
  },
  2: {
    short: { ru: "НАП", kk: "ШАБ", en: "OH" },
    label: { ru: "Нападающий", kk: "Шабуылшы", en: "Outside Hitter" },
  },
  3: {
    short: { ru: "БЛОК", kk: "БЛК", en: "MB" },
    label: { ru: "Блокирующий", kk: "Блок қоюшы", en: "Middle Blocker" },
  },
  4: {
    short: { ru: "ДИАГ", kk: "ДИАГ", en: "OPP" },
    label: { ru: "Диагональный", kk: "Диагональ", en: "Opposite" },
  },
  5: {
    short: { ru: "ЛИБ", kk: "ЛИБ", en: "L" },
    label: { ru: "Либеро", kk: "Либеро", en: "Libero" },
  },
  6: {
    short: { ru: "ЗАЩ", kk: "ҚОР", en: "DEF" },
    label: { ru: "Защитник", kk: "Қорғаныс ойыншысы", en: "Defender" },
  },
} satisfies Record<VolleyballPosition, PositionMeta>;
