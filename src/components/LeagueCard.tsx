import { type FC } from "react";
import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { League } from "../types/league";

interface LeagueCardProps {
  league: League;
  onEdit: (league: League) => void;
  onDelete: (leagueId: string) => void;
}

const LeagueCard: FC<LeagueCardProps> = ({ league, onEdit, onDelete }) => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          "&:last-child": { pb: 2 },
        }}
      >
        <Box>
          <Typography variant="h6" component="div" fontWeight={600}>
            {league.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Группа: {league.group}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={() => onEdit(league)}
            sx={{
              backgroundColor: "rgba(80, 96, 216, 0.08)",
              color: "primary.main",
              "&:hover": {
                backgroundColor: "rgba(80, 96, 216, 0.16)",
              },
            }}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            onClick={() => onDelete(league.id)}
            sx={{
              backgroundColor: "rgba(244, 67, 54, 0.08)",
              color: "error.main",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.16)",
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LeagueCard;
