// llf-webview/src/components/MatchScoreTable.tsx

import { type FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import type { Match } from "../types/tour";

interface MatchScoreTableProps {
  match: Match;
}

const MatchScoreTable: FC<MatchScoreTableProps> = ({ match }) => {
  return (
    <Table
      size="small"
      sx={{
        mt: 1,
        "& .MuiTableCell-root": {
          padding: "4px 8px",
          fontSize: "10px",
          borderBottom: "none",
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>Команда</TableCell>
          <TableCell align="center" sx={{ fontWeight: 600 }}>
            Сет 1
          </TableCell>
          <TableCell align="center" sx={{ fontWeight: 600 }}>
            Сет 2
          </TableCell>
          <TableCell align="center" sx={{ fontWeight: 600 }}>
            Сет 3
          </TableCell>
          <TableCell align="center" sx={{ fontWeight: 600 }}>
            Счёт
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <TableRow>
          <TableCell sx={{ fontWeight: 500 }}>
            {match.team1Name}
          </TableCell>
          <TableCell align="center">
            {match.team1Set1Score}
          </TableCell>
          <TableCell align="center">
            {match.team1Set2Score}
          </TableCell>
          <TableCell align="center">
            {match.team1Set3Score}
          </TableCell>
          <TableCell
            align="center"
            sx={{
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {match.team1Score}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell sx={{ fontWeight: 500 }}>
            {match.team2Name}
          </TableCell>
          <TableCell align="center">
            {match.team2Set1Score}
          </TableCell>
          <TableCell align="center">
            {match.team2Set2Score}
          </TableCell>
          <TableCell align="center">
            {match.team2Set3Score}
          </TableCell>
          <TableCell
            align="center"
            sx={{
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {match.team2Score}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default MatchScoreTable;
