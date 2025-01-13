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
    Tooltip,
    Checkbox,
    Snackbar
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

const formatDate = (dateString: string | null | undefined): string => {
    try {
        if (!dateString) return 'Data não disponível';
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
    const [selected, setSelected] = useState<string[]>([]);
    const [sendingStatus, setSendingStatus] = useState<{ [key: string]: boolean }>({});
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

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
            console.log('Dados recebidos:', data);
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

    const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelected = filteredCommunications
                .filter(c => c.status === 'pending')
                .map(c => c.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (id: string, status: string) => {
        console.log('Status recebido:', status);
        if (status !== 'pending') return;
        
        const selectedIndex = selected.indexOf(id);
        let newSelected: string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const handleSendSelected = async () => {
        if (!activeCommunity || selected.length === 0) return;

        const newSendingStatus = { ...sendingStatus };
        let successCount = 0;
        let failCount = 0;

        for (const id of selected) {
            try {
                newSendingStatus[id] = true;
                setSendingStatus(newSendingStatus);
                
                await CommunicationService.sendCommunication(activeCommunity.id, id);
                successCount++;
            } catch (err) {
                console.error(`Erro ao enviar comunicação ${id}:`, err);
                failCount++;
            } finally {
                newSendingStatus[id] = false;
                setSendingStatus(newSendingStatus);
            }
        }

        let message = '';
        if (successCount > 0) {
            message += `${successCount} comunicação(ões) enviada(s) com sucesso. `;
        }
        if (failCount > 0) {
            message += `${failCount} falha(s) no envio.`;
        }

        setSnackbarMessage(message);
        setSnackbarOpen(true);
        setSelected([]);
        await loadCommunications();
    };

    const handleSendSingle = async (communicationId: string) => {
        if (!activeCommunity) return;

        const newSendingStatus = { ...sendingStatus, [communicationId]: true };
        setSendingStatus(newSendingStatus);

        try {
            await CommunicationService.sendCommunication(activeCommunity.id, communicationId);
            setSnackbarMessage('Comunicação enviada com sucesso');
            await loadCommunications();
        } catch (err: any) {
            console.error('Erro ao enviar comunicação:', err);
            setSnackbarMessage('Erro ao enviar comunicação');
        } finally {
            setSendingStatus({ ...newSendingStatus, [communicationId]: false });
            setSnackbarOpen(true);
        }
    };

    const handleDelete = async (communicationId: string) => {
        if (!activeCommunity || !window.confirm('Tem certeza que deseja excluir esta comunicação?')) return;

        try {
            await CommunicationService.deleteCommunication(activeCommunity.id, communicationId);
            await loadCommunications();
            setSnackbarMessage('Comunicação excluída com sucesso');
            setSnackbarOpen(true);
        } catch (err: any) {
            console.error('Erro ao excluir comunicação:', err);
            setError('Erro ao excluir comunicação');
        }
    };

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

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
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {selected.length > 0 && (
                            <Button
                                variant="contained"
                                color="success"
                                startIcon={<SendIcon />}
                                onClick={handleSendSelected}
                            >
                                Enviar Selecionados ({selected.length})
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => navigate('/communications/new')}
                        >
                            Nova Comunicação
                        </Button>
                    </Box>
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
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                indeterminate={selected.length > 0 && selected.length < filteredCommunications.filter(c => c.status === 'pending').length}
                                                checked={filteredCommunications.filter(c => c.status === 'pending').length > 0 && selected.length === filteredCommunications.filter(c => c.status === 'pending').length}
                                                onChange={handleSelectAllClick}
                                            />
                                        </TableCell>
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
                                            <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                                <CircularProgress />
                                            </TableCell>
                                        </TableRow>
                                    ) : filteredCommunications.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} align="center">
                                                Nenhuma comunicação encontrada
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredCommunications
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((communication) => {
                                                const isItemSelected = isSelected(communication.id);
                                                const isSending = sendingStatus[communication.id];

                                                return (
                                                    <TableRow
                                                        key={communication.id}
                                                        hover
                                                        onClick={() => handleClick(communication.id, communication.status)}
                                                        role="checkbox"
                                                        aria-checked={isItemSelected}
                                                        selected={isItemSelected}
                                                    >
                                                        <TableCell padding="checkbox">
                                                            <Checkbox
                                                                checked={isItemSelected}
                                                                disabled={communication.status !== 'pending'}
                                                            />
                                                        </TableCell>
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
                                                            {formatDate(communication.created_at)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                                {communication.status === 'pending' && (
                                                                    <Tooltip title="Enviar">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleSendSingle(communication.id);
                                                                            }}
                                                                            color="success"
                                                                            disabled={isSending}
                                                                        >
                                                                            {isSending ? (
                                                                                <CircularProgress size={20} />
                                                                            ) : (
                                                                                <SendIcon />
                                                                            )}
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                <Tooltip title="Editar">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            navigate(`/communications/${communication.id}/edit`);
                                                                        }}
                                                                        color="primary"
                                                                        disabled={communication.status !== 'pending'}
                                                                    >
                                                                        <EditIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Excluir">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDelete(communication.id);
                                                                        }}
                                                                        color="error"
                                                                    >
                                                                        <DeleteIcon />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            component="div"
                            count={filteredCommunications.length}
                            page={page}
                            onPageChange={(event, newPage) => setPage(newPage)}
                            rowsPerPage={rowsPerPage}
                            onRowsPerPageChange={(event) => {
                                setRowsPerPage(parseInt(event.target.value, 10));
                                setPage(0);
                            }}
                            labelRowsPerPage="Itens por página"
                            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                            rowsPerPageOptions={[10, 25, 50]}
                        />
                    </CardContent>
                </Card>
            </Box>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Container>
    );
};

export default Communications; 