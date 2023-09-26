import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Scoreboard from './Scoreboard';
import { Button, TextField, Paper, Container, Grid, Typography, Select, MenuItem } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  const [scores, setScores] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isGameOn, setIsGameOn] = useState(false);
  const [currentGame, setCurrentGame] = useState({ player1_id: null, player2_id: null, player1_score: 0, player2_score: 0 });
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/scores')
      .then(response => {
        setScores(response.data.data);
      });
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/rankings')
      .then(response => {
        setRankings(response.data.data);
      });
  }, [scores]);

  const handleAddPlayer = () => {
    const newPlayer = { name: newPlayerName, score: 0, history: [] };
    axios.post('http://localhost:3001/scores', newPlayer)
      .then(response => {
        setScores(prevScores => [...prevScores, { ...newPlayer, id: response.data.id }]);
        setNewPlayerName('');
      })
      .catch(error => {
        console.error("Error adding player:", error);
      });
  };

  const handleDeletePlayer = (id) => {
    axios.delete(`http://localhost:3001/scores/${id}`)
      .then(() => {
        const updatedScores = scores.filter(score => score.id !== id);
        setScores(updatedScores);
      })
      .catch(error => {
        console.error("Error deleting player:", error);
      });
  };

  const handleGameCompletion = () => {
    console.log("Entered handleGameCompletion");
    if (!currentGame.player1_id || !currentGame.player2_id) return;
    axios.post('http://localhost:3001/gameResult', currentGame)
      .then(response => {
        console.log('Game saved with ID:', response.data.game_id);
        setCurrentGame({ player1_id: null, player2_id: null, player1_score: 0, player2_score: 0 });
      })
      .catch(error => {
        console.error("Error saving game:", error);
      });
  };

  const incrementScore = (name) => {
    const playerScore = scores.find(score => score.name === name);
    const updatedScoreValue = playerScore.score + 1;

    const playerHistory = Array.isArray(playerScore.history) ? playerScore.history : [];

    axios.put(`http://localhost:3001/scores/${name}`, { score: updatedScoreValue })
      .then(response => {
        const updatedScores = scores.map(score => {
          if (score.name === name) {
            return {
              ...score,
              score: updatedScoreValue,
              history: [...playerHistory, `Added 1 point. New score: ${updatedScoreValue}`]
            };
          }
          return score;
        });
        setScores(updatedScores);
      })
      .catch(error => {
        console.error("Error incrementing score:", error);
      });
  };

  const decrementScore = (name) => {
    const playerScore = scores.find(score => score.name === name);
    const updatedScoreValue = Math.max(0, playerScore.score - 1);

    const playerHistory = Array.isArray(playerScore.history) ? playerScore.history : [];

    axios.put(`http://localhost:3001/scores/${name}`, { score: updatedScoreValue })
      .then(response => {
        const updatedScores = scores.map(score => {
          if (score.name === name) {
            return {
              ...score,
              score: updatedScoreValue,
              history: [...playerHistory, `Removed 1 point. New score: ${updatedScoreValue}`]
            };
          }
          return score;
        });
        setScores(updatedScores);
      })
      .catch(error => {
        console.error("Error decrementing score:", error);
      });
  };

  const resetScores = () => {
    const resetedScores = scores.map(score => ({ ...score, score: 0 }));
    setScores(resetedScores);
  };

  const startGame = (player1_id, player2_id) => {
    if (player1_id && player2_id && player1_id !== player2_id) {
      setCurrentGame({
        ...currentGame,
        player1_id: player1_id,
        player2_id: player2_id,
        player1_score: 0,
        player2_score: 0
      });
      setIsGameOn(true);
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item>
            <Typography variant="h3" gutterBottom>
              Nexer Växjö Tabletop Hockey Scoreboard
            </Typography>
          </Grid>
          <Grid item>
            <TextField
              value={newPlayerName}
              onChange={e => setNewPlayerName(e.target.value)}
              placeholder="Enter player name"
              variant="outlined"
              label="Player Name"
            />
            <Button onClick={handleAddPlayer} variant="contained" color="primary" style={{ marginLeft: '35px', marginTop: '10px' }}>
              Add Player
            </Button>
          </Grid>
          <Grid item>
            {!isGameOn && (
              <>
                <Select value={currentGame.player1_id || ''} onChange={e => setCurrentGame({ ...currentGame, player1_id: e.target.value })}>
                  {scores.map(player => (
                    <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                  ))}
                </Select>
                vs
                <Select value={currentGame.player2_id || ''} onChange={e => setCurrentGame({ ...currentGame, player2_id: e.target.value })}>
                  {scores.map(player => (
                    <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                  ))}
                </Select>
                <Button onClick={() => startGame(currentGame.player1_id, currentGame.player2_id)}>Start Game</Button>
              </>
            )}
            {isGameOn && (
              <>
                <Typography variant="h6">{scores.find(p => p.id === currentGame.player1_id)?.name || 'Unknown'}: {currentGame.player1_score}</Typography>
                <Button onClick={() => setCurrentGame({ ...currentGame, player1_score: Math.max(currentGame.player1_score - 1, 0) })}>-1</Button>
                <Button onClick={() => setCurrentGame({ ...currentGame, player1_score: currentGame.player1_score + 1 })}>+1</Button>
                <Typography variant="h6">{scores.find(p => p.id === currentGame.player2_id)?.name || 'Unknown'}: {currentGame.player2_score}</Typography>
                <Button onClick={() => setCurrentGame({ ...currentGame, player2_score: Math.max(currentGame.player2_score - 1, 0) })}>-1</Button>
                <Button onClick={() => setCurrentGame({ ...currentGame, player2_score: currentGame.player2_score + 1 })}>+1</Button>
                <Button variant="contained" color="secondary" onClick={handleGameCompletion}>Finish Game</Button>
              </>
            )}
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: '20px' }}>
              <Scoreboard
                scores={scores}
                incrementScore={incrementScore}
                decrementScore={decrementScore}
                resetScores={resetScores}
                deletePlayer={handleDeletePlayer}
                isGameOn={isGameOn}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
