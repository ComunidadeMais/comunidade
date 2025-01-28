import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, TextField, Typography, Grid, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useSelectedCommunity } from '../../../hooks/useSelectedCommunity';
import { donationService, AsaasAccount } from '../../../services/donation';

export const AsaasSettings: React.FC = () => {
  const { selectedCommunity } = useSelectedCommunity();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<AsaasAccount | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf_cnpj: '',
    company_type: 'MEI',
    phone: '',
    mobile_phone: '',
    address: '',
    address_number: '',
    complement: '',
    province: '',
    postal_code: '',
    responsible_name: '',
    responsible_cpf: '',
    responsible_birth_date: '',
    responsible_phone: '',
    responsible_email: '',
    bank_account: {
      bank: '',
      bank_agency: '',
      bank_account: '',
      bank_account_type: 'CONTA_CORRENTE'
    }
  });

  // Log para debug
  useEffect(() => {
    console.log('Selected Community:', selectedCommunity);
  }, [selectedCommunity]);

  useEffect(() => {
    if (selectedCommunity) {
      loadAccount();
    }
  }, [selectedCommunity]);

  const loadAccount = async () => {
    if (!selectedCommunity) return;

    setLoading(true);
    try {
      const response = await donationService.getAsaasAccount(selectedCommunity.id);
      console.log('Resposta da API:', response);
      // Verifica se há contas na resposta
      if (response.accounts && response.accounts.length > 0) {
        setAccount(response.accounts[0]);
      } else {
        setAccount(null);
      }
    } catch (error) {
      console.error('Erro ao carregar conta ASAAS:', error);
      enqueueSnackbar('Erro ao carregar conta ASAAS', { variant: 'error' });
      setAccount(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCommunity) return;

    setLoading(true);
    try {
      await donationService.createAsaasAccount(selectedCommunity.id, formData);
      enqueueSnackbar('Conta Comunidade+ criada com sucesso!', { variant: 'success' });
      loadAccount();
    } catch (error) {
      console.error('Erro ao criar conta Comunidade+:', error);
      enqueueSnackbar('Erro ao criar conta Comunidade+', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name?.includes('bank_account.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bank_account: {
          ...prev.bank_account,
          [bankField]: value
        }
      }));
    } else if (name?.includes('responsible_')) {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    if (name?.includes('bank_account.')) {
      const bankField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bank_account: {
          ...prev.bank_account,
          [bankField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  if (!selectedCommunity) {
    return (
      <Box p={3}>
        <Typography>Por favor, selecione uma comunidade no menu superior para continuar.</Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box p={3}>
        <Typography>Carregando...</Typography>
      </Box>
    );
  }

  if (account) {
    return (
      <Box p={3}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Conta ASAAS</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography><strong>Nome:</strong> {account.name}</Typography>
                <Typography><strong>Email:</strong> {account.email}</Typography>
                <Typography><strong>CPF/CNPJ:</strong> {account.cpf_cnpj}</Typography>
                <Typography><strong>Tipo de Empresa:</strong> {account.company_type}</Typography>
                <Typography><strong>Status:</strong> {account.status}</Typography>
              </Grid>
              {account.bank_account && (
                <Grid item xs={12}>
                  <Typography variant="h6">Dados Bancários</Typography>
                  <Typography><strong>Banco:</strong> {account.bank_account.bank}</Typography>
                  <Typography><strong>Agência:</strong> {account.bank_account.bank_agency}</Typography>
                  <Typography><strong>Conta:</strong> {account.bank_account.bank_account}</Typography>
                  <Typography><strong>Tipo de Conta:</strong> {account.bank_account.bank_account_type}</Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Criar Conta ASAAS</Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>Dados da Empresa</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF/CNPJ"
                  name="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tipo de Empresa</InputLabel>
                  <Select
                    name="company_type"
                    value={formData.company_type}
                    onChange={handleSelectChange}
                    required
                  >
                    <MenuItem value="MEI">MEI</MenuItem>
                    <MenuItem value="ME">ME</MenuItem>
                    <MenuItem value="EIRELI">EIRELI</MenuItem>
                    <MenuItem value="LTDA">LTDA</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Celular"
                  name="mobile_phone"
                  value={formData.mobile_phone}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Endereço</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Endereço"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Número"
                  name="address_number"
                  value={formData.address_number}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Complemento"
                  name="complement"
                  value={formData.complement}
                  onChange={handleInputChange}
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Bairro"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CEP"
                  name="postal_code"
                  value={formData.postal_code}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Dados do Responsável</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Nome do Responsável"
                  name="responsible_name"
                  value={formData.responsible_name}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="CPF do Responsável"
                  name="responsible_cpf"
                  value={formData.responsible_cpf}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Data de Nascimento do Responsável"
                  name="responsible_birth_date"
                  type="date"
                  value={formData.responsible_birth_date}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Telefone do Responsável"
                  name="responsible_phone"
                  value={formData.responsible_phone}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email do Responsável"
                  name="responsible_email"
                  type="email"
                  value={formData.responsible_email}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Dados Bancários</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Banco"
                  name="bank_account.bank"
                  value={formData.bank_account.bank}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Agência"
                  name="bank_account.bank_agency"
                  value={formData.bank_account.bank_agency}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Conta"
                  name="bank_account.bank_account"
                  value={formData.bank_account.bank_account}
                  onChange={handleInputChange}
                  required
                  margin="normal"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Tipo de Conta</InputLabel>
                  <Select
                    name="bank_account.bank_account_type"
                    value={formData.bank_account.bank_account_type}
                    onChange={handleSelectChange}
                    required
                  >
                    <MenuItem value="CONTA_CORRENTE">Conta Corrente</MenuItem>
                    <MenuItem value="CONTA_POUPANCA">Conta Poupança</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  sx={{ mt: 2 }}
                >
                  Criar Conta Comunidade+
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AsaasSettings; 