import { Typography, Grid, Card, CardContent, Box } from '@mui/material';

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
            <Card style={{ width: '500px', margin: '0 auto' }}>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  {game.date}
                </Typography>
                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="h6" align="left" style={{ flex: 1 }}>
                    {player1Name}
                  </Typography>
                  <Typography variant="h4" align="center" style={{ flex: 1 }}>
                    {player1Score}-{player2Score}
                  </Typography>
                  <Typography variant="h6" align="right" style={{ flex: 1 }}>
                    {player2Name}
                  </Typography>
                </Box>
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
