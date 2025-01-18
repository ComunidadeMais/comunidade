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
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSnackbar } from 'notistack';
import { useCommunity } from '../../../contexts/CommunityContext';
import { financialService } from '../../../services/financial';
import { Revenue, FinancialCategory, RevenueStatus } from '../../../types/financial';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency } from '../../../utils/format';

export default function Revenues() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    status: 'pending' as RevenueStatus,
    payment_type: '',
  });

  const handleEdit = (revenue: Revenue) => {
    setSelectedRevenue(revenue);
    setFormData({
      category_id: revenue.category_id,
      amount: revenue.amount.toString(),
      date: format(new Date(revenue.date), 'yyyy-MM-dd'),
      description: revenue.description || '',
      status: revenue.status,
      payment_type: revenue.payment_type || '',
    });
    setOpenDialog(true);
  };

  const handleDelete = async (revenue: Revenue) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta receita?')) {
      try {
        await financialService.deleteRevenue(selectedCommunity.id, revenue.id);
        enqueueSnackbar('Receita excluída com sucesso', { variant: 'success' });
        loadData();
      } catch (error) {
        console.error('Erro ao excluir receita:', error);
        enqueueSnackbar('Erro ao excluir receita', { variant: 'error' });
      }
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'Data',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
    },
    {
      field: 'amount',
      headerName: 'Valor',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {formatCurrency(params.value)}
        </Typography>
      ),
    },
    {
      field: 'category',
      headerName: 'Categoria',
      width: 200,
      renderCell: (params) => (
        <Typography>{params.row.category?.name}</Typography>
      ),
    },
    { field: 'description', headerName: 'Descrição', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => {
        const statusMap = {
          pending: 'Pendente',
          received: 'Recebido',
          cancelled: 'Cancelado',
        };
        return <Typography>{statusMap[params.value as keyof typeof statusMap]}</Typography>;
      },
    },
    {
      field: 'payment_type',
      headerName: 'Forma de Pagamento',
      width: 160,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Editar"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => handleDelete(params.row)}
        />,
      ],
    },
  ];

  const loadData = async () => {
    if (!selectedCommunity) return;
    
    try {
      setLoading(true);
      const [revenuesResponse, categoriesResponse] = await Promise.all([
        financialService.listRevenues(selectedCommunity.id),
        financialService.listCategories(selectedCommunity.id),
      ]);
      
      setRevenues(revenuesResponse.data);
      setCategories(categoriesResponse.data.filter(cat => cat.type === 'revenue'));
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      enqueueSnackbar('Erro ao carregar dados', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCommunity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
      };

      if (selectedRevenue) {
        await financialService.updateRevenue(selectedCommunity.id, selectedRevenue.id, data);
        enqueueSnackbar('Receita atualizada com sucesso', { variant: 'success' });
      } else {
        await financialService.createRevenue(selectedCommunity.id, data);
        enqueueSnackbar('Receita criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedRevenue(null);
      setFormData({
        category_id: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        status: 'pending',
        payment_type: '',
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar receita:', error);
      enqueueSnackbar('Erro ao salvar receita', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRevenue(null);
    setFormData({
      category_id: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      status: 'pending',
      payment_type: '',
    });
  };

  return (
    <Box>
      <PageHeader
        title="Receitas"
        subtitle="Gerencie as receitas da comunidade"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Receita
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={revenues}
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
            {selectedRevenue ? 'Editar Receita' : 'Nova Receita'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="date"
                  label="Data"
                  fullWidth
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  label="Valor"
                  fullWidth
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  inputProps={{ step: '0.01', min: '0' }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Categoria"
                  fullWidth
                  required
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Descrição"
                  fullWidth
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as RevenueStatus })}
                >
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="received">Recebido</MenuItem>
                  <MenuItem value="cancelled">Cancelado</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Forma de Pagamento"
                  fullWidth
                  value={formData.payment_type}
                  onChange={(e) => setFormData({ ...formData, payment_type: e.target.value })}
                />
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