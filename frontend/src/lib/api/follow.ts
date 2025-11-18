import { apiRequest } from '@/lib/api-client';
import type { AppUser } from '@/lib/types';

export interface FollowStatusResponse {
  isFollowing: boolean;
}

export interface FollowersResponse {
  followers: AppUser[];
}

export interface FollowingResponse {
  following: AppUser[];
}

export async function followUser(userId: string, token: string): Promise<void> {
  await apiRequest(`/api/follow/${userId}`, {
    method: 'POST',
    token,
  });
}

export async function unfollowUser(userId: string, token: string): Promise<void> {
  await apiRequest(`/api/follow/${userId}`, {
    method: 'DELETE',
    token,
  });
}

export async function getFollowStatus(userId: string, token: string): Promise<boolean> {
  const response = await apiRequest<FollowStatusResponse>(`/api/follow/${userId}/status`, {
    method: 'GET',
    token,
  });
  return response.isFollowing;
}

export async function getUserFollowers(userId: string, token?: string): Promise<AppUser[]> {
  const response = await apiRequest<FollowersResponse>(`/api/follow/${userId}/followers`, {
    method: 'GET',
    ...(token && { token }),
  });
  return response.followers;
}

export async function getUserFollowing(userId: string, token?: string): Promise<AppUser[]> {
  const response = await apiRequest<FollowingResponse>(`/api/follow/${userId}/following`, {
    method: 'GET',
    ...(token && { token }),
  });
  return response.following;
}