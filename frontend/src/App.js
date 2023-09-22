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
    setScores(prevScores => [...prevScores, { name: newPlayerName, score: 0, history: [] }]);
    setNewPlayerName('');
  };

  const incrementScore = (name) => {
    const updatedScores = scores.map(score => {
      if (score.name === name) {
        return {
          ...score,
          score: score.score + 1,
          history: [...score.history, `Added 1 point. New score: ${score.score + 1}`]
        };
      }
      return score;
    });
    setScores(updatedScores);
  };


  const decrementScore = (name) => {
    const updatedScores = scores.map(score => {
      if (score.name === name) {
        return {
          ...score,
          score: Math.max(0, score.score - 1),
          history: [...score.history, `Removed 1 point. New score: ${score.score - 1}`]
        };
      }
      return score;
    });
    setScores(updatedScores);
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
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default App;
