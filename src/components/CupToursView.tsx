// llf-webview/src/components/CupToursView.tsx

import { type FC, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import type { CupGroup } from "../types/cup";

interface CupToursViewProps {
  groups: CupGroup[];
}

const CupToursView: FC<CupToursViewProps> = ({ groups }) => {
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
      setExpandedGroupIds((prev) =>
        isExpanded ? [...prev, groupId] : prev.filter((id) => id !== groupId),
      );
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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: "12px", textAlign: "center", py: 2 }}
              >
                Содержимое будет отображаться здесь
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default CupToursView;
