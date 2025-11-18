import { apiRequest } from '@/lib/api-client';
import type { Post, AppUser } from '@/lib/types';

export interface UserStats {
  stats: {
    posts: number;
    following: number;
    followers: number;
  };
  createdAt: string;
}

export interface UserProfileResponse extends AppUser {
  stats: {
    posts: number;
    following: number;
    followers: number;
  };
}

export interface PostsResponse {
  posts: Post[];
}

export async function fetchPosts(): Promise<Post[]> {
  const response = await apiRequest<{ posts: Post[] }>('/api/posts');
  return response.posts;
}

export async function createPost(text: string, token: string): Promise<Post> {
  return apiRequest<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ text }),
    token,
  });
}

export async function fetchUserStats(token: string): Promise<UserStats> {
  return apiRequest<UserStats>('/api/users/me', {
    method: 'GET',
    token,
  });
}

export async function fetchUserProfile(userId: string, token?: string): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>(`/api/users/${userId}`, {
    method: 'GET',
    ...(token && { token }),
  });
}

export async function fetchUserPosts(token: string): Promise<Post[]> {
  const response = await apiRequest<PostsResponse>('/api/posts/me', {
    method: 'GET',
    token,
  });
  return response.posts || [];
}

export async function fetchUserPostsById(userId: string, token?: string): Promise<Post[]> {
  const response = await apiRequest<PostsResponse>(`/api/posts/user/${userId}`, {
    method: 'GET',
    ...(token && { token }),
  });
  return response.posts || [];
}

