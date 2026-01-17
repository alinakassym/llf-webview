// llf-webview/src/components/CupGroupsList.tsx

import { type FC, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { CupGroup } from "../types/cup";
import { ShirtIcon } from "./icons";

interface CupGroupsListProps {
  groups: CupGroup[];
  onEdit?: (groupId: number, groupName: string) => void;
  onDelete?: (groupId: number, groupName: string) => void;
  onExpandGroup?: (groupId: number) => void;
  onAddTeam?: (groupId: number, groupName: string) => void;
  onEditTeam?: (groupId: number, teamId: number, teamName: string) => void;
  onDeleteTeam?: (groupId: number, teamId: number, teamName: string) => void;
}

const CupGroupsList: FC<CupGroupsListProps> = ({
  groups,
  onEdit,
  onDelete,
  onExpandGroup,
  onAddTeam,
  onEditTeam,
  onDeleteTeam,
}) => {
  const [expandedGroupIds, setExpandedGroupIds] = useState<number[]>([]);
  const [loadingGroupIds, setLoadingGroupIds] = useState<number[]>([]);

  if (groups.length === 0) {
    return (
      <Typography
        variant="body1"
        color="text.secondary"
        textAlign="center"
        sx={{ py: 4 }}
      >
        Группы не найдены
      </Typography>
    );
  }

  const handleAccordionChange =
    (groupId: number) =>
    (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedGroupIds((prev) =>
        isExpanded ? [...prev, groupId] : prev.filter((id) => id !== groupId),
      );

      if (isExpanded && onExpandGroup) {
        const group = groups.find((g) => g.id === groupId);

        // Загружаем команды только если их еще нет
        if (group && !group.teams) {
          setLoadingGroupIds((prev) =>
            prev.includes(groupId) ? prev : [...prev, groupId],
          );

          onExpandGroup(groupId);

          // Сбрасываем loading через небольшую задержку
          setTimeout(() => {
            setLoadingGroupIds((prev) => prev.filter((id) => id !== groupId));
          }, 2000);
        }
      }
    };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {groups.map((group) => (
        <Accordion
          key={group.id}
          expanded={expandedGroupIds.includes(group.id)}
          onChange={handleAccordionChange(group.id)}
          sx={{
            borderRadius: "12px !important",
            border: 1,
            borderColor: "cardBorder",
            backgroundColor: "background.paper",
            boxShadow: "none",
            "&:before": {
              display: "none",
            },
            "&.Mui-expanded": {
              margin: 0,
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: 48,
              "&.Mui-expanded": {
                minHeight: 48,
              },
              "& .MuiAccordionSummary-content": {
                margin: "12px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&.Mui-expanded": {
                  margin: "12px 0",
                },
              },
            }}
          >
            <Box sx={{ flex: 1, display: "flex", alignItems: "center" }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ fontSize: "12px" }}
              >
                Группа {group.name}
              </Typography>
            </Box>

            <Box
              sx={{ display: "flex", gap: 1, mr: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box
                onClick={() => onEdit?.(group.id, group.name)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
              </Box>

              <Box
                onClick={() => onDelete?.(group.id, group.name)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
              </Box>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ pt: 0, pb: 2 }}>
            <Box sx={{ px: 0 }}>
              {loadingGroupIds.includes(group.id) ? (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    py: 2,
                  }}
                >
                  <CircularProgress size={24} />
                </Box>
              ) : (
                <>
                  {group.teams && group.teams.length > 0 ? (
                    <Box
                      sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                    >
                      {group.teams.map((team) => (
                        <Box
                          key={team.teamId}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1.5,
                            p: 1.5,
                            borderRadius: "8px",
                            backgroundColor: "surface",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                            }}
                          >
                            <ShirtIcon color1={team.primaryColor} />
                            <Box>
                              <Typography
                                variant="body1"
                                sx={{ fontSize: "12px", fontWeight: 600 }}
                              >
                                {team.teamName}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ fontSize: "12px", fontWeight: 500 }}
                              >
                                {team.cityName}
                              </Typography>
                            </Box>
                          </div>
                          <Box
                            sx={{ display: "flex", gap: 1, mr: 1 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Box
                              onClick={() =>
                                onEditTeam?.(group.id, team.teamId, team.teamName)
                              }
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                backgroundColor: "customBackground",
                                color: "primary.main",
                                "&:hover": {
                                  opacity: 0.8,
                                },
                              }}
                            >
                              <EditIcon sx={{ fontSize: 16 }} />
                            </Box>

                            <Box
                              onClick={() =>
                                onDeleteTeam?.(group.id, team.teamId, team.teamName)
                              }
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 32,
                                height: 32,
                                borderRadius: "8px",
                                backgroundColor: "customBackground",
                                color: "#ef4444",
                                "&:hover": {
                                  opacity: 0.8,
                                },
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "12px", textAlign: "center", py: 2 }}
                    >
                      Команды не найдены
                    </Typography>
                  )}

                  {onAddTeam && (
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => onAddTeam(group.id, group.name)}
                        fullWidth
                        sx={{
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Добавить команду
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default CupGroupsList;
