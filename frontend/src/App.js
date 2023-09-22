import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:3001/scores')
      .then(response => {
        setScores(response.data.data);
      });
  }, []);

  return (
    <div className="App">
      <h1>Nexer Växjö Tabletop Scoreboard</h1>
      <ul>
        {scores.map(score => (
          <li key={score.name}>{score.name}: {score.score}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
