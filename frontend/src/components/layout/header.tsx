'use client';

import { AuthButton } from '@/components/auth/auth-button';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Menu, Home, User, Settings, Bell } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuthContext } from '@/lib/auth-context';
import { useNotificationCount } from '@/hooks/use-notification-count';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

const navigationItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Notifications', href: '/notifications', icon: Bell, hasNotifications: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Header() {
  const isMobile = useIsMobile();
  const { user, token } = useAuthContext();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { unreadCount } = useNotificationCount(token);

  const MobileMenu = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 glass">
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col bg-gradient-to-b from-blue-50/50 via-purple-50/30 to-pink-50/50">
          {/* Header with profile */}
          {user && (
            <div className="border-b border-white/20 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12 ring-4 ring-white/30 shadow-lg">
                    <AvatarImage src={PlaceHolderImages[0].imageUrl} alt={user.displayName ?? user.email} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold">
                      {user.displayName?.charAt(0).toUpperCase() ?? user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-slate-700">{user.displayName ?? 'Anonymous'}</h3>
                  <p className="text-sm text-slate-500">{user.email}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation items */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                const showBadge = item.hasNotifications && unreadCount > 0;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-slate-900 transition-all duration-200 relative group"
                      onClick={() => setIsSheetOpen(false)}
                    >
                      <div className="relative">
                        <IconComponent className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        {showBadge && (
                          <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs notification-pulse bg-gradient-to-r from-red-500 to-pink-500 border-0"
                          >
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </Badge>
                        )}
                      </div>
                      <span className="group-hover:translate-x-1 transition-transform">{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Auth section at bottom */}
          <div className="border-t border-white/20 p-4 bg-gradient-to-r from-slate-50/50 to-blue-50/50">
            <AuthButton />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  const DesktopNav = () => (
    <nav className="hidden md:flex items-center space-x-8">
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        const showBadge = item.hasNotifications && unreadCount > 0;
        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex items-center space-x-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-all duration-200 relative group py-2 px-3 rounded-lg hover:bg-white/20"
          >
            <div className="relative">
              <IconComponent className="h-4 w-4 group-hover:scale-110 transition-transform" />
              {showBadge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs notification-pulse bg-gradient-to-r from-red-500 to-pink-500 border-0"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </div>
            <span className="group-hover:translate-x-0.5 transition-transform">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full glass border-b backdrop-blur-xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          {isMobile && <MobileMenu />}
          <Link href="/" className="flex items-center space-x-2 ml-2 md:ml-0 group">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-white">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              WhisperNet
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Auth Button for Desktop */}
        <div className="hidden md:flex items-center">
          <AuthButton />
        </div>

        {/* Mobile Auth Button (if no user) */}
        {!user && isMobile && (
          <div className="md:hidden">
            <AuthButton />
          </div>
        )}
      </div>
    </header>
  );
}
