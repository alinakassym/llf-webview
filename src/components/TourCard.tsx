// llf-webview/src/components/TourCard.tsx

import { type FC } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { Match } from "../types/tour";
import MatchScoreTable from "./MatchScoreTable";

interface TourCardProps {
  title: string;
  subtitle?: string;
  matches: Match[];
  onEdit?: () => void;
  onDelete?: () => void;
  onAddMatch?: () => void;
}

const TourCard: FC<TourCardProps> = ({
  title,
  subtitle,
  matches,
  onEdit,
  onDelete,
  onAddMatch,
}) => {
  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        paddingLeft: "14px",
        paddingRight: "12px",
        paddingY: "12px",
        borderRadius: "12px",
        border: 1,
        borderColor: "cardBorder",
        backgroundColor: "background.paper",
        marginBottom: 1,
      }}
    >
      {/* Заголовок тура с кнопками */}
      <Box
        sx={{
          pb: 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: matches.length > 0 ? 2 : 0,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ fontSize: "12px", marginBottom: "4px" }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "12px" }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={onEdit}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: "surface",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "surface",
                opacity: 0.8,
              },
            }}
          >
            <EditIcon sx={{ fontSize: 16 }} />
          </IconButton>

          <IconButton
            onClick={onDelete}
            sx={{
              width: 32,
              height: 32,
              borderRadius: "8px",
              backgroundColor: "surface",
              color: "#ef4444",
              "&:hover": {
                backgroundColor: "surface",
                opacity: 0.8,
              },
            }}
          >
            <DeleteIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ marginBottom: 1 }} />
      {/* Список матчей */}
      {matches.length > 0 && (
        <Box sx={{ mb: 2 }}>
          {matches.map((match) => (
            <Box
              key={match.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 0.5,
                paddingY: 1,
                paddingX: 1.5,
                borderRadius: "8px",
                backgroundColor: "surface",
                marginBottom: 1,
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "10px" }}
              >
                {formatDateTime(match.dateTime)}
                {match.location && ` • ${match.location}`}
              </Typography>

              {(match.team1Score > 0 || match.team2Score > 0) && (
                <MatchScoreTable match={match} />
              )}
            </Box>
          ))}
        </Box>
      )}

      {/* Кнопка добавления матча */}
      <Button
        onClick={onAddMatch}
        startIcon={<AddIcon />}
        variant="outlined"
        size="small"
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontSize: "12px",
          paddingY: 0.75,
          borderColor: "cardBorder",
          color: "text.primary",
          "&:hover": {
            borderColor: "primary.main",
            backgroundColor: "transparent",
          },
        }}
      >
        Добавить матч
      </Button>
    </Box>
  );
};

export default TourCard;
