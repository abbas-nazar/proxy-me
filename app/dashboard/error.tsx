"use client"

import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Button from "@mui/material/Button"

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 10, maxWidth: 900, mx: "auto", textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Something went wrong</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
        An unexpected error occurred. Try refreshing or click below to retry.
      </Typography>
      <Button
        variant="outlined"
        size="small"
        onClick={reset}
        sx={{ borderRadius: 2, textTransform: "none", borderColor: "rgba(255,255,255,0.12)" }}
      >
        Try again
      </Button>
    </Box>
  )
}
