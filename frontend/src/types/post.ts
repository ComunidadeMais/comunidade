import { Member } from './member';

export interface Post {
  id: string;
  title: string;
  content: string;
  type: string;
  author: Member;
  likes: number;
  comments?: Comment[];
  // Campos em camelCase para uso no frontend
  createdAt: string;
  updatedAt: string;
  authorId: string;
  communityId: string;
  // Campos em snake_case que vêm da API
  created_at: string;
  updated_at: string;
  author_id: string;
  community_id: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Member;
  // Campos em camelCase para uso no frontend
  createdAt: string;
  updatedAt: string;
  authorId: string;
  postId: string;
  // Campos em snake_case que vêm da API
  created_at: string;
  updated_at: string;
  author_id: string;
  post_id: string;
} 