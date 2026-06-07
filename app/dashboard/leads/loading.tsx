import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"

export default function LeadsLoading() {
  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width={100} height={32} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
        <Skeleton variant="text" width={140} height={18} sx={{ bgcolor: "rgba(255,255,255,0.04)" }} />
      </Box>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} variant="rounded" height={64} sx={{ mb: 1.5, bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
      ))}
    </Box>
  )
}
