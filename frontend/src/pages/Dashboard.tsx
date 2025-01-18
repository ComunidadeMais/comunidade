import { FC, useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Badge,
  LinearProgress,
} from '@mui/material';
import {
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
  Event as EventIcon,
  CalendarToday as CalendarTodayIcon,
  Warning as WarningIcon,
  GetApp as GetAppIcon,
  Print as PrintIcon,
} from '@mui/icons-material';
import { useCommunity } from '../contexts/CommunityContext';
import { useTheme } from '@mui/material/styles';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Dados mockados
const mockData = {
  kpis: {
    membrosAtivos: 245,
    doacoesMes: 12500.0,
    participantesUltimoEvento: 180,
    eventosFuturos: 8,
  },
  participacaoEventos: [
    { nome: 'Culto Domingo', participantes: 200 },
    { nome: 'Estudo Bíblico', participantes: 85 },
    { nome: 'Culto Jovens', participantes: 120 },
    { nome: 'Reunião Liderança', participantes: 30 },
    { nome: 'Culto Quarta', participantes: 150 },
    { nome: 'Encontro Casais', participantes: 90 },
  ],
  doacoesMensais: [
    { mes: 'Jan', valor: 10200 },
    { mes: 'Fev', valor: 11500 },
    { mes: 'Mar', valor: 9800 },
    { mes: 'Abr', valor: 12500 },
    { mes: 'Mai', valor: 11000 },
    { mes: 'Jun', valor: 12500 },
  ],
  distribuicaoDoacoes: [
    { metodo: 'PIX', valor: 7500 },
    { metodo: 'Cartão', valor: 3000 },
    { metodo: 'Transferência', valor: 2000 },
  ],
  proximosEventos: [
    { id: 1, nome: 'Culto de Celebração', data: '2024-03-24 18:00', inscritos: 150 },
    { id: 2, nome: 'Encontro de Jovens', data: '2024-03-30 19:30', inscritos: 80 },
    { id: 3, nome: 'Estudo Bíblico', data: '2024-03-27 19:00', inscritos: 45 },
  ],
  checkinsRecentes: [
    { evento: 'Culto Domingo', total: 195, visitantes: 25 },
    { evento: 'Culto Quarta', total: 145, visitantes: 15 },
    { evento: 'Encontro Jovens', total: 85, visitantes: 10 },
  ],
  alertas: [
    { tipo: 'success', mensagem: 'Meta de arrecadação 80% atingida para a campanha "Reforma do Templo"' },
    { tipo: 'warning', mensagem: '12 membros estão inativos há mais de 30 dias' },
    { tipo: 'info', mensagem: 'Próximo evento importante: Encontro de Líderes (27/03)' },
  ],
};

const CORES_GRAFICO = ['#2196f3', '#ff9800', '#4caf50', '#f44336', '#9c27b0', '#795548'];

const Dashboard: FC = () => {
  const theme = useTheme();
  const { loadCommunities, loading, error } = useCommunity();
  const [periodoFiltro, setPeriodoFiltro] = useState('mes');

  useEffect(() => {
    loadCommunities();
  }, []);

  const KPICard = ({ titulo, valor, icone, corIcone }: any) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ 
            backgroundColor: `${corIcone}15`,
            borderRadius: '50%',
            p: 1,
            mr: 2
          }}>
            {icone}
          </Box>
          <Typography variant="h6" color="text.secondary">
            {titulo}
          </Typography>
        </Box>
        <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
          {typeof valor === 'number' && valor.toLocaleString('pt-BR')}
          {typeof valor === 'string' && valor}
        </Typography>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ color: 'error.main', p: 2 }}>
        {error}
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Dashboard
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Período</InputLabel>
            <Select
              value={periodoFiltro}
              label="Período"
              onChange={(e) => setPeriodoFiltro(e.target.value)}
              size="small"
            >
              <MenuItem value="semana">Semana</MenuItem>
              <MenuItem value="mes">Mês</MenuItem>
              <MenuItem value="ano">Ano</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Exportar Relatório">
            <IconButton>
              <GetAppIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Imprimir">
            <IconButton>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* KPIs */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            titulo="Membros Ativos"
            valor={mockData.kpis.membrosAtivos}
            icone={<PeopleIcon sx={{ color: theme.palette.primary.main }} />}
            corIcone={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            titulo="Doações do Mês"
            valor={`R$ ${mockData.kpis.doacoesMes.toLocaleString('pt-BR')}`}
            icone={<AttachMoneyIcon sx={{ color: theme.palette.success.main }} />}
            corIcone={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            titulo="Último Evento"
            valor={mockData.kpis.participantesUltimoEvento}
            icone={<EventIcon sx={{ color: theme.palette.secondary.main }} />}
            corIcone={theme.palette.secondary.main}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPICard
            titulo="Eventos Futuros"
            valor={mockData.kpis.eventosFuturos}
            icone={<CalendarTodayIcon sx={{ color: theme.palette.info.main }} />}
            corIcone={theme.palette.info.main}
          />
        </Grid>
      </Grid>

      {/* Alertas */}
      <Box sx={{ mb: 4 }}>
        {mockData.alertas.map((alerta, index) => (
          <Alert 
            key={index} 
            severity={alerta.tipo as any} 
            sx={{ mb: 1 }}
            icon={<WarningIcon />}
          >
            {alerta.mensagem}
          </Alert>
        ))}
      </Box>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Participação em Eventos
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                <Bar
                  data={{
                    labels: mockData.participacaoEventos.map(item => item.nome),
                    datasets: [
                      {
                        label: 'Participantes',
                        data: mockData.participacaoEventos.map(item => item.participantes),
                        backgroundColor: theme.palette.primary.main,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Distribuição de Doações
              </Typography>
              <Box sx={{ height: 300, position: 'relative' }}>
                <Pie
                  data={{
                    labels: mockData.distribuicaoDoacoes.map(item => item.metodo),
                    datasets: [
                      {
                        data: mockData.distribuicaoDoacoes.map(item => item.valor),
                        backgroundColor: CORES_GRAFICO,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tendência de Doações */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Tendência de Doações Mensais
          </Typography>
          <Box sx={{ height: 300, position: 'relative' }}>
            <Line
              data={{
                labels: mockData.doacoesMensais.map(item => item.mes),
                datasets: [
                  {
                    label: 'Doações',
                    data: mockData.doacoesMensais.map(item => item.valor),
                    borderColor: theme.palette.success.main,
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Próximos Eventos e Check-ins */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Próximos Eventos
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Evento</TableCell>
                      <TableCell>Data</TableCell>
                      <TableCell align="right">Inscritos</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockData.proximosEventos.map((evento) => (
                      <TableRow key={evento.id}>
                        <TableCell>{evento.nome}</TableCell>
                        <TableCell>
                          {new Date(evento.data).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={evento.inscritos} 
                            color="primary" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Check-ins Recentes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Evento</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Visitantes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {mockData.checkinsRecentes.map((checkin, index) => (
                      <TableRow key={index}>
                        <TableCell>{checkin.evento}</TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={checkin.total} 
                            color="primary" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Chip 
                            label={`${Math.round((checkin.visitantes/checkin.total)*100)}%`}
                            color="secondary" 
                            size="small" 
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 