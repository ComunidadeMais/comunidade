import { FC } from 'react';
import { Typography, Box } from '@mui/material';

const Settings: FC = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Gerencie as configurações da sua comunidade.
      </Typography>
    </Box>
  );
};

export default Settings; 