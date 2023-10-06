import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import axios from 'axios';
import Scoreboard from './Scoreboard';
import Standings from './Standings';
import myImage from './NBHL.jpg';
import hornSound from './air-horn.mp3';
import { AppBar, Toolbar, Button, TextField, Paper, Container, Grid, Typography, Select, MenuItem, Box, Snackbar, Alert } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  const [scores, setScores] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isGameOn, setIsGameOn] = useState(false);
  const [currentGame, setCurrentGame] = useState({ player1_id: null, player2_id: null, player1_score: 0, player2_score: 0 });
  const [games, setGames] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [severity, setSeverity] = useState('info');

  useEffect(() => {
    axios.get('/.netlify/functions/getScores')
      .then(response => {
        setScores(response.data.data);
      });
  }, []);

  useEffect(() => {
    axios.get('/.netlify/functions/getGameResults')
      .then(response => {
        const data = response.data;
        if (data && data.data) {
          setGames(data.data);
        }
      })
      .catch(error => {
        if (error.response) {
          console.error("Data:", error.response.data);
          console.error("Status:", error.response.status);
          console.error("Headers:", error.response.headers);
        } else if (error.request) {
          console.error("Request was made but no response was received:", error.request);
        } else {
          console.error("Error setting up the request:", error.message);
        }
        console.error('Full Error Object:', error.config);
      });
  }, []);


  const handleAddPlayer = () => {
    const newPlayer = { name: newPlayerName, score: 0, history: [] };
    axios.post('/.netlify/functions/postScores', newPlayer)
      .then(response => {
        setScores(prevScores => [...prevScores, { ...newPlayer, id: response.data.id }]);
        setNewPlayerName('');
      })
      .catch(error => {
        console.error("Error adding player:", error);
      });
  };

  const getPlayerNameFromID = useCallback((id) => {
    const player = scores.find(p => parseInt(p.id, 10) === parseInt(id, 10));
    return player ? player.name : 'Unknown';
  }, [scores]);

  const handleGameCompletion = useCallback(() => {
    const gameResult = {
      player1_id: currentGame.player1_id,
      player2_id: currentGame.player2_id,
      player1_score: currentGame.player1_score,
      player2_score: currentGame.player2_score
    };

    axios.post('/.netlify/functions/postGameResult', gameResult)
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
          axios.put(`/.netlify/functions/putScoresById/${winnerId}`, {
            wins: 1,
            games_played: 1,
            total_goals: gameResult.player1_score,
            goals_conceded: gameResult.player2_score
          }).catch(error => {
            console.error("Error updating winner stats:", error);
            if (error.response && error.response.data) {
              console.error("Server response:", error.response.data);
            }
          });

          axios.put(`/.netlify/functions/putScoresById/${loserId}`, {
            games_played: 1,
            total_goals: gameResult.player2_score,
            goals_conceded: gameResult.player1_score
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
  }, [currentGame, getPlayerNameFromID]);

  const playHornSound = () => {
    const audio = new Audio(hornSound);
    audio.play();
  };

  useEffect(() => {
    if (isGameOn && secondsLeft > 0) {
      const intervalId = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
    if (secondsLeft <= 0) {
      playHornSound();
      handleGameCompletion();
    }
  }, [isGameOn, secondsLeft, handleGameCompletion]);

  const startGame = (player1_id, player2_id) => {
    if (!player1_id || !player2_id) {
      setSeverity('error');
      setSnackbarMessage("Två spelarna måste väljas.");
      setSnackbarOpen(true);
      return;
    }
    if (player1_id === player2_id) {
      setSeverity('error');
      setSnackbarMessage("Olika spelare måste väljas");
      setSnackbarOpen(true);
      return;
    }

    setCurrentGame({
      ...currentGame,
      player1_id: player1_id,
      player2_id: player2_id,
      player1_score: 0,
      player2_score: 0
    });
    setIsGameOn(true);
    setSecondsLeft(300);
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <AppBar position="static" style={{ backgroundColor: 'black', zIndex: 2 }}>
          <Toolbar>
            <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
              <img src={myImage} alt="Logo" style={{ width: '45px', height: '45px', marginRight: '10px' }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                NEXER BORDSHOCKEYLIGA NBHL
              </Typography>
            </Link>
            <Box marginLeft="auto">
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
            </Box>
          </Toolbar>
        </AppBar>
        <Container style={{ position: 'relative' }}>
          <Grid container spacing={3} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: 'calc(100vh - 64px)' }}>
            <Routes>
              <Route path="/" element={
                <Grid item xs={12} style={{ textAlign: 'center', marginTop: '-20px' }}>
                  <img src={myImage} alt="Description" style={{ maxWidth: '40vw', height: 'auto' }} />
                </Grid>
              } />
              <Route path="/start-game" element={
                <Grid item style={{ marginTop: '20px' }}>
                  <Paper elevation={3} style={{ padding: '20px', backgroundColor: 'black', color: 'white' }}>
                    {!isGameOn && (
                      <>
                        <Typography variant="h5" style={{ marginBottom: '20px' }}>
                          Spelinställningar
                        </Typography>
                        <TextField
                          value={newPlayerName}
                          onChange={e => setNewPlayerName(e.target.value)}
                          placeholder="Ange spelarens namn"
                          variant="outlined"
                          label="Spelarnamn"
                          style={{ backgroundColor: 'white' }}
                        />
                        <Button onClick={handleAddPlayer} variant="contained" color="primary" style={{ backgroundColor: '#fec70a', color: 'black', marginLeft: '15px', marginTop: '10px', marginBottom: '10px' }}>
                          Lägg till
                        </Button>
                        <Select value={currentGame.player1_id || ''} onChange={e => setCurrentGame({ ...currentGame, player1_id: e.target.value })} style={{ backgroundColor: 'white', marginRight: '10px' }}>
                          {scores?.map(player => (
                            <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                          ))}
                        </Select>
                        <Typography variant="h6" style={{ display: 'inline', margin: '0 10px' }}>
                          vs
                        </Typography>
                        <Select value={currentGame.player2_id || ''} onChange={e => setCurrentGame({ ...currentGame, player2_id: e.target.value })} style={{ backgroundColor: 'white', marginLeft: '10px' }}>
                          {scores?.map(player => (
                            <MenuItem key={player.id} value={player.id}>{player.name}</MenuItem>
                          ))}
                        </Select>

                        <Button onClick={() => startGame(currentGame.player1_id, currentGame.player2_id)} variant="contained" style={{ margin: '20px 0', backgroundColor: '#fec70a', color: 'black' }}>
                          Starta spelet
                        </Button>
                      </>
                    )}

                    {isGameOn && (
                      <>
                        <Typography variant="h1" style={{ textAlign: 'center', marginBottom: '20px' }}>
                          {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                        </Typography>
                        <Typography variant="h2" style={{ textAlign: 'center' }}>{getPlayerNameFromID(currentGame.player1_id)}: {currentGame.player1_score}</Typography>
                        <Grid container justifyContent="center" spacing={2} style={{ marginBottom: '20px' }}>
                          <Grid item>
                            <Button onClick={() => setCurrentGame({ ...currentGame, player1_score: Math.max(currentGame.player1_score - 1, 0) })} style={{ color: '#fec70a', fontSize: '40px', padding: '10px 20px' }}>-</Button>
                          </Grid>
                          <Grid item>
                            <Button onClick={() => setCurrentGame({ ...currentGame, player1_score: currentGame.player1_score + 1 })} style={{ color: '#fec70a', fontSize: '40px', padding: '10px 20px' }}>+</Button>
                          </Grid>
                        </Grid>
                        <Typography variant="h2" style={{ textAlign: 'center' }}>{getPlayerNameFromID(currentGame.player2_id)}: {currentGame.player2_score}</Typography>
                        <Grid container justifyContent="center" spacing={2} style={{ marginBottom: '20px' }}>
                          <Grid item>
                            <Button onClick={() => setCurrentGame({ ...currentGame, player2_score: Math.max(currentGame.player2_score - 1, 0) })} style={{ color: '#fec70a', fontSize: '40px', padding: '10px 20px' }}>-</Button>
                          </Grid>
                          <Grid item>
                            <Button onClick={() => setCurrentGame({ ...currentGame, player2_score: currentGame.player2_score + 1 })} style={{ color: '#fec70a', fontSize: '40px', padding: '10px 20px' }}>+</Button>
                          </Grid>
                        </Grid>
                        <Grid container justifyContent="center" style={{ marginTop: '20px' }}>
                          <Grid item>
                            <Button variant="contained" color="secondary" onClick={handleGameCompletion} style={{ backgroundColor: '#fec70a', color: 'black', padding: '10px 30px', fontSize: '18px' }}>
                              Avsluta spelet
                            </Button>
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </Paper>
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
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert onClose={() => setSnackbarOpen(false)} severity={severity}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </ThemeProvider>
    </Router>
  );
}

export default App;
