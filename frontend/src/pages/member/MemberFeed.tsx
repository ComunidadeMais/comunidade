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
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Favorite as LikeIcon,
  FavoriteBorder as LikeOutlinedIcon,
  Comment as CommentIcon,
  MoreVert as MoreIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import MemberLayout from '../../layouts/MemberLayout';
import { useAuth } from '../../contexts/AuthContext';
import engagementService, { Post, Comment } from '../../services/member/engagement';
import CreatePostDialog from '../../components/member/engagement/CreatePostDialog';
import { formatImageUrl } from '../../config/api';
import ImageViewerDialog from '../../components/member/engagement/ImageViewerDialog';

const MemberFeed: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { currentCommunity, currentUser } = useAuth();
  const theme = useTheme();
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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
      setAnchorEl(null);
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      setError('Não foi possível deletar o post. Tente novamente mais tarde.');
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
            Feed da Comunidade
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
          >
            Nova Publicação
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {posts.map((post) => (
            <Grid item xs={12} key={post.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar src={formatImageUrl(post.author?.photo)}>
                        {post.author?.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {post.author?.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatPostDate(post.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                    {post.authorId === currentUser?.id && (
                      <>
                        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                          <MoreIcon />
                        </IconButton>
                        <Menu
                          anchorEl={anchorEl}
                          open={Boolean(anchorEl)}
                          onClose={() => setAnchorEl(null)}
                        >
                          <MenuItem onClick={() => handleDeletePost(post.id)}>
                            Excluir
                          </MenuItem>
                        </Menu>
                      </>
                    )}
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {post.content}
                  </Typography>

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
                                '&:hover': {
                                  '& img': {
                                    transform: 'scale(1.02)',
                                    transition: 'transform 0.2s',
                                  },
                                },
                                '& img': {
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  transition: 'transform 0.2s',
                                },
                              }}
                              onClick={() => {
                                setSelectedImages(post.images.map(img => formatImageUrl(img)));
                                setSelectedImageIndex(index);
                                setImageViewerOpen(true);
                              }}
                            >
                              <img src={formatImageUrl(image)} alt={`Imagem ${index + 1}`} />
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  )}

                  <Box display="flex" alignItems="center" gap={2}>
                    <IconButton
                      color={post.likes > 0 ? "primary" : "default"}
                      onClick={() => handleReaction(post.id, 'like')}
                    >
                      {post.likes > 0 ? <LikeIcon /> : <LikeOutlinedIcon />}
                    </IconButton>
                    <Typography variant="body2" color="text.secondary">
                      {post.likes} curtidas
                    </Typography>
                  </Box>
                </CardContent>

                <Divider />

                <CardContent>
                  <Typography variant="subtitle2" gutterBottom>
                    Comentários
                  </Typography>
                  {post.comments?.map((comment) => (
                    <Box key={comment.id} py={1}>
                      <Box display="flex" alignItems="flex-start" gap={2}>
                        <Avatar
                          src={formatImageUrl(comment.author?.photo)}
                          sx={{ width: 32, height: 32 }}
                        >
                          {comment.author?.name?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {comment.author?.name}
                          </Typography>
                          <Typography variant="body2">
                            {comment.content}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatPostDate(comment.createdAt)}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </CardContent>

                <CardActions>
                  <Box display="flex" width="100%" gap={2}>
                    <Avatar
                      src={formatImageUrl(currentUser?.photo)}
                      sx={{ width: 32, height: 32 }}
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
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      disabled={!comment.trim() || selectedPost !== post.id}
                      onClick={() => handleCreateComment(post.id)}
                    >
                      Comentar
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <CreatePostDialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          onSubmit={handleCreatePost}
        />

        {/* Image Viewer Dialog */}
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