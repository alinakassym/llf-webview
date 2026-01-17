// llf-webview/src/components/SportSelectRow.tsx

import type { FC } from "react";
import { useState, useEffect } from "react";
import {
  Box,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { SportIcon } from "./icons/SportIcons";

const SPORT_TYPE_STORAGE_KEY = "selectedSportType";

// Кастомная иконка dropdown с белым цветом
const WhiteDropdownIcon = (
  props: React.ComponentProps<typeof ArrowDropDownIcon>,
) => <ArrowDropDownIcon {...props} sx={{ fill: "text.secondary" }} />;

export type Sport = {
  id: number;
  name: string;
  icon: "volleyball" | "football";
  color: string;
};

interface SportSelectRowProps {
  sports: Sport[];
  onSportChange?: (sportId: number) => void;
}

export const SportSelectRow: FC<SportSelectRowProps> = ({
  sports,
  onSportChange,
}) => {
  // Инициализация: читаем из localStorage или используем "2" (волейбол) по умолчанию
  const getInitialSportId = (): string => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SPORT_TYPE_STORAGE_KEY);
      if (saved) return saved;
    }
    return "2"; // Волейбол по умолчанию
  };

  const [selectedSportId, setSelectedSportId] = useState<string>(
    getInitialSportId(),
  );

  // Сохраняем в localStorage при каждом изменении
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SPORT_TYPE_STORAGE_KEY, selectedSportId);
    }
  }, [selectedSportId]);

  // Вызываем callback при монтировании компонента с начальным значением
  useEffect(() => {
    if (onSportChange) {
      onSportChange(Number(selectedSportId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSportChange = (event: SelectChangeEvent) => {
    const newSportId = event.target.value;
    setSelectedSportId(newSportId);
    // Вызываем callback сразу при изменении
    if (onSportChange) {
      onSportChange(Number(newSportId));
    }
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
          disabled
          value={selectedSportId}
          onChange={handleSportChange}
          size="small"
          displayEmpty
          IconComponent={WhiteDropdownIcon}
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
            borderRadius: 1,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
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
