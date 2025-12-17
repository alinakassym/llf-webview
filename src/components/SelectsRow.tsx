// llf-webview/src/components/SelectsRow.tsx

import type { FC } from "react";
import { useState } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { SportIcon } from "./icons/SportIcons";
import { SportType, SportTypeName } from "../types/sportType";

type Sport = {
  id: number;
  name: string;
  icon: "volleyball" | "football";
  color: string;
};

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

export const SelectsRow: FC = () => {
  const [selectedSportId, setSelectedSportId] = useState<string>(
    String(SportType.Volleyball)
  );

  const handleSportChange = (event: SelectChangeEvent) => {
    setSelectedSportId(event.target.value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        pb: 1,
      }}
    >
      {/* Sport Select */}
      <FormControl sx={{ flex: 1, maxWidth: 68 }}>
        <Select
          value={selectedSportId}
          onChange={handleSportChange}
          size="small"
          displayEmpty
          renderValue={(selected) => {
            const sport = SPORTS.find((s) => String(s.id) === selected);
            if (!sport) return "";
            return (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <SportIcon name={sport.icon} size={24} color={sport.color} />
              </Box>
            );
          }}
          sx={{
            backgroundColor: (theme) => theme.palette.bgOpacity,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: 2,
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
          }}
        >
          {SPORTS.map((sport) => (
            <MenuItem key={sport.id} value={String(sport.id)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <SportIcon name={sport.icon} size={24} color={sport.color} />
                <span>{sport.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
