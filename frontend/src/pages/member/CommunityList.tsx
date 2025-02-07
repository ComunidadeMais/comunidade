import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { Search as SearchIcon, ArrowForward } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MotionGrid = motion(Grid);
const MotionCard = motion(Card);

interface Community {
  id: string;
  name: string;
  description: string;
  logo: string;
  banner: string;
  address: string;
  city: string;
  state: string;
}

const CommunityList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadCommunities = async () => {
      try {
        setLoading(true);
        // TODO: Implementar chamada à API
        // const response = await communityService.listPublicCommunities();
        // setCommunities(response.data);
        
        // Dados mockados para desenvolvimento
        setCommunities([
          {
            id: '1',
            name: 'Igreja Exemplo 1',
            description: 'Uma comunidade acolhedora e vibrante',
            logo: '/path/to/logo1.png',
            banner: '/path/to/banner1.jpg',
            address: 'Rua Exemplo, 123',
            city: 'São Paulo',
            state: 'SP',
          },
          {
            id: '2',
            name: 'Igreja Exemplo 2',
            description: 'Crescendo juntos na fé',
            logo: '/path/to/logo2.png',
            banner: '/path/to/banner2.jpg',
            address: 'Av. Exemplo, 456',
            city: 'Rio de Janeiro',
            state: 'RJ',
          },
          // Adicione mais comunidades conforme necessário
        ]);
      } catch (error) {
        console.error('Erro ao carregar comunidades:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCommunities();
  }, []);

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold' }}
        >
          Portal do Membro
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Encontre sua comunidade e acesse sua área exclusiva
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome da comunidade ou cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ maxWidth: 600, mt: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <MotionGrid
        container
        spacing={3}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {filteredCommunities.map((community, index) => (
          <Grid item xs={12} sm={6} md={4} key={community.id}>
            <MotionCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4],
                  transition: 'all 0.3s',
                },
              }}
            >
              <CardMedia
                component="img"
                height="140"
                image={community.banner || '/default-banner.jpg'}
                alt={community.name}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Box
                    component="img"
                    src={community.logo || '/default-logo.png'}
                    alt={`${community.name} logo`}
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      border: `2px solid ${theme.palette.primary.main}`,
                    }}
                  />
                  <Typography variant="h6" component="h2">
                    {community.name}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {community.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {community.address}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {`${community.city} - ${community.state}`}
                </Typography>
              </CardContent>
              <Box p={2} pt={0}>
                <Button
                  fullWidth
                  variant="contained"
                  endIcon={<ArrowForward />}
                  onClick={() => navigate(`/member/${community.id}/login`)}
                >
                  Acessar Portal
                </Button>
              </Box>
            </MotionCard>
          </Grid>
        ))}
      </MotionGrid>

      {filteredCommunities.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6" color="text.secondary">
            Nenhuma comunidade encontrada com os termos da busca.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default CommunityList; 