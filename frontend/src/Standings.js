import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import './Standings.css';

function Standings({ playersStats }) {
  const sortedPlayers = playersStats.sort((a, b) => b.wins - a.wins);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell className="table-heading">Spelare</TableCell>
          <TableCell align="right" className="table-heading">Matcher</TableCell>
          <TableCell align="right" className="table-heading">Vinst</TableCell>
          <TableCell align="right" className="table-heading">Oavgort</TableCell>
          <TableCell align="right" className="table-heading">Förlust</TableCell>
          <TableCell align="right" className="table-heading">Mål</TableCell>
          <TableCell align="right" className="table-heading">Poäng</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedPlayers.map((player) => (
          <TableRow key={player.id}>
            <TableCell component="th" scope="row" className="table-data">
              {player.name}
            </TableCell>
            <TableCell align="right" className="table-data">{player.games_played}</TableCell>
            <TableCell align="right" className="table-data">{player.wins}</TableCell>
            <TableCell align="right" className="table-data">{player.draws}</TableCell>
            <TableCell align="right" className="table-data">{player.losses}</TableCell>
            <TableCell align="right" className="table-data">{player.total_goals}</TableCell>
            <TableCell align="right" className="table-data">{player.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Standings;
