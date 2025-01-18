import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { financialService } from '../../../services/financial';
import { FinancialReport } from '../../../types/financial';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency } from '../../../utils/format';

export default function FinancialReports() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: format(new Date(), 'yyyy-MM-dd'),
    type: 'custom' as const,
  });

  const columns: GridColDef[] = [
    {
      field: 'type',
      headerName: 'Tipo',
      width: 120,
      renderCell: (params) => {
        const typeMap = {
          daily: 'Diário',
          weekly: 'Semanal',
          monthly: 'Mensal',
          yearly: 'Anual',
          custom: 'Personalizado',
        };
        return <Typography>{typeMap[params.value as keyof typeof typeMap]}</Typography>;
      },
    },
    {
      field: 'start_date',
      headerName: 'Data Inicial',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'end_date',
      headerName: 'Data Final',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'total_revenue',
      headerName: 'Total Receitas',
      width: 160,
      renderCell: (params) => (
        <Typography color="success.main">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'total_expense',
      headerName: 'Total Despesas',
      width: 160,
      renderCell: (params) => (
        <Typography color="error.main">
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'balance',
      headerName: 'Saldo',
      width: 160,
      renderCell: (params) => {
        const color = params.value >= 0 ? 'success.main' : 'error.main';
        return (
          <Typography color={color}>
            {formatCurrency(params.value)}
          </Typography>
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Gerado em',
      width: 180,
      renderCell: (params) => (
        <Typography>
          {format(new Date(params.value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Typography>
      ),
    },
  ];

  const loadReports = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const response = await financialService.listReports(selectedCommunity.id);
      setReports(response.data);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
      enqueueSnackbar('Erro ao carregar relatórios', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    try {
      await financialService.generateReport(selectedCommunity.id, formData);
      enqueueSnackbar('Relatório gerado com sucesso', { variant: 'success' });
      setOpenDialog(false);
      setFormData({
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: format(new Date(), 'yyyy-MM-dd'),
        type: 'custom' as const,
      });
      loadReports();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      enqueueSnackbar('Erro ao gerar relatório', { variant: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Relatórios Financeiros"
        subtitle="Gere e visualize relatórios financeiros"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Novo Relatório
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={reports}
            columns={columns}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
            pagination
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Novo Relatório Financeiro</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Data Inicial"
                  fullWidth
                  required
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Data Final"
                  fullWidth
                  required
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Tipo"
                  fullWidth
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom' })}
                >
                  <MenuItem value="daily">Diário</MenuItem>
                  <MenuItem value="weekly">Semanal</MenuItem>
                  <MenuItem value="monthly">Mensal</MenuItem>
                  <MenuItem value="yearly">Anual</MenuItem>
                  <MenuItem value="custom">Personalizado</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
            <Button type="submit" variant="contained">Gerar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 