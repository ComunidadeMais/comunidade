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
import { Donation, Campaign } from '../../../types/donation';
import PageHeader from '../../../components/PageHeader';
import getGridActions from '../../../components/GridActions';

const paymentMethods = [
  { value: 'credit_card', label: 'Cartão de Crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'pix', label: 'PIX' },
];

const statusColors: { [key: string]: 'success' | 'warning' | 'error' | 'default' } = {
  pending: 'warning',
  paid: 'success',
  failed: 'error',
  cancelled: 'default',
};

const statusLabels: { [key: string]: string } = {
  pending: 'Pendente',
  paid: 'Pago',
  failed: 'Falhou',
  cancelled: 'Cancelado',
};

export default function Donations() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [formData, setFormData] = useState({
    campaign_id: '',
    amount: 0,
    payment_method: '',
    status: 'pending',
  });

  const handleEdit = (donation: Donation) => {
    setSelectedDonation(donation);
    setFormData({
      campaign_id: donation.campaign_id || '',
      amount: donation.amount,
      payment_method: donation.payment_method,
      status: donation.status,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (donation: Donation) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta doação?')) {
      try {
        await donationService.deleteDonation(selectedCommunity.id, donation.id);
        enqueueSnackbar('Doação excluída com sucesso', { variant: 'success' });
        loadDonations();
      } catch (error) {
        console.error('Erro ao excluir doação:', error);
        enqueueSnackbar('Erro ao excluir doação', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'campaign_id',
      headerName: 'Campanha',
      width: 200,
      align: 'left',
      headerAlign: 'left',
      renderCell: (params) => {
        const campaign = campaigns.find(c => c.id === params.value);
        return campaign ? campaign.name : 'Doação Avulsa';
      },
    },
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
      field: 'payment_date',
      headerName: 'Data Pagamento',
      width: 180,
      align: 'center',
      headerAlign: 'center',
      renderCell: (params) => (
        params.value ? (
          <Typography align="center" sx={{ width: '100%' }}>
            {format(new Date(params.value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
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

  const loadDonations = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const response = await donationService.listDonations(selectedCommunity.id);
      setDonations(response.data);
    } catch (error) {
      console.error('Erro ao carregar doações:', error);
      enqueueSnackbar('Erro ao carregar doações', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const loadCampaigns = async () => {
    if (!selectedCommunity) return;
    
    try {
      const response = await donationService.listCampaigns(selectedCommunity.id);
      setCampaigns(response.data);
    } catch (error) {
      console.error('Erro ao carregar campanhas:', error);
    }
  };

  useEffect(() => {
    loadDonations();
    loadCampaigns();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    try {
      if (selectedDonation) {
        await donationService.updateDonation(selectedCommunity.id, selectedDonation.id, formData);
        enqueueSnackbar('Doação atualizada com sucesso', { variant: 'success' });
      } else {
        await donationService.createDonation(selectedCommunity.id, formData);
        enqueueSnackbar('Doação criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedDonation(null);
      setFormData({ campaign_id: '', amount: 0, payment_method: '', status: 'pending' });
      loadDonations();
    } catch (error) {
      console.error('Erro ao salvar doação:', error);
      enqueueSnackbar('Erro ao salvar doação', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDonation(null);
    setFormData({ campaign_id: '', amount: 0, payment_method: '', status: 'pending' });
  };

  return (
    <Box>
      <PageHeader
        title="Doações"
        subtitle="Gerencie as doações recebidas"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Doação
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={donations}
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
            {selectedDonation ? 'Editar Doação' : 'Nova Doação'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Campanha"
                  fullWidth
                  value={formData.campaign_id}
                  onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                >
                  <MenuItem value="">Doação Avulsa</MenuItem>
                  {campaigns.map((campaign) => (
                    <MenuItem key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
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