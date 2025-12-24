// llf-webview/src/components/ToursList.tsx

import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import TourCard from "./TourCard";
import type { Tour } from "../types/tour";

interface ToursListProps {
  tours: Tour[];
  onEdit?: (tourId: number) => void;
  onDelete?: (tourId: number, tourName: string) => void;
  onAddMatch?: (tourId: number) => void;
  onEditMatch?: (matchId: number) => void;
  onDeleteMatch?: (matchId: number, matchTitle: string) => void;
}

const ToursList: FC<ToursListProps> = ({
  tours,
  onEdit,
  onDelete,
  onAddMatch,
  onEditMatch,
  onDeleteMatch,
}) => {
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
          <TourCard
            key={tour.id}
            title={tour.name || `Тур ${tour.number}`}
            subtitle={formatDateRange(tour.startDate, tour.endDate)}
            matches={tour.matches || []}
            onEdit={onEdit ? () => onEdit(tour.id) : undefined}
            onDelete={
              onDelete
                ? () => onDelete(tour.id, tour.name || `Тур ${tour.number}`)
                : undefined
            }
            onAddMatch={onAddMatch ? () => onAddMatch(tour.id) : undefined}
            onEditMatch={onEditMatch}
            onDeleteMatch={onDeleteMatch}
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
