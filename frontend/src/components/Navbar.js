import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          3D Model Viewer
        </Typography>
        <Button color="inherit" component={RouterLink} to="/">
          Dashboard
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar; 