import React from 'react';
import { Button, Typography, Grid, IconButton, Card, CardContent, CardActions } from '@mui/material';
import { Add, Remove, Delete } from '@mui/icons-material';

function Scoreboard({ scores, incrementScore, decrementScore, resetScores, deletePlayer, isGameOn }) {
  const styles = {
    card: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
    }
  };

  return (
    <Grid container spacing={3} direction="column" alignItems="center">
      {scores.map(score => (
        <Grid item key={score.name} xs={12}>
          <Card style={styles.card}>
            <CardContent>
              <Typography variant="h5">{score.name}: {score.score}</Typography>
            </CardContent>
            {!isGameOn && (
              <CardActions style={styles.actions}>
                <IconButton onClick={() => decrementScore(score.name)}>
                  <Remove />
                </IconButton>
                <IconButton onClick={() => incrementScore(score.name)}>
                  <Add />
                </IconButton>
              </CardActions>
            )}
          </Card>
        </Grid>
      ))}
      <Grid item>
        <Button variant="contained" color="secondary" onClick={resetScores}>
          Reset Scores
        </Button>
      </Grid>
    </Grid>
  );
}

export default Scoreboard;
