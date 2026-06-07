import Box from "@mui/material/Box"
import Skeleton from "@mui/material/Skeleton"

export default function SectionsLoading() {
  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Box>
          <Skeleton variant="text" width={140} height={32} sx={{ bgcolor: "rgba(255,255,255,0.06)" }} />
          <Skeleton variant="text" width={80} height={18} sx={{ bgcolor: "rgba(255,255,255,0.04)" }} />
        </Box>
        <Skeleton variant="rounded" width={100} height={32} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
      </Box>
      {[1, 2, 3, 4, 5].map((i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Skeleton variant="text" width={60} height={14} sx={{ mb: 1, bgcolor: "rgba(255,255,255,0.04)" }} />
          <Skeleton variant="rounded" height={90} sx={{ bgcolor: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
        </Box>
      ))}
    </Box>
  )
}
