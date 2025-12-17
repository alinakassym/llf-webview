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

export type Sport = {
  id: number;
  name: string;
  icon: "volleyball" | "football";
  color: string;
};

interface SelectsRowProps {
  sports: Sport[];
}

export const SelectsRow: FC<SelectsRowProps> = ({ sports }) => {
  const [selectedSportId, setSelectedSportId] = useState<string>(
    sports.length > 0 ? String(sports[0].id) : "",
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
            const sport = sports.find((s) => String(s.id) === selected);
            if (!sport) return "";
            return (
              <Box
                sx={{
                  pt: 0.3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <SportIcon name={sport.icon} size={18} color="#FFFFFF" />
              </Box>
            );
          }}
          sx={{
            height: 32,
            backgroundColor: (theme) => theme.palette.bgOpacity,
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            borderRadius: 1,
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
          {sports.map((sport) => (
            <MenuItem key={sport.id} value={String(sport.id)}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <SportIcon name={sport.icon} size={18} color={sport.color} />
                <span>{sport.name}</span>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
