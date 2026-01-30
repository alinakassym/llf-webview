// llf-webview/src/utils/dateFormat.ts

/**
 * Форматирует дату в формат DD.MM.YYYY
 * @param dateString - строка с датой в формате ISO (например, "2025-11-01T00:00:00Z")
 * @returns отформатированная дата в формате DD.MM.YYYY
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}.${month}.${year}`;
};

/**
 * Вычисляет возраст из даты рождения
 * @param dateOfBirth - строка с датой рождения в формате ISO
 * @returns возраст в годах
 */
export const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Форматирует дату в формат datetime-local (YYYY-MM-DDTHH:mm) используя локальное время
 * @param date - объект Date
 * @returns отформатированная строка в формате YYYY-MM-DDTHH:mm
 */
export const formatDateTimeLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
