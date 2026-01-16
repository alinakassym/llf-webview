// llf-webview/src/pages/cup-management.tsx

import { type FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Tabs, Tab } from "@mui/material";
import { SportSelectRow, type Sport } from "../components/SportSelectRow";
import { SportType, SportTypeName } from "../types/sportType";

const SPORTS: Sport[] = [
  {
    id: SportType.Volleyball,
    name: SportTypeName[SportType.Volleyball],
    icon: "volleyball",
    color: "#5060D8",
  },
  {
    id: SportType.Football,
    name: SportTypeName[SportType.Football],
    icon: "football",
    color: "#8450D8",
  },
];

const CupManagementPage: FC = () => {
  const { cupId, sportType } = useParams<{
    cupId: string;
    sportType: string;
  }>();

  const [tabValue, setTabValue] = useState(0);
  const [selectedSportType, setSelectedSportType] = useState<number>(
    sportType ? parseInt(sportType) : 2,
  );

  const handleSportChange = (sportId: number) => {
    setSelectedSportType(sportId);
  };

  // Логируем открытие кубка для отладки
  useEffect(() => {
    if (cupId) {
      console.log("Opened cup:", cupId, "sportType:", selectedSportType);
    }
  }, [cupId, selectedSportType]);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        right: 0,
        minHeight: "100%",
        backgroundColor: "surface",
      }}
    >
      <Box
        sx={{
          pt: 1,
          pr: 1,
          width: "100%",
          minHeight: 48,
          maxHeight: 48,
          display: "flex",
          borderBottom: 1,
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
        }}
      >
        <Box sx={{ pl: 1 }}>
          <SportSelectRow sports={SPORTS} onSportChange={handleSportChange} />
        </Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="league management tabs"
          variant="fullWidth"
          sx={{
            width: "100%",
            "& .MuiTabs-indicator": {
              display: "none",
            },
            "& .MuiTab-root": {
              ml: 1,
              textTransform: "uppercase",
              fontSize: "12px",
              fontWeight: 400,
              minHeight: 32,
              maxHeight: 32,
              color: "#FFFFFF",
              borderRadius: 1,
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              "&.Mui-selected": {
                backgroundColor: "dark",
                color: "#FFFFFF",
              },
            },
          }}
        >
          <Tab
            label="Группы"
            id="groups-tab-0"
            aria-controls="cup-tabpanel-0"
          />
          <Tab label="Туры" id="tours-tab-1" aria-controls="cup-tabpanel-1" />
        </Tabs>
      </Box>
    </Box>
  );
};

export default CupManagementPage;
