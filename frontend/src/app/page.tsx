import { Feed } from '@/components/feed/feed';
import { PostForm } from '@/components/feed/post-form';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 animate-pulse"></div>
        <div className="relative container mx-auto max-w-4xl px-4 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 float-animation">
              Welcome to WhisperNet
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Share your thoughts, connect with others, and discover amazing conversations in our vibrant community.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-2xl px-4 pb-8">
        <div className="space-y-6">
          {/* Post Form */}
          <div className="gradient-card rounded-2xl p-6 shadow-xl">
            <PostForm />
          </div>
          
          {/* Feed */}
          <div className="gradient-card rounded-2xl p-6 shadow-xl">
            <Feed />
          </div>
        </div>
      </div>
      
      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-gradient-to-r from-indigo-400/25 to-cyan-400/25 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>
    </div>
  );
}
