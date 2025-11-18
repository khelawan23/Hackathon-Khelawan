'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogIn, LogOut, User, Settings } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useAuthContext } from '@/lib/auth-context';
import { useIsMobile } from '@/hooks/use-mobile';

export function AuthButton() {
  const { user, loading, signOut } = useAuthContext();
  const isMobile = useIsMobile();

  const handleSignOut = async () => {
    try {
      signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return <Button variant="outline" size="sm" disabled>Loading...</Button>;
  }

  if (!user) {
    return (
      <Button asChild variant="outline" size="sm" className="hover:shadow-[0_0_15px_hsl(var(--primary)/0.3)] transition-shadow">
        <Link href="/login">
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-full md:w-10 rounded-full md:rounded-full justify-start md:justify-center p-2">
          <Avatar className="h-6 w-6 md:h-8 md:w-8">
            <AvatarImage src={PlaceHolderImages[0].imageUrl} alt={user.displayName ?? user.email} />
            <AvatarFallback>
              {user.displayName?.charAt(0).toUpperCase() ?? user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isMobile && (
            <div className="ml-3 flex-1 text-left md:hidden">
              <p className="text-sm font-medium">{user.displayName ?? 'Anonymous'}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.displayName ?? 'Anonymous'}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
