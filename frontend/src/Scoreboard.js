import { Button, Typography, Grid, Card, CardContent } from '@mui/material';

function Scoreboard({ games, resetScores }) {
  return (
    <Grid container spacing={3} direction="column" alignItems="center">
      {games && games.length > 0 ? games.map((game, index) => {
        const player1Name = game.scores[0].name;
        const player1Score = game.scores[0].score;
        const player2Name = game.scores[1].name;
        const player2Score = game.scores[1].score;

        return (
          <Grid item key={index} xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h5">
                  Date: {game.date}
                </Typography>
                <Typography variant="body1">
                  {player1Name}: {player1Score}
                </Typography>
                <Typography variant="body1">
                  {player2Name}: {player2Score}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        );
      }) : (
        <Typography variant="body1">No games available.</Typography>
      )}
    </Grid>
  );
}

export default Scoreboard;
