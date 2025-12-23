// llf-webview/src/components/ToursList.tsx

import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { Tour } from "../types/tour";

interface ToursListProps {
  tours: Tour[];
  onEdit?: (tourId: number) => void;
  onDelete?: (tourId: number, tourName: string) => void;
}

const ToursList: FC<ToursListProps> = ({ tours, onEdit, onDelete }) => {
  const formatDateRange = (startDate: string | null, endDate: string | null) => {
    if (!startDate && !endDate) return "";

    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    };

    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (start && end) {
      return `${start} - ${end}`;
    }
    if (start) {
      return `с ${start}`;
    }
    if (end) {
      return `до ${end}`;
    }
    return "";
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {tours.length > 0 ? (
        tours.map((tour) => (
          <ManagementItemCard
            key={tour.id}
            title={tour.name || `Тур ${tour.number}`}
            subtitle={formatDateRange(tour.startDate, tour.endDate)}
            onEdit={onEdit ? () => onEdit(tour.id) : undefined}
            onDelete={
              onDelete
                ? () => onDelete(tour.id, tour.name || `Тур ${tour.number}`)
                : undefined
            }
          />
        ))
      ) : (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ py: 4 }}
        >
          Туры не найдены
        </Typography>
      )}
    </Box>
  );
};

export default ToursList;
