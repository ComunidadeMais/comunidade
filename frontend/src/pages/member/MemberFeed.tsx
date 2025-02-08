import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  IconButton,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Menu,
  MenuItem,
  Fade,
  Chip,
  Tooltip,
  Badge,
  useTheme,
  alpha,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Favorite as LikeIcon,
  FavoriteBorder as LikeOutlinedIcon,
  Comment as CommentIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  EmojiEmotions as EmojiIcon,
  Sync as SyncIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MemberLayout from '../../layouts/MemberLayout';
import { useAuth } from '../../contexts/AuthContext';
import engagementService, { Post, Comment } from '../../services/member/engagement';
import CreatePostDialog from '../../components/member/engagement/CreatePostDialog';
import { formatImageUrl } from '../../config/api';
import ImageViewerDialog from '../../components/member/engagement/ImageViewerDialog';
import EditPostDialog from '../../components/member/engagement/EditPostDialog';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { usePolling } from '../../hooks/usePolling';

const MemberFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [menuAnchorElMap, setMenuAnchorElMap] = useState<Record<string, HTMLElement | null>>({});
  const { currentCommunity, currentUser } = useAuth();
  const theme = useTheme();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<Post | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState<{ [key: string]: boolean }>({});
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  const loadPosts = async () => {
    try {
      if (!currentCommunity?.id) {
        throw new Error('ID da comunidade não encontrado');
      }

      const response = await engagementService.listPosts(currentCommunity.id);
      setPosts(response.posts || []);
      setError(null); // Limpa qualquer erro anterior em caso de sucesso
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Não foi possível carregar as publicações. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  // Carregamento inicial dos posts
  useEffect(() => {
    loadPosts();
  }, [currentCommunity?.id]);

  // Configuração do polling automático
  const { startPolling, stopPolling } = usePolling(loadPosts, {
    interval: 30000, // 30 segundos
    enabled: true,   // Sempre ativado
    backoffFactor: 2,
    maxBackoff: 300000 // 5 minutos
  });

  useEffect(() => {
    startPolling(); // Inicia o polling automaticamente
    return () => stopPolling(); // Limpa ao desmontar o componente
  }, [startPolling, stopPolling]);

  const handleCreatePost = async (data: Partial<Post> & { imageFiles?: File[] }) => {
    try {
      if (!currentCommunity?.id || !currentUser?.id) {
        console.error('Dados necessários não encontrados:', {
          communityId: currentCommunity?.id,
          userId: currentUser?.id
        });
        throw new Error('ID da comunidade ou membro não encontrado');
      }

      const formData = new FormData();
      formData.append('title', data.title || '');
      formData.append('content', data.content || '');
      formData.append('type', data.type || 'post');

      // Adiciona as imagens ao FormData
      if (data.imageFiles) {
        data.imageFiles.forEach((file, index) => {
          formData.append(`images`, file);
        });
      }

      await engagementService.createPost(currentCommunity.id, formData);
      setOpenCreateDialog(false);
      loadPosts();
    } catch (error) {
      console.error('Erro ao criar post:', error);
      setError('Não foi possível criar o post. Tente novamente mais tarde.');
    }
  };

  const handleEmojiClick = (postId: string) => (emojiData: EmojiClickData) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: (prev[postId] || '') + emojiData.emoji
    }));
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentText(prev => ({
      ...prev,
      [postId]: value
    }));
  };

  const handleCreateComment = async (postId: string) => {
    try {
      await engagementService.createComment(currentCommunity!.id, postId, {
        content: commentText[postId]
      });
      
      // Limpar o comentário após enviar
      setCommentText(prev => ({
        ...prev,
        [postId]: ''
      }));
      
      // Recarregar os posts para mostrar o novo comentário
      await loadPosts();
    } catch (error) {
      console.error('Error creating comment:', error);
      setError('Failed to create comment');
    }
  };

  const handleReaction = async (postId: string, type: 'like' | 'love' | 'pray' | 'celebrate') => {
    try {
      if (!currentCommunity?.id) {
        return;
      }

      await engagementService.createReaction(currentCommunity.id, postId, type);
      loadPosts();
    } catch (error) {
      console.error('Erro ao reagir ao post:', error);
      setError('Não foi possível reagir ao post. Tente novamente mais tarde.');
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      if (!currentCommunity?.id) {
        return;
      }

      await engagementService.deletePost(currentCommunity.id, postId);
      loadPosts();
      setMenuAnchorElMap(prev => ({ ...prev, [postId]: null }));
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      setError('Não foi possível deletar o post. Tente novamente mais tarde.');
    }
  };

  const handleEditPost = async (postId: string, data: Partial<Post> | FormData) => {
    try {
      if (!currentCommunity) {
        setError('Community not found');
        return;
      }
      const updatedPost = await engagementService.updatePost(currentCommunity.id, postId, data);
      setPosts(posts.map(post => post.id === postId ? updatedPost : post));
      setPostToEdit(null);
    } catch (error) {
      console.error('Error updating post:', error);
      setError('Failed to update post');
    }
  };

  const formatPostDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "PPp", { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, postId: string) => {
    setMenuAnchorElMap(prev => ({ ...prev, [postId]: event.currentTarget }));
  };

  const handleMenuClose = (postId: string) => {
    setMenuAnchorElMap(prev => ({ ...prev, [postId]: null }));
  };

  // Novo estilo para o card do post
  const postCardStyle = {
    borderRadius: 2,
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
    },
  };

  // Estilo para o botão de ação
  const actionButtonStyle = {
    borderRadius: 20,
    px: 2,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  };

  if (loading) {
    return (
      <MemberLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <Container 
        maxWidth={false} 
        sx={{ 
          maxWidth: theme.breakpoints.values.lg,
          m: 0,
          p: 0
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h4" component="h1" gutterBottom>
            Feed
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setOpenCreateDialog(true)}
            startIcon={<AddIcon />}
          >
            Nova Publicação
          </Button>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              my: 2,
              borderRadius: 2,
              boxShadow: theme.shadows[2],
            }}
          >
            {error}
          </Alert>
        )}

        {/* Lista de Posts */}
        <AnimatePresence>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {posts.map((post) => (
              <Grid item xs={12} key={post.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card sx={postCardStyle}>
                    <CardContent>
                      {/* Cabeçalho do Post */}
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            src={formatImageUrl(post.author?.photo)}
                            sx={{ 
                              width: 48, 
                              height: 48,
                              border: 2,
                              borderColor: 'primary.main',
                            }}
                          >
                            {post.author?.name?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {post.author?.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatPostDate(post.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                        {post.authorId === currentUser?.id && (
                          <Box>
                            <IconButton onClick={(e) => handleMenuOpen(e, post.id)}>
                              <MoreIcon />
                            </IconButton>
                            <Menu
                              anchorEl={menuAnchorElMap[post.id]}
                              open={Boolean(menuAnchorElMap[post.id])}
                              onClose={() => handleMenuClose(post.id)}
                              TransitionComponent={Fade}
                            >
                              <MenuItem onClick={() => {
                                setPostToEdit(post);
                                setEditDialogOpen(true);
                                handleMenuClose(post.id);
                              }}>
                                Editar
                              </MenuItem>
                              <MenuItem 
                                onClick={() => {
                                  handleDeletePost(post.id);
                                  handleMenuClose(post.id);
                                }}
                                sx={{ color: 'error.main' }}
                              >
                                Excluir
                              </MenuItem>
                            </Menu>
                          </Box>
                        )}
                      </Box>

                      {/* Tipo do Post */}
                      <Chip
                        label={post.type === 'announcement' ? 'Anúncio' : 
                               post.type === 'devotional' ? 'Devocional' : 'Post'}
                        size="small"
                        color={post.type === 'announcement' ? 'error' : 
                               post.type === 'devotional' ? 'success' : 'primary'}
                        sx={{ mb: 2 }}
                      />

                      {/* Conteúdo do Post */}
                      <Typography variant="h6" gutterBottom fontWeight="medium">
                        {post.title}
                      </Typography>
                      <Typography variant="body1" paragraph>
                        {post.content}
                      </Typography>

                      {/* Imagens do Post */}
                      {post.images && post.images.length > 0 && (
                        <Box sx={{ mt: 2, mb: 2 }}>
                          <Grid container spacing={1}>
                            {post.images.map((image, index) => (
                              <Grid item xs={12} sm={6} md={4} key={index}>
                                <Box
                                  sx={{
                                    position: 'relative',
                                    paddingTop: '75%',
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    '&:hover': {
                                      '& img': {
                                        transform: 'scale(1.05)',
                                      },
                                      '& .overlay': {
                                        opacity: 1,
                                      },
                                    },
                                  }}
                                  onClick={() => {
                                    setSelectedImages((post.images ?? []).map(img => formatImageUrl(img)));
                                    setSelectedImageIndex(index);
                                    setImageViewerOpen(true);
                                  }}
                                >
                                  <img
                                    src={formatImageUrl(image)}
                                    alt={`Imagem ${index + 1}`}
                                    style={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      width: '100%',
                                      height: '100%',
                                      objectFit: 'cover',
                                      transition: 'transform 0.3s ease',
                                    }}
                                  />
                                  <Box
                                    className="overlay"
                                    sx={{
                                      position: 'absolute',
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      bgcolor: 'rgba(0,0,0,0.3)',
                                      opacity: 0,
                                      transition: 'opacity 0.3s ease',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Typography color="white" variant="body2">
                                      Ver imagem
                                    </Typography>
                                  </Box>
                                </Box>
                              </Grid>
                            ))}
                          </Grid>
                        </Box>
                      )}

                      {/* Ações do Post */}
                      <Box display="flex" alignItems="center" gap={2} mt={2}>
                        <Tooltip title="Curtir">
                          <IconButton
                            color={post.likes > 0 ? "primary" : "default"}
                            onClick={() => handleReaction(post.id, 'like')}
                            sx={{
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <Badge badgeContent={post.likes} color="primary">
                              {post.likes > 0 ? <LikeIcon /> : <LikeOutlinedIcon />}
                            </Badge>
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Comentar">
                          <IconButton
                            color="default"
                            onClick={() => {
                              setSelectedPost(post.id);
                            }}
                            sx={{
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <Badge badgeContent={post.comments?.length || 0} color="primary">
                              <CommentIcon />
                            </Badge>
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Compartilhar">
                          <IconButton
                            sx={{
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <ShareIcon />
                          </IconButton>
                        </Tooltip>

                        <Box flexGrow={1} />

                        <Tooltip title="Salvar">
                          <IconButton
                            sx={{
                              transition: 'transform 0.2s',
                              '&:hover': {
                                transform: 'scale(1.1)',
                              },
                            }}
                          >
                            <BookmarkBorderIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>

                    <Divider sx={{ my: 1 }} />

                    {/* Seção de Comentários */}
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom fontWeight="medium">
                        Comentários
                      </Typography>
                      <Box sx={{ maxHeight: 300, overflowY: 'auto', pr: 1 }}>
                        {post.comments?.map((comment) => (
                          <Box
                            key={comment.id}
                            sx={{
                              py: 1.5,
                              '&:not(:last-child)': {
                                borderBottom: 1,
                                borderColor: 'divider',
                              },
                            }}
                          >
                            <Box display="flex" alignItems="flex-start" gap={1.5}>
                              <Avatar
                                src={formatImageUrl(comment.author?.photo)}
                                sx={{ width: 32, height: 32 }}
                              >
                                {comment.author?.name?.[0]}
                              </Avatar>
                              <Box flex={1}>
                                <Box
                                  sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    p: 1.5,
                                    borderRadius: 2,
                                  }}
                                >
                                  <Typography variant="subtitle2" fontWeight="medium">
                                    {comment.author?.name}
                                  </Typography>
                                  <Typography variant="body2">
                                    {comment.content}
                                  </Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                                  {formatPostDate(comment.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>

                    {/* Campo de Comentário */}
                    <CardActions sx={{ p: 2, pt: 0 }}>
                      <Box 
                        display="flex" 
                        width="100%" 
                        gap={2} 
                        alignItems="flex-start"
                      >
                        <Avatar
                          src={formatImageUrl(currentUser?.photo)}
                          sx={{ width: 36, height: 36 }}
                        >
                          {currentUser?.name?.[0]}
                        </Avatar>
                        <Box flexGrow={1}>
                          <Box display="flex" gap={1} alignItems="flex-start">
                            <TextField
                              fullWidth
                              size="small"
                              placeholder="Escreva um comentário..."
                              value={commentText[post.id] || ''}
                              onChange={(e) => handleCommentChange(post.id, e.target.value)}
                              InputProps={{
                                sx: {
                                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                  },
                                  borderRadius: 2,
                                },
                                endAdornment: (
                                  <IconButton 
                                    size="small" 
                                    onClick={() => setShowEmojiPicker(prev => ({
                                      ...prev,
                                      [post.id]: !prev[post.id]
                                    }))}
                                  >
                                    <EmojiIcon />
                                  </IconButton>
                                )
                              }}
                            />
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleCreateComment(post.id)}
                              disabled={!commentText[post.id]?.trim()}
                              sx={{
                                height: 40,
                                px: 3,
                                borderRadius: 2,
                                textTransform: 'none',
                                fontWeight: 500,
                                boxShadow: 'none',
                                '&:hover': {
                                  boxShadow: 'none',
                                  bgcolor: theme.palette.primary.dark,
                                },
                              }}
                            >
                              Comentar
                            </Button>
                          </Box>
                          
                          {/* Emoji Picker */}
                          {showEmojiPicker[post.id] && (
                            <Box
                              sx={{
                                position: 'absolute',
                                zIndex: 1,
                                mt: 1
                              }}
                            >
                              <Box
                                sx={{
                                  position: 'fixed',
                                  top: 0,
                                  right: 0,
                                  bottom: 0,
                                  left: 0
                                }}
                                onClick={() => setShowEmojiPicker(prev => ({
                                  ...prev,
                                  [post.id]: false
                                }))}
                              />
                              <EmojiPicker onEmojiClick={handleEmojiClick(post.id)} />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardActions>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </AnimatePresence>

        {/* Diálogos */}
        <CreatePostDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          onSubmit={handleCreatePost}
        />

        {postToEdit && (
          <EditPostDialog
            open={editDialogOpen}
            onClose={() => {
              setEditDialogOpen(false);
              setPostToEdit(null);
            }}
            onSubmit={(data) => handleEditPost(postToEdit!.id, data)}
            post={postToEdit}
          />
        )}

        <ImageViewerDialog
          open={imageViewerOpen}
          onClose={() => setImageViewerOpen(false)}
          images={selectedImages}
          initialIndex={selectedImageIndex}
        />
      </Container>
    </MemberLayout>
  );
};

export default MemberFeed; 