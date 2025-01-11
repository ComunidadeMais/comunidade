import { FC } from 'react';
import { Typography, Box, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import EmailIcon from '@mui/icons-material/Email';

const Settings: FC = () => {
  const { communityId } = useParams<{ communityId: string }>();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Configurações
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Gerencie as configurações da sua comunidade.
      </Typography>

      <List>
        <ListItemButton
          component={Link}
          to="/settings/communication"
        >
          <ListItemIcon>
            <EmailIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Comunicações" 
            secondary="Configure email, SMS e WhatsApp"
          />
        </ListItemButton>
      </List>
    </Box>
  );
};

export default Settings; 