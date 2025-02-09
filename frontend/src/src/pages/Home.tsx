import React from 'react';
import { Container, Typography, Card, CardContent, Grid, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        {/* Card de Boas-vindas */}
        <Grid item xs={12}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h3" gutterBottom>
                Bem-vindo ao Comunidade+
              </Typography>
              <Typography variant="h5" color="text.secondary" gutterBottom>
                A plataforma completa para gestão de comunidades religiosas
              </Typography>
              <Button 
                variant="contained" 
                size="large" 
                sx={{ mt: 2 }}
                onClick={() => navigate('/demonstracao')}
              >
                Comece Agora
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Cards de Recursos */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Gestão de Membros
              </Typography>
              <Typography variant="body1">
                Cadastre e gerencie membros, visitantes e voluntários de forma simples e organizada.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Eventos e Reuniões
              </Typography>
              <Typography variant="body1">
                Organize cultos, células, eventos especiais e controle a presença dos participantes.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Contribuições
              </Typography>
              <Typography variant="body1">
                Gerencie dízimos, ofertas e doações com transparência e segurança.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home; 