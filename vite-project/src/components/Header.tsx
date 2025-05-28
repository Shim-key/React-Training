import { AppBar, Toolbar, Typography, Container } from '@mui/material';

const Header = () => {
  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#2c3e50' }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
              letterSpacing: '.1rem',
              color: 'white',
            }}
          >
            いつかのライブ
          </Typography>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;