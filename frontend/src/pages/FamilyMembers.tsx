import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Avatar,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PersonAdd as PersonAddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { FamilyService } from '../services/family';
import { MemberService } from '../services/member';
import { useCommunity } from '../contexts/CommunityContext';
import { Member } from '../types/member';
import { Family, FamilyMember, FamilyRoles, FamilyRoleValues } from '../types/family';

const FamilyMembers = () => {
  const navigate = useNavigate();
  const { id: familyId } = useParams();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMember, setSelectedMember] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{ id: string, role: string } | null>(null);
  const [searchMember, setSearchMember] = useState('');
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalMembers, setTotalMembers] = useState(0);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (activeCommunity && familyId) {
      loadFamily();
      loadMembers();
    }
  }, [activeCommunity, familyId]);

  const loadFamily = async () => {
    if (!activeCommunity || !familyId) return;

    setLoading(true);
    setError(null);
    try {
      const data = await FamilyService.getFamily(activeCommunity.id, familyId);
      setFamily(data.family);
      setFamilyMembers(data.members || []);
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao carregar família');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!activeCommunity) return;
    try {
      const data = await MemberService.listMembers(activeCommunity.id);
      setMembers(data.members);
    } catch (err) {
      console.error('Erro ao carregar membros:', err);
    }
  };

  const handleAddMember = async () => {
    if (!activeCommunity || !familyId || !selectedMember || !selectedRole) return;

    try {
      await FamilyService.addMember(activeCommunity.id, familyId, selectedMember, selectedRole);
      setSuccess('Membro adicionado com sucesso!');
      loadFamily();
      handleCloseDialog();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao adicionar membro');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!activeCommunity || !familyId) return;

    if (!window.confirm('Tem certeza que deseja remover este membro da família?')) {
      return;
    }

    try {
      await FamilyService.removeMember(activeCommunity.id, familyId, memberId);
      setSuccess('Membro removido com sucesso!');
      loadFamily();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao remover membro');
    }
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    if (!activeCommunity || !familyId) return;

    try {
      await FamilyService.updateMemberRole(activeCommunity.id, familyId, memberId, role);
      setSuccess('Papel atualizado com sucesso!');
      loadFamily();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao atualizar papel');
    }
  };

  const handleOpenDialog = () => {
    setSelectedMember('');
    setSelectedRole('');
    setSearchMember('');
    setPage(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.name : 'Membro não encontrado';
  };

  const getAvailableMembers = () => {
    const familyMemberIds = familyMembers.map(fm => fm.member_id);
    return members.filter(member => !familyMemberIds.includes(member.id));
  };

  const getRoleLabel = (role: string) => {
    const key = Object.entries(FamilyRoleValues).find(([_, value]) => value === role)?.[0];
    return key ? FamilyRoles[key as keyof typeof FamilyRoles] : role;
  };

  const handleOpenEditDialog = (memberId: string, role: string) => {
    setEditingMember({ id: memberId, role });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditingMember(null);
    setEditDialogOpen(false);
  };

  const handleUpdateMemberRole = async () => {
    if (!activeCommunity || !familyId || !editingMember) return;

    try {
      await FamilyService.updateMemberRole(
        activeCommunity.id,
        familyId,
        editingMember.id,
        editingMember.role
      );
      setSuccess('Papel atualizado com sucesso!');
      loadFamily();
      handleCloseEditDialog();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao atualizar papel');
    }
  };

  const loadAvailableMembers = async () => {
    if (!activeCommunity) return;

    setLoadingMembers(true);
    try {
      const response = await MemberService.listMembers(activeCommunity.id, {
        page: page + 1,
        per_page: rowsPerPage,
        search: searchMember.trim(),
      });

      // Filtra membros que já estão na família
      const familyMemberIds = familyMembers.map(fm => fm.member_id);
      const filteredMembers = response.members.filter(
        member => !familyMemberIds.includes(member.id)
      );

      setAvailableMembers(filteredMembers);
      setTotalMembers(response.pagination?.total || 0);
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
  }, [searchMember, page, rowsPerPage, openDialog]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar famílias
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
              onClick={() => navigate('/families')}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              Membros da {family?.name || 'Família'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            onClick={handleOpenDialog}
          >
            Adicionar Membro
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Card>
          <CardContent>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Papel na Família</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {familyMembers.map((familyMember) => (
                    <TableRow key={familyMember.id}>
                      <TableCell>{getMemberName(familyMember.member_id)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Chip label={getRoleLabel(familyMember.role)} />
                          <Tooltip title="Editar papel">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditDialog(familyMember.member_id, familyMember.role)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Remover da família">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveMember(familyMember.member_id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {familyMembers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        Nenhum membro nesta família
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Adicionar Membro à Família</DialogTitle>
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
                  <TableCell>Papel na Família</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadingMembers ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : availableMembers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
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
                      <TableCell>
                        <FormControl fullWidth size="small">
                          <Select
                            value={selectedMember === member.id ? selectedRole : ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              setSelectedRole(e.target.value);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            onOpen={(e) => {
                              e.stopPropagation();
                              setSelectedMember(member.id);
                            }}
                          >
                            {Object.entries(FamilyRoles).map(([key, label]) => (
                              <MenuItem 
                                key={key} 
                                value={FamilyRoleValues[key as keyof typeof FamilyRoleValues]}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!selectedRole || selectedMember !== member.id}
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

          <TablePagination
            component="div"
            count={totalMembers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Itens por página"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog}>
        <DialogTitle>Editar Papel na Família</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Papel na Família</InputLabel>
            <Select
              value={editingMember?.role || ''}
              onChange={(e) => setEditingMember(prev => prev ? { ...prev, role: e.target.value } : null)}
              label="Papel na Família"
            >
              {Object.entries(FamilyRoles).map(([key, label]) => (
                <MenuItem key={key} value={FamilyRoleValues[key as keyof typeof FamilyRoleValues]}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>Cancelar</Button>
          <Button
            onClick={handleUpdateMemberRole}
            variant="contained"
            disabled={!editingMember?.role}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FamilyMembers; 