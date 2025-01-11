import React, { useEffect, useState } from 'react';
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
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  TablePagination,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { GroupService } from '../services/group';
import { Group, GroupTypeLabels, GroupStatusLabels, GroupVisibilityLabels } from '../types/group';
import { useCommunity } from '../contexts/CommunityContext';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

const GroupList = () => {
  const navigate = useNavigate();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<Group[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (activeCommunity) {
      loadGroups();
    }
  }, [activeCommunity, page, rowsPerPage]);

  useEffect(() => {
    filterGroups();
  }, [search, groups]);

  const loadGroups = async () => {
    if (!activeCommunity) return;

    setLoading(true);
    setError(null);

    try {
      const response = await GroupService.listGroups(activeCommunity.id, {
        page: page + 1,
        per_page: rowsPerPage
      });
      setGroups(response.groups || []);
      setTotal(response.pagination?.total || 0);
    } catch (err: any) {
      console.error('Erro ao carregar grupos:', err);
      setError(err.response?.data?.message || 'Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  const filterGroups = () => {
    const filtered = groups.filter(group =>
      group.name.toLowerCase().includes(search.toLowerCase()) ||
      group.description.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredGroups(filtered);
  };

  const handleDelete = async (groupId: string) => {
    if (!activeCommunity) return;

    if (!window.confirm('Tem certeza que deseja excluir este grupo?')) {
      return;
    }

    try {
      await GroupService.deleteGroup(activeCommunity.id, groupId);
      await loadGroups();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao excluir grupo');
    }
  };

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
          Selecione uma comunidade para gerenciar grupos
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Grupos
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/groups/new')}
          >
            Novo Grupo
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar grupos..."
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

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nome</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Visibilidade</TableCell>
                    <TableCell>Membros</TableCell>
                    <TableCell>Encontros</TableCell>
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
                  ) : filteredGroups.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        Nenhum grupo encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredGroups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <Link
                            to={`/groups/${group.id}`}
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {group.name}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Chip label={GroupTypeLabels[group.type]} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={GroupStatusLabels[group.status]}
                            color={group.status === 'active' ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={GroupVisibilityLabels[group.visibility]} size="small" />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <GroupIcon fontSize="small" />
                            {group.member_count}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {group.meeting_day && group.meeting_time ? (
                            `${group.meeting_day} às ${group.meeting_time}`
                          ) : (
                            'Não definido'
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                            <Tooltip title="Membros">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/communities/${activeCommunity.id}/groups/${group.id}/members`)}
                              >
                                <GroupIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Editar">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/groups/${group.id}/edit`)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Excluir">
                              <IconButton
                                size="small"
                                onClick={() => handleDelete(group.id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default GroupList; 