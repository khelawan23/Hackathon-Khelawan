'use client';

import { useAuthContext } from '@/lib/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { fetchUserStats, fetchUserPosts, fetchUserProfile, fetchUserPostsById } from '@/lib/api/posts';
import { followUser, unfollowUser, getFollowStatus } from '@/lib/api/follow';
import { Edit, Mail, Calendar, MapPin, RefreshCw, UserPlus, UserMinus, MessageCircle, Heart } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import type { Post } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

interface UserStats {
  stats: {
    posts: number;
    following: number;
    followers: number;
  };
  createdAt: string;
}

function ProfileContent() {
  const { user, token } = useAuthContext();
  const searchParams = useSearchParams();
  const profileUserId = searchParams.get('userId'); // If viewing another user's profile
  const isOwnProfile = !profileUserId || profileUserId === user?.id;
  
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null); // For other user's profile data

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (isOwnProfile && token) {
          // Fetch current user's data
          const [statsData, postsData] = await Promise.all([
            fetchUserStats(token),
            fetchUserPosts(token)
          ]);
          
          setUserStats(statsData);
          setUserPosts(postsData);
          setProfileUser(user);
        } else if (profileUserId && token) {
          // Fetch another user's data
          const [profileData, followStatus] = await Promise.all([
            fetchUserProfile(profileUserId, token),
            getFollowStatus(profileUserId, token)
          ]);
          
          setUserStats({
            stats: profileData.stats,
            createdAt: profileData.createdAt
          });
          setProfileUser(profileData);
          setIsFollowing(followStatus);
          
          // Fetch their posts (if public)
          try {
            const postsData = await fetchUserPostsById(profileUserId, token);
            setUserPosts(postsData);
          } catch (err) {
            console.log('Could not fetch user posts:', err);
            setUserPosts([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, token, profileUserId, isOwnProfile]);

  const handleRefresh = async () => {
    if (!user || !token || refreshing) return;

    try {
      setRefreshing(true);
      setError(null);

      if (isOwnProfile) {
        const [statsData, postsData] = await Promise.all([
          fetchUserStats(token),
          fetchUserPosts(token)
        ]);
        setUserStats(statsData);
        setUserPosts(postsData);
      } else if (profileUserId) {
        const [profileData, followStatus] = await Promise.all([
          fetchUserProfile(profileUserId, token),
          getFollowStatus(profileUserId, token)
        ]);
        
        setUserStats({
          stats: profileData.stats,
          createdAt: profileData.createdAt
        });
        setProfileUser(profileData);
        setIsFollowing(followStatus);
        
        try {
          const postsData = await fetchUserPostsById(profileUserId, token);
          setUserPosts(postsData);
        } catch (err) {
          console.log('Could not fetch user posts:', err);
          setUserPosts([]);
        }
      }
    } catch (err) {
      console.error('Failed to refresh profile data:', err);
      setError('Failed to refresh profile data');
    } finally {
      setRefreshing(false);
    }
  };

  const handleFollowToggle = async () => {
    if (!token || !profileUserId || followLoading || isOwnProfile) return;

    try {
      setFollowLoading(true);
      
      if (isFollowing) {
        await unfollowUser(profileUserId, token);
        setIsFollowing(false);
        // Update follower count locally
        if (userStats) {
          setUserStats({
            ...userStats,
            stats: {
              ...userStats.stats,
              followers: Math.max(0, userStats.stats.followers - 1)
            }
          });
        }
      } else {
        await followUser(profileUserId, token);
        setIsFollowing(true);
        // Update follower count locally
        if (userStats) {
          setUserStats({
            ...userStats,
            stats: {
              ...userStats.stats,
              followers: userStats.stats.followers + 1
            }
          });
        }
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Unknown';
    }
  };

  const formatPostDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown date';
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center p-8">
            <p className="text-destructive mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={handleRefresh} 
                variant="outline"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Retrying...' : 'Retry'}
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header with refresh button */}
          <div className="gradient-card rounded-2xl p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {isOwnProfile ? 'Your Profile' : `${profileUser?.displayName || profileUser?.email || 'User'}'s Profile`}
                </h1>
                <p className="text-slate-600 mt-2">
                  {isOwnProfile ? 'Manage your profile and view your activity' : 'View profile and activity'}
                </p>
              </div>
              <Button 
                onClick={handleRefresh} 
                variant="outline" 
                size="sm"
                disabled={loading || refreshing}
                className="hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-200"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>

        {/* Profile Header */}
        <Card className="gradient-card rounded-2xl shadow-xl overflow-hidden">
          <CardContent className="p-0">
            {/* Background Pattern */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/20 to-transparent"></div>
            </div>
            
            <div className="px-8 pb-8 -mt-16 relative">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 ring-4 ring-white shadow-2xl">
                    <AvatarImage src={PlaceHolderImages[0].imageUrl} alt={profileUser?.displayName ?? profileUser?.email} />
                    <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      {profileUser?.displayName?.charAt(0).toUpperCase() ?? profileUser?.email?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                    <div className="h-3 w-3 bg-green-400 rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left mt-4 md:mt-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-slate-800">{profileUser?.displayName ?? 'Anonymous User'}</h1>
                      <p className="text-slate-500">@{profileUser?.email?.split('@')[0]}</p>
                    </div>
                    
                    {isOwnProfile ? (
                      <Button variant="outline" className="mt-4 md:mt-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border-blue-300">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <Button 
                        onClick={handleFollowToggle}
                        variant={isFollowing ? "outline" : "default"}
                        className={`mt-4 md:mt-0 ${
                          isFollowing 
                            ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10 hover:from-red-500/20 hover:to-pink-500/20 border-red-300' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 shadow-lg'
                        }`}
                        disabled={followLoading}
                      >
                        {followLoading ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : isFollowing ? (
                          <UserMinus className="h-4 w-4 mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        {followLoading ? 'Loading...' : isFollowing ? 'Unfollow' : 'Follow'}
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center justify-center md:justify-start">
                      <Mail className="h-4 w-4 mr-2" />
                      {profileUser?.email}
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <Calendar className="h-4 w-4 mr-2" />
                      {loading ? (
                        <Skeleton className="h-4 w-32" />
                      ) : (
                        `Joined ${userStats ? formatJoinDate(userStats.createdAt) : 'Unknown'}`
                      )}
                    </div>
                    <div className="flex items-center justify-center md:justify-start">
                      <MapPin className="h-4 w-4 mr-2" />
                      Location not set
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="gradient-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto" />
                ) : (
                  userStats?.stats.posts || 0
                )}
              </CardTitle>
              <CardDescription className="font-medium text-slate-600">Posts</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="gradient-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto" />
                ) : (
                  userStats?.stats.following || 0
                )}
              </CardTitle>
              <CardDescription className="font-medium text-slate-600">Following</CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="gradient-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {loading ? (
                  <Skeleton className="h-8 w-16 mx-auto" />
                ) : (
                  userStats?.stats.followers || 0
                )}
              </CardTitle>
              <CardDescription className="font-medium text-slate-600">Followers</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest posts and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                ))}
              </div>
            ) : userPosts.length > 0 ? (
              <div className="space-y-4">
                {userPosts.slice(0, 5).map((post) => (
                  <div key={post.id} className="border-l-2 border-primary/20 pl-4 py-2 hover:bg-accent/50 rounded-r-lg transition-colors">
                    <p className="text-sm mb-2 line-clamp-3">{post.text}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatPostDate(post.timestamp)}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {userPosts.length > 5 && (
                  <div className="text-center pt-4 border-t">
                    <Button variant="outline" size="sm">
                      View All Posts ({userPosts.length})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity to show.</p>
                <p className="text-sm mt-2">Start posting to see your activity here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            <Card className="gradient-card rounded-2xl p-8 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-8 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-24" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}