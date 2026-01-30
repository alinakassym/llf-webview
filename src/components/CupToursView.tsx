// llf-webview/src/components/CupToursView.tsx

import { type FC, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Card,
  CardContent,
  Button,
  IconButton,
} from "@mui/material";
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
} from "@mui/lab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import type { CupGroup, CupTour } from "../types/cup";
import { ShirtIcon } from "./icons";
import { formatTime } from "../utils/dateTimeFormat";

type TourStatus = "FINISHED" | "SCHEDULED" | "PENDING";

const getTourStatus = (tour: CupTour): TourStatus => {
  if (tour.team1Score !== null && tour.team2Score !== null) {
    return "FINISHED";
  }
  if (tour.dateTime !== null) {
    return "SCHEDULED";
  }
  return "PENDING";
};

const getStatusColor = (status: TourStatus) => {
  switch (status) {
    case "FINISHED":
      return "success";
    case "SCHEDULED":
      return "primary";
    case "PENDING":
      return "grey";
    default:
      return "grey";
  }
};

interface TourItem {
  team1Set1Score: number | null;
  team2Set1Score: number | null;
  team1Set2Score: number | null;
  team2Set2Score: number | null;
  team1Set3Score: number | null;
  team2Set3Score: number | null;
}

const hasSetsScore = (tourItem: unknown): boolean => {
  if (
    typeof tourItem === "object" &&
    tourItem !== null &&
    "team1Set1Score" in tourItem &&
    "team2Set1Score" in tourItem &&
    "team1Set2Score" in tourItem &&
    "team2Set2Score" in tourItem &&
    "team1Set3Score" in tourItem &&
    "team2Set3Score" in tourItem
  ) {
    const item = tourItem as TourItem;
    return [
      item.team1Set1Score,
      item.team2Set1Score,
      item.team1Set2Score,
      item.team2Set2Score,
      item.team1Set3Score,
      item.team2Set3Score,
    ].some((score) => score !== null && score !== undefined);
  }
  return false;
};

interface CupToursViewProps {
  groups: CupGroup[];
  onExpandGroup?: (groupId: number) => void;
  loadingGroupIds?: number[];
  onAddTour?: (groupId: number, groupName: string) => void;
  onEditTour?: (groupId: number, tourId: number) => void;
  onDeleteTour?: (groupId: number, tourId: number, tourName: string) => void;
}

const CupToursView: FC<CupToursViewProps> = ({
  groups,
  onExpandGroup,
  loadingGroupIds,
  onAddTour,
  onEditTour,
  onDeleteTour,
}) => {
  const [expandedGroupIds, setExpandedGroupIds] = useState<number[]>([]);

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
      console.log("groupId: ", groupId);
      console.log("isExpanded: ", isExpanded);
      setExpandedGroupIds((prev) =>
        isExpanded ? [...prev, groupId] : prev.filter((id) => id !== groupId),
      );
      console.log("expandedGroupIds", expandedGroupIds);

      if (isExpanded && onExpandGroup) {
        const group = groups.find((g) => g.id === groupId);
        console.log("groups: ", groups);

        // Загружаем туры только если их еще нет
        if (group && !group.tours?.length) {
          onExpandGroup(groupId);
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
          </AccordionSummary>

          <AccordionDetails sx={{ pt: 0, pb: 2 }}>
            <Box sx={{ px: 0 }}>
              {loadingGroupIds?.includes(group.id) ? (
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
                  {group.tours && group.tours.length > 0 && (
                    <Timeline
                      position="right"
                      sx={{
                        p: 0,
                        m: 0,
                        "& .MuiTimelineItem-root": {
                          minHeight: "auto",
                          "&:before": {
                            flex: 0,
                            padding: 0,
                          },
                        },
                      }}
                    >
                      {group.tours.map((tour, index) => {
                        // Находим команды по ID из teams массива
                        const team1 = group.teams?.find(
                          (t) => t.teamId === tour.team1Id,
                        );
                        const team2 = group.teams?.find(
                          (t) => t.teamId === tour.team2Id,
                        );
                        const status = getTourStatus(tour);
                        const isLastItem = index === group.tours!.length - 1;

                        return (
                          <TimelineItem key={tour.id}>
                            <TimelineSeparator>
                              <TimelineDot
                                color={getStatusColor(status)}
                                variant={
                                  status === "PENDING" ? "outlined" : "filled"
                                }
                              />
                              {!isLastItem && <TimelineConnector />}
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: 0, px: 2, pb: 2 }}>
                              <Card
                                sx={{
                                  borderRadius: "8px",
                                  border: 1,
                                  borderColor: "cardBorder",
                                  backgroundColor: "background.paper",
                                  boxShadow: "none",
                                }}
                              >
                                <CardContent
                                  sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}
                                >
                                  {/* Tour header */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ fontSize: "12px", flex: 1 }}
                                    >
                                      {tour.name || `Тур ${tour.number}`}
                                    </Typography>

                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      {/* CRUD Actions */}
                                      {(onEditTour || onDeleteTour) && (
                                        <Box sx={{ display: "flex", gap: 0.5 }}>
                                          {onEditTour && (
                                            <IconButton
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onEditTour(group.id, tour.id);
                                              }}
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
                                          )}

                                          {onDeleteTour && (
                                            <IconButton
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteTour(
                                                  group.id,
                                                  tour.id,
                                                  tour.name ||
                                                    `Тур ${tour.number}`,
                                                );
                                              }}
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
                                              <DeleteIcon
                                                sx={{ fontSize: 16 }}
                                              />
                                            </IconButton>
                                          )}
                                        </Box>
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Match information */}
                                  <Box
                                    sx={{
                                      mt: 2,
                                      display: "flex",
                                      alignItems: hasSetsScore(tour)
                                        ? "flex-start"
                                        : "center",
                                      justifyContent: "space-between",
                                      gap: 2,
                                    }}
                                  >
                                    {/* Команда 1 */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "start",
                                        gap: 0,
                                        flex: 1,
                                      }}
                                    >
                                      <ShirtIcon
                                        color1={
                                          team1?.primaryColor ?? "#5060D8"
                                        }
                                        color2={
                                          team1?.secondaryColor ?? "#5060D8"
                                        }
                                      />
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontSize: "12px",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {tour.team1Name}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{
                                            fontSize: "10px",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {team1?.cityName}
                                        </Typography>
                                      </Box>
                                    </Box>

                                    {/* Score or VS */}
                                    <Box
                                      sx={{
                                        mb: hasSetsScore(tour) ? 0 : 2,
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize:
                                            status === "FINISHED"
                                              ? "16px"
                                              : "12px",
                                          fontWeight: 700,
                                          lineHeight: 1,
                                          color:
                                            status === "FINISHED"
                                              ? "text.primary"
                                              : "text.secondary",
                                          minWidth: "40px",
                                          textAlign: "center",
                                        }}
                                      >
                                        {tour.team1Score !== null &&
                                        tour.team2Score !== null
                                          ? `${tour.team1Score}:${tour.team2Score}`
                                          : "VS"}
                                      </Typography>
                                      {tour.dateTime && (
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ mb: 0, lineHeight: 1 }}
                                        >
                                          {formatTime(tour.dateTime)}
                                        </Typography>
                                      )}

                                      {/* Sets information */}
                                      {hasSetsScore(tour) && (
                                        <Box
                                          sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                          }}
                                        >
                                          {/* СЕТ 1 */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 1,
                                            }}
                                          >
                                            {/* Команда 1 */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {tour.team1Set1Score}
                                            </Typography>

                                            {/* Score or VS */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                color: "text.secondary",
                                                textAlign: "center",
                                              }}
                                            >
                                              (сет 1)
                                            </Typography>

                                            {/* Команда 2 */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {tour.team2Set1Score}
                                            </Typography>
                                          </Box>

                                          {/* СЕТ 2 */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 1,
                                            }}
                                          >
                                            {/* Команда 1 */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {tour.team1Set2Score}
                                            </Typography>

                                            {/* Score or VS */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                color: "text.secondary",
                                                textAlign: "center",
                                              }}
                                            >
                                              (сет 2)
                                            </Typography>

                                            {/* Команда 2 */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {tour.team2Set2Score}
                                            </Typography>
                                          </Box>

                                          {/* СЕТ 3 */}
                                          <Box
                                            sx={{
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              gap: 1,
                                            }}
                                          >
                                            {/* Команда 1 */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {tour.team1Set3Score}
                                            </Typography>

                                            {/* Score or VS */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "10px",
                                                fontWeight: 700,
                                                color: "text.secondary",
                                                textAlign: "center",
                                              }}
                                            >
                                              (сет 3)
                                            </Typography>

                                            {/* Команда 2 */}
                                            <Typography
                                              variant="body2"
                                              sx={{
                                                fontSize: "12px",
                                                fontWeight: 600,
                                              }}
                                            >
                                              {tour.team2Set3Score}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      )}
                                    </Box>

                                    {/* Команда 2 */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "end",
                                        gap: 0,
                                        flex: 1,
                                      }}
                                    >
                                      <ShirtIcon
                                        color1={
                                          team2?.primaryColor ?? "#5060D8"
                                        }
                                        color2={
                                          team2?.secondaryColor ?? "#5060D8"
                                        }
                                      />
                                      <Box
                                        sx={{
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "flex-end",
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontSize: "12px",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {tour.team2Name}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{
                                            fontSize: "10px",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {team2?.cityName}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Date/time and location for scheduled matches */}
                                  <Box
                                    sx={{
                                      mt: 2,
                                      pt: 1,
                                      width: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      borderTop: 0.5,
                                      borderColor: "divider",
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        py: 1,
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        lineHeight: "10px",
                                      }}
                                    >
                                      {tour?.location ?? ""}
                                    </Box>
                                    <Box
                                      sx={{
                                        px: 2,
                                        py: 1,
                                        borderRadius: "4px",
                                        backgroundColor:
                                          status === "FINISHED"
                                            ? "success.light"
                                            : status === "SCHEDULED"
                                            ? "primary.light"
                                            : "action.hover",
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        lineHeight: "10px",
                                        color:
                                          status === "FINISHED"
                                            ? "success.dark"
                                            : status === "SCHEDULED"
                                            ? "primary.dark"
                                            : "text.secondary",
                                      }}
                                    >
                                      {status === "FINISHED"
                                        ? "ЗАВЕРШЕН"
                                        : status === "SCHEDULED"
                                        ? "ЗАПЛАНИРОВАН"
                                        : "ОЖИДАНИЕ"}
                                    </Box>
                                  </Box>
                                </CardContent>
                              </Card>
                            </TimelineContent>
                          </TimelineItem>
                        );
                      })}
                    </Timeline>
                  )}

                  {(!group.tours || group.tours.length === 0) && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "12px", textAlign: "center", py: 2 }}
                    >
                      Туры не найдены
                    </Typography>
                  )}

                  {/* Кнопка добавления тура */}
                  {onAddTour && (
                    <Box
                      sx={{ mt: 0, display: "flex", justifyContent: "center" }}
                    >
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={() => onAddTour(group.id, group.name)}
                        sx={{
                          width: "100%",
                          borderRadius: "8px",
                          textTransform: "none",
                          fontSize: "12px",
                          fontWeight: 600,
                        }}
                      >
                        Добавить тур
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

export default CupToursView;
