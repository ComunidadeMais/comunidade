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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Favorite as PrayerIcon, Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MemberLayout from '../../layouts/MemberLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

interface Prayer {
  id: string;
  title: string;
  description: string;
  date: string;
  status: string;
  prayerCount: number;
}

const MemberPrayers: React.FC = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ title: '', description: '' });
  const { currentCommunity } = useAuth();
  const theme = useTheme();

  useEffect(() => {
    loadPrayers();
  }, [currentCommunity]);

  const loadPrayers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentCommunity?.id) {
        throw new Error('ID da comunidade não encontrado');
      }

      const response = await api.get(`/communities/${currentCommunity.id}/prayers`);
      setPrayers(response.data.prayers || []);
    } catch (error) {
      console.error('Erro ao carregar pedidos de oração:', error);
      setError('Não foi possível carregar os pedidos de oração. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrayer = async () => {
    try {
      if (!currentCommunity?.id) {
        throw new Error('ID da comunidade não encontrado');
      }

      await api.post(`/communities/${currentCommunity.id}/prayers`, newPrayer);
      setOpenDialog(false);
      setNewPrayer({ title: '', description: '' });
      loadPrayers();
    } catch (error) {
      console.error('Erro ao enviar pedido de oração:', error);
      setError('Não foi possível enviar o pedido de oração. Tente novamente mais tarde.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'answered':
        return 'success';
      case 'praying':
        return 'info';
      case 'pending':
        return 'warning';
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
            Pedidos de Oração
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Novo Pedido
          </Button>
        </Box>

        <Grid container spacing={3}>
          {prayers.length > 0 ? (
            prayers.map((prayer) => (
              <Grid item xs={12} md={6} key={prayer.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PrayerIcon />
                      </Avatar>
                      <Box flex={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">{prayer.title}</Typography>
                          <Chip
                            label={prayer.status}
                            size="small"
                            color={getStatusColor(prayer.status)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(prayer.date), "PPp", { locale: ptBR })}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="body2" paragraph>
                      {prayer.description}
                    </Typography>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        {prayer.prayerCount} pessoas orando
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      Estou Orando
                    </Button>
                    {prayer.status !== 'answered' && (
                      <Button size="small" color="success">
                        Marcar como Respondida
                      </Button>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Box textAlign="center" py={4}>
                <Typography variant="h6" color="text.secondary">
                  Nenhum pedido de oração encontrado
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>

        {/* Dialog para novo pedido de oração */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Novo Pedido de Oração</DialogTitle>
          <DialogContent>
            <Box pt={2}>
              <TextField
                fullWidth
                label="Título"
                value={newPrayer.title}
                onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Descrição"
                value={newPrayer.description}
                onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
                margin="normal"
                multiline
                rows={4}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button
              onClick={handleSubmitPrayer}
              variant="contained"
              color="primary"
              disabled={!newPrayer.title || !newPrayer.description}
            >
              Enviar
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </MemberLayout>
  );
};

export default MemberPrayers; 