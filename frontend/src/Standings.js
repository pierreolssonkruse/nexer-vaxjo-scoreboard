import React, { useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Modal, Box } from '@mui/material';
import './Standings.css';

function Standings({ playersStats }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const sortedPlayers = [...playersStats].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.games_played !== b.games_played) return b.games_played - a.games_played;
    if (a.total_goals !== b.total_goals) return b.total_goals - a.total_goals;
    return a.name.localeCompare(b.name);
  });

  const handleResetClick = () => {
    setShowConfirm(true);
  }

  const handleConfirmReset = async () => {
    try {
      const response = await fetch('http://localhost:3001/resetStats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.message) {
        console.log(data.message);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error resetting player stats:', error);
    }
    setShowConfirm(false);
  }

  const handleCancelReset = () => {
    setShowConfirm(false);
  }

  return (
    <div>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell className="table-heading">Spelare</TableCell>
            <TableCell align="right" className="table-heading">S</TableCell>
            <TableCell align="right" className="table-heading">V</TableCell>
            <TableCell align="right" className="table-heading">O</TableCell>
            <TableCell align="right" className="table-heading">F</TableCell>
            <TableCell align="right" className="table-heading">+/-</TableCell>
            <TableCell align="right" className="table-heading">P</TableCell>
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
              <TableCell align="right" className="table-data">
                {
                  (() => {
                    const goalDifference = (player.total_goals || 0) - (player.goals_conceded || 0);
                    return goalDifference > 0 ? `+${goalDifference}` : goalDifference;
                  })()
                }
              </TableCell>
              <TableCell align="right" className="table-points">{player.games_played ? player.points : 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="centered-button-container">
        <Button className='reset-button' onClick={handleResetClick}>
          Återställ tabellstatistik
        </Button>
      </div>
      <Modal
        open={showConfirm}
        onClose={handleCancelReset}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className="modal-content">
          <p id="modal-modal-title">VARNING</p>
          <p id="modal-modal-description">Är du säker på att du vill återställa statistiken?</p>
          <Button className="modal-button" onClick={handleConfirmReset}>Återställ</Button>
          <Button className="modal-button" onClick={handleCancelReset}>Avbryt</Button>
        </Box>
      </Modal>
    </div>
  );
}

export default Standings;
