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
          <TableCell align="right" className="table-heading">Oavgjort</TableCell>
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
            <TableCell align="right" className="table-data">{player.games_played || 0}</TableCell>
            <TableCell align="right" className="table-data">{player.games_played ? player.wins : 0}</TableCell>
            <TableCell align="right" className="table-data">{player.games_played ? player.draws : 0}</TableCell>
            <TableCell align="right" className="table-data">{player.games_played ? player.losses : 0}</TableCell>
            <TableCell align="right" className="table-data">{player.games_played ? player.total_goals : 0}</TableCell>
            <TableCell align="right" className="table-data">{player.games_played ? player.points : 0}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default Standings;
