import { getOrRedirectUser } from "@/app/actions/onboarding"
import { db } from "@/lib/db"
import { visitorContacts } from "@/db/schema"
import { eq, desc } from "drizzle-orm"
import Box from "@mui/material/Box"

import Typography from "@mui/material/Typography"
import Paper from "@mui/material/Paper"
import Table from "@mui/material/Table"
import TableHead from "@mui/material/TableHead"
import TableBody from "@mui/material/TableBody"
import TableRow from "@mui/material/TableRow"
import TableCell from "@mui/material/TableCell"

export default async function LeadsPage() {
  const user = await getOrRedirectUser()

  const contacts = await db
    .select()
    .from(visitorContacts)
    .where(eq(visitorContacts.userId, user.id))
    .orderBy(desc(visitorContacts.createdAt))

  return (
    <Box sx={{ px: { xs: 3, md: 5 }, py: 4, maxWidth: 900, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: "-0.3px" }}>
          Leads
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""} collected.
        </Typography>
      </Box>

      {contacts.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderStyle: "dashed",
            px: 6,
            py: 8,
            textAlign: "center",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.disabled" }}>
            No leads yet. Enable contact collection in Settings to start capturing visitor details.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "#1b1b2a" }}>
                {["Name", "Email", "Date", "Conversation"].map((col) => (
                  <TableCell
                    key={col}
                    sx={{
                      fontWeight: 700,
                      fontSize: 11,
                      color: "text.disabled",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      py: 1.5,
                    }}
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
                      <Typography component="span" variant="caption" sx={{ color: "text.disabled" }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  )
}
