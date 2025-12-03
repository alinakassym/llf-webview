import { type FC } from "react";
import { Box } from "@mui/material";
import PlayerPreviewCard from "./PlayerPreviewCard";
import type { PlayerProfile } from "../types/player";

interface PlayersListProps {
  players: PlayerProfile[];
  onPlayerClick: (userId: number) => void;
}

// Маппинг позиций для мини-футбола
const getPositionName = (position: number): string => {
  const positions: Record<number, string> = {
    1: "Вратарь",
    2: "Защитник",
    3: "Полузащитник",
    4: "Нападающий",
  };
  return positions[position] || "Неизвестно";
};

const PlayersList: FC<PlayersListProps> = ({ players, onPlayerClick }) => {
  if (players.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          color: "text.secondary",
        }}
      >
        Игроки не найдены
      </Box>
    );
  }

  return (
    <Box>
      {players.map((player) => (
        <PlayerPreviewCard
          key={player.userId}
          fullName={player.fullName}
          age={player.age}
          position={getPositionName(player.position)}
          onClick={() => onPlayerClick(player.userId)}
        />
      ))}
    </Box>
  );
};

export default PlayersList;
