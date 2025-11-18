'use client';

import type { Post } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  const timestamp = post.timestamp ? new Date(post.timestamp) : null;
  const timeAgo = timestamp ? formatDistanceToNow(timestamp, { addSuffix: true }) : 'just now';
  const authorName = post.author.displayName ?? 'Anonymous';

  return (
    <Card className="overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center gap-4 p-4 bg-card">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={PlaceHolderImages[0].imageUrl} alt={authorName} />
          <AvatarFallback>{authorName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <p className="font-semibold">{authorName}</p>
          <p className="text-sm text-muted-foreground">{timeAgo}</p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap">{post.text}</p>
      </CardContent>
    </Card>
  );
}
