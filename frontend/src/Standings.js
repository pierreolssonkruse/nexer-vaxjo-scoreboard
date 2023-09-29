import React from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';

function Standings({ playersStats }) {
  const sortedPlayers = playersStats.sort((a, b) => b.wins - a.wins);

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Player</TableCell>
          <TableCell align="right">Matcher</TableCell>
          <TableCell align="right">Vinst</TableCell>
          <TableCell align="right">Oavgort</TableCell>
          <TableCell align="right">Förlust</TableCell>
          <TableCell align="right">Mål</TableCell>
          <TableCell align="right">Poäng</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sortedPlayers.map((player) => (
          <TableRow key={player.id}>
            <TableCell component="th" scope="row">
              {player.name}
            </TableCell>
            <TableCell align="right">{player.games_played}</TableCell>
            <TableCell align="right">{player.wins}</TableCell>
            <TableCell align="right">{player.draws}</TableCell>
            <TableCell align="right">{player.losses}</TableCell>
            <TableCell align="right">{player.total_goals}</TableCell>
            <TableCell align="right">{player.points}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Standings;