import { FC, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import { useCommunity } from '../contexts/CommunityContext';

const Dashboard: FC = () => {
  const { loadCommunities, loading, error } = useCommunity();

  useEffect(() => {
    loadCommunities();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', p: 2 }}>
        {error}
      </Box>
    );
  }

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