import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { visitorContacts } from "@/db/schema"
import { eq, desc, isNotNull, and } from "drizzle-orm"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableBody from "@mui/material/TableBody"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"
import Divider from "@mui/material/Divider"

export default async function LeadsPage() {
  const user = await getOrRedirectUser()

  const contacts = await db
    .select()
    .from(visitorContacts)
    .where(and(eq(visitorContacts.userId, user.id), isNotNull(visitorContacts.email)))
    .orderBy(desc(visitorContacts.createdAt))

  return (
    <Box sx={{ px: { xs: 2, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ mb: 3, display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
            Leads
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {contacts.length} contact{contacts.length !== 1 ? "s" : ""} collected.
          </Typography>
        </Box>
        {contacts.length > 0 && (
          <a
            href="/api/leads/export"
            style={{
              fontSize: 12, color: "#9a9aae", textDecoration: "none",
              border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
              padding: "6px 14px", whiteSpace: "nowrap", flexShrink: 0,
            }}
          >
            Export CSV
          </a>
        )}
      </Box>

      {contacts.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 2, borderStyle: "dashed", px: 4, py: 8, textAlign: "center" }}
        >
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            No leads yet. Enable contact collection in Settings to start capturing visitor details.
          </Typography>
        </Paper>
      ) : (
        <>
          {/* Desktop table */}
          <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", display: { xs: "none", sm: "block" } }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "#1b1b2a" }}>
                  {["Name", "Email", "Date", "Conversation"].map((col) => (
                    <TableCell
                      key={col}
                      sx={{ fontWeight: 700, fontSize: 11, color: "text.disabled", letterSpacing: "0.06em", textTransform: "uppercase", py: 1.5 }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {contacts.map((c) => (
                  <TableRow key={c.id} hover>
                    <TableCell sx={{ fontWeight: 500, fontSize: 13 }}>
                      {c.name ?? <Typography component="span" sx={{ color: "text.disabled" }}>—</Typography>}
                    </TableCell>
                    <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>
                      {c.email ?? <Typography component="span" sx={{ color: "text.disabled" }}>—</Typography>}
                    </TableCell>
                    <TableCell sx={{ color: "text.disabled", fontSize: 12 }}>
                      {c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
                        : ""}
                    </TableCell>
                    <TableCell>
                      {c.sessionId ? (
                        <Typography
                          component="a"
                          href={`/dashboard/conversations#session-${c.sessionId}`}
                          variant="caption"
                          sx={{ color: "text.primary", textDecoration: "underline", textUnderlineOffset: 2, "&:hover": { opacity: 0.6 } }}
                        >
                          View chat
                        </Typography>
                      ) : (
                        <Typography component="span" variant="caption" sx={{ color: "text.disabled" }}>—</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>

          {/* Mobile cards */}
          <Box sx={{ display: { xs: "flex", sm: "none" }, flexDirection: "column", gap: 1.5 }}>
            {contacts.map((c, i) => (
              <Paper key={c.id} variant="outlined" sx={{ borderRadius: 2, px: 2, py: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: 14 }}>
                    {c.name ?? <Typography component="span" sx={{ color: "text.disabled", fontSize: 14 }}>No name</Typography>}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.disabled", flexShrink: 0, ml: 1 }}>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })
                      : ""}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mb: c.sessionId ? 1 : 0 }}>
                  {c.email ?? <Typography component="span" sx={{ color: "text.disabled", fontSize: 13 }}>No email</Typography>}
                </Typography>
                {c.sessionId && (
                  <>
                    <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,0.06)" }} />
                    <Typography
                      component="a"
                      href={`/dashboard/conversations#session-${c.sessionId}`}
                      sx={{ fontSize: 12, color: "text.primary", textDecoration: "underline", textUnderlineOffset: 2 }}
                    >
                      View conversation
                    </Typography>
                  </>
                )}
              </Paper>
            ))}
          </Box>
        </>
      )}
    </Box>
  )
}
