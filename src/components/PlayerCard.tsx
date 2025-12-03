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
        ...position,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0.5,
        backgroundColor: "rgba(0, 0, 0, 0.25)",
        borderRadius: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
    >
      {/* Иконка футболки с номером */}
      <Box
        sx={{
          position: "relative",
          width: 64,
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
        }}
      >
        <ShirtIcon size={64} strokeColor="#FFFFFF" />
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
      <div
        style={{
          maxWidth: 80,
          padding: "2px 6px",
          borderBottomLeftRadius: 8,
          backgroundColor: "rgba(255, 255, 255, 0.8)",
        }}
      >
        <Typography
          sx={{
            fontSize: "12px",
            fontWeight: 400,
            whiteSpace: "nowrap",
          }}
        >
          {playerName}
        </Typography>
      </div>
    </Box>
  );
};

export default PlayerCard;
