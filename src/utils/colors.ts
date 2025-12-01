/**
 * Затемняет HEX цвет на заданный процент
 * @param color - HEX цвет (например, "#0057A6")
 * @param amount - процент затемнения от 0 до 1 (например, 0.3 = 30%)
 * @returns затемненный HEX цвет
 */
export const darkenColor = (color: string, amount: number = 0.3): string => {
  // Убираем # если есть
  const hex = color.replace("#", "");

  // Конвертируем в RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Затемняем каждый канал
  const newR = Math.max(0, Math.floor(r * (1 - amount)));
  const newG = Math.max(0, Math.floor(g * (1 - amount)));
  const newB = Math.max(0, Math.floor(b * (1 - amount)));

  // Конвертируем обратно в HEX
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};

/**
 * Осветляет HEX цвет на заданный процент
 * @param color - HEX цвет (например, "#0057A6")
 * @param amount - процент осветления от 0 до 1 (например, 0.3 = 30%)
 * @returns осветленный HEX цвет
 */
export const lightenColor = (color: string, amount: number = 0.3): string => {
  // Убираем # если есть
  const hex = color.replace("#", "");

  // Конвертируем в RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Осветляем каждый канал
  const newR = Math.min(255, Math.floor(r + (255 - r) * amount));
  const newG = Math.min(255, Math.floor(g + (255 - g) * amount));
  const newB = Math.min(255, Math.floor(b + (255 - b) * amount));

  // Конвертируем обратно в HEX
  return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
};
