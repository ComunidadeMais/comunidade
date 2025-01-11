import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Container,
    Alert,
    TextField,
    InputAdornment,
    TablePagination,
    CircularProgress,
    Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Send as SendIcon,
    Search as SearchIcon
} from '@mui/icons-material';
import { useCommunity } from '../../contexts/CommunityContext';
import { CommunicationService } from '../../services/communication';
import { Communication, CommunicationType } from '../../types/communication';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeLabels: Record<CommunicationType, string> = {
    email: 'E-mail',
    sms: 'SMS',
    whatsapp: 'WhatsApp'
};

const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    sent: 'Enviado',
    delivered: 'Entregue',
    failed: 'Falhou'
};

const statusColors: Record<string, 'default' | 'primary' | 'success' | 'error'> = {
    pending: 'default',
    sent: 'primary',
    delivered: 'success',
    failed: 'error'
};

const formatDate = (dateString: string) => {
    try {
        if (!dateString) return 'Data inválida';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Data inválida';
        }
        return format(date, 'dd/MM/yyyy HH:mm', { locale: ptBR });
    } catch (error) {
        console.error('Erro ao formatar data:', error);
        return 'Data inválida';
    }
};

const Communications: FC = () => {
    const navigate = useNavigate();
    const { activeCommunity } = useCommunity();
    const [communications, setCommunications] = useState<Communication[]>([]);
    const [filteredCommunications, setFilteredCommunications] = useState<Communication[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (activeCommunity) {
            loadCommunications();
        }
    }, [activeCommunity]);

    useEffect(() => {
        filterCommunications();
    }, [search, communications]);

    const loadCommunications = async () => {
        if (!activeCommunity) return;

        setLoading(true);
        setError(null);
        try {
            const data = await CommunicationService.listCommunications(activeCommunity.id);
            setCommunications(data);
        } catch (err: any) {
            console.error('Erro ao carregar comunicações:', err);
            setError('Erro ao carregar comunicações');
        } finally {
            setLoading(false);
        }
    };

    const filterCommunications = () => {
        const filtered = communications.filter(communication =>
            communication.subject?.toLowerCase().includes(search.toLowerCase()) ||
            communication.content?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCommunications(filtered);
        setPage(0);
    };

    const handleDelete = async (communicationId: string) => {
        if (!activeCommunity || !window.confirm('Tem certeza que deseja excluir esta comunicação?')) return;

        try {
            await CommunicationService.deleteCommunication(activeCommunity.id, communicationId);
            await loadCommunications();
        } catch (err: any) {
            console.error('Erro ao excluir comunicação:', err);
            setError('Erro ao excluir comunicação');
        }
    };

    const handleSend = async (communicationId: string) => {
        if (!activeCommunity) return;

        try {
            await CommunicationService.sendCommunication(activeCommunity.id, communicationId);
            await loadCommunications();
        } catch (err: any) {
            console.error('Erro ao enviar comunicação:', err);
            setError('Erro ao enviar comunicação');
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
                    Selecione uma comunidade para gerenciar as comunicações.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1">
                        Comunicações
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/communications/new')}
                    >
                        Nova Comunicação
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Card>
                    <CardContent>
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Buscar comunicações..."
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
                                        <TableCell>Tipo</TableCell>
                                        <TableCell>Assunto</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Data de Criação</TableCell>
                                        <TableCell align="right">Ações</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredCommunications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                Nenhuma comunicação encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCommunications
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((communication) => (
                                                <TableRow key={communication.id}>
                                                    <TableCell>
                                                        <Chip
                                                            label={typeLabels[communication.type]}
                                                            size="small"
                                                            color={communication.type === 'email' ? 'primary' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{communication.subject}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={statusLabels[communication.status]}
                                                            size="small"
                                                            color={statusColors[communication.status]}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {formatDate(communication.createdAt)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                            {communication.status === 'pending' && (
                                                                <Tooltip title="Enviar">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => handleSend(communication.id)}
                                                                        color="success"
                                                                    >
                                                                        <SendIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                            <Tooltip title="Editar">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => navigate(`/communications/${communication.id}/edit`)}
                                                                    color="primary"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Excluir">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(communication.id)}
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
                            count={filteredCommunications.length}
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

export default Communications; 