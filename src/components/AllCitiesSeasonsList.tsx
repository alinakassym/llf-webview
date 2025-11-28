import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { Season } from "../types/season";
import { formatDate } from "../utils/dateFormat";

interface AllCitiesSeasonsListProps {
  seasonsByCity: Record<string, Season[]>;
  onEdit: (seasonId: string) => void;
  onDelete: (seasonId: string, seasonName: string) => void;
}

const AllCitiesSeasonsList: FC<AllCitiesSeasonsListProps> = ({
  seasonsByCity,
  onEdit,
  onDelete,
}) => {
  const hasCities = Object.keys(seasonsByCity).length > 0;

  if (!hasCities) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{ py: 4 }}
      >
        Сезоны не найдены
      </Typography>
    );
  }

  return (
    <>
      {Object.entries(seasonsByCity).map(([cityName, citySeasons]) => (
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
            {citySeasons.map((season) => (
              <ManagementItemCard
                key={season.id}
                title={season.name}
                subtitle={formatDate(season.date)}
                onEdit={() => onEdit(String(season.id))}
                onDelete={() => onDelete(String(season.id), season.name)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default AllCitiesSeasonsList;
