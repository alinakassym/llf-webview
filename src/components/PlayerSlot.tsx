// llf-webview/src/components/PlayerSlot.tsx

import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

interface PlayerSlotProps {
  fullName: string;
  label: string;
  onClick?: () => void;
  applyFilter?: boolean;
  backgroundColor?: string;
  borderColor?: string;
}

const PlayerSlot: FC<PlayerSlotProps> = ({
  fullName,
  label,
  onClick,
  applyFilter = false,
  backgroundColor = "rgba(42, 128, 25, 0.8)",
  borderColor = "rgba(255, 255, 255, 0.5)",
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        width: 80,
        height: 100,
        backgroundColor: backgroundColor,
        border: `2px solid ${borderColor}`,
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        pointerEvents: "auto",
        filter: applyFilter
          ? "hue-rotate(50deg) brightness(1.2) contrast(1.1)"
          : "none",
        "&:hover": onClick
          ? {
              backgroundColor: backgroundColor,
              borderColor: borderColor,
            }
          : {},
      }}
    >
      {/* Иконка игрока */}
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <PersonIcon
          sx={{
            fontSize: 20,
            color: "#FFFFFF",
          }}
        />
      </Box>

      {/* Имя игрока */}
      <Typography
        sx={{
          fontSize: "8px",
          fontWeight: 500,
          color: "#FFFFFF",
          textAlign: "center",
          lineHeight: 1.2,
          maxWidth: "100%",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          px: 0.5,
        }}
      >
        {fullName}
      </Typography>

      {/* Позиция */}
      <Typography
        sx={{
          fontSize: "9px",
          fontWeight: 600,
          color: "#FFFFFF",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
};

export default PlayerSlot;
