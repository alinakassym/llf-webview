import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { League } from "../types/league";

interface SingleCityLeaguesListProps {
  cityName: string;
  leagues: League[];
  onEdit: (leagueId: string) => void;
  onDelete: (leagueId: string, leagueName: string) => void;
}

const SingleCityLeaguesList: FC<SingleCityLeaguesListProps> = ({
  cityName,
  leagues,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <Typography
        variant="subtitle2"
        fontWeight={600}
        gutterBottom
        sx={{ mb: 1, mt: 0 }}
      >
        {cityName}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {leagues.length > 0 ? (
          leagues.map((league) => (
            <ManagementItemCard
              key={league.id}
              title={league.name}
              subtitle={`Группа: ${league.leagueGroupName}`}
              onEdit={() => onEdit(league.id)}
              onDelete={() => onDelete(league.id, league.name)}
            />
          ))
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 4 }}
          >
            Лиги не найдены
          </Typography>
        )}
      </Box>
    </>
  );
};

export default SingleCityLeaguesList;
