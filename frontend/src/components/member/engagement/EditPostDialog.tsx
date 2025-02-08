import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Grid,
  Typography,
  InputAdornment,
} from '@mui/material';
import { Close as CloseIcon, Delete as DeleteIcon, PhotoCamera, EmojiEmotions } from '@mui/icons-material';
import { Post } from '../../../services/member/engagement';
import { formatImageUrl } from '../../../config/api';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface EditPostDialogProps {
  post: Post;
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Post> | FormData) => Promise<void>;
}

const EditPostDialog: React.FC<EditPostDialogProps> = ({ post, open, onClose, onSubmit }) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [loading, setLoading] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>(post.images || []);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<'title' | 'content' | null>(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
      setCurrentImages(post.images || []);
      setNewImages([]);
      setPreviewUrls([]);
      setShowEmojiPicker(null);
    }
  }, [post]);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewImages(prev => [...prev, ...files]);
    
    // Criar URLs de preview para as novas imagens
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveCurrentImage = (index: number) => {
    setCurrentImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    URL.revokeObjectURL(previewUrls[index]); // Limpar URL do preview
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (field: 'title' | 'content') => (emojiData: EmojiClickData) => {
    if (field === 'title') {
      setTitle(prev => prev + emojiData.emoji);
    } else {
      setContent(prev => prev + emojiData.emoji);
    }
    setShowEmojiPicker(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('type', post.type);
      
      // Adicionar imagens existentes que não foram removidas
      if (currentImages.length > 0) {
        formData.append('existing_images', JSON.stringify(currentImages));
      }

      // Adicionar novas imagens
      if (newImages.length > 0) {
        newImages.forEach(file => {
          formData.append('images', file);
        });
      }

      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Error updating post:', err);
      setError(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          Editar Publicação
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3}>
            <Box position="relative">
              <TextField
                fullWidth
                label="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowEmojiPicker('title')}>
                        <EmojiEmotions />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {showEmojiPicker === 'title' && (
                <Box
                  position="absolute"
                  zIndex={1000}
                  bgcolor="background.paper"
                  boxShadow={3}
                  borderRadius={1}
                  right={0}
                  mt={1}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick('title')} />
                </Box>
              )}
            </Box>

            <Box position="relative">
              <TextField
                fullWidth
                label="Conteúdo"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                multiline
                rows={4}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowEmojiPicker('content')}>
                        <EmojiEmotions />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {showEmojiPicker === 'content' && (
                <Box
                  position="absolute"
                  zIndex={1000}
                  bgcolor="background.paper"
                  boxShadow={3}
                  borderRadius={1}
                  right={0}
                  mt={1}
                >
                  <EmojiPicker onEmojiClick={handleEmojiClick('content')} />
                </Box>
              )}
            </Box>

            <Box>
              <input
                type="file"
                accept="image/*"
                multiple
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImageSelect}
              />
              <Button
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
              >
                Adicionar Novas Imagens
              </Button>
            </Box>

            {currentImages.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Imagens Atuais
                </Typography>
                <Grid container spacing={1}>
                  {currentImages.map((image, index) => (
                    <Grid item xs={4} key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '100%',
                          '& img': {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                          },
                        }}
                      >
                        <img src={formatImageUrl(image)} alt={`Imagem ${index + 1}`} />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' },
                          }}
                          onClick={() => handleRemoveCurrentImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {previewUrls.length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Novas Imagens
                </Typography>
                <Grid container spacing={1}>
                  {previewUrls.map((url, index) => (
                    <Grid item xs={4} key={index}>
                      <Box
                        sx={{
                          position: 'relative',
                          paddingTop: '100%',
                          '& img': {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            borderRadius: 1,
                          },
                        }}
                      >
                        <img src={url} alt={`Nova Imagem ${index + 1}`} />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'background.paper',
                            '&:hover': { bgcolor: 'background.paper' },
                          }}
                          onClick={() => handleRemoveNewImage(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading || !title.trim() || !content.trim()}
          >
            Salvar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditPostDialog; 