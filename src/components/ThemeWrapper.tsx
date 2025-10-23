import { type FC, type ReactNode, useMemo } from "react";
import { ThemeProvider, useMediaQuery } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { createAppTheme } from "../theme";

interface ThemeWrapperProps {
  children: ReactNode;
}

const ThemeWrapper: FC<ThemeWrapperProps> = ({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const theme = useMemo(
    () => createAppTheme(prefersDarkMode ? "dark" : "light"),
    [prefersDarkMode],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapper;
