import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  PeopleAlt as PeopleIcon,
  Person as PersonIcon,
  PersonAdd as VisitorIcon,
} from '@mui/icons-material';
import { CheckIn, CheckInStats } from '../../types/checkin';
import checkInService from '../../services/checkin';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const CheckInDashboard: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [checkInsData, statsData] = await Promise.all([
          checkInService.getEventCheckIns(eventId || ''),
          checkInService.getEventStats(eventId || ''),
        ]);

        setCheckIns(checkInsData);
        setStats(statsData);
      } catch (err) {
        setError('Erro ao carregar dados do check-in');
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard de Check-in
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats?.total_check_ins || 0}
                </Typography>
                <Typography color="text.secondary">
                  Total de check-ins
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats?.members_check_ins || 0}
                </Typography>
                <Typography color="text.secondary">
                  Membros
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <VisitorIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h5" component="div">
                  {stats?.visitors_check_ins || 0}
                </Typography>
                <Typography color="text.secondary">
                  Visitantes
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Paper sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Lista de Check-ins
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>E-mail</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Data/Hora</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell>{checkIn.name}</TableCell>
                    <TableCell>{checkIn.email}</TableCell>
                    <TableCell>
                      {checkIn.is_visitor ? 'Visitante' : 'Membro'}
                    </TableCell>
                    <TableCell>
                      {format(new Date(checkIn.check_in_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Container>
  );
}; 