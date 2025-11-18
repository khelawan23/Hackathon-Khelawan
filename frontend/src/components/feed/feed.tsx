'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Post } from '@/lib/types';
import { PostCard } from './post-card';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchPosts } from '@/lib/api/posts';
import { useToast } from '@/hooks/use-toast';
import { ApiError } from '@/lib/api-client';

export function Feed() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchPosts();
      setPosts(data);
    } catch (error: any) {
      const description =
        error instanceof ApiError ? error.message : error?.message || 'Failed to load posts';
      toast({
        title: 'Error loading posts',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    const handler = () => loadPosts();
    window.addEventListener('posts:refresh', handler);
    return () => window.removeEventListener('posts:refresh', handler);
  }, [loadPosts]);

  if (isLoading && !posts) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts?.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {posts?.length === 0 && !isLoading && (
        <div className="text-center text-muted-foreground py-10">
          <p className="text-lg">The feed is quiet...</p>
          <p>Be the first to share a thought!</p>
        </div>
      )}
    </div>
  );
}
