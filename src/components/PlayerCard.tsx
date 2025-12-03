import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import { ShirtIcon } from "./icons";

interface PlayerCardProps {
  playerName: string;
  playerNumber: number;
  position: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

const PlayerCard: FC<PlayerCardProps> = ({
  playerName,
  playerNumber,
  position,
}) => {
  return (
    <Box
      sx={{
        position: "absolute",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        ...position,
      }}
    >
      {/* Иконка футболки с номером */}
      <Box
        sx={{
          position: "relative",
          width: 60,
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        }}
      >
        <ShirtIcon size={48} strokeColor="#1976d2" />
        <Typography
          sx={{
            position: "absolute",
            fontSize: "12px",
            lineHeight: "12px",
            fontWeight: 700,
            color: "#1976d2",
            backgroundColor: "white",
          }}
        >
          {playerNumber}
        </Typography>
      </Box>

      {/* Имя игрока */}
      <Box
        sx={{
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          borderRadius: 1,
          px: 1,
          py: 0.5,
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 600,
            color: "text.primary",
            whiteSpace: "nowrap",
          }}
        >
          {playerName}
        </Typography>
      </Box>
    </Box>
  );
};

export default PlayerCard;
