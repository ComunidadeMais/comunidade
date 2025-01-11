import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    Card,
    CardContent,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Container,
    Alert,
    Autocomplete
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material/Select';
import { useCommunity } from '../../contexts/CommunityContext';
import { CommunicationService } from '../../services/communication';
import { CreateCommunicationRequest } from '../../types/communication';
import { MemberService } from '../../services/member';
import { FamilyService } from '../../services/family';
import { GroupService } from '../../services/group';

interface Member {
    id: string;
    name: string;
}

interface Family {
    id: string;
    name: string;
}

interface Group {
    id: string;
    name: string;
}

interface Recipient {
    id: string;
    name: string;
}

const CommunicationForm: FC = () => {
    const navigate = useNavigate();
    const { communicationId } = useParams();
    const { activeCommunity } = useCommunity();
    const [loading, setLoading] = useState(false);
    const [loadingRecipients, setLoadingRecipients] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recipients, setRecipients] = useState<Recipient[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
    const [formData, setFormData] = useState<CreateCommunicationRequest>({
        Type: 'email',
        Subject: '',
        Content: '',
        RecipientType: 'member',
        RecipientID: ''
    });

    useEffect(() => {
        if (communicationId && activeCommunity) {
            loadCommunication();
        }
    }, [communicationId, activeCommunity]);

    useEffect(() => {
        if (activeCommunity && formData.RecipientType) {
            loadRecipients();
        }
    }, [activeCommunity, formData.RecipientType]);

    const loadCommunication = async () => {
        if (!activeCommunity || !communicationId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await CommunicationService.getCommunication(activeCommunity.id, communicationId);
            setFormData({
                Type: data.type.toUpperCase(),
                Subject: data.subject,
                Content: data.content,
                RecipientType: data.recipientType.toUpperCase(),
                RecipientID: data.recipientId
            });
        } catch (err: any) {
            console.error('Erro ao carregar comunicação:', err);
            setError('Erro ao carregar comunicação');
        } finally {
            setLoading(false);
        }
    };

    const loadRecipients = async () => {
        if (!activeCommunity) return;

        setLoadingRecipients(true);
        try {
            let data: Recipient[] = [];
            switch (formData.RecipientType.toLowerCase()) {
                case 'member':
                    const membersResponse = await MemberService.listMembers(activeCommunity.id);
                    data = (membersResponse.members || []).map((member: { id: string; name: string }) => ({ 
                        id: member.id, 
                        name: member.name 
                    }));
                    break;
                case 'family':
                    const familiesResponse = await FamilyService.listFamilies(activeCommunity.id);
                    data = (familiesResponse.families || []).map((family: { id: string; name: string }) => ({ 
                        id: family.id, 
                        name: family.name 
                    }));
                    break;
                case 'group':
                    const groupsResponse = await GroupService.listGroups(activeCommunity.id);
                    data = (groupsResponse.groups || []).map((group: { id: string; name: string }) => ({ 
                        id: group.id, 
                        name: group.name 
                    }));
                    break;
            }
            setRecipients(data);
            setSelectedRecipient(null);
        } catch (err: any) {
            console.error('Erro ao carregar destinatários:', err);
            setError('Erro ao carregar destinatários');
        } finally {
            setLoadingRecipients(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCommunity || !selectedRecipient) return;

        setLoading(true);
        setError(null);
        try {
            const dataToSubmit = {
                Type: formData.Type,
                Subject: formData.Subject,
                Content: formData.Content,
                RecipientType: formData.RecipientType,
                RecipientID: selectedRecipient.id
            };

            console.log('Dados a serem enviados:', dataToSubmit);

            if (communicationId) {
                await CommunicationService.updateCommunication(activeCommunity.id, communicationId, dataToSubmit);
            } else {
                await CommunicationService.createCommunication(activeCommunity.id, dataToSubmit);
            }
            navigate('/communications');
        } catch (err: any) {
            console.error('Erro ao salvar comunicação:', err);
            setError(err.response?.data?.error || 'Erro ao salvar comunicação');
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (field: keyof CreateCommunicationRequest) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

    const handleSelectChange = (field: keyof CreateCommunicationRequest) => (
        event: SelectChangeEvent
    ) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

    const getRecipientTypeLabel = () => {
        switch (formData.RecipientType.toLowerCase()) {
            case 'member':
                return 'Membro';
            case 'family':
                return 'Família';
            case 'group':
                return 'Grupo';
            default:
                return 'Destinatário';
        }
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
                <Typography variant="h4" component="h1" gutterBottom>
                    {communicationId ? 'Editar Comunicação' : 'Nova Comunicação'}
                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <form onSubmit={handleSubmit}>
                    <Card>
                        <CardContent>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo</InputLabel>
                                        <Select
                                            value={formData.Type}
                                            onChange={handleSelectChange('Type')}
                                            label="Tipo"
                                        >
                                            <MenuItem value="EMAIL">E-mail</MenuItem>
                                            <MenuItem value="SMS">SMS</MenuItem>
                                            <MenuItem value="WHATSAPP">WhatsApp</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <FormControl fullWidth>
                                        <InputLabel>Tipo de Destinatário</InputLabel>
                                        <Select
                                            value={formData.RecipientType}
                                            onChange={handleSelectChange('RecipientType')}
                                            label="Tipo de Destinatário"
                                        >
                                            <MenuItem value="member">Membro</MenuItem>
                                            <MenuItem value="family">Família</MenuItem>
                                            <MenuItem value="group">Grupo</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12}>
                                    <Autocomplete
                                        value={selectedRecipient}
                                        onChange={(event, newValue) => setSelectedRecipient(newValue)}
                                        options={recipients}
                                        getOptionLabel={(option) => option.name}
                                        loading={loadingRecipients}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label={getRecipientTypeLabel()}
                                                InputProps={{
                                                    ...params.InputProps,
                                                    endAdornment: (
                                                        <>
                                                            {loadingRecipients ? <CircularProgress color="inherit" size={20} /> : null}
                                                            {params.InputProps.endAdornment}
                                                        </>
                                                    ),
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Assunto"
                                        value={formData.Subject}
                                        onChange={handleTextChange('Subject')}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Conteúdo"
                                        value={formData.Content}
                                        onChange={handleTextChange('Content')}
                                        multiline
                                        rows={4}
                                    />
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading || !selectedRecipient}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Salvar'}
                                </Button>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/communications')}
                                    disabled={loading}
                                >
                                    Cancelar
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </form>
            </Box>
        </Container>
    );
};

export default CommunicationForm; 