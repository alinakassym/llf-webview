import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { Cup } from "../types/cup";
import { formatDate } from "../utils/dateFormat";

interface AllCitiesCupsListProps {
  cupsByCity: Record<string, Cup[]>;
  onEdit: (cupId: string, cityId: number) => void;
  onDelete: (cupId: string, cupName: string) => void;
}

const AllCitiesCupsList: FC<AllCitiesCupsListProps> = ({
  cupsByCity,
  onEdit,
  onDelete,
}) => {
  const hasCities = Object.keys(cupsByCity).length > 0;

  if (!hasCities) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{ py: 4 }}
      >
        Кубки не найдены
      </Typography>
    );
  }

  return (
    <>
      {Object.entries(cupsByCity).map(([cityName, cityCups]) => (
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
            {cityCups.map((cup) => (
              <ManagementItemCard
                key={`${cityName}${cup.id}`}
                title={cup.name}
                subtitle={`${formatDate(cup.startDate)} - ${formatDate(cup.endDate)}`}
                onEdit={() => onEdit(String(cup.id), cup.cityId)}
                onDelete={() => onDelete(String(cup.id), cup.name)}
              />
            ))}
          </Box>
        </Box>
      ))}
    </>
  );
};

export default AllCitiesCupsList;
