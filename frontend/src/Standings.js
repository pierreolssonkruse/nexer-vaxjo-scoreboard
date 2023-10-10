import React, { useState, useEffect } from 'react';
import { Table, TableHead, TableRow, TableCell, TableBody, Button, Modal, Box } from '@mui/material';
import './Standings.css';

function Standings({ playersStats = [] }) {
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [displayedPlayers, setDisplayedPlayers] = useState(playersStats);

  const sortedPlayers = [...displayedPlayers].sort((a, b) => {
    if (a.points !== b.points) return b.points - a.points;
    if (a.games_played !== b.games_played) return b.games_played - a.games_played;
    if (a.total_goals !== b.total_goals) return b.total_goals - a.total_goals;
    return a.name.localeCompare(b.name);
  });

  const promptDeletePlayer = (playerId) => {
    setPlayerToDelete(playerId);
    setShowConfirmDelete(true);
  }

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    try {
      const response = await fetch(`/.netlify/functions/deleteScores${playerToDelete}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();

      if (data.message) {
        console.log(data.message);
        setDisplayedPlayers(prevPlayers => prevPlayers.filter(player => player.id !== playerToDelete));
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('Error deleting player:', error);
    }

    setPlayerToDelete(null);
    setShowConfirmDelete(false);
  }

  useEffect(() => {
    setDisplayedPlayers(playersStats);
  }, [playersStats]);

  const handleResetClick = () => {
    setShowConfirmReset(true);
  }

  const handleConfirmReset = async () => {
    try {
      const response = await fetch('/.netlify/functions/resetStats', {
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
    setShowConfirmReset(false);
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
            <TableCell align="right" className="table-heading">Radera</TableCell>
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
              <TableCell align="right" className="table-data">
                <Button onClick={() => promptDeletePlayer(player.id)} style={{ color: 'red' }}>
                  X
                </Button>
              </TableCell>
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
        open={showConfirmReset}
        onClose={() => setShowConfirmReset(false)}
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
      >
        <Box className="modal-content">
          <p id="reset-modal-title">VARNING</p>
          <p id="reset-modal-description">Är du säker på att du vill återställa statistiken?</p>
          <Button className="modal-button" onClick={handleConfirmReset}>Återställ</Button>
          <Button className="modal-button" onClick={() => setShowConfirmReset(false)}>Avbryt</Button>
        </Box>
      </Modal>
      <Modal
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        aria-labelledby="delete-modal-title"
        aria-describedby="delete-modal-description"
      >
        <Box className="modal-content">
          <p id="delete-modal-title">VARNING</p>
          <p id="delete-modal-description">Är du säker på att du vill radera spelaren?</p>
          <Button className="modal-button" onClick={handleDeletePlayer}>Bekräfta</Button>
          <Button className="modal-button" onClick={() => setShowConfirmDelete(false)}>Avbryt</Button>
        </Box>
      </Modal>
    </div>
  );

}

export default Standings;
