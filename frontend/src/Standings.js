import React, { useState } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Modal, Box } from '@mui/material';
import './Standings.css';

function Standings({ playersStats }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const sortedPlayers = [...playersStats].sort((a, b) => b.wins - a.wins);

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
