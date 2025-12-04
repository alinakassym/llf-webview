/**
 * Форматирует дату в формат DD.MM.YYYY
 * @param dateString - строка с датой в формате ISO (например, "2025-11-01T00:00:00Z")
 * @returns отформатированная дата в формате DD.MM.YYYY
 */
// llf-webview/src/utils/dateFormat.ts
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};
