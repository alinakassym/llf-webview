import type { Lang, VolleyballPosition } from "../types/volleyballPosition";
import { VOLLEYBALL_POSITIONS } from "../types/volleyballPosition";

/**
 * Возвращает короткое название позиции волейболиста
 * @param position - позиция волейболиста (0-6)
 * @param lang - язык ("ru" | "kk")
 * @returns короткое название позиции
 * @example
 * getVolleyballPositionShort(1, "ru"); // "СВ"
 * getVolleyballPositionShort(1, "kk"); // "БС"
 */
export const getVolleyballPositionShort = (
  position: VolleyballPosition,
  lang: Lang,
): string => VOLLEYBALL_POSITIONS[position].short[lang];

/**
 * Возвращает полное название позиции волейболиста
 * @param position - позиция волейболиста (0-6)
 * @param lang - язык ("ru" | "kk")
 * @returns полное название позиции
 * @example
 * getVolleyballPositionLabel(6, "ru"); // "Защитник"
 * getVolleyballPositionLabel(6, "kk"); // "Қорғаныс ойыншысы"
 */
export const getVolleyballPositionLabel = (
  position: VolleyballPosition,
  lang: Lang,
): string => VOLLEYBALL_POSITIONS[position].label[lang];
