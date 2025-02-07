import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';

const MemberLogin = () => {
  const { communityId } = useParams();
  const { setCurrentCommunity } = useAuth();
  const [signUpError, setSignUpError] = useState('');

  const loadCommunityData = async () => {
    try {
      const response = await api.get(`/communities/${communityId}/public`);
      const communityData = response.data;
      console.log('MemberLogin - Dados da comunidade recebidos:', communityData);
      
      setCurrentCommunity({
        id: communityData.id,
        name: communityData.name,
        logo: communityData.logo,
      });
      
      console.log('MemberLogin - Comunidade definida no contexto:', {
        id: communityData.id,
        name: communityData.name,
        logo: communityData.logo,
      });
    } catch (error) {
      console.error('Erro ao carregar dados da comunidade:', error);
      setSignUpError('Erro ao carregar dados da comunidade');
    }
  };

  useEffect(() => {
    loadCommunityData();
  }, []);

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {signUpError && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {signUpError}
          </Alert>
        )}
        <Typography component="h1" variant="h5">
          Carregando dados da comunidade...
        </Typography>
      </Box>
    </Container>
  );
};

export default MemberLogin; 