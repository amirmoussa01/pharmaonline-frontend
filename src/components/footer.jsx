import React from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#f1f8e9', // vert très clair
        padding: '20px 0',
        marginTop: 'auto',
        boxShadow: '0 -1px 4px rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Divider sx={{ mb: 2 }} />
        <Typography variant="body2" color="textSecondary" align="center">
          &copy; {new Date().getFullYear()} <strong>PharmaOnline</strong>. Tous droits réservés.
        </Typography>
        <Typography variant="body2" color="textSecondary" align="center">
          Développé par <a href="https://amirmoussa01.github.io/moussaamir-cv/" color='green' text-alignment='none'><em>@alamir</em></a> 
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
