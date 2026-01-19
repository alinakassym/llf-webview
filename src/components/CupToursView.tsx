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
import type { CupGroup, CupTour } from "../types/cup";
import { ShirtIcon } from "./icons";

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

interface CupToursViewProps {
  groups: CupGroup[];
  onExpandGroup?: (groupId: number) => void;
  loadingGroupIds?: number[];
  onAddTour?: (groupId: number, groupName: string) => void;
}

const CupToursView: FC<CupToursViewProps> = ({
  groups,
  onExpandGroup,
  loadingGroupIds,
  onAddTour,
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
                                      sx={{ fontSize: "12px" }}
                                    >
                                      {tour.name || `Тур ${tour.number}`}
                                    </Typography>
                                    <Box
                                      sx={{
                                        px: 1,
                                        py: 0.25,
                                        borderRadius: "4px",
                                        backgroundColor:
                                          status === "FINISHED"
                                            ? "success.light"
                                            : status === "SCHEDULED"
                                            ? "primary.light"
                                            : "action.hover",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          fontSize: "10px",
                                          fontWeight: 600,
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
                                      </Typography>
                                    </Box>
                                  </Box>

                                  {/* Match information */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                      gap: 2,
                                    }}
                                  >
                                    {/* Команда 1 */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        flex: 1,
                                      }}
                                    >
                                      <ShirtIcon color1={team1?.primaryColor} />
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
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize:
                                          status === "FINISHED"
                                            ? "16px"
                                            : "12px",
                                        fontWeight: 700,
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

                                    {/* Команда 2 */}
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        flex: 1,
                                        justifyContent: "flex-end",
                                      }}
                                    >
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
                                      <ShirtIcon color1={team2?.primaryColor} />
                                    </Box>
                                  </Box>

                                  {/* Date/time and location for scheduled matches */}
                                  {status === "SCHEDULED" && tour.dateTime && (
                                    <Box
                                      sx={{
                                        mt: 1,
                                        pt: 1,
                                        borderTop: 1,
                                        borderColor: "divider",
                                      }}
                                    >
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ fontSize: "10px" }}
                                      >
                                        {new Date(tour.dateTime).toLocaleString(
                                          "ru-RU",
                                          {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          },
                                        )}
                                        {tour.location && ` • ${tour.location}`}
                                      </Typography>
                                    </Box>
                                  )}
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
                      sx={{ mt: 2, display: "flex", justifyContent: "center" }}
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
