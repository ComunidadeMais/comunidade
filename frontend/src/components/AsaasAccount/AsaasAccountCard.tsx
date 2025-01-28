import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  BusinessCenter,
  Description,
  CheckCircle,
  Launch,
  Refresh,
  Edit
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { useAsaasAccountStatus } from '../../hooks/useAsaasAccountStatus';
import { useCommunity } from '../../contexts/CommunityContext';
import api from '../../services/api';
import { useSnackbar } from 'notistack';
import { SelectChangeEvent } from '@mui/material/Select';

export interface AsaasAccount {
  id: string;
  community_id: string;
  name: string;
  email: string;
  cpf_cnpj: string;
  company_type: string;
  phone: string;
  mobile_phone: string;
  address: string;
  address_number: string;
  complement: string;
  province: string;
  postal_code: string;
  birth_date: string;
  api_key: string;
  wallet_id: string;
  status: string;
  asaas_id: string;
  created_at: string;
  updated_at: string;
  bank: string;
  bank_agency: string;
  bank_account: string;
  bank_account_type: string;
  commercial_info: string;
  bank_account_info: string;
  documentation: string;
  general_status: string;
  onboarding_url?: string;
  person_type: string;
  webhooks: any;
}

interface AccountStatus {
  id: string;
  commercialInfo: 'REJECTED' | 'APPROVED' | 'AWAITING_APPROVAL' | 'PENDING';
  bankAccountInfo: 'REJECTED' | 'APPROVED' | 'PENDING';
  documentation: 'REJECTED' | 'APPROVED' | 'AWAITING_APPROVAL' | 'PENDING';
  general: 'REJECTED' | 'APPROVED' | 'AWAITING_APPROVAL' | 'PENDING';
}

const translateStatus = (status?: string) => {
  switch (status) {
    case 'APPROVED':
      return 'Aprovado';
    case 'PENDING':
      return 'Pendente';
    case 'AWAITING_APPROVAL':
      return 'Em Análise';
    case 'REJECTED':
      return 'Rejeitado';
    default:
      return 'Não informado';
  }
};

interface AsaasAccountCardProps {
  account: AsaasAccount;
  onRefresh: () => void;
}

export const AsaasAccountCard: React.FC<AsaasAccountCardProps> = ({ account, onRefresh }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { communityId } = useCommunity();
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: account.name,
    email: account.email,
    cpfCnpj: account.cpf_cnpj,
    companyType: account.company_type,
    phone: account.phone,
    mobilePhone: account.mobile_phone,
    address: account.address,
    addressNumber: account.address_number,
    complement: account.complement,
    province: account.province,
    postalCode: account.postal_code,
    birthDate: account.birth_date,
    incomeValue: 1000,
    personType: account.person_type
  });

  const { data: status, isLoading: isLoadingStatus } = useAsaasAccountStatus(
    communityId,
    account.id
  );

  const formatCpfCnpj = (value: string | undefined) => {
    if (!value) return '';
    
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '$1.$2.$3-$4');
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/g, '$1.$2.$3/$4-$5');
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCompanyTypeLabel = (type?: string) => {
    switch (type) {
      case 'MEI':
        return 'Microempreendedor Individual';
      case 'LIMITED':
        return 'Limitada';
      case 'INDIVIDUAL':
        return 'Individual';
      default:
        return type || '';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'APPROVED':
        return {
          bg: theme.palette.success.light,
          color: theme.palette.success.dark,
          borderColor: theme.palette.success.main
        };
      case 'PENDING':
        return {
          bg: theme.palette.warning.light,
          color: theme.palette.warning.dark,
          borderColor: theme.palette.warning.main
        };
      case 'AWAITING_APPROVAL':
        return {
          bg: theme.palette.info.light,
          color: theme.palette.info.dark,
          borderColor: theme.palette.info.main
        };
      case 'REJECTED':
        return {
          bg: theme.palette.error.light,
          color: theme.palette.error.dark,
          borderColor: theme.palette.error.main
        };
      default:
        return {
          bg: theme.palette.grey[100],
          color: theme.palette.grey[700],
          borderColor: theme.palette.grey[300]
        };
    }
  };

  const handleTextFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post(`/communities/${communityId}/donations/asaas/accounts/${account.id}/commercial-info`, formData);
      enqueueSnackbar('Dados comerciais atualizados com sucesso', { variant: 'success' });
      onRefresh();
      setOpenDialog(false);
    } catch (error) {
      console.error('Erro ao atualizar dados comerciais:', error);
      enqueueSnackbar('Erro ao atualizar dados comerciais', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setFormData({
      name: account.name,
      email: account.email,
      cpfCnpj: account.cpf_cnpj,
      companyType: account.company_type,
      phone: account.phone,
      mobilePhone: account.mobile_phone,
      address: account.address,
      addressNumber: account.address_number,
      complement: account.complement,
      province: account.province,
      postalCode: account.postal_code,
      birthDate: account.birth_date,
      incomeValue: 1000,
      personType: account.person_type
    });
    setOpenDialog(true);
  };

  return (
    <>
      <Card sx={{ 
        boxShadow: theme.shadows[3],
        borderRadius: 2,
        overflow: 'hidden',
        maxWidth: 1200,
        margin: '0 auto'
      }}>
        <Box sx={{ 
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
          p: 4,
          color: 'white'
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {account.name}
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                {account.email}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<Refresh />}
              onClick={onRefresh}
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                px: 3,
                py: 1.5
              }}
            >
              Atualizar Dados
            </Button>
          </Stack>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4}>
            {/* Informações Comerciais */}
            <Grid item xs={12} md={4}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: theme.palette.grey[50], 
                  borderRadius: 2,
                  height: '100%',
                  border: `1px solid ${theme.palette.grey[200]}`
                }}
              >
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" color="primary" sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      pb: 1,
                      borderBottom: `2px solid ${theme.palette.primary.main}`
                    }}>
                      <BusinessCenter /> Informações Comerciais
                    </Typography>
                    <IconButton 
                      color="primary" 
                      onClick={handleOpenDialog}
                      sx={{ ml: 1 }}
                    >
                      <Edit />
                    </IconButton>
                  </Box>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="textSecondary">CPF/CNPJ</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formatCpfCnpj(account.cpf_cnpj)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">Tipo de Empresa</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {account.company_type}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" color="textSecondary">Tipo de Pessoa</Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {account.person_type === 'JURIDICA' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>

            {/* Status da Conta */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: theme.palette.grey[50], 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.grey[200]}`
                }}
              >
                <Typography variant="h6" color="primary" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  pb: 1,
                  mb: 3,
                  borderBottom: `2px solid ${theme.palette.primary.main}`
                }}>
                  <Description /> Status da Conta
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1} alignItems="center">
                      <Chip
                        icon={<CheckCircle />}
                        label="Informações"
                        sx={{ 
                          width: '100%',
                          bgcolor: getStatusColor(status?.commercialInfo).bg,
                          color: getStatusColor(status?.commercialInfo).color,
                          border: 1,
                          borderColor: getStatusColor(status?.commercialInfo).borderColor,
                          '& .MuiChip-label': {
                            fontWeight: 'medium'
                          }
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: getStatusColor(status?.commercialInfo).color,
                          fontWeight: 'medium'
                        }}
                      >
                        {translateStatus(status?.commercialInfo)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1} alignItems="center">
                      <Chip
                        icon={<CheckCircle />}
                        label="Bancário"
                        sx={{ 
                          width: '100%',
                          bgcolor: getStatusColor(status?.bankAccountInfo).bg,
                          color: getStatusColor(status?.bankAccountInfo).color,
                          border: 1,
                          borderColor: getStatusColor(status?.bankAccountInfo).borderColor,
                          '& .MuiChip-label': {
                            fontWeight: 'medium'
                          }
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: getStatusColor(status?.bankAccountInfo).color,
                          fontWeight: 'medium'
                        }}
                      >
                        {translateStatus(status?.bankAccountInfo)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1} alignItems="center">
                      <Chip
                        icon={<Description />}
                        label="Documentos"
                        sx={{ 
                          width: '100%',
                          bgcolor: getStatusColor(status?.documentation).bg,
                          color: getStatusColor(status?.documentation).color,
                          border: 1,
                          borderColor: getStatusColor(status?.documentation).borderColor,
                          '& .MuiChip-label': {
                            fontWeight: 'medium'
                          }
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: getStatusColor(status?.documentation).color,
                          fontWeight: 'medium'
                        }}
                      >
                        {translateStatus(status?.documentation)}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Stack spacing={1} alignItems="center">
                      <Chip
                        icon={<CheckCircle />}
                        label="Geral"
                        sx={{ 
                          width: '100%',
                          bgcolor: getStatusColor(status?.general).bg,
                          color: getStatusColor(status?.general).color,
                          border: 1,
                          borderColor: getStatusColor(status?.general).borderColor,
                          '& .MuiChip-label': {
                            fontWeight: 'medium'
                          }
                        }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: getStatusColor(status?.general).color,
                          fontWeight: 'medium'
                        }}
                      >
                        {translateStatus(status?.general)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Link de Onboarding */}
            {account.onboarding_url && (
              <Grid item xs={12}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 3, 
                    bgcolor: theme.palette.warning.light,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.warning.main}`
                  }}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" color="warning.dark" sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                      Existem itens pendentes para completar seu cadastro
                    </Typography>
                    <Button
                      variant="contained"
                      color="warning"
                      size="large"
                      endIcon={<Launch />}
                      href={account.onboarding_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{ px: 4 }}
                    >
                      Completar Cadastro
                    </Button>
                  </Stack>
                </Paper>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Atualizar Dados Comerciais</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Nome"
                value={formData.name}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="cpfCnpj"
                label="CPF/CNPJ"
                value={formData.cpfCnpj}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Empresa</InputLabel>
                <Select
                  name="companyType"
                  value={formData.companyType}
                  onChange={handleSelectChange}
                  label="Tipo de Empresa"
                >
                  <MenuItem value="MEI">MEI</MenuItem>
                  <MenuItem value="LIMITED">Limitada</MenuItem>
                  <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="phone"
                label="Telefone"
                value={formData.phone}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="mobilePhone"
                label="Celular"
                value={formData.mobilePhone}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="address"
                label="Endereço"
                value={formData.address}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="addressNumber"
                label="Número"
                value={formData.addressNumber}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="complement"
                label="Complemento"
                value={formData.complement}
                onChange={handleTextFieldChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="province"
                label="Bairro"
                value={formData.province}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="postalCode"
                label="CEP"
                value={formData.postalCode}
                onChange={handleTextFieldChange}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="birthDate"
                label="Data de Nascimento"
                type="date"
                value={formData.birthDate}
                onChange={handleTextFieldChange}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Tipo de Pessoa</InputLabel>
                <Select
                  name="personType"
                  value={formData.personType}
                  onChange={handleSelectChange}
                  label="Tipo de Pessoa"
                >
                  <MenuItem value="JURIDICA">Pessoa Jurídica</MenuItem>
                  <MenuItem value="FISICA">Pessoa Física</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>
            Cancelar
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={loading}
          >
            Salvar Alterações
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 