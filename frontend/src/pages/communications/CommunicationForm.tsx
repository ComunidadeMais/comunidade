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
  SelectChangeEvent,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { CommunicationService } from '../../services/communication';
import { useCommunity } from '../../contexts/CommunityContext';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import type { Editor } from '@ckeditor/ckeditor5-core';
import { CKEDITOR_CONFIG, DEFAULT_TEMPLATE } from '../../config/communicationEditor';
import { CommunicationType, RecipientType } from '../../types/communication';
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

export default function CommunicationForm() {
  const navigate = useNavigate();
  const { communicationId } = useParams();
  const { activeCommunity } = useCommunity();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [editorReady, setEditorReady] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  const [formData, setFormData] = useState({
    type: 'email' as CommunicationType,
    subject: '',
    content: '',
    recipient_type: 'member' as RecipientType,
    recipient_id: '',
  });

  useEffect(() => {
    if (activeCommunity && communicationId) {
      loadCommunication();
    }
  }, [activeCommunity, communicationId]);

  useEffect(() => {
    if (activeCommunity) {
      loadRecipientOptions();
    }
  }, [activeCommunity, formData.recipient_type]);

  useEffect(() => {
    if (editorRef.current && !communicationId) {
      editorRef.current.setData('');
      setEditorContent('');
    }
  }, [editorReady]);

  const loadCommunication = async () => {
    if (!activeCommunity || !communicationId) return;

    try {
      setLoading(true);
      const communication = await CommunicationService.getCommunication(activeCommunity.id, communicationId);
      
      if (communication) {
        setFormData({
          type: communication.type || 'email',
          subject: communication.subject || '',
          content: communication.content || '',
          recipient_type: communication.recipient_type || 'member',
          recipient_id: communication.recipient_id || '',
        });
        
        if (editorRef.current) {
          const content = extractContentFromTemplate(communication.content);
          editorRef.current.setData(content);
          setEditorContent(content);
        }
      }
    } catch (err: any) {
      setError('Erro ao carregar dados da comunicação');
    } finally {
      setLoading(false);
    }
  };

  const extractContentFromTemplate = (htmlContent: string): string => {
    if (!htmlContent) return '';
    
    const match = htmlContent.match(/<div style="color: #757575; line-height: 1.6;">(.*?)<\/div>/s);
    return match ? match[1].trim() : htmlContent;
  };

  const loadRecipientOptions = async () => {
    if (!activeCommunity) return;

    try {
      switch (formData.recipient_type) {
        case 'member':
          const { members } = await MemberService.listMembers(activeCommunity.id);
          setMembers(members || []);
          break;
        case 'family':
          const families = await FamilyService.listFamilies(activeCommunity.id);
          console.log('Famílias carregadas:', families);
          setFamilies(families || []);
          break;
        case 'group':
          const { groups } = await GroupService.listGroups(activeCommunity.id);
          setGroups(groups || []);
          break;
      }
    } catch (err) {
      console.error('Erro ao carregar opções:', err);
      setError('Erro ao carregar opções de destinatário');
      setMembers([]);
      setFamilies([]);
      setGroups([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommunity) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const finalContent = DEFAULT_TEMPLATE
        .replace('[CONTEUDO]', editorContent)
        .replace(/\[COMUNIDADE_NOME\]/g, activeCommunity.name)
        .replace('[ASSUNTO]', formData.subject);

      const payload = {
        ...formData,
        content: finalContent,
        title: '',
      };

      if (communicationId) {
        await CommunicationService.updateCommunication(activeCommunity.id, communicationId, payload);
        setSuccess('Comunicação atualizada com sucesso!');
      } else {
        await CommunicationService.createCommunication(activeCommunity.id, payload);
        setSuccess('Comunicação criada com sucesso!');
      }
      navigate('/communications');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar comunicação');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!activeCommunity) {
    return (
      <Container maxWidth="lg">
        <Alert severity="warning" sx={{ mt: 4 }}>
          Selecione uma comunidade para gerenciar comunicações
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
              onClick={() => navigate('/communications')}
            >
              Voltar
            </Button>
            <Typography variant="h4" component="h1">
              {communicationId ? 'Editar Comunicação' : 'Nova Comunicação'}
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
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo</InputLabel>
                    <Select
                      name="type"
                      value={formData.type}
                      onChange={handleSelectChange}
                      label="Tipo"
                    >
                      <MenuItem value="email">E-mail</MenuItem>
                      <MenuItem value="sms">SMS</MenuItem>
                      <MenuItem value="whatsapp">WhatsApp</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    label="Assunto"
                    name="subject"
                    value={formData.subject}
                    onChange={handleTextChange}
                    required
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Tipo de Destinatário</InputLabel>
                    <Select
                      name="recipient_type"
                      value={formData.recipient_type}
                      onChange={handleSelectChange}
                      label="Tipo de Destinatário"
                    >
                      <MenuItem value="member">Membro</MenuItem>
                      <MenuItem value="family">Família</MenuItem>
                      <MenuItem value="group">Grupo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={8}>
                  <FormControl fullWidth>
                    <InputLabel>{formData.recipient_type === 'member' ? 'Membro' : formData.recipient_type === 'family' ? 'Família' : 'Grupo'}</InputLabel>
                    <Select
                      name="recipient_id"
                      value={formData.recipient_id}
                      onChange={handleSelectChange}
                      label={formData.recipient_type === 'member' ? 'Membro' : formData.recipient_type === 'family' ? 'Família' : 'Grupo'}
                    >
                      {formData.recipient_type === 'member' && members.map(member => (
                        <MenuItem key={member.id} value={member.id}>
                          {member.name}
                        </MenuItem>
                      ))}
                      {formData.recipient_type === 'family' && families.map(family => (
                        <MenuItem key={family.id} value={family.id}>
                          {family.name}
                        </MenuItem>
                      ))}
                      {formData.recipient_type === 'group' && groups.map(group => (
                        <MenuItem key={group.id} value={group.id}>
                          {group.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Conteúdo
                    </Typography>
                    <CKEditor
                      editor={ClassicEditor}
                      config={CKEDITOR_CONFIG}
                      data={formData.content}
                      onReady={(editor: Editor) => {
                        editorRef.current = editor;
                        setEditorReady(true);
                      }}
                      onChange={(_event: any, editor: Editor) => {
                        const data = editor.getData();
                        setEditorContent(data);
                      }}
                      onError={(error: Error, { phase }: { phase: string }) => {
                        console.error(`CKEditor error (${phase}):`, error);
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
} 