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
import { Expense, FinancialCategory, Supplier, ExpenseStatus } from '../../../types/financial';
import PageHeader from '../../../components/PageHeader';
import { formatCurrency } from '../../../utils/format';

export default function Expenses() {
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedCommunity } = useCommunity();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    supplier_id: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    description: '',
    status: 'pending' as ExpenseStatus,
    payment_type: '',
    due_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleEdit = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      category_id: expense.category_id,
      supplier_id: expense.supplier_id || '',
      amount: expense.amount.toString(),
      date: format(new Date(expense.date), 'yyyy-MM-dd'),
      description: expense.description || '',
      status: expense.status,
      payment_type: expense.payment_type || '',
      due_date: format(new Date(expense.due_date), 'yyyy-MM-dd'),
    });
    setOpenDialog(true);
  };

  const handleDelete = async (expense: Expense) => {
    if (!selectedCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      try {
        await financialService.deleteExpense(selectedCommunity.id, expense.id);
        enqueueSnackbar('Despesa excluída com sucesso', { variant: 'success' });
        loadData();
      } catch (error) {
        console.error('Erro ao excluir despesa:', error);
        enqueueSnackbar('Erro ao excluir despesa', { variant: 'error' });
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
    {
      field: 'supplier',
      headerName: 'Fornecedor',
      width: 200,
      renderCell: (params) => (
        <Typography>{params.row.supplier?.name || '-'}</Typography>
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
          paid: 'Pago',
          cancelled: 'Cancelado',
        };
        return <Typography>{statusMap[params.value as keyof typeof statusMap]}</Typography>;
      },
    },
    {
      field: 'due_date',
      headerName: 'Vencimento',
      width: 120,
      renderCell: (params) => (
        <Typography>
          {format(new Date(params.value), 'dd/MM/yyyy', { locale: ptBR })}
        </Typography>
      ),
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
      const [expensesResponse, categoriesResponse, suppliersResponse] = await Promise.all([
        financialService.listExpenses(selectedCommunity.id),
        financialService.listCategories(selectedCommunity.id),
        financialService.listSuppliers(selectedCommunity.id),
      ]);
      
      setExpenses(expensesResponse.data);
      setCategories(categoriesResponse.data.filter(cat => cat.type === 'expense'));
      setSuppliers(suppliersResponse.data);
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
        supplier_id: formData.supplier_id || undefined,
      };

      if (selectedExpense) {
        await financialService.updateExpense(selectedCommunity.id, selectedExpense.id, data);
        enqueueSnackbar('Despesa atualizada com sucesso', { variant: 'success' });
      } else {
        await financialService.createExpense(selectedCommunity.id, data);
        enqueueSnackbar('Despesa criada com sucesso', { variant: 'success' });
      }
      setOpenDialog(false);
      setSelectedExpense(null);
      setFormData({
        category_id: '',
        supplier_id: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        description: '',
        status: 'pending',
        payment_type: '',
        due_date: format(new Date(), 'yyyy-MM-dd'),
      });
      loadData();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      enqueueSnackbar('Erro ao salvar despesa', { variant: 'error' });
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExpense(null);
    setFormData({
      category_id: '',
      supplier_id: '',
      amount: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      description: '',
      status: 'pending',
      payment_type: '',
      due_date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  return (
    <Box>
      <PageHeader
        title="Despesas"
        subtitle="Gerencie as despesas da comunidade"
        button={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Nova Despesa
          </Button>
        }
      />

      <Card>
        <CardContent>
          <DataGrid
            rows={expenses}
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
            {selectedExpense ? 'Editar Despesa' : 'Nova Despesa'}
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
                  select
                  label="Fornecedor"
                  fullWidth
                  value={formData.supplier_id}
                  onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                >
                  <MenuItem value="">Nenhum</MenuItem>
                  {suppliers.map((supplier) => (
                    <MenuItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
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
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as ExpenseStatus })}
                >
                  <MenuItem value="pending">Pendente</MenuItem>
                  <MenuItem value="paid">Pago</MenuItem>
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
              <Grid item xs={12}>
                <TextField
                  type="date"
                  label="Data de Vencimento"
                  fullWidth
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
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