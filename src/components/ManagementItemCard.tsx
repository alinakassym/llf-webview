import { type FC } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

interface ManagementItemCardProps {
  title: string;
  subtitle?: string;
  onEdit: () => void;
  onDelete: () => void;
}

const ManagementItemCard: FC<ManagementItemCardProps> = ({
  title,
  subtitle,
  onEdit,
  onDelete,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
  );
};

export default ManagementItemCard;
