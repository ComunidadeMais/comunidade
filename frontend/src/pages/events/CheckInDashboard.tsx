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
  TablePagination,
  useTheme,
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
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!eventId) {
        setError('ID do evento não encontrado');
        return;
      }

      console.log('Carregando dados do evento:', eventId);
      
      const [checkInsData, statsData] = await Promise.all([
        checkInService.getEventCheckIns(eventId, page + 1, rowsPerPage),
        checkInService.getEventStats(eventId),
      ]);

      console.log('Dados de check-in:', checkInsData);
      console.log('Estatísticas:', statsData);

      setCheckIns(checkInsData.check_ins);
      setTotal(checkInsData.pagination.total);
      setStats(statsData);
    } catch (err: any) {
      console.error('Erro detalhado:', err);
      setError(err.response?.data?.error || err.message || 'Erro ao carregar dados do check-in');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Atualizar a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [eventId, page, rowsPerPage]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
                <PeopleIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 1 }} />
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
                <PersonIcon sx={{ fontSize: 40, color: theme.palette.success.main, mb: 1 }} />
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
                <VisitorIcon sx={{ fontSize: 40, color: theme.palette.warning.main, mb: 1 }} />
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

        <Paper sx={{ mt: 4 }}>
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="h6">
              Lista de Check-ins
            </Typography>
          </Box>
          
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : checkIns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                      <Typography color="text.secondary">
                        Nenhum check-in realizado ainda
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  checkIns.map((checkIn) => (
                    <TableRow key={checkIn.id}>
                      <TableCell>{checkIn.name}</TableCell>
                      <TableCell>{checkIn.email}</TableCell>
                      <TableCell>
                        <Typography 
                          component="span" 
                          sx={{ 
                            color: checkIn.is_visitor ? theme.palette.warning.main : theme.palette.success.main,
                            fontWeight: 500
                          }}
                        >
                          {checkIn.is_visitor ? 'Visitante' : 'Membro'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {format(new Date(checkIn.check_in_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            rowsPerPageOptions={[5, 10, 25, 50]}
          />
        </Paper>
      </Box>
    </Container>
  );
}; 