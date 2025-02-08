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

  useEffect(() => {
    if (currentCommunity?.id) {
      loadPosts();
    }
  }, [currentCommunity]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!currentCommunity?.id) {
        throw new Error('ID da comunidade não encontrado');
      }

      const response = await engagementService.listPosts(currentCommunity.id);
      setPosts(response.posts || []);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      setError('Não foi possível carregar os posts. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

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

  const handleCreateComment = async (postId: string) => {
    try {
      if (!currentCommunity?.id || !currentUser?.id || !comment.trim()) {
        return;
      }

      await engagementService.createComment(currentCommunity.id, postId, {
        content: comment,
        authorId: currentUser.id,
        postId: postId,
      });
      setComment('');
      loadPosts();
    } catch (error) {
      console.error('Erro ao criar comentário:', error);
      setError('Não foi possível criar o comentário. Tente novamente mais tarde.');
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
        {/* Header do Feed */}
        <Box
          sx={{
            position: 'sticky',
            top: 64,
            zIndex: 1,
            bgcolor: 'background.default',
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" component="h1" fontWeight="bold">
              Feed da Comunidade
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                boxShadow: theme.shadows[4],
              }}
            >
              Nova Publicação
            </Button>
          </Box>
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
                      <Box display="flex" width="100%" gap={2} alignItems="center">
                        <Avatar
                          src={formatImageUrl(currentUser?.photo)}
                          sx={{ width: 36, height: 36 }}
                        >
                          {currentUser?.name?.[0]}
                        </Avatar>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Escreva um comentário..."
                          value={selectedPost === post.id ? comment : ''}
                          onChange={(e) => {
                            setSelectedPost(post.id);
                            setComment(e.target.value);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCreateComment(post.id);
                            }
                          }}
                          InputProps={{
                            sx: {
                              borderRadius: 3,
                              bgcolor: alpha(theme.palette.primary.main, 0.04),
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                              },
                            },
                            endAdornment: (
                              <IconButton size="small">
                                <EmojiIcon />
                              </IconButton>
                            ),
                          }}
                        />
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={!comment.trim() || selectedPost !== post.id}
                          onClick={() => handleCreateComment(post.id)}
                          sx={{
                            borderRadius: 3,
                            minWidth: 100,
                          }}
                        >
                          Comentar
                        </Button>
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