import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { League } from "../types/league";

interface LeagueListProps {
  leagues: League[];
  onEdit: (leagueId: string) => void;
  onDelete: (leagueId: string, leagueName: string) => void;
  emptyMessage?: string;
}

const LeagueList: FC<LeagueListProps> = ({
  leagues,
  onEdit,
  onDelete,
  emptyMessage = "Лиги не найдены",
}) => {
  if (leagues.length === 0) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{ py: 4 }}
      >
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {leagues.map((league) => (
        <ManagementItemCard
          key={league.id}
          title={league.name}
          subtitle={`Группа: ${league.leagueGroupName}`}
          onEdit={() => onEdit(league.id)}
          onDelete={() => onDelete(league.id, league.name)}
        />
      ))}
    </Box>
  );
};

export default LeagueList;
