import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import Scoreboard from './Scoreboard';
import Standings from './Standings';
import { AppBar, Toolbar, Button, TextField, Paper, Container, Grid, Typography, Select, MenuItem } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  const [scores, setScores] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isGameOn, setIsGameOn] = useState(false);
  const [currentGame, setCurrentGame] = useState({ player1_id: null, player2_id: null, player1_score: 0, player2_score: 0 });
  const [rankings, setRankings] = useState([]);
  const [games, setGames] = useState([]);


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

  useEffect(() => {
    fetch('http://localhost:3001/gameResults')
      .then(res => res.json())
      .then(data => {
        if (data && data.data) {
          setGames(data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching game results:', error);
      });
  }, []);

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
    const gameResult = {
      player1_id: currentGame.player1_id,
      player2_id: currentGame.player2_id,
      player1_score: currentGame.player1_score,
      player2_score: currentGame.player2_score
    };

    axios.post('http://localhost:3001/gameResult', gameResult)
      .then(response => {
        setGames(prevGames => [...prevGames, {
          date: new Date().toISOString().slice(0, 10),
          scores: [
            { name: getPlayerNameFromID(currentGame.player1_id), score: currentGame.player1_score },
            { name: getPlayerNameFromID(currentGame.player2_id), score: currentGame.player2_score }
          ]
        }]);
        setCurrentGame({ player1_id: null, player2_id: null, player1_score: 0, player2_score: 0 });
        setIsGameOn(false);

        let winnerId;
        let loserId;

        if (gameResult.player1_score > gameResult.player2_score) {
          winnerId = gameResult.player1_id;
          loserId = gameResult.player2_id;
        } else if (gameResult.player1_score < gameResult.player2_score) {
          winnerId = gameResult.player2_id;
          loserId = gameResult.player1_id;
        }

        if (winnerId) {
          axios.put(`http://localhost:3001/scores/${winnerId}`, {
            wins: 1,
            games_played: 1,
            total_goals: gameResult.player1_score
          }).catch(error => {
            console.error("Error updating winner stats:", error);
            if (error.response && error.response.data) {
              console.error("Server response:", error.response.data);
            }
          });

          axios.put(`http://localhost:3001/scores/${loserId}`, {
            games_played: 1,
            total_goals: gameResult.player2_score
          }).catch(error => {
            console.error("Error updating loser stats:", error);
            if (error.response && error.response.data) {
              console.error("Server response:", error.response.data);
            }
          });
        }
      })
      .catch(error => {
        console.error("Error saving game:", error);
        if (error.response && error.response.data) {
          console.error("Server response:", error.response.data);
        }
      });
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

  const getPlayerNameFromID = (id) => {
    const player = scores.find(p => parseInt(p.id, 10) === parseInt(id, 10));
    return player ? player.name : 'Unknown';
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Svenska Bordshockeyligan SBHL
            </Typography>
            <Button color="inherit">
              <Link to="/start-game" style={{ textDecoration: 'none', color: 'inherit' }}>
                Start
              </Link>
            </Button>
            <Button color="inherit">
              <Link to="/scoreboard" style={{ textDecoration: 'none', color: 'inherit' }}>
                Resultat
              </Link>
            </Button>
            <Button color="inherit">
              <Link to="/standings" style={{ textDecoration: 'none', color: 'inherit' }}>
                Tabell
              </Link>
            </Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Grid container spacing={3} direction="column" alignItems="center">
            <Routes>
              <Route path="/start-game" element={
                <Grid item style={{ marginTop: '20px' }}>
                  <TextField
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    placeholder="Ange spelarens namn"
                    variant="outlined"
                    label="Spelarnamn"
                  />
                  <Button onClick={handleAddPlayer} variant="contained" color="primary" style={{ marginLeft: '15px', marginTop: '10px', marginBottom: '10px' }}>
                    Lägg till spelare
                  </Button>
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

                        <Button onClick={() => startGame(currentGame.player1_id, currentGame.player2_id)}>Starta spelet</Button>
                      </>
                    )}
                    {isGameOn && (
                      <>
                        <Typography variant="h6">{getPlayerNameFromID(currentGame.player1_id)}: {currentGame.player1_score}</Typography>
                        <Button onClick={() => setCurrentGame({ ...currentGame, player1_score: Math.max(currentGame.player1_score - 1, 0) })}>-1</Button>
                        <Button onClick={() => setCurrentGame({ ...currentGame, player1_score: currentGame.player1_score + 1 })}>+1</Button>
                        <Typography variant="h6">{getPlayerNameFromID(currentGame.player2_id)}: {currentGame.player2_score}</Typography>
                        <Button onClick={() => setCurrentGame({ ...currentGame, player2_score: Math.max(currentGame.player2_score - 1, 0) })}>-1</Button>
                        <Button onClick={() => setCurrentGame({ ...currentGame, player2_score: currentGame.player2_score + 1 })}>+1</Button>
                        <Button variant="contained" color="secondary" onClick={handleGameCompletion}>Avsluta spelet</Button>
                      </>
                    )}
                  </Grid>
                </Grid>
              } />
              <Route path="/scoreboard" element={
                <Grid item xs={12}>
                  <Paper elevation={3} style={{ padding: '20px' }}>
                    <Scoreboard games={games} />
                  </Paper>
                </Grid>
              } />
              <Route path="/standings" element={
                <Grid item>
                  <Standings playersStats={scores} />
                </Grid>
              } />
            </Routes>
          </Grid>
        </Container>
      </ThemeProvider>
    </Router>
  );

}

export default App;
