import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SEO from '../components/SEO';

const ThankYou: React.FC = () => {
  return (
    <>
      <SEO 
        title="Obrigado pelo Interesse"
        description="Agradecemos seu interesse no ComunidadeMais. Em breve entraremos em contato."
      />
      
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          
          <Typography variant="h4" component="h1" gutterBottom>
            Obrigado pelo Interesse!
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 4 }}>
            Recebemos seus dados e em breve nossa equipe entrará em contato para apresentar o ComunidadeMais e entender melhor as necessidades da sua igreja.
          </Typography>

          <Box sx={{ mt: 4 }}>
            <Button
              component={Link}
              to="/"
              variant="contained"
              color="primary"
              size="large"
            >
              Voltar para a Página Inicial
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
};

export default ThankYou; 