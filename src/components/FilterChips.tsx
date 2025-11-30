import { type FC } from "react";
import { Box, Chip } from "@mui/material";

interface FilterChipsProps<T extends string> {
  options: readonly T[];
  selected: T;
  onSelect: (value: T) => void;
}

const FilterChips = <T extends string>({
  options,
  selected,
  onSelect,
}: FilterChipsProps<T>): ReturnType<FC> => {
  return (
    <Box
      sx={{
        px: 2,
        display: "flex",
        gap: 1,
        overflowX: "auto",
        "&::-webkit-scrollbar": {
          display: "none",
        },
        scrollbarWidth: "none",
      }}
    >
      {options.map((option) => (
        <Chip
          key={option}
          label={option}
          onClick={() => onSelect(option)}
          color={selected === option ? "primary" : "default"}
          variant={selected === option ? "filled" : "outlined"}
          sx={{
            borderRadius: 2,
            fontSize: "12px",
            fontWeight: selected === option ? 600 : 400,
            flexShrink: 0,
          }}
        />
      ))}
    </Box>
  );
};

export default FilterChips;
