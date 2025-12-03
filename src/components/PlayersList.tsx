// llf-webview/src/components/PlayersList.tsx

import { type FC } from "react";
import { Box } from "@mui/material";
import PlayerPreviewCard from "./PlayerPreviewCard";
import type { PlayerProfile } from "../types/player";
import { PlayerRole, PlayerRoleAbbreviation } from "../types/playerRole";

interface PlayersListProps {
  players: PlayerProfile[];
  onPlayerClick: (fullName: string) => void;
}

// Получение сокращенного обозначения позиции
const getPositionAbbreviation = (position: PlayerRole): string => {
  return PlayerRoleAbbreviation[position] || "—";
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
          position={getPositionAbbreviation(player.position)}
          onClick={() => onPlayerClick(player.fullName)}
        />
      ))}
    </Box>
  );
};

export default PlayersList;
