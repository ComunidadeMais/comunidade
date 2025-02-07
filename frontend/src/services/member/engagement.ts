import api from '../api';

export interface Post {
  id: string;
  communityId: string;
  authorId: string;
  title: string;
  content: string;
  type: 'post' | 'announcement' | 'devotional';
  likes: number;
  createdAt: string;
  updatedAt: string;
  images?: string[];
  author?: {
    id: string;
    name: string;
    photo?: string;
  };
  comments?: Comment[];
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    photo?: string;
  };
}

export interface Reaction {
  id: string;
  postId: string;
  memberId: string;
  type: 'like' | 'love' | 'pray' | 'celebrate';
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  memberId: string;
  badgeName: string;
  description: string;
  points: number;
  earnedAt: string;
  createdAt: string;
  updatedAt: string;
}

const convertApiPostToFrontend = (apiPost: any): Post => {
  return {
    id: apiPost.id,
    title: apiPost.title,
    content: apiPost.content,
    type: apiPost.type,
    author: apiPost.author,
    likes: apiPost.likes,
    images: apiPost.images || [],
    comments: apiPost.comments?.map(convertApiCommentToFrontend),
    createdAt: apiPost.created_at,
    updatedAt: apiPost.updated_at,
    authorId: apiPost.author_id,
    communityId: apiPost.community_id
  };
};

const convertApiCommentToFrontend = (apiComment: any): Comment => {
  return {
    id: apiComment.id,
    content: apiComment.content,
    author: apiComment.author,
    createdAt: apiComment.created_at,
    updatedAt: apiComment.updated_at,
    authorId: apiComment.author_id,
    postId: apiComment.post_id
  };
};

class EngagementService {
  // Posts
  async createPost(communityId: string, data: Partial<Post> | FormData) {
    const response = await api.post(
      `/communities/${communityId}/engagement/posts`,
      data,
      {
        headers: data instanceof FormData ? {
          'Content-Type': 'multipart/form-data'
        } : undefined
      }
    );
    return convertApiPostToFrontend(response.data);
  }

  async listPosts(communityId: string) {
    const response = await api.get(`/communities/${communityId}/engagement/posts`);
    const posts = response.data.posts?.map(convertApiPostToFrontend) || [];
    
    // Ordena os posts pelo mais recente
    posts.sort((a: Post, b: Post) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return {
      ...response.data,
      posts
    };
  }

  async getPost(communityId: string, postId: string) {
    const response = await api.get(`/communities/${communityId}/engagement/posts/${postId}`);
    return convertApiPostToFrontend(response.data);
  }

  async updatePost(communityId: string, postId: string, data: Partial<Post>) {
    const response = await api.put(`/communities/${communityId}/engagement/posts/${postId}`, data);
    return response.data;
  }

  async deletePost(communityId: string, postId: string) {
    const response = await api.delete(`/communities/${communityId}/engagement/posts/${postId}`);
    return response.data;
  }

  // Comentários
  async createComment(communityId: string, postId: string, data: Partial<Comment>) {
    const response = await api.post(`/communities/${communityId}/engagement/posts/${postId}/comments`, data);
    return response.data;
  }

  async deleteComment(communityId: string, postId: string, commentId: string) {
    const response = await api.delete(`/communities/${communityId}/engagement/posts/${postId}/comments/${commentId}`);
    return response.data;
  }

  // Reações
  async createReaction(communityId: string, postId: string, type: Reaction['type']) {
    const response = await api.post(`/communities/${communityId}/engagement/posts/${postId}/reactions/${type}`);
    return response.data;
  }

  async deleteReaction(communityId: string, postId: string) {
    const response = await api.delete(`/communities/${communityId}/engagement/posts/${postId}/reactions`);
    return response.data;
  }

  // Conquistas
  async listAchievements(communityId: string, memberId: string) {
    const response = await api.get(`/communities/${communityId}/engagement/members/${memberId}/achievements`);
    return response.data;
  }
}

export default new EngagementService(); 