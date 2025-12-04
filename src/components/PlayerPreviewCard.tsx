// llf-webview/src/components/PlayerPreviewCard.tsx

import { type FC } from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { ShirtIcon } from "./icons";
import { getYearsWord } from "../utils/getYearsWord";

interface PlayerPreviewCardProps {
  fullName: string;
  age: number;
  position?: string;
  photoUrl?: string;
  onClick?: () => void;
}

const PlayerPreviewCard: FC<PlayerPreviewCardProps> = ({
  fullName,
  age,
  position,
  photoUrl,
  onClick,
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 1.5,
        paddingX: 2,
        paddingY: 1.5,
        borderRadius: "12px",
        border: 1,
        borderColor: "cardBorder",
        backgroundColor: "background.paper",
        marginBottom: 1,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }
          : {},
      }}
    >
      {/* Аватар/фото игрока */}
      <Box>
        {photoUrl ? (
          <Avatar
            src={photoUrl}
            alt={fullName}
            sx={{
              width: 48,
              height: 48,
              borderRadius: "10px",
            }}
          />
        ) : (
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "10px",
              backgroundColor: "surface",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShirtIcon size={32} strokeColor="#1976d2" />
          </Box>
        )}
      </Box>

      {/* Информация об игроке */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
        <div>
          <Typography
            variant="body1"
            fontWeight={600}
            sx={{
              fontSize: "12px",
              color: "text.primary",
            }}
          >
            {fullName}
          </Typography>
        </div>
        <div
          style={{
            marginTop: 2,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Box
            sx={{
              paddingX: 1.5,
              paddingY: 0.75,
              borderRadius: "8px",
              backgroundColor: "surface",
            }}
          >
            <Typography
              variant="body2"
              fontWeight={400}
              sx={{
                fontSize: "10px",
                color: "primary.main",
              }}
            >
              {age} {getYearsWord(age)}
            </Typography>
          </Box>
          {/* Позиция (если есть) */}
          {position && (
            <Box
              sx={{
                paddingX: 1.5,
                paddingY: 0.75,
                borderRadius: "8px",
                backgroundColor: "surface",
              }}
            >
              <Typography
                variant="body2"
                fontWeight={400}
                sx={{
                  fontSize: "10px",
                  color: "primary.main",
                }}
              >
                {position}
              </Typography>
            </Box>
          )}
        </div>
      </Box>
    </Box>
  );
};

export default PlayerPreviewCard;
