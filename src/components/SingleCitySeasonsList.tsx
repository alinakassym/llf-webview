import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { Season } from "../types/season";

interface SingleCitySeasonsListProps {
  cityName: string;
  seasons: Season[];
  onEdit: (seasonId: string) => void;
  onDelete: (seasonId: string, seasonName: string) => void;
}

const SingleCitySeasonsList: FC<SingleCitySeasonsListProps> = ({
  cityName,
  seasons,
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
        {seasons.length > 0 ? (
          seasons.map((season) => (
            <ManagementItemCard
              key={season.id}
              title={season.name}
              subtitle={`Порядок: ${season.order}`}
              onEdit={() => onEdit(season.id)}
              onDelete={() => onDelete(season.id, season.name)}
            />
          ))
        ) : (
          <Typography
            variant="body1"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 4 }}
          >
            Сезоны не найдены
          </Typography>
        )}
      </Box>
    </>
  );
};

export default SingleCitySeasonsList;
