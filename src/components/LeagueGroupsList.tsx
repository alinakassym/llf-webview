// llf-webview/src/components/LeagueGroupsList.tsx

import { type FC } from "react";
import { Box } from "@mui/material";
import ManagementItemCard from "./ManagementItemCard";
import type { LeagueGroup } from "../store/slices/leagueGroupSlice";

interface LeagueGroupsListProps {
  leagueGroups: LeagueGroup[];
  onEdit?: (groupId: number) => void;
  onDelete?: (groupId: number, groupName: string) => void;
}

const LeagueGroupsList: FC<LeagueGroupsListProps> = ({
  leagueGroups,
  onEdit,
  onDelete,
}) => {
  if (leagueGroups.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          color: "text.secondary",
        }}
      >
        Группы лиг не найдены
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {leagueGroups.map((group) => (
        <ManagementItemCard
          key={group.id}
          title={`${group.order}: ${group.name}`}
          subtitle={group.cityName}
          onEdit={onEdit ? () => onEdit(group.id) : undefined}
          onDelete={onDelete ? () => onDelete(group.id, group.name) : undefined}
        />
      ))}
    </Box>
  );
};

export default LeagueGroupsList;
