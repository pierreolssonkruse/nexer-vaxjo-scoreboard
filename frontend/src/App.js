import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Scoreboard from './Scoreboard';
import { Button, TextField, Paper, Container, Grid, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  const [scores, setScores] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3001/scores')
      .then(response => {
        setScores(response.data.data);
      });
  }, []);

  const handleAddPlayer = () => {
    const newPlayer = { name: newPlayerName, score: 0, history: [] };
    axios.post('http://localhost:3001/score', newPlayer)
      .then(response => {
        setScores(prevScores => [...prevScores, { ...newPlayer, id: response.data.id }]);
        setNewPlayerName('');
      })
      .catch(error => {
        console.error("Error adding player:", error);
      });
  };

  const handleDeletePlayer = (id) => {
    axios.delete(`http://localhost:3001/score/${id}`)
      .then(() => {
        const updatedScores = scores.filter(score => score.id !== id);
        setScores(updatedScores);
      })
      .catch(error => {
        console.error("Error deleting player:", error);
      });
  };

  const incrementScore = (name) => {
    const playerScore = scores.find(score => score.name === name);
    const updatedScoreValue = playerScore.score + 1;

    const playerHistory = Array.isArray(playerScore.history) ? playerScore.history : [];

    axios.put(`http://localhost:3001/score/${name}`, { score: updatedScoreValue })
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

    axios.put(`http://localhost:3001/score/${name}`, { score: updatedScoreValue })
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
            <Grid item>
              <Button onClick={handleAddPlayer} variant="contained" color="primary" style={{ marginLeft: '35px', marginTop: '10px' }}>
                Add Player
              </Button>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={3} style={{ padding: '20px' }}>
              <Scoreboard
                scores={scores}
                incrementScore={incrementScore}
                decrementScore={decrementScore}
                resetScores={resetScores}
                deletePlayer={handleDeletePlayer}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
