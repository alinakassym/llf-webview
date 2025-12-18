import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { League } from "../types/league";

interface AllCitiesLeaguesListProps {
  leaguesByCity: Record<string, League[]>;
  onEdit: (leagueId: string) => void;
  onDelete: (leagueId: string, leagueName: string) => void;
}

const AllCitiesLeaguesList: FC<AllCitiesLeaguesListProps> = ({
  leaguesByCity,
  onEdit,
  onDelete,
}) => {
  const hasCities = Object.keys(leaguesByCity).length > 0;

  if (!hasCities) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{ py: 4 }}
      >
        Лиги не найдены
      </Typography>
    );
  }

  return (
    <>
      {Object.entries(leaguesByCity).map(([cityName, cityLeagues]) => (
        <Box key={cityName} sx={{ mb: 3 }}>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            gutterBottom
            sx={{ mb: 1, mt: 0 }}
          >
            {cityName}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {cityLeagues.map((league) => (
              <ManagementItemCard
                key={`${cityName}-${league.id}-${Math.random()}`}
                title={league.name}
                subtitle={`Группа: ${league.leagueGroupName}`}
                onEdit={() => onEdit(league.id)}
                onDelete={() => onDelete(league.id, league.name)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default AllCitiesLeaguesList;
