// llf-webview/src/types/volleyballPosition.ts

export type VolleyballPosition = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type Lang = "ru" | "kk";

type PositionMeta = {
  short: Record<Lang, string>;
  label: Record<Lang, string>;
};

export const VOLLEYBALL_POSITIONS = {
  0: {
    short: { ru: "?", kk: "?" },
    label: { ru: "Не указана", kk: "Көрсетілмеген" },
  },
  1: {
    short: { ru: "СВ", kk: "БС" },
    label: { ru: "Связующий", kk: "Байланыстырушы" },
  },
  2: {
    short: { ru: "НАП", kk: "ШАБ" },
    label: { ru: "Нападающий", kk: "Шабуылшы" },
  },
  3: {
    short: { ru: "БЛОК", kk: "БЛК" },
    label: { ru: "Блокирующий", kk: "Блок қоюшы" },
  },
  4: {
    short: { ru: "ДИАГ", kk: "ДИАГ" },
    label: { ru: "Диагональный", kk: "Диагональ" },
  },
  5: {
    short: { ru: "ЛИБ", kk: "ЛИБ" },
    label: { ru: "Либеро", kk: "Либеро" },
  },
  6: {
    short: { ru: "ЗАЩ", kk: "ҚОР" },
    label: { ru: "Защитник", kk: "Қорғаныс ойыншысы" },
  },
} satisfies Record<VolleyballPosition, PositionMeta>;
