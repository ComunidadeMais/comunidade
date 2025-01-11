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
  Paper,
  IconButton,
  Tooltip,
  Chip,
  TablePagination,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  Search as SearchIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { FamilyService } from '../services/family';
import { MemberService } from '../services/member';
import { Family } from '../types/family';
import { Member } from '../types/member';
import { useCommunity } from '../contexts/CommunityContext';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';

interface FamilyWithHeadName extends Family {
  headOfFamilyName?: string;
}

const FamilyList = () => {
  const navigate = useNavigate();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [families, setFamilies] = useState<FamilyWithHeadName[]>([]);
  const [filteredFamilies, setFilteredFamilies] = useState<FamilyWithHeadName[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (activeCommunity) {
      loadFamilies();
    }
  }, [activeCommunity]);

  useEffect(() => {
    filterFamilies();
  }, [search, families]);

  const loadFamilies = async () => {
    if (!activeCommunity) return;

    setLoading(true);
    setError(null);
    try {
      const data = await FamilyService.listFamilies(activeCommunity.id);
      
      // Carregar os nomes dos chefes de família
      const familiesWithHeadNames = await Promise.all(
        data.map(async (family: Family) => {
          if (family.head_of_family) {
            try {
              const member = await MemberService.getMember(activeCommunity.id, family.head_of_family);
              return {
                ...family,
                headOfFamilyName: member.name
              };
            } catch (err) {
              console.error('Erro ao carregar chefe da família:', err);
              return {
                ...family,
                headOfFamilyName: 'Membro não encontrado'
              };
            }
          }
          return family;
        })
      );

      setFamilies(familiesWithHeadNames);
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao carregar famílias');
    } finally {
      setLoading(false);
    }
  };

  const filterFamilies = () => {
    const filtered = families.filter(family =>
      family.name.toLowerCase().includes(search.toLowerCase()) ||
      family.description?.toLowerCase().includes(search.toLowerCase()) ||
      family.headOfFamilyName?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredFamilies(filtered);
    setPage(0);
  };

  const handleDelete = async (familyId: string) => {
    if (!activeCommunity) return;

    if (!window.confirm('Tem certeza que deseja excluir esta família?')) {
      return;
    }

    try {
      await FamilyService.deleteFamily(activeCommunity.id, familyId);
      await loadFamilies();
    } catch (err: any) {
      console.error('Error details:', err.response?.data);
      setError(err.response?.data?.message || 'Erro ao excluir família');
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
          Selecione uma comunidade para gerenciar famílias
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Famílias
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/families/new')}
          >
            Nova Família
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Card>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar famílias..."
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
                    <TableCell>Nome</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Chefe da Família</TableCell>
                    <TableCell>Data de Criação</TableCell>
                    <TableCell align="center">Membros</TableCell>
                    <TableCell align="right">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredFamilies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        Nenhuma família encontrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFamilies
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((family) => (
                        <TableRow key={family.id}>
                          <TableCell>{family.name}</TableCell>
                          <TableCell>{family.description || '-'}</TableCell>
                          <TableCell>
                            {family.headOfFamilyName ? (
                              <Chip
                                icon={<PersonIcon />}
                                label={family.headOfFamilyName}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell>
                            {dayjs(family.created_at).locale('pt-br').format("DD [de] MMMM [de] YYYY")}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Ver membros">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/families/${family.id}/members`)}
                                color="primary"
                              >
                                <GroupIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                              <Tooltip title="Editar">
                                <IconButton
                                  size="small"
                                  onClick={() => navigate(`/families/${family.id}/edit`)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Excluir">
                                <IconButton
                                  size="small"
                                  onClick={() => handleDelete(family.id)}
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
            </TableContainer>

            <TablePagination
              component="div"
              count={filteredFamilies.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Itens por página"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
              rowsPerPageOptions={[10, 25, 50]}
            />
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default FamilyList; 