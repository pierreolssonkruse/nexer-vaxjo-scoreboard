import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Scoreboard from './Scoreboard';

function App() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/scores')
      .then(response => {
        setScores(response.data.data);
      });
  }, []);

  const incrementScore = (name) => {
    const updatedScores = scores.map(score => {
      if (score.name === name) {
        return { ...score, score: score.score + 1 };
      }
      return score;
    });
    setScores(updatedScores);
  };

  const decrementScore = (name) => {
    const updatedScores = scores.map(score => {
      if (score.name === name) {
        return { ...score, score: Math.max(0, score.score - 1) };
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
