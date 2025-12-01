import { type FC } from "react";
import { Box } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { Player } from "../types/player";

interface PlayersListProps {
  players: Player[];
  onEdit: (playerId: string) => void;
  onDelete: (playerId: string) => void;
}

// Функция для вычисления возраста из даты рождения
const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const PlayersList: FC<PlayersListProps> = ({ players, onEdit, onDelete }) => {
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
      {players.map((player) => {
        const age = calculateAge(player.dateOfBirth);
        const subtitle = `${age} лет • ${player.teamName}`;

        return (
          <ManagementItemCard
            key={player.id}
            title={player.fullName}
            subtitle={subtitle}
            onEdit={() => onEdit(String(player.id))}
            onDelete={() => onDelete(String(player.id))}
          />
        );
      })}
    </Box>
  );
};

export default PlayersList;
