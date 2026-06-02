"use client"

import { createTheme } from "@mui/material/styles"

const accent = "#8b6dff"
const bg = "#0a0a0f"
const bg2 = "#0e0e16"
const surface = "#14141f"
const surface2 = "#1b1b2a"
const border = "rgba(255,255,255,0.09)"
const borderStrong = "rgba(255,255,255,0.16)"
const text = "#f3f1ee"
const muted = "#9a9aae"
const muted2 = "#6e6e82"
const fontDisplay = '"Space Grotesk", system-ui, sans-serif'
const fontBody = '"Hanken Grotesk", system-ui, sans-serif'
const fontMono = '"JetBrains Mono", ui-monospace, monospace'

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: accent,
      contrastText: bg,
    },
    secondary: {
      main: muted,
    },
    background: {
      default: bg,
      paper: surface,
    },
    text: {
      primary: text,
      secondary: muted,
      disabled: muted2,
    },
    divider: border,
    action: {
      hover: "rgba(255,255,255,0.04)",
      selected: "rgba(139,109,255,0.15)",
      disabled: muted2,
    },
  },
  typography: {
    fontFamily: fontBody,
    button: { textTransform: "none", fontWeight: 600 },
    h1: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.025em" },
    h2: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.025em" },
    h3: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.025em" },
    h4: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.025em" },
    h5: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.025em" },
    h6: { fontFamily: fontDisplay, fontWeight: 600, letterSpacing: "-0.025em" },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    caption: { color: muted },
    overline: { fontFamily: fontMono, letterSpacing: "0.08em", color: muted2 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        "*, *::before, *::after": { boxSizing: "border-box" },
        body: {
          backgroundColor: bg,
          color: text,
          fontFamily: fontBody,
          WebkitFontSmoothing: "antialiased",
        },
        "::selection": { background: "rgba(139,109,255,0.35)" },
        "::-webkit-scrollbar": { width: 6, height: 6 },
        "::-webkit-scrollbar-track": { background: "transparent" },
        "::-webkit-scrollbar-thumb": { background: borderStrong, borderRadius: 3 },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none",
          fontWeight: 600,
          fontFamily: fontBody,
          "&:hover": { boxShadow: "none" },
          "&.MuiButton-containedPrimary": {
            background: accent,
            color: bg,
            boxShadow: `0 0 20px rgba(139,109,255,0.35)`,
            "&:hover": { background: "#7a5cf0", boxShadow: `0 0 28px rgba(139,109,255,0.5)` },
          },
          "&.MuiButton-outlinedPrimary": {
            borderColor: borderStrong,
            color: text,
            "&:hover": { borderColor: accent, backgroundColor: "rgba(139,109,255,0.08)" },
          },
          "&.MuiButton-outlinedSecondary": {
            borderColor: borderStrong,
            color: text,
            "&:hover": { borderColor: borderStrong, backgroundColor: "rgba(255,255,255,0.04)" },
          },
          "&.MuiButton-text": {
            color: muted,
            "&:hover": { color: text, backgroundColor: "rgba(255,255,255,0.04)" },
          },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: muted,
          "&:hover": { backgroundColor: "rgba(255,255,255,0.06)", color: text },
        },
      },
    },

    MuiTextField: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: surface,
            borderRadius: 12,
            fontFamily: fontBody,
            color: text,
            "& fieldset": { borderColor: borderStrong },
            "&:hover fieldset": { borderColor: "rgba(255,255,255,0.28)" },
            "&.Mui-focused fieldset": {
              borderColor: accent,
              boxShadow: `0 0 0 3px rgba(139,109,255,0.15)`,
            },
          },
          "& .MuiInputLabel-root": { color: muted },
          "& .MuiInputLabel-root.Mui-focused": { color: accent },
          "& .MuiInputBase-input::placeholder": { color: muted2, opacity: 1 },
        },
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: surface,
          "& fieldset": { borderColor: borderStrong },
          "&:hover fieldset": { borderColor: "rgba(255,255,255,0.28)" },
          "&.Mui-focused fieldset": { borderColor: accent },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: surface,
          backgroundImage: "none",
          border: `1px solid ${border}`,
        },
        outlined: {
          border: `1px solid ${border}`,
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: surface,
          backgroundImage: "none",
          border: `1px solid ${border}`,
          borderRadius: 16,
        },
      },
    },

    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: surface2,
          borderColor: border,
          color: text,
          fontFamily: fontBody,
        },
        colorPrimary: {
          backgroundColor: "rgba(139,109,255,0.15)",
          borderColor: "rgba(139,109,255,0.35)",
          color: accent,
        },
        deleteIcon: {
          color: muted,
          "&:hover": { color: text },
        },
      },
    },

    MuiSwitch: {
      styleOverrides: {
        thumb: { color: "#ffffff" },
        track: {
          backgroundColor: "rgba(255,255,255,0.18)",
          ".Mui-checked.Mui-checked + &": { backgroundColor: accent, opacity: 1 },
        },
      },
    },

    MuiDivider: {
      styleOverrides: {
        root: { borderColor: border },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: bg2,
          backgroundImage: "none",
          borderRight: `1px solid ${border}`,
        },
      },
    },

    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
          "&.Mui-selected": {
            backgroundColor: "rgba(139,109,255,0.15)",
            color: text,
            "&:hover": { backgroundColor: "rgba(139,109,255,0.22)" },
          },
        },
      },
    },

    MuiListItemIcon: {
      styleOverrides: {
        root: { color: muted, minWidth: 36 },
      },
    },

    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: surface2,
          color: text,
          border: `1px solid ${border}`,
          fontSize: 12,
          borderRadius: 8,
        },
      },
    },

    MuiTable: {
      styleOverrides: {
        root: { backgroundColor: surface },
      },
    },

    MuiTableHead: {
      styleOverrides: {
        root: {
          "& .MuiTableCell-root": {
            backgroundColor: surface2,
            color: muted2,
            borderBottom: `1px solid ${border}`,
            fontFamily: fontMono,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          },
        },
      },
    },

    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": {
            "&:hover": { backgroundColor: "rgba(255,255,255,0.03)" },
          },
          "& .MuiTableCell-root": {
            borderBottom: `1px solid ${border}`,
            color: text,
          },
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${border}`,
          color: text,
        },
      },
    },

    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: surface2,
          border: `1px solid ${border}`,
          borderRadius: 12,
          "&.MuiAlert-standardError": { borderColor: "rgba(248,113,113,0.3)", color: "#f87171" },
          "&.MuiAlert-standardSuccess": { borderColor: "rgba(52,211,153,0.3)", color: "#34d399" },
        },
      },
    },

    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: surface,
          backgroundImage: "none",
          border: `1px solid ${borderStrong}`,
          borderRadius: 20,
        },
      },
    },

    MuiDialogTitle: {
      styleOverrides: {
        root: { fontFamily: fontDisplay, fontWeight: 600, color: text },
      },
    },

    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: surface2, borderRadius: 4 },
        bar: { backgroundColor: accent, borderRadius: 4 },
      },
    },

    MuiCircularProgress: {
      styleOverrides: {
        root: { color: accent },
      },
    },

    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: surface2 },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: { color: muted },
      },
    },

    MuiInputAdornment: {
      styleOverrides: {
        root: { color: muted2, fontFamily: fontMono },
      },
    },

    MuiSelect: {
      styleOverrides: {
        icon: { color: muted },
      },
    },

    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: surface2,
          border: `1px solid ${borderStrong}`,
          borderRadius: 12,
          backgroundImage: "none",
        },
      },
    },

    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: text,
          fontSize: 14,
          "&:hover": { backgroundColor: "rgba(255,255,255,0.04)" },
          "&.Mui-selected": { backgroundColor: "rgba(139,109,255,0.15)" },
        },
      },
    },

    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${border}` },
        indicator: { backgroundColor: accent },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          color: muted,
          fontFamily: fontBody,
          fontWeight: 500,
          "&.Mui-selected": { color: text },
        },
      },
    },
  },
})
