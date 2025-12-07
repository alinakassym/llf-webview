// llf-webview/src/components/EmptyPlayerSlot.tsx

import { type FC } from "react";
import { Box, Typography } from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

interface EmptyPlayerSlotProps {
  label: string;
  onClick?: () => void;
}

const EmptyPlayerSlot: FC<EmptyPlayerSlotProps> = ({ label, onClick }) => {
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
        backgroundColor: "#2a8019",
        border: "2px dashed rgba(255, 255, 255, 0.5)",
        borderRadius: 2,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        pointerEvents: "auto",
        filter: "hue-rotate(50deg) brightness(1.2) contrast(1.1)",
        "&:hover": onClick
          ? {
              backgroundColor: "rgba(255, 255, 255, 0.15)",
              borderColor: "rgba(255, 255, 255, 0.8)",
            }
          : {},
      }}
    >
      {/* Иконка добавления игрока */}
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
        <PersonAddIcon
          sx={{
            fontSize: 20,
            color: "#FFFFFF",
          }}
        />
      </Box>

      {/* Позиция */}
      <Typography
        sx={{
          fontSize: "10px",
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

export default EmptyPlayerSlot;
