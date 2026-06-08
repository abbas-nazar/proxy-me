"use client"

import TableCell from "@mui/material/TableCell"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

type Props = {
  col: "name" | "email" | "date"
  label: string
  active: string
  dir: "asc" | "desc"
}

export default function SortableHeader({ col, label, active, dir }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function handleClick() {
    const newDir = active === col && dir === "asc" ? "desc" : "asc"
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", col)
    params.set("dir", newDir)
    router.push(`${pathname}?${params.toString()}`)
  }

  const isActive = active === col
  const arrow = isActive ? (dir === "asc" ? " ↑" : " ↓") : ""

  return (
    <TableCell
      onClick={handleClick}
      sx={{
        fontWeight: 700, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", py: 1.5,
        color: isActive ? "text.primary" : "text.disabled",
        cursor: "pointer", userSelect: "none",
        "&:hover": { color: "text.primary" },
        transition: "color 0.15s",
        whiteSpace: "nowrap",
      }}
    >
      {label}{arrow}
    </TableCell>
  )
}
