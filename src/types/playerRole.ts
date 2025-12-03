// llf-webview/src/types/playerRole.ts

export enum PlayerRole {
  Goalkeeper = 0, // Вратарь
  Defender = 1, // Защитник
  Halfback = 2, // Полузащитник
  Forward = 3, // Нападающий
}

// Сокращенные обозначения для UI
export const PlayerRoleAbbreviation: Record<PlayerRole, string> = {
  [PlayerRole.Goalkeeper]: "ВР",
  [PlayerRole.Defender]: "ЗАЩ",
  [PlayerRole.Halfback]: "ПЗЩ",
  [PlayerRole.Forward]: "НАП",
};

// Полные названия позиций
export const PlayerRoleName: Record<PlayerRole, string> = {
  [PlayerRole.Goalkeeper]: "Вратарь",
  [PlayerRole.Defender]: "Защитник",
  [PlayerRole.Halfback]: "Полузащитник",
  [PlayerRole.Forward]: "Нападающий",
};
