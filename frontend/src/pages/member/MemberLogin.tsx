import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  CircularProgress,
  Alert,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Link,
  Tabs,
  Tab,
  Grid,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatImageUrl } from '../../config/api';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
} from '@mui/icons-material';

const MotionCard = motion(Card);

interface CommunityData {
  id: string;
  name: string;
  logo: string;
  banner: string;
  description: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
}

interface SignUpFormData {
  cpf: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface CommunityResponse {
  community: {
    id: string;
    name: string;
    description: string;
    logo?: string;
    banner?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    type?: string;
    status?: string;
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

const MemberLogin: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { communityId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const { login, setCurrentCommunity } = useAuth();
  const [communityData, setCommunityData] = useState<CommunityData>({
    id: '',
    name: '',
    logo: '',
    banner: '',
    description: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    website: ''
  });

  // Form states
  const [loginForm, setLoginForm] = useState({
    login: '',
    password: '',
  });

  const [signUpForm, setSignUpForm] = useState<SignUpFormData>({
    cpf: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadCommunityData = async () => {
      if (!communityId) {
        console.error('ID da comunidade não fornecido');
        setError('ID da comunidade inválido');
        return;
      }

      try {
        setLoading(true);
        console.log('Tentando carregar dados da comunidade:', communityId);
        
        const response = await api.get<CommunityResponse>(`/communities/${communityId}/public`);
        console.log('Resposta da API:', response.data);
        
        const { community } = response.data;
        
        if (!community) {
          console.error('Dados da comunidade não encontrados na resposta');
          setError('Comunidade não encontrada');
          return;
        }

        // Debug logs para as URLs das imagens
        console.log('Logo original:', community.logo);
        console.log('Logo formatada:', formatImageUrl(community.logo));
        console.log('Banner original:', community.banner);
        console.log('Banner formatado:', formatImageUrl(community.banner));

        setCurrentCommunity({
          id: community.id,
          name: community.name,
          logo: community.logo
        });
        
        setCommunityData({
          id: community.id,
          name: community.name,
          logo: community.logo || '',
          banner: community.banner || '',
          description: community.description || '',
          address: community.address || '',
          city: community.city || '',
          state: community.state || '',
          phone: '',
          email: '',
          website: ''
        });
        
        setError(null);
      } catch (error: any) {
        console.error('Erro detalhado ao carregar dados da comunidade:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 404) {
          setError('Comunidade não encontrada');
        } else if (error.response?.status === 500) {
          setError('Erro interno do servidor ao carregar dados da comunidade');
        } else {
          setError('Erro ao carregar dados da comunidade');
        }
      } finally {
        setLoading(false);
      }
    };

    loadCommunityData();
  }, [communityId, setCurrentCommunity]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError(null);
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginForm({
      ...loginForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignUpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignUpForm({
      ...signUpForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await api.post(`/communities/${communityId}/members/login`, loginForm);
      const { token } = response.data;
      
      await login(token, communityId!);
        navigate(`/communities/${communityId}/member/dashboard`);
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      setError(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signUpForm.password !== signUpForm.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    setLoading(true);

    try {
      await api.post(`/communities/${communityId}/members/signup`, {
        community_id: communityId,
        cpf: signUpForm.cpf,
        email: signUpForm.email,
        password: signUpForm.password,
      });

      // Após o cadastro, muda para a aba de login
      setTabValue(0);
      setLoginForm({
        ...loginForm,
        login: signUpForm.email,
      });
    } catch (error: any) {
      console.error('Erro ao cadastrar:', error);
      setError(error.response?.data?.error || 'Erro ao realizar cadastro');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !communityData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: theme.palette.background.default,
        padding: 3
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          {/* Lado esquerdo - Informações da Comunidade */}
          <Box
            sx={{
              flex: '1',
              p: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: theme.palette.primary.main,
              color: 'white',
              position: 'relative'
            }}
          >
            {communityData.banner && (
              <Box
                component="img"
                src={formatImageUrl(communityData.banner)}
                alt="Banner"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.1
                }}
              />
            )}
            <Box
              sx={{
                position: 'relative',
                textAlign: 'center',
                zIndex: 1
              }}
            >
              {communityData.logo && (
                <Avatar
                  src={formatImageUrl(communityData.logo)}
                  sx={{
                    width: 120,
                    height: 120,
                    mb: 3,
                    mx: 'auto',
                    border: '4px solid white'
                  }}
                />
              )}
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                {communityData.name}
              </Typography>
              <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                Portal do Membro
              </Typography>
              {communityData.description && (
                <Typography variant="body1" sx={{ opacity: 0.8 }}>
                  {communityData.description}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Lado direito - Formulário de Login */}
          <Box
            sx={{
              flex: '1',
              p: 4,
              bgcolor: 'background.paper',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h5" component="h2" gutterBottom textAlign="center">
              Acesse sua conta
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Paper sx={{ width: '100%', mt: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="auth tabs"
                variant="fullWidth"
              >
                <Tab label="Login" />
                <Tab label="Cadastro" />
              </Tabs>

              <TabPanel value={tabValue} index={0}>
                <Box component="form" onSubmit={handleLoginSubmit} sx={{ p: 3 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                    id="login"
                    label="CPF ou E-mail"
                    name="login"
                autoComplete="email"
                autoFocus
                    value={loginForm.login}
                    onChange={handleLoginChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Senha"
                    type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                    value={loginForm.password}
                    onChange={handleLoginChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Entrar'}
              </Button>
                  <Grid container>
                    <Grid item xs>
                <Link
                        href="#"
                  variant="body2"
                        onClick={(e) => {
                          e.preventDefault();
                          setTabValue(1);
                        }}
                      >
                        {"Não tem uma conta? Cadastre-se"}
                </Link>
                    </Grid>
                    <Grid item>
                      <Link
                        href="#"
                        variant="body2"
                        onClick={(e) => {
                          e.preventDefault();
                          setTabValue(0);
                        }}
                      >
                        {"Já tem uma conta? Faça login"}
                </Link>
                    </Grid>
                  </Grid>
              </Box>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <Box component="form" onSubmit={handleSignUpSubmit} sx={{ p: 3 }}>
              <TextField
                    margin="normal"
                    required
                fullWidth
                    id="cpf"
                label="CPF"
                name="cpf"
                    autoComplete="cpf"
                    value={signUpForm.cpf}
                onChange={handleSignUpChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person />
                        </InputAdornment>
                      ),
                    }}
              />
              <TextField
                margin="normal"
                required
                    fullWidth
                    id="email"
                    label="E-mail"
                    name="email"
                    autoComplete="email"
                    value={signUpForm.email}
                    onChange={handleSignUpChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email />
                        </InputAdornment>
                      ),
                    }}
              />
              <TextField
                margin="normal"
                required
                    fullWidth
                    name="password"
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    id="signup-password"
                    value={signUpForm.password}
                    onChange={handleSignUpChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
              />
              <TextField
                margin="normal"
                required
                    fullWidth
                    name="confirmPassword"
                    label="Confirmar Senha"
                    type={showPassword ? 'text' : 'password'}
                    id="confirm-password"
                    value={signUpForm.confirmPassword}
                    onChange={handleSignUpChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={loading}
                  >
              {loading ? <CircularProgress size={24} /> : 'Cadastrar'}
            </Button>
                  <Grid container justifyContent="flex-end">
                    <Grid item>
                      <Link
                        href="#"
                        variant="body2"
                        onClick={(e) => {
                          e.preventDefault();
                          setTabValue(0);
                        }}
                      >
                        {"Já tem uma conta? Faça login"}
                      </Link>
                    </Grid>
                  </Grid>
                </Box>
              </TabPanel>
            </Paper>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default MemberLogin; 