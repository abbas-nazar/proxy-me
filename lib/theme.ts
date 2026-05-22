"use client"

import { createTheme } from "@mui/material/styles"

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#000000" },
    secondary: { main: "#6b7280" },
    background: { default: "#f9fafb", paper: "#ffffff" },
  },
  typography: {
    fontFamily: "inherit",
    button: { textTransform: "none" },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { boxShadow: "none", "&:hover": { boxShadow: "none" } },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: "1px solid #e5e7eb", backgroundColor: "#ffffff" },
      },
    },
  },
})
