// llf-webview/src/components/ManagementTeamCard.tsx

import { type FC, useMemo } from "react";
import { Box, Typography, IconButton, Divider } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAppSelector } from "../store/hooks";
import { ShirtIcon } from "./icons";

interface ManagementTeamCardProps {
  title: string;
  subtitle?: string;
  teamId: string;
  primaryColor: string;
  secondaryColor: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ManagementTeamCard: FC<ManagementTeamCardProps> = ({
  title,
  subtitle,
  teamId,
  primaryColor,
  secondaryColor,
  onEdit,
  onDelete,
}) => {
  // Получаем игроков для этой команды
  const playersData = useAppSelector((state) => state.players.itemsByTeamId[teamId]);
  const players = useMemo(() => playersData || [], [playersData]);

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
      {/* Верхняя часть: название, лига и кнопки */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 2,
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            cursor: "pointer",
          }}
          onClick={onEdit}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 1.5,
            }}
          >
            {primaryColor && secondaryColor ? (
              <ShirtIcon size={40} color1={primaryColor} color2={secondaryColor} />
            ) : (
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "action.disabled",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "20px" }}>👕</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ flex: 1, gap: 0 }}>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ fontSize: "12px" }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "12px", mb: 0 }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        </div>

        {/* кнопки */}
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

      <Divider sx={{ marginBottom: 2 }} />

      {/* Нижняя часть: Состав команды */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ fontSize: "12px", color: "text.secondary" }}
          >
            Состав команды ({players.length})
          </Typography>
        </Box>

        {/* Список игроков */}
        {players.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {players.map((player) => (
              <Box
                key={player.id}
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  paddingY: 0.75,
                  paddingX: 1,
                  borderRadius: "8px",
                  backgroundColor: "surface",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "11px",
                    fontWeight: 600,
                    minWidth: "24px",
                    color: "text.secondary",
                  }}
                >
                  #{player.number}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "11px", flex: 1, marginLeft: 1 }}
                >
                  {player.fullName}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ManagementTeamCard;
