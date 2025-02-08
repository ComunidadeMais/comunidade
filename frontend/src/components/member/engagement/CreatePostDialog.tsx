import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Grid,
  Typography,
  InputAdornment,
} from '@mui/material';
import { PhotoCamera, Close as CloseIcon, EmojiEmotions } from '@mui/icons-material';
import { Post } from '../../../services/member/engagement';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface CreatePostDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Post> & { imageFiles?: File[] }) => void;
}

const CreatePostDialog: React.FC<CreatePostDialogProps> = ({ open, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Post['type']>('post');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<'title' | 'content' | null>(null);

  const handleClose = () => {
    setTitle('');
    setContent('');
    setType('post');
    setSelectedImages([]);
    setPreviewUrls([]);
    setShowEmojiPicker(null);
    onClose();
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedImages(prev => [...prev, ...files]);
    
    // Criar URLs de preview para as imagens selecionadas
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
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

  const handleSubmit = () => {
    onSubmit({
      title,
      content,
      type,
      imageFiles: selectedImages
    });
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Publicação</DialogTitle>
      <DialogContent>
        <Box pt={2} display="flex" flexDirection="column" gap={2}>
          <FormControl fullWidth>
            <InputLabel>Tipo</InputLabel>
            <Select
              value={type}
              label="Tipo"
              onChange={(e) => setType(e.target.value as Post['type'])}
            >
              <MenuItem value="post">Post</MenuItem>
              <MenuItem value="announcement">Anúncio</MenuItem>
              <MenuItem value="devotional">Devocional</MenuItem>
            </Select>
          </FormControl>

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
              Adicionar Imagens
            </Button>
          </Box>

          {previewUrls.length > 0 && (
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
                    <img src={url} alt={`Preview ${index + 1}`} />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'background.paper',
                        '&:hover': { bgcolor: 'background.paper' },
                      }}
                      onClick={() => handleRemoveImage(index)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={!title.trim() || !content.trim()}
        >
          Publicar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePostDialog; 