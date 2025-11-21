import { createTheme, type PaletteMode } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Palette {
    tertiary: Palette["primary"];
    cardBorder: string;
  }
  interface PaletteOptions {
    tertiary?: PaletteOptions["primary"];
    cardBorder?: string;
  }
}

export const createAppTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: "#5060D8",
      },
      secondary: {
        main: "#8450D8",
      },
      tertiary: {
        main: "#50A4D8",
      },
      cardBorder: mode === "light" ? "#EDF2F8" : "#1D1527",
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
            padding: "14px",
            boxShadow: "none",
            "&:hover": {
              boxShadow: "none",
            },
            "&:active": {
              boxShadow: "none",
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: 8,
            },
          },
        },
      },
    },
  });
