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
    SelectChangeEvent
} from '@mui/material';
import { useCommunity } from '../../contexts/CommunityContext';
import { CommunicationService } from '../../services/communication';
import { CreateTemplateRequest } from '../../types/communication';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEDITOR_CONFIG, DEFAULT_TEMPLATE, generateCommunicationTemplate } from '../../config/communicationEditor';

const TemplateForm: FC = () => {
    const navigate = useNavigate();
    const { templateId } = useParams();
    const { activeCommunity } = useCommunity();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<CreateTemplateRequest>({
        name: '',
        type: 'email',
        subject: '',
        content: ''
    });

    useEffect(() => {
        if (templateId && activeCommunity) {
            loadTemplate();
        } else if (activeCommunity) {
            setFormData(prev => ({
                ...prev,
                content: generateCommunicationTemplate(activeCommunity)
            }));
        }
    }, [templateId, activeCommunity]);

    const loadTemplate = async () => {
        if (!activeCommunity || !templateId) return;

        setLoading(true);
        setError(null);
        try {
            const data = await CommunicationService.getTemplate(activeCommunity.id, templateId);
            setFormData({
                name: data.name,
                type: data.type,
                subject: data.subject,
                content: data.content || generateCommunicationTemplate(activeCommunity)
            });
        } catch (err: any) {
            console.error('Erro ao carregar template:', err);
            setError('Erro ao carregar template');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeCommunity) return;

        setLoading(true);
        setError(null);
        try {
            let processedContent = generateCommunicationTemplate(activeCommunity);
            processedContent = processedContent.replace('[ASSUNTO]', formData.subject);
            processedContent = processedContent.replace('[CONTEUDO]', formData.content);

            const dataToSubmit = {
                ...formData,
                content: processedContent
            };

            if (templateId) {
                await CommunicationService.updateTemplate(activeCommunity.id, templateId, dataToSubmit);
            } else {
                await CommunicationService.createTemplate(activeCommunity.id, dataToSubmit);
            }
            navigate('/communications/templates');
        } catch (err: any) {
            console.error('Erro ao salvar template:', err);
            setError(err.response?.data?.error || 'Erro ao salvar template');
        } finally {
            setLoading(false);
        }
    };

    const handleTextChange = (field: keyof CreateTemplateRequest) => (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

    const handleSelectChange = (field: keyof CreateTemplateRequest) => (
        event: SelectChangeEvent
    ) => {
        setFormData(prev => ({ ...prev, [field]: event.target.value }));
    };

    if (!activeCommunity) {
        return (
            <Box>
                <Typography>Selecione uma comunidade para gerenciar os templates.</Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                {templateId ? 'Editar Template' : 'Novo Template'}
            </Typography>

            {error && (
                <Box sx={{ mb: 2 }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            )}

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardContent>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nome"
                                    value={formData.name}
                                    onChange={handleTextChange('name')}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Tipo</InputLabel>
                                    <Select
                                        value={formData.type}
                                        onChange={handleSelectChange('type')}
                                        label="Tipo"
                                    >
                                        <MenuItem value="email">E-mail</MenuItem>
                                        <MenuItem value="sms">SMS</MenuItem>
                                        <MenuItem value="whatsapp">WhatsApp</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Assunto"
                                    value={formData.subject}
                                    onChange={handleTextChange('subject')}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
                                    <CKEditor
                                        editor={ClassicEditor}
                                        config={CKEDITOR_CONFIG}
                                        data={formData.content}
                                        onChange={(event, editor) => {
                                            const data = editor.getData();
                                            setFormData(prev => ({ ...prev, content: data }));
                                        }}
                                    />
                                </Box>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : 'Salvar'}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/communications/templates')}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </form>
        </Box>
    );
};

export default TemplateForm; 