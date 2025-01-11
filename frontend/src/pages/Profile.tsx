import { FC, useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  IconButton,
  Divider,
  Alert,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { AuthService } from '../services/auth';
import { User, UpdateProfileRequest } from '../types/user';

const Profile: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState<UpdateProfileRequest>({
    name: '',
    email: '',
    phone: '',
    bio: '',
    date_of_birth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    language: 'pt-BR',
    theme: 'light' as const,
    timezone: 'America/Sao_Paulo',
    notify_by_email: true,
    notify_by_phone: false,
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('Carregando dados do usuário...');
        const userData = await AuthService.getProfile();
        console.log('Dados do usuário recebidos:', userData);
        
        if (!userData) {
          console.error('Dados do usuário estão vazios');
          return;
        }

        setUser(userData);
        
        const newFormData = {
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          bio: userData.bio || '',
          date_of_birth: userData.date_of_birth?.split('T')[0] || '',
          gender: userData.gender || '',
          address: userData.address || '',
          city: userData.city || '',
          state: userData.state || '',
          country: userData.country || '',
          zip_code: userData.zip_code || '',
          language: userData.language || 'pt-BR',
          theme: (userData.theme || 'light') as 'light' | 'dark',
          timezone: userData.timezone || 'America/Sao_Paulo',
          notify_by_email: userData.notify_by_email ?? true,
          notify_by_phone: userData.notify_by_phone ?? false,
        };

        console.log('Atualizando formulário com:', newFormData);
        setFormData(newFormData);
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        setError('Erro ao carregar dados do usuário');
      }
    };
    loadUser();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setLoading(true);
        const updatedUser = await AuthService.updateAvatar(file);
        setUser(updatedUser);
        setSuccess('Foto atualizada com sucesso!');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao atualizar foto');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      console.log('Enviando dados:', formData);
      const updatedUser = await AuthService.updateProfile(formData);
      setUser(updatedUser);
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao atualizar perfil:', err);
      setError(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await AuthService.updatePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      });
      setSuccess('Senha alterada com sucesso!');
      setOpenPasswordDialog(false);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Meu Perfil
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Grid container spacing={3}>
          {/* Card de Foto */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Avatar
                    alt={user?.name}
                    src={user?.avatar || undefined}
                    sx={{ 
                      width: 120, 
                      height: 120,
                      border: '2px solid',
                      borderColor: 'primary.main'
                    }}
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </Avatar>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      color="primary"
                      aria-label="upload picture"
                      component="span"
                      disabled={loading}
                    >
                      <PhotoCameraIcon />
                    </IconButton>
                  </label>
                  <Typography variant="caption" color="text.secondary">
                    Clique no ícone para alterar sua foto
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Card de Dados Pessoais */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom>
                        Dados Pessoais
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Nome completo"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        name="email"
                        value={formData.email}
                        disabled
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Telefone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Data de nascimento"
                        name="date_of_birth"
                        type="date"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Gênero</InputLabel>
                        <Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleSelectChange}
                          label="Gênero"
                        >
                          <MenuItem value="">Não informar</MenuItem>
                          <MenuItem value="male">Masculino</MenuItem>
                          <MenuItem value="female">Feminino</MenuItem>
                          <MenuItem value="other">Outro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Biografia"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        multiline
                        rows={4}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Endereço
                      </Typography>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Endereço"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Cidade"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Estado"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="País"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="CEP"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                        Preferências
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Idioma</InputLabel>
                        <Select
                          name="language"
                          value={formData.language}
                          onChange={handleSelectChange}
                          label="Idioma"
                        >
                          <MenuItem value="pt-BR">Português (Brasil)</MenuItem>
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="es">Español</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Tema</InputLabel>
                        <Select
                          name="theme"
                          value={formData.theme}
                          onChange={handleSelectChange}
                          label="Tema"
                        >
                          <MenuItem value="light">Claro</MenuItem>
                          <MenuItem value="dark">Escuro</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.notify_by_email}
                            onChange={handleChange}
                            name="notify_by_email"
                          />
                        }
                        label="Receber notificações por email"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.notify_by_phone}
                            onChange={handleChange}
                            name="notify_by_phone"
                          />
                        }
                        label="Receber notificações por telefone"
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 2 }} />
                    </Grid>

                    <Grid item xs={12} sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={loading}
                        startIcon={<SaveIcon />}
                      >
                        {loading ? 'Salvando...' : 'Salvar alterações'}
                      </Button>

                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => setOpenPasswordDialog(true)}
                        disabled={loading}
                        startIcon={<LockIcon />}
                      >
                        Alterar senha
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Diálogo de alteração de senha */}
      <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
        <DialogTitle>Alterar senha</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Senha atual"
                name="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
              <TextField
                fullWidth
                label="Nova senha"
                name="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
              <TextField
                fullWidth
                label="Confirmar nova senha"
                name="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPasswordDialog(false)}>Cancelar</Button>
          <Button onClick={handlePasswordSubmit} variant="contained" disabled={loading}>
            {loading ? 'Alterando...' : 'Alterar senha'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 