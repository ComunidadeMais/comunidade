import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Chip,
  Tooltip,
  TextField,
  InputAdornment,
  Badge,
  ChipProps,
  TableContainer,
  Table,
  TablePagination,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  WhatsApp as WhatsAppIcon,
  Cake as CakeIcon,
  Church as ChurchIcon,
  Group as GroupIcon,
  Event as EventIcon,
  PhotoCamera
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MemberService } from '../services/member';
import { Member } from '../types/member';
import { useCommunity } from '../contexts/CommunityContext';
import API_CONFIG from '../config/api';

const Members: React.FC = () => {
  const navigate = useNavigate();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (activeCommunity) {
      loadMembers();
    }
  }, [activeCommunity, page, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeCommunity) {
        setPage(0);
        loadMembers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadMembers = async () => {
    if (!activeCommunity) return;

    setLoading(true);
    setError(null);

    try {
      const response = await MemberService.listMembers(activeCommunity.id, {
        page: page + 1,
        per_page: rowsPerPage,
        search: search.trim()
      });
      setMembers(response.members || []);
      setTotal(response.pagination?.total || 0);
    } catch (err: any) {
      console.error('Erro ao carregar membros:', err);
      setError(err.response?.data?.message || 'Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleDelete = async (id: string) => {
    if (!activeCommunity) return;
    
    if (window.confirm('Tem certeza que deseja excluir este membro?')) {
      setLoading(true);
      setError(null);
      try {
        await MemberService.deleteMember(activeCommunity.id, id);
        loadMembers();
      } catch (err: any) {
        setError(err.response?.data?.message || 'Erro ao excluir membro');
        console.error('Erro ao excluir membro:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const getRoleColor = (role: string): ChipProps['color'] => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'leader':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string): ChipProps['color'] => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'warning';
      case 'inactive':
        return 'default';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const handlePhotoUpload = async (memberId: string, file: File) => {
    if (!activeCommunity) return;
    
    setLoading(true);
    setError(null);
    try {
      await MemberService.uploadPhoto(activeCommunity.id, memberId, file);
      loadMembers(); // Recarrega a lista para mostrar a nova foto
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao fazer upload da foto');
      console.error('Erro ao fazer upload da foto:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Membros
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/members/new')}
            disabled={loading || !activeCommunity}
          >
            Novo Membro
          </Button>
        </Box>

        {!activeCommunity && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Selecione uma comunidade para gerenciar seus membros
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card sx={{ mb: 2 }}>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Buscar por nome, email ou telefone..."
              value={search}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </CardContent>
        </Card>

        {loading && !members.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {members.map((member) => (
              <Card key={member.id}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <IconButton
                          component="label"
                          size="small"
                          sx={{
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' },
                          }}
                        >
                          <input
                            hidden
                            accept="image/*"
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handlePhotoUpload(member.id, file);
                              }
                            }}
                          />
                          <PhotoCamera fontSize="small" />
                        </IconButton>
                      }
                    >
                      <Avatar
                        sx={{ 
                          width: 64, 
                          height: 64,
                          bgcolor: 'primary.main'
                        }}
                        src={member.photo ? `${API_CONFIG.uploadsURL}/${member.photo}` : undefined}
                      >
                        {!member.photo && member.name.charAt(0)}
                      </Avatar>
                    </Badge>

                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {member.name}
                        </Typography>
                        <Chip 
                          size="small" 
                          label={member.role} 
                          color={getRoleColor(member.role) as any}
                        />
                        <Chip 
                          size="small" 
                          label={member.status} 
                          color={getStatusColor(member.status) as any}
                        />
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        {member.email && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <MailIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {member.email}
                            </Typography>
                          </Box>
                        )}
                        {member.phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {member.phone}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {member.birthDate && (
                          <Tooltip title="Data de Nascimento">
                            <Chip
                              size="small"
                              icon={<CakeIcon />}
                              label={new Date(member.birthDate).toLocaleDateString()}
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                        {member.baptismDate && (
                          <Tooltip title="Data de Batismo">
                            <Chip
                              size="small"
                              icon={<ChurchIcon />}
                              label={new Date(member.baptismDate).toLocaleDateString()}
                              variant="outlined"
                            />
                          </Tooltip>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Tooltip title="Grupos">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <GroupIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {member.ministry || '-'}
                              </Typography>
                            </Box>
                          </Tooltip>

                          <Tooltip title="Eventos">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <EventIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                {member.membershipType || '-'}
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton
                        color="primary"
                        onClick={() => navigate(`/members/${member.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(member.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}

            {members.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Nenhum membro encontrado
                </Typography>
              </Box>
            )}

            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
              }
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default Members; 