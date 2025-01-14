import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
  Alert,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  CloudUpload as CloudUploadIcon
} from '@mui/icons-material';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { EventService } from '../../services/event';
import { useCommunity } from '../../contexts/CommunityContext';
import { EventType } from '../../types/event';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { Editor } from '@ckeditor/ckeditor5-core';
import { CKEDITOR_CONFIG, DEFAULT_TEMPLATE } from '../../config/editor';
import { uploadImage } from '../../services/upload';
import { User } from '../../types/user';
import { API_BASE_URL } from '../../services/api';
import { useUsers } from '../../contexts/UsersContext';

interface LocationState {
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function EventForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId } = useParams();
  const { activeCommunity } = useCommunity();
  const { users, loading: loadingUsers } = useUsers();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const editorRef = useRef<Editor | null>(null);
  
  const locationState = location.state as LocationState;
  
  const [formData, setFormData] = useState({
    community_id: '',
    title: '',
    description: '',
    location: '',
    start_date: locationState?.defaultStartDate ? dayjs(locationState.defaultStartDate).format('YYYY-MM-DDTHH:mm') : '',
    end_date: locationState?.defaultEndDate ? dayjs(locationState.defaultEndDate).format('YYYY-MM-DDTHH:mm') : '',
    type: EventType.SERVICE,
    recurrence: 'none',
    responsible_id: '',
    image_url: '',
    html_template: '',
  });

  const processTemplate = (template: string) => {
    // Encontra o usuário responsável
    const responsibleUser = users?.find(u => u.id === formData.responsible_id);
    
    // Formata as datas usando dayjs
    const formattedStartDate = formData.start_date 
      ? dayjs(formData.start_date).locale('pt-br').format('DD [de] MMMM [de] YYYY [às] HH:mm')
      : '';
    const formattedEndDate = formData.end_date
      ? dayjs(formData.end_date).locale('pt-br').format('DD [de] MMMM [de] YYYY [às] HH:mm')
      : '';

    // Tenta obter a URL do banner da comunidade
    const bannerPath = activeCommunity?.banner_url || activeCommunity?.banner || '';
    const bannerUrl = bannerPath ? `http://localhost:8080/uploads/${bannerPath}` : '';

    const imageUrl = formData.image_url ? `http://localhost:8080/uploads/${formData.image_url}` : '';

    const replacements = {
      '[LOGO_URL]': bannerUrl,
      '[COMUNIDADE_NOME]': activeCommunity?.name || '',
      '[TITULO]': formData.title || '',
      '[IMAGEM_URL]': imageUrl,
      '[DATA_INICIO]': formattedStartDate,
      '[DATA_FIM]': formattedEndDate,
      '[LOCAL]': formData.location || '',
      '[DESCRICAO]': formData.description || '',
      '[RESPONSAVEL_NOME]': responsibleUser?.name || '',
      '[RESPONSAVEL_EMAIL]': responsibleUser?.email || ''
    };

    let processedTemplate = template;
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      processedTemplate = processedTemplate.replace(regex, value);
    });

    return processedTemplate;
  };

  useEffect(() => {
    if (activeCommunity) {
      setFormData(prev => ({
        ...prev,
        community_id: activeCommunity.id
      }));
      if (eventId) {
        loadEvent();
      }
    }
  }, [activeCommunity, eventId]);

  // Atualiza o template quando os dados mudarem
  useEffect(() => {
    const updateTemplate = () => {
      if (editorRef.current) {
        const processedTemplate = processTemplate(DEFAULT_TEMPLATE);
        
        // Só atualiza se houver mudanças
        const currentContent = editorRef.current.getData();
        if (currentContent !== processedTemplate) {
          editorRef.current.setData(processedTemplate);
        }
      }
    };

    // Aguarda um pequeno intervalo para garantir que o editor está pronto
    const timeoutId = setTimeout(updateTemplate, 100);
    return () => clearTimeout(timeoutId);
  }, [
    formData.title,
    formData.description,
    formData.location,
    formData.start_date,
    formData.end_date,
    formData.responsible_id,
    formData.image_url,
    activeCommunity?.banner,
    activeCommunity?.banner_url,
    activeCommunity?.name,
    users
  ]);

  const loadEvent = async () => {
    if (!activeCommunity || !eventId) return;

    try {
      setLoading(true);
      const event = await EventService.getEvent(activeCommunity.id, eventId);
      
      if (event) {
        const newFormData = {
          community_id: event.community_id,
          title: event.title || '',
          description: event.description || '',
          location: event.location || '',
          start_date: dayjs(event.start_date).format('YYYY-MM-DDTHH:mm'),
          end_date: dayjs(event.end_date).format('YYYY-MM-DDTHH:mm'),
          type: event.type || EventType.SERVICE,
          recurrence: event.recurrence || 'none',
          responsible_id: event.responsible_id || '',
          image_url: event.image_url || '',
          html_template: event.html_template || DEFAULT_TEMPLATE,
        };
        setFormData(newFormData);
        
        // Atualiza o template assim que o editor estiver pronto
        if (editorRef.current) {
          const processedTemplate = processTemplate(event.html_template || DEFAULT_TEMPLATE);
          editorRef.current.setData(processedTemplate);
        }
      }
    } catch (err: any) {
      setError('Erro ao carregar dados do evento');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;

    if (!formData.description.trim()) {
      setError('A descrição é obrigatória');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const processedTemplate = processTemplate(DEFAULT_TEMPLATE);

      const payload = {
        ...formData,
        community_id: activeCommunity.id,
        start_date: dayjs(formData.start_date).format('YYYY-MM-DDTHH:mm:00Z'),
        end_date: dayjs(formData.end_date).format('YYYY-MM-DDTHH:mm:00Z'),
        description: formData.description.trim(),
        html_template: processedTemplate,
        image_url: formData.image_url
      };

      if (eventId) {
        await EventService.updateEvent(activeCommunity.id, eventId, payload);
        setSuccess('Evento atualizado com sucesso!');
      } else {
        await EventService.createEvent(payload);
        setSuccess('Evento criado com sucesso!');
      }
      navigate('/events');
    } catch (err: any) {
      setError(err.response?.data?.details || err.response?.data?.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeCommunity) {
      try {
        setLoading(true);
        setSelectedImage(e.target.files[0]);
        
        // Upload da imagem usando o serviço de eventos
        const imageUrl = await EventService.uploadImage(activeCommunity.id, eventId || null, e.target.files[0]);
        
        // Atualiza o formData com a URL da imagem
        setFormData(prev => ({
          ...prev,
          image_url: imageUrl
        }));

        // Força a atualização do template com a nova imagem
        if (editorRef.current) {
          const processedTemplate = processTemplate(DEFAULT_TEMPLATE);
          editorRef.current.setData(processedTemplate);
        }

        setSuccess('Imagem carregada com sucesso!');
      } catch (err: any) {
        setError(err.message || 'Erro ao fazer upload da imagem');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTemplateChange = (content: string) => {
    setFormData(prev => ({
      ...prev,
      html_template: content
    }));
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar eventos
        </Alert>
      </Container>
    );
  }

  if (loadingUsers) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography>Carregando usuários...</Typography>
        </Box>
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
              onClick={() => navigate('/events')}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              {eventId ? 'Editar Evento' : 'Novo Evento'}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSubmit}
            disabled={loading}
          >
            Salvar
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Título"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Local"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Data de Início"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Data de Término"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="type-label">Tipo</InputLabel>
                    <Select
                      labelId="type-label"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      label="Tipo"
                      required
                    >
                      <MenuItem value={EventType.CULTO}>Culto</MenuItem>
                      <MenuItem value={EventType.SERVICE}>Serviço</MenuItem>
                      <MenuItem value={EventType.CLASS}>Aula</MenuItem>
                      <MenuItem value={EventType.MEETING}>Reunião</MenuItem>
                      <MenuItem value={EventType.VISIT}>Visita</MenuItem>
                      <MenuItem value={EventType.OTHER}>Outros</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="recurrence-label">Recorrência</InputLabel>
                    <Select
                      labelId="recurrence-label"
                      name="recurrence"
                      value={formData.recurrence}
                      onChange={handleChange}
                      label="Recorrência"
                      required
                    >
                      <MenuItem value="none">Nenhuma</MenuItem>
                      <MenuItem value="daily">Diária</MenuItem>
                      <MenuItem value="weekly">Semanal</MenuItem>
                      <MenuItem value="monthly">Mensal</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="responsible-label">Responsável</InputLabel>
                    <Select
                      labelId="responsible-label"
                      name="responsible_id"
                      value={formData.responsible_id}
                      onChange={handleChange}
                      label="Responsável"
                      required
                    >
                      {users?.map((user: User) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-upload"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUploadIcon />}
                    >
                      Upload Imagem
                    </Button>
                  </label>
                  {selectedImage && (
                    <Box mt={2}>
                      <img
                        src={URL.createObjectURL(selectedImage)}
                        alt="Preview"
                        style={{ maxWidth: '200px' }}
                      />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Template HTML do Evento
                  </Typography>
                  <CKEditor
                    editor={ClassicEditor}
                    config={CKEDITOR_CONFIG}
                    data={processTemplate(DEFAULT_TEMPLATE)}
                    onReady={(editor: Editor) => {
                      editorRef.current = editor;
                    }}
                    onChange={(_event: any, editor: Editor) => {
                      const data = editor.getData();
                      handleTemplateChange(data);
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descrição"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    multiline
                    rows={4}
                    required
                  />
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 