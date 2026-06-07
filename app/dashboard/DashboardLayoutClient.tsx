"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { UserButton } from "@clerk/nextjs"
import { BASE_URL } from "@/lib/baseUrl"
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
            "&.Mui-selected": { bgcolor: "rgba(139,109,255,0.15)", color: "#f3f1ee" },
            "&.Mui-selected:hover": { bgcolor: "rgba(139,109,255,0.22)" },
            "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: collapsed ? 0 : 1.5,
              color: active ? "#f3f1ee" : "text.secondary",
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
            <Box sx={{ my: 1, mx: 1, borderTop: "1px solid rgba(255,255,255,0.09)" }} />
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
}: {
  collapsed: boolean
}) {
  return (
    <Box sx={{ p: 1.5, borderTop: "1px solid rgba(255,255,255,0.09)" }}>
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
      <Box sx={{ display: "flex", alignItems: "center", px: 2, py: 1.5, justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.09)" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", color: "#f3f1ee" }} onClick={onClose}>
          <Box component="span" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px", fontFamily: "var(--font-space-grotesk)" }}>
            Proxy<span style={{ color: "#8b6dff" }}>-</span>Me
          </Box>
        </Link>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <SidebarGroups collapsed={false} pathname={pathname} onItemClick={onClose} />
      <SidebarBottom collapsed={false} />
    </Box>
  )
}

export default function DashboardLayout({ children, slug }: { children: React.ReactNode; slug: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const pathname = usePathname()
  const width = collapsed ? DRAWER_COLLAPSED : DRAWER_WIDTH
  const publicUrl = `${BASE_URL.replace(/^https?:\/\//, "")}/${slug}`

  function copyLink() {
    navigator.clipboard.writeText(`${BASE_URL}/${slug}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#0a0a0f" }}>

      {/* Mobile top bar */}
      <Box
        sx={{
          display: { xs: "flex", md: "none" },
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "#0e0e16",
          borderBottom: "1px solid rgba(255,255,255,0.09)",
          px: 2,
          py: 1.5,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none", color: "#f3f1ee", fontWeight: 700, fontSize: 15, fontFamily: "var(--font-space-grotesk)" }}>
          Proxy<span style={{ color: "#8b6dff" }}>-</span>Me
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
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH, boxSizing: "border-box", bgcolor: "#0e0e16" },
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
            bgcolor: "#0e0e16",
            borderRight: "1px solid rgba(255,255,255,0.09)",
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
            borderBottom: "1px solid rgba(255,255,255,0.09)",
            minHeight: 52,
          }}
        >
          {!collapsed && (
            <Link href="/dashboard" style={{ textDecoration: "none", color: "#f3f1ee" }}>
              <Box component="span" sx={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px", fontFamily: "var(--font-space-grotesk)" }}>
                Proxy<span style={{ color: "#8b6dff" }}>-</span>Me
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

      <Box component="main" sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", bgcolor: "#0a0a0f" }}>
        {/* Top bar */}
        <Box sx={{
          display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 1.5,
          px: { xs: 2, md: 3 }, py: 1,
          pt: { xs: 8, md: 1 },
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          bgcolor: "#0e0e16",
          minHeight: { xs: "auto", md: 48 },
        }}>
          <Box
            onClick={copyLink}
            sx={{
              display: "flex", alignItems: "center", gap: 1,
              bgcolor: "#14141f", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 2, px: 1.5, py: 0.75, cursor: "pointer",
              "&:hover": { borderColor: "rgba(255,255,255,0.2)" },
              transition: "border-color 0.15s",
            }}
          >
            <Box component="span" sx={{ fontFamily: "var(--font-jetbrains-mono, monospace)", fontSize: 12, color: "#9a9aae" }}>
              {publicUrl}
            </Box>
            <Box component="span" sx={{ fontSize: 11, color: copied ? "#4ade80" : "#8b6dff", fontWeight: 600, flexShrink: 0 }}>
              {copied ? "Copied!" : "Copy"}
            </Box>
          </Box>
          <Box component="a" href={`/${slug}`} target="_blank" rel="noopener noreferrer"
            sx={{ display: "flex", alignItems: "center", color: "text.disabled", "&:hover": { color: "text.primary" }, transition: "color 0.15s" }}
          >
            <OpenInNewIcon sx={{ fontSize: 16 }} />
          </Box>
        </Box>

        <Box sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}
