'use client';

import { useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Send } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuthContext } from '@/lib/auth-context';
import { createPost } from '@/lib/api/posts';
import { ApiError } from '@/lib/api-client';

export function PostForm() {
  const { user, token } = useAuthContext();
  const formRef = useRef<HTMLFormElement>(null);
  const [postText, setPostText] = useState('');
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !token) return;
    
    if (!postText || postText.trim() === '') {
      toast({
        title: 'Error',
        description: 'Post content cannot be empty.',
        variant: 'destructive',
      });
      return;
    }
    
    if (postText.trim().length > 500) {
      toast({
        title: 'Error',
        description: 'Post cannot exceed 500 characters.',
        variant: 'destructive',
      });
      return;
    }

    setIsPending(true);

    try {
      await createPost(postText.trim(), token);
      formRef.current?.reset();
      setPostText('');
      window.dispatchEvent(new Event('posts:refresh'));
    } catch (error: any) {
      const description =
        error instanceof ApiError ? error.message : error?.message || 'Failed to create post';
      toast({
        title: 'Error creating post',
        description,
        variant: 'destructive',
      });
    } finally {
      setIsPending(false);
    }
  };

  if (!user) {
    return (
        <Card className="mb-8 text-center p-6 bg-muted/50">
            <p className="text-muted-foreground">Please sign in to share your thoughts.</p>
        </Card>
    );
  }

  return (
    <Card className="mb-8 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <form onSubmit={handleCreatePost} ref={formRef} className="flex items-start space-x-4">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src={PlaceHolderImages[0].imageUrl} alt={user.displayName ?? user.email} />
            <AvatarFallback>
              {user.displayName?.charAt(0).toUpperCase() ?? user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Textarea
              name="text"
              placeholder="What's on your mind?"
              className="w-full resize-none border-0 bg-transparent p-0 focus:ring-0 focus:outline-none focus-visible:ring-offset-0 focus-visible:ring-0"
              rows={3}
              required
              disabled={isPending}
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
            />
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" className="transition-transform hover:scale-105" disabled={isPending}>
                <Send className="mr-2 h-4 w-4" />
                {isPending ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
