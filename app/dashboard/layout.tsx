"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import PersonIcon from "@mui/icons-material/Person"
import ChatIcon from "@mui/icons-material/Chat"
import SettingsIcon from "@mui/icons-material/Settings"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import PeopleIcon from "@mui/icons-material/People"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"

const DRAWER_WIDTH = 220
const DRAWER_COLLAPSED = 64

const NAV_ITEMS = [
  { label: "Profile", href: "/dashboard/sections", icon: <PersonIcon fontSize="small" /> },
  { label: "Conversations", href: "/dashboard/conversations", icon: <ChatIcon fontSize="small" /> },
  { label: "Leads", href: "/dashboard/leads", icon: <PeopleIcon fontSize="small" /> },
  { label: "Import CV", href: "/dashboard/import", icon: <FileUploadIcon fontSize="small" /> },
  { label: "Settings", href: "/dashboard/settings", icon: <SettingsIcon fontSize="small" /> },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Drawer
        variant="permanent"
        sx={{
          width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            transition: "width 0.2s ease",
            overflowX: "hidden",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", px: 1.5, py: 1.5, justifyContent: collapsed ? "center" : "space-between" }}>
          {!collapsed && (
            <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
              <Box component="span" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>proxy-me</Box>
            </Link>
          )}
          <IconButton size="small" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>

        <Divider />

        <List dense sx={{ px: 1, pt: 1 }}>
          {NAV_ITEMS.map(({ label, href, icon }) => {
            const active = pathname.startsWith(href)
            return (
              <ListItem key={href} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={collapsed ? label : ""} placement="right">
                  <ListItemButton
                    component={Link}
                    href={href}
                    selected={active}
                    sx={{
                      borderRadius: 1.5,
                      minHeight: 40,
                      justifyContent: collapsed ? "center" : "flex-start",
                      px: collapsed ? 1 : 1.5,
                      "&.Mui-selected": { bgcolor: "#f3f4f6", color: "black" },
                      "&.Mui-selected:hover": { bgcolor: "#e5e7eb" },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: active ? "black" : "text.secondary" }}>
                      {icon}
                    </ListItemIcon>
                    {!collapsed && <ListItemText primary={label} slotProps={{ primary: { style: { fontSize: 14 } } }} />}
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            )
          })}
        </List>

        <Box sx={{ mt: "auto", p: 1.5, display: "flex", justifyContent: collapsed ? "center" : "flex-start" }}>
          <UserButton />
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1, p: 4, maxWidth: 800, mx: "auto", width: "100%" }}>
        {children}
      </Box>
    </Box>
  )
}
