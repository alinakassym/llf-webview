// llf-webview/src/components/ManagementTeamCard.tsx

import { type FC } from "react";
import { Box, Typography, IconButton, Divider, Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

interface ManagementTeamCardProps {
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddPlayer?: () => void;
}

const ManagementTeamCard: FC<ManagementTeamCardProps> = ({
  title,
  subtitle,
  onEdit,
  onDelete,
  onAddPlayer,
}) => {
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

      <Divider sx={{ marginBottom: 2 }} />

      {/* Нижняя часть: Состав команды */}
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
          Состав команды
        </Typography>

        <Button
          variant="outlined"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={onAddPlayer}
          sx={{
            fontSize: "11px",
            textTransform: "none",
            paddingX: 1.5,
            paddingY: 0.5,
            borderRadius: "8px",
          }}
        >
          Добавить игрока
        </Button>
      </Box>
    </Box>
  );
};

export default ManagementTeamCard;
