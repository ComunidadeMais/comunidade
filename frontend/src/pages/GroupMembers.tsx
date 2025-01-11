import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Avatar,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { GroupService } from '../services/group';
import { MemberService } from '../services/member';
import { Member } from '../types/member';
import { useCommunity } from '../contexts/CommunityContext';

const GroupMembers = () => {
  const navigate = useNavigate();
  const { groupId } = useParams<{ groupId: string }>();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [searchMember, setSearchMember] = useState('');
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (activeCommunity && groupId) {
      loadMembers();
    }
  }, [activeCommunity, groupId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeCommunity && groupId) {
        loadMembers();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const loadMembers = async () => {
    if (!activeCommunity || !groupId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await GroupService.listMembers(activeCommunity.id, groupId);
      setMembers(response.members || []);
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableMembers = async () => {
    if (!activeCommunity) return;
    
    setLoadingMembers(true);
    try {
      const response = await MemberService.listMembers(activeCommunity.id);

      // Filtra membros que já estão no grupo
      const groupMemberIds = members.map(m => m.id);
      const filteredMembers = (response.members || []).filter(
        member => !groupMemberIds.includes(member.id)
      );

      setAvailableMembers(filteredMembers);
    } catch (err) {
      console.error('Erro ao carregar membros disponíveis:', err);
      setError('Erro ao carregar membros disponíveis');
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    if (openDialog) {
      const timer = setTimeout(() => {
        loadAvailableMembers();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [searchMember, openDialog]);

  const handleAddMember = async () => {
    if (!activeCommunity || !groupId || !selectedMember) return;

    try {
      await GroupService.addMember(activeCommunity.id, groupId, selectedMember);
      setSuccess('Membro adicionado com sucesso!');
      await loadMembers();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao adicionar membro');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeCommunity || !groupId) return;

    if (!window.confirm('Tem certeza que deseja remover este membro do grupo?')) {
      return;
    }

    try {
      await GroupService.removeMember(activeCommunity.id, groupId, memberId);
      setSuccess('Membro removido com sucesso!');
      await loadMembers();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao remover membro');
    }
  };

  const handleOpenDialog = () => {
    setSelectedMember('');
    setSearchMember('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar membros
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate(-1)}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              Membros do Grupo
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          >
            Adicionar Membro
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar membros..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Foto</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell>Função</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum membro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <Avatar 
                            src={member.photo ? `http://localhost:8080/uploads/${member.photo}` : undefined}
                            alt={member.name}
                          >
                            {!member.photo && member.name.charAt(0)}
                          </Avatar>
                        </TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell>
                          <Chip 
                            label={member.role} 
                            color={member.role === 'admin' ? 'error' : member.role === 'leader' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={member.status} 
                            color={
                              member.status === 'active' ? 'success' :
                              member.status === 'pending' ? 'warning' :
                              member.status === 'blocked' ? 'error' : 'default'
                            }
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="error"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Adicionar Membro ao Grupo</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar membro..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <TableContainer sx={{ maxHeight: 400 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Foto</TableCell>
                    <TableCell>Nome</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Telefone</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingMembers ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <CircularProgress size={24} />
                      </TableCell>
                    </TableRow>
                  ) : availableMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Nenhum membro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    availableMembers.map((member) => (
                      <TableRow 
                        key={member.id}
                        selected={selectedMember === member.id}
                        hover
                        onClick={() => setSelectedMember(member.id)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <Avatar
                            src={member.photo ? `http://localhost:8080/uploads/${member.photo}` : undefined}
                            sx={{ width: 40, height: 40 }}
                          >
                            {!member.photo && member.name.charAt(0)}
                          </Avatar>
                        </TableCell>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>{member.phone}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            disabled={!selectedMember || selectedMember !== member.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddMember();
                            }}
                          >
                            Adicionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Fechar</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default GroupMembers; 