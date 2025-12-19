// llf-webview/src/components/SearchBar.tsx

import { type FC } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  variant?: "outlined" | "filled" | "standard";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  iconColor?: string;
  textColor?: string;
}

const SearchBar: FC<SearchBarProps> = ({
  variant = "outlined",
  value,
  onChange,
  placeholder = "Поиск...",
  iconColor = "text.secondary",
  textColor = "text.primary",
}) => {
  return (
    <TextField
      variant={variant}
      fullWidth
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: iconColor }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        input: { color: textColor },
        "& .MuiOutlinedInput-root": {
          height: "44px",
          backgroundColor: "background.paper",
          fontSize: "14px",
          fontWeight: 400,
          "& fieldset": {
            borderColor: "cardBorder",
          },
          "&:hover fieldset": {
            borderColor: "cardBorder",
          },
          "&.Mui-focused fieldset": {
            borderColor: "primary.main",
          },
        },
        "& .MuiOutlinedInput-input": {
          padding: "10px 14px",
          fontSize: "14px",
          fontWeight: 400,
        },
      }}
    />
  );
};

export default SearchBar;
