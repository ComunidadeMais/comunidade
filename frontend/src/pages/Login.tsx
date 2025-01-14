import { FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  useTheme,
  InputAdornment,
  IconButton,
  Fade
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { AuthService } from '../services/auth';

const Login: FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Verifica se já existe um token válido
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Iniciando login...');
      await AuthService.login({ email, password });
      console.log('Login bem sucedido, redirecionando...');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      console.error('Erro no login:', err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Email ou senha inválidos');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: `linear-gradient(135deg, #6B2AEE 0%, #5E3AD7 100%)`,
        py: 12,
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url(/pattern-comunidade.png) repeat',
          opacity: 0.05,
          animation: 'pulse 4s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 0.05,
          },
          '50%': {
            opacity: 0.08,
          },
        },
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={1000}>
          <Paper
            elevation={8}
            sx={{
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(20px)',
              background: 'rgba(255, 255, 255, 0.98)',
              position: 'relative',
              border: '1px solid rgba(107, 42, 238, 0.1)',
              boxShadow: '0 8px 32px rgba(107, 42, 238, 0.1)',
            }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #6B2AEE 0%, #5E3AD7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}
                >
                  Bem-vindo à Comunidade+
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    maxWidth: '80%', 
                    mx: 'auto',
                    fontSize: '1rem',
                    lineHeight: 1.5
                  }}
                >
                  Entre com suas credenciais para acessar sua conta
                </Typography>
              </Box>

              {error && (
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'rgba(211, 47, 47, 0.05)',
                    color: '#d32f2f',
                    fontSize: '0.875rem',
                    border: '1px solid rgba(211, 47, 47, 0.1)',
                  }}
                >
                  {error}
                </Box>
              )}

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(107, 42, 238, 0.02)',
                    '&:hover': {
                      bgcolor: 'rgba(107, 42, 238, 0.05)',
                    },
                    '&.Mui-focused': {
                      bgcolor: 'rgba(107, 42, 238, 0.05)',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(107, 42, 238, 0.2)',
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6B2AEE',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'rgba(107, 42, 238, 0.5)' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{
                          color: 'rgba(107, 42, 238, 0.5)',
                          '&:hover': {
                            color: '#6B2AEE',
                          }
                        }}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: 'rgba(107, 42, 238, 0.02)',
                    '&:hover': {
                      bgcolor: 'rgba(107, 42, 238, 0.05)',
                    },
                    '&.Mui-focused': {
                      bgcolor: 'rgba(107, 42, 238, 0.05)',
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(107, 42, 238, 0.2)',
                  },
                  '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6B2AEE',
                  }
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: '#6B2AEE',
                  boxShadow: '0 4px 12px rgba(107, 42, 238, 0.2)',
                  '&:hover': {
                    bgcolor: '#5E3AD7',
                    boxShadow: '0 6px 16px rgba(107, 42, 238, 0.3)',
                  }
                }}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>

              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1
                }}
              >
                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/forgot-password')}
                  disabled={loading}
                  sx={{ 
                    color: 'rgba(107, 42, 238, 0.7)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#6B2AEE',
                    }
                  }}
                >
                  Esqueceu sua senha?
                </Link>

                <Link
                  component="button"
                  variant="body2"
                  onClick={() => navigate('/register')}
                  disabled={loading}
                  sx={{ 
                    color: 'rgba(107, 42, 238, 0.7)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#6B2AEE',
                    }
                  }}
                >
                  Criar uma conta
                </Link>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Login; 