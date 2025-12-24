// llf-webview/src/components/PlayersList.tsx

import { type FC } from "react";
import { Box } from "@mui/material";
import PlayerPreviewCard from "./PlayerPreviewCard";
import type { PlayerProfile } from "../types/player";
import { PlayerRole, PlayerRoleAbbreviation } from "../types/playerRole";

interface PlayersListProps {
  players: PlayerProfile[];
  onPlayerClick: (fullName: string) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

// Получение сокращенного обозначения позиции
const getPositionAbbreviation = (position: PlayerRole | string): string => {
  return typeof position === "string" && position in PlayerRoleAbbreviation
    ? PlayerRoleAbbreviation[position as unknown as PlayerRole]
    : "—";
};

const PlayersList: FC<PlayersListProps> = ({
  players,
  onPlayerClick,
  onEdit,
  onDelete,
}) => {
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
          key={player.id}
          fullName={player.fullName}
          age={player.age}
          position={getPositionAbbreviation(player.position)}
          onClick={() => onPlayerClick(player.fullName)}
          onEdit={
            onEdit && player.id != null
              ? () => onEdit(player.id as number)
              : undefined
          }
          onDelete={
            onDelete && player.id !== null
              ? () => onDelete(player.id!)
              : undefined
          }
        />
      ))}
    </Box>
  );
};

export default PlayersList;
