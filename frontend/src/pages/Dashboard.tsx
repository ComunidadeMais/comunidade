import { FC } from 'react';
import { Container, Typography, Box } from '@mui/material';

const Dashboard: FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
      Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary">
      Bem-vindo ao Comunidade+
      </Typography>
    </Box>
  );
};

export default Dashboard; 