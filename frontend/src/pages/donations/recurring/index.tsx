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
  TextField,
  Typography,
  useTheme,
  Chip,
  MenuItem,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { donationService } from '../../../services/donation';
import { RecurringDonation } from '../../../types/donation';
import PageHeader from '../../../components/PageHeader';
import getGridActions from '../../../components/GridActions';

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'pix', label: 'PIX' },
];

const frequencies = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'bimonthly', label: 'Bimestral' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'semiannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
];

const statusColors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
  active: 'success',
  pending: 'warning',
  failed: 'error',
  cancelled: 'default',
};

const statusLabels: { [key: string]: string } = {
  active: 'Ativa',
  pending: 'Pendente',
  failed: 'Falhou',
  cancelled: 'Cancelada',
};

export default function RecurringDonations() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [recurringDonations, setRecurringDonations] = useState<RecurringDonation[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecurringDonation, setSelectedRecurringDonation] = useState<RecurringDonation | null>(null);
  const [formData, setFormData] = useState({
    amount: 0,
    payment_method: '',
    frequency: 'monthly',
    status: 'pending',
  });

  const handleEdit = (recurringDonation: RecurringDonation) => {
    setSelectedRecurringDonation(recurringDonation);
    setFormData({
      amount: recurringDonation.amount,
      payment_method: recurringDonation.payment_method,
      frequency: recurringDonation.frequency,
      status: recurringDonation.status,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (recurringDonation: RecurringDonation) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta doação recorrente?')) {
      try {
        await donationService.deleteRecurringDonation(selectedCommunity.id, recurringDonation.id);
        enqueueSnackbar('Doação recorrente excluída com sucesso', { variant: 'success' });
        loadRecurringDonations();
      } catch (error) {
        console.error('Erro ao excluir doação recorrente:', error);
        enqueueSnackbar('Erro ao excluir doação recorrente', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'amount',
      headerName: 'Valor',
      width: 150,
      align: 'right',
      headerAlign: 'right',
      renderCell: (params) => (
        <Typography align="right" sx={{ width: '100%' }}>
          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(params.value)}
        </Typography>
      ),
    },
    {
      field: 'payment_method',
      headerName: 'Forma de Pagamento',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const method = paymentMethods.find(m => m.value === params.value);
        return method ? method.label : params.value;
      },
    },
    {
      field: 'frequency',
      headerName: 'Frequência',
      width: 150,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => {
        const freq = frequencies.find(f => f.value === params.value);
        return freq ? freq.label : params.value;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Chip
          label={statusLabels[params.value] || params.value}
          color={statusColors[params.value] || 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'next_payment_date',
      headerName: 'Próximo Pagamento',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Typography align="center" sx={{ width: '100%' }}>
            {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
          </Typography>
        ) : '-'
      ),
    },
    {
      field: 'created_at',
      headerName: 'Criado em',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        <Typography align="center" sx={{ width: '100%' }}>
          {format(new Date(params.value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      align: 'center',
      headerAlign: 'center',
      getActions: (params) => getGridActions({
        onEdit: () => handleEdit(params.row),
        onDelete: () => handleDelete(params.row),
      }),
    },
  ];

  const loadRecurringDonations = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const response = await donationService.listRecurringDonations(selectedCommunity.id);
      setRecurringDonations(response.data);
    } catch (error) {
      console.error('Erro ao carregar doações recorrentes:', error);
      enqueueSnackbar('Erro ao carregar doações recorrentes', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecurringDonations();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    try {
      if (selectedRecurringDonation) {
        await donationService.updateRecurringDonation(selectedCommunity.id, selectedRecurringDonation.id, formData);
        enqueueSnackbar('Doação recorrente atualizada com sucesso', { variant: 'success' });
      } else {
        await donationService.createRecurringDonation(selectedCommunity.id, formData);
        enqueueSnackbar('Doação recorrente criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedRecurringDonation(null);
      setFormData({ amount: 0, payment_method: '', frequency: 'monthly', status: 'pending' });
      loadRecurringDonations();
    } catch (error) {
      console.error('Erro ao salvar doação recorrente:', error);
      enqueueSnackbar('Erro ao salvar doação recorrente', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRecurringDonation(null);
    setFormData({ amount: 0, payment_method: '', frequency: 'monthly', status: 'pending' });
  };

  return (
    <Box>
      <PageHeader
        title="Doações Recorrentes"
        subtitle="Gerencie as doações recorrentes"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Doação Recorrente
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={recurringDonations}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {selectedRecurringDonation ? 'Editar Doação Recorrente' : 'Nova Doação Recorrente'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  label="Valor (R$)"
                  fullWidth
                  required
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Forma de Pagamento"
                  fullWidth
                  required
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                >
                  {paymentMethods.map((method) => (
                    <MenuItem key={method.value} value={method.value}>
                      {method.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Frequência"
                  fullWidth
                  required
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                >
                  {frequencies.map((freq) => (
                    <MenuItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
} 