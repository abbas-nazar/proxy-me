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
import IconButton from "@mui/material/IconButton"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"
import PersonIcon from "@mui/icons-material/Person"
import ChatIcon from "@mui/icons-material/Chat"
import SettingsIcon from "@mui/icons-material/Settings"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import PeopleIcon from "@mui/icons-material/People"
import OpenInNewIcon from "@mui/icons-material/OpenInNew"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import CloseIcon from "@mui/icons-material/Close"

const DRAWER_WIDTH = 220
const DRAWER_COLLAPSED = 64

type NavItem = {
  label: string
  href: string
  icon: React.ReactNode
}

type NavGroup = {
  groupLabel?: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Profile", href: "/dashboard/sections", icon: <PersonIcon fontSize="small" /> },
    ],
  },
  {
    groupLabel: "ACTIVITY",
    items: [
      { label: "Conversations", href: "/dashboard/conversations", icon: <ChatIcon fontSize="small" /> },
      { label: "Leads", href: "/dashboard/leads", icon: <PeopleIcon fontSize="small" /> },
    ],
  },
  {
    groupLabel: "MANAGE",
    items: [
      { label: "Import CV", href: "/dashboard/import", icon: <FileUploadIcon fontSize="small" /> },
      { label: "Settings", href: "/dashboard/settings", icon: <SettingsIcon fontSize="small" /> },
    ],
  },
]

function NavItemRow({
  label,
  href,
  icon,
  collapsed,
  active,
  onClick,
}: {
  label: string
  href: string
  icon: React.ReactNode
  collapsed: boolean
  active: boolean
  onClick?: () => void
}) {
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <Tooltip title={collapsed ? label : ""} placement="right">
        <ListItemButton
          component={Link}
          href={href}
          selected={active}
          onClick={onClick}
          sx={{
            borderRadius: 1.5,
            minHeight: 38,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 1.5,
            "&.Mui-selected": { bgcolor: "#f3f4f6", color: "#111" },
            "&.Mui-selected:hover": { bgcolor: "#e5e7eb" },
            "&:hover": { bgcolor: "#f9fafb" },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 1.5,
              color: active ? "#111" : "text.secondary",
            }}
          >
            {icon}
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary={label}
              slotProps={{ primary: { style: { fontSize: 13.5, fontWeight: active ? 600 : 400 } } }}
            />
          )}
        </ListItemButton>
      </Tooltip>
    </ListItem>
  )
}

function SidebarGroups({
  collapsed,
  pathname,
  onItemClick,
}: {
  collapsed: boolean
  pathname: string
  onItemClick?: () => void
}) {
  return (
    <Box sx={{ flex: 1, overflowY: "auto", px: 1, pt: 1 }}>
      {NAV_GROUPS.map((group, gi) => (
        <Box key={gi} sx={{ mb: collapsed ? 0 : 0.5 }}>
          {!collapsed && group.groupLabel && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                color: "text.disabled",
                fontWeight: 700,
                letterSpacing: "0.08em",
                fontSize: 10,
                px: 1.5,
                pt: gi === 0 ? 0.5 : 1.5,
                pb: 0.5,
              }}
            >
              {group.groupLabel}
            </Typography>
          )}
          {collapsed && group.groupLabel && gi > 0 && (
            <Box sx={{ my: 1, mx: 1, borderTop: "1px solid #f0f0f0" }} />
          )}
          <List dense disablePadding>
            {group.items.map(({ label, href, icon }) => (
              <NavItemRow
                key={href}
                label={label}
                href={href}
                icon={icon}
                collapsed={collapsed}
                active={pathname.startsWith(href)}
                onClick={onItemClick}
              />
            ))}
          </List>
        </Box>
      ))}
    </Box>
  )
}

function SidebarBottom({
  collapsed,
  onItemClick,
}: {
  collapsed: boolean
  onItemClick?: () => void
}) {
  return (
    <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1, borderTop: "1px solid #f0f0f0" }}>
      <Tooltip title={collapsed ? "Preview page" : ""} placement="right">
        <ListItemButton
          component="a"
          href="/"
          target="_blank"
          onClick={onItemClick}
          sx={{
            borderRadius: 1.5,
            minHeight: 38,
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 1 : 1.5,
            "&:hover": { bgcolor: "#f9fafb" },
          }}
        >
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? 0 : 1.5, color: "text.secondary" }}>
            <OpenInNewIcon fontSize="small" />
          </ListItemIcon>
          {!collapsed && (
            <ListItemText
              primary="Preview page"
              slotProps={{ primary: { style: { fontSize: 13.5 } } }}
            />
          )}
        </ListItemButton>
      </Tooltip>
      <Box sx={{ display: "flex", justifyContent: collapsed ? "center" : "flex-start", px: 0.5 }}>
        <UserButton />
      </Box>
    </Box>
  )
}

function MobileSidebarContent({
  pathname,
  onClose,
}: {
  pathname: string
  onClose: () => void
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, justifyContent: "space-between", borderBottom: "1px solid #f0f0f0" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }} onClick={onClose}>
          <Box component="span" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>
            proxy-me
          </Box>
        </Link>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <SidebarGroups collapsed={false} pathname={pathname} onItemClick={onClose} />
      <SidebarBottom collapsed={false} onItemClick={onClose} />
    </Box>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fafafa" }}>

      {/* Mobile top bar */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "white",
          borderBottom: "1px solid #e5e7eb",
          px: 2,
          py: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit", fontWeight: 700, fontSize: 15 }}>
          proxy-me
        </Link>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <UserButton />
          <IconButton size="small" onClick={() => setMobileOpen(true)}>
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box" },
        }}
      >
        <MobileSidebarContent pathname={pathname} onClose={() => setMobileOpen(false)} />
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "flex" },
          width,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width,
            boxSizing: "border-box",
            transition: "width 0.2s ease",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            bgcolor: "white",
            borderRight: "1px solid #f0f0f0",
          },
        }}
      >
        {/* Sidebar header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: collapsed ? 1 : 2,
            py: 1.5,
            justifyContent: collapsed ? "center" : "space-between",
            borderBottom: "1px solid #f0f0f0",
            minHeight: 52,
          }}
        >
          {!collapsed && (
            <Link href="/dashboard" style={{ textDecoration: "none", color: "inherit" }}>
              <Box component="span" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>
                proxy-me
              </Box>
            </Link>
          )}
          <IconButton size="small" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>

        <SidebarGroups collapsed={collapsed} pathname={pathname} />
        <SidebarBottom collapsed={collapsed} />
      </Drawer>

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          pt: { xs: 8, md: 0 },
          bgcolor: "#fafafa",
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
