import React from 'react';
import { Button, Typography, Grid, IconButton } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

function Scoreboard({ scores, incrementScore, decrementScore, resetScores }) {
    return (
        <Grid container spacing={3} direction="column" alignItems="center">
            {scores.map(score => (
                <Grid item key={score.name}>
                    <Typography variant="h4">{score.name}: {score.score}</Typography>
                    <IconButton onClick={() => incrementScore(score.name)}>
                        <Add />
                    </IconButton>
                    <IconButton onClick={() => decrementScore(score.name)}>
                        <Remove />
                    </IconButton>
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
