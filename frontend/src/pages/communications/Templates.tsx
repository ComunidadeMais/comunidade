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
    Paper,
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
    Search as SearchIcon
} from '@mui/icons-material';
import { useCommunity } from '../../contexts/CommunityContext';
import { CommunicationService } from '../../services/communication';
import { CommunicationTemplate, CommunicationType } from '../../types/communication';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const typeLabels: Record<CommunicationType, string> = {
    email: 'E-mail',
    sms: 'SMS',
    whatsapp: 'WhatsApp'
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

const Templates: FC = () => {
    const navigate = useNavigate();
    const { activeCommunity } = useCommunity();
    const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
    const [filteredTemplates, setFilteredTemplates] = useState<CommunicationTemplate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        if (activeCommunity) {
            loadTemplates();
        }
    }, [activeCommunity]);

    useEffect(() => {
        filterTemplates();
    }, [search, templates]);

    const loadTemplates = async () => {
        if (!activeCommunity) return;

        setLoading(true);
        setError(null);
        try {
            const data = await CommunicationService.listTemplates(activeCommunity.id);
            setTemplates(data);
        } catch (err: any) {
            console.error('Erro ao carregar templates:', err);
            setError('Erro ao carregar templates');
        } finally {
            setLoading(false);
        }
    };

    const filterTemplates = () => {
        const filtered = templates.filter(template =>
            template.name.toLowerCase().includes(search.toLowerCase()) ||
            template.subject?.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredTemplates(filtered);
        setPage(0);
    };

    const handleDelete = async (templateId: string) => {
        if (!activeCommunity || !window.confirm('Tem certeza que deseja excluir este template?')) return;

        try {
            await CommunicationService.deleteTemplate(activeCommunity.id, templateId);
            await loadTemplates();
        } catch (err: any) {
            console.error('Erro ao excluir template:', err);
            setError('Erro ao excluir template');
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
                    Selecione uma comunidade para gerenciar os templates.
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" component="h1">
                        Templates de Comunicação
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => navigate('/communications/templates/new')}
                    >
                        Novo Template
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Card>
                    <CardContent>
                        <Box sx={{ mb: 3 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Buscar templates..."
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
                                        <TableCell>Tipo</TableCell>
                                        <TableCell>Assunto</TableCell>
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
                                    ) : filteredTemplates.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                Nenhum template encontrado
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredTemplates
                                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                            .map((template) => (
                                                <TableRow key={template.id}>
                                                    <TableCell>{template.name}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={typeLabels[template.type]}
                                                            size="small"
                                                            color={template.type === 'email' ? 'primary' : 'default'}
                                                        />
                                                    </TableCell>
                                                    <TableCell>{template.subject}</TableCell>
                                                    <TableCell>
                                                        {formatDate(template.createdAt)}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                                            <Tooltip title="Editar">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => navigate(`/communications/templates/${template.id}/edit`)}
                                                                    color="primary"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title="Excluir">
                                                                <IconButton
                                                                    size="small"
                                                                    onClick={() => handleDelete(template.id)}
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
                            count={filteredTemplates.length}
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

export default Templates; 