export const VolleyballPosition = {
  Unknown: 0,
  Setter: 1, // Связующий
  OutsideHitter: 2, // Нападающий
  MiddleBlocker: 3, // Блокирующий
  Opposite: 4, // Диагональный
  Libero: 5, // Либеро
  DefensiveSpecialist: 6, // Защитник
} as const;

export type VolleyballPosition =
  (typeof VolleyballPosition)[keyof typeof VolleyballPosition];

// Сокращения позиций для отображения на поле
export const VolleyballPositionAbbreviation: Record<VolleyballPosition, string> = {
  [VolleyballPosition.Unknown]: "?",
  [VolleyballPosition.Setter]: "СВ",
  [VolleyballPosition.OutsideHitter]: "НАП",
  [VolleyballPosition.MiddleBlocker]: "БЛОК",
  [VolleyballPosition.Opposite]: "ДИАГ",
  [VolleyballPosition.Libero]: "ЛИБ",
  [VolleyballPosition.DefensiveSpecialist]: "ЗАЩ",
};

// Полные названия позиций
export const VolleyballPositionName: Record<VolleyballPosition, string> = {
  [VolleyballPosition.Unknown]: "Не указана",
  [VolleyballPosition.Setter]: "Связующий",
  [VolleyballPosition.OutsideHitter]: "Нападающий",
  [VolleyballPosition.MiddleBlocker]: "Блокирующий",
  [VolleyballPosition.Opposite]: "Диагональный",
  [VolleyballPosition.Libero]: "Либеро",
  [VolleyballPosition.DefensiveSpecialist]: "Защитник",
};
