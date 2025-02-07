import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AttachMoney as DonationIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MemberLayout from '../../layouts/MemberLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Donation {
  id: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  campaign?: string;
}

const MemberDonations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentCommunity } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    const loadDonations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!currentCommunity?.id) {
          throw new Error('ID da comunidade não encontrado');
        }

        const response = await api.get(`/communities/${currentCommunity.id}/donations`);
        setDonations(response.data.donations || []);
      } catch (error) {
        console.error('Erro ao carregar doações:', error);
        setError('Não foi possível carregar as doações. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, [currentCommunity]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <MemberLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </MemberLayout>
    );
  }

  if (error) {
    return (
      <MemberLayout>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        </Container>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <Container 
        maxWidth={false} 
        sx={{ 
          maxWidth: theme.breakpoints.values.lg,
          m: 0,
          p: 0
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Doações
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DonationIcon />}
          >
            Nova Doação
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Resumo das doações */}
          <Grid item xs={12}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="text.secondary">
                        Total Doado
                      </Typography>
                      <Typography variant="h4" color="primary">
                        R$ {donations.reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="text.secondary">
                        Doações Realizadas
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {donations.length}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box textAlign="center">
                      <Typography variant="h6" color="text.secondary">
                        Última Doação
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {donations.length > 0
                          ? format(new Date(donations[0].date), "dd/MM/yyyy", { locale: ptBR })
                          : '-'}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Lista de doações */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Histórico de Doações
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                {donations.length > 0 ? (
                  donations.map((donation, index) => (
                    <React.Fragment key={donation.id}>
                      <Box display="flex" alignItems="center" gap={2} py={2}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <DonationIcon />
                        </Avatar>
                        <Box flex={1}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="subtitle1">
                              R$ {donation.amount.toFixed(2)}
                            </Typography>
                            <Chip
                              label={donation.status}
                              size="small"
                              color={getStatusColor(donation.status)}
                            />
                          </Box>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(donation.date), "PPp", { locale: ptBR })}
                            </Typography>
                            {donation.campaign && (
                              <Typography variant="body2" color="text.secondary">
                                Campanha: {donation.campaign}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </Box>
                      {index < donations.length - 1 && <Divider />}
                    </React.Fragment>
                  ))
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="text.secondary">
                      Nenhuma doação encontrada
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </MemberLayout>
  );
};

export default MemberDonations; 