import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Scoreboard from './Scoreboard';
import { Button, Input } from '@mui/material';

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
    <div className="App">
      <h1>Nexer Växjö Tabletop Scoreboard</h1>
      <div>
        <Input
          value={newPlayerName}
          onChange={e => setNewPlayerName(e.target.value)}
          placeholder="Enter player name"
        />
        <Button onClick={handleAddPlayer}>Add Player</Button>
      </div>
      <Scoreboard
        scores={scores}
        incrementScore={incrementScore}
        decrementScore={decrementScore}
        resetScores={resetScores}
      />
    </div>
  );
}

export default App;
