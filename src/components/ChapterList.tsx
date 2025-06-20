import React, { useState } from 'react';
import { Clock, User, Tag, BookOpen, Search, Filter, Settings, LogOut, Play, Star, TrendingUp } from 'lucide-react';
import { Chapter } from '../types';
import { useAuth } from '../hooks/useAuth';

interface ChapterListProps {
  chapters: Chapter[];
  onChapterSelect: (chapter: Chapter) => void;
  theme: 'light' | 'dark' | 'sepia';
  loading?: boolean;
  onAdminAccess: () => void;
  isAuthenticated: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({ 
  chapters, 
  onChapterSelect, 
  theme,
  loading = false,
  onAdminAccess,
  isAuthenticated
}) => {
  const { signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', ...Array.from(new Set(chapters.map(c => c.category || 'Uncategorized')))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredChapters = chapters.filter(chapter => {
    const matchesSearch = (chapter.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (chapter.author || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (chapter.tags || []).some(tag => tag && typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || (chapter.category || 'Uncategorized') === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || (chapter.difficulty || 'Beginner') === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30';
      case 'Intermediate': return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-300 border-yellow-500/30';
      case 'Advanced': return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/30';
      default: return 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen animated-bg">
      {/* Floating particles background effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          {/* Top Navigation */}
          <div className="flex justify-between items-center mb-12">
            <div className="glass-card px-6 py-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">Knowledge Library</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <>
                  <button
                    onClick={onAdminAccess}
                    className="glass-button px-6 py-3 flex items-center space-x-2 glow-hover"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Admin Panel</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="glass-button px-6 py-3 flex items-center space-x-2 glow-hover"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <button
                  onClick={onAdminAccess}
                  className="glass-button px-6 py-3 flex items-center space-x-2 glow-hover"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Admin Login</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Hero Section */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 blur-3xl"></div>
            <div className="relative">
              <h1 className="text-7xl md:text-8xl font-bold mb-6 gradient-text leading-tight">
                Knowledge
              </h1>
              <h2 className="text-5xl md:text-6xl font-light mb-8 text-white/80">
                Library
              </h2>
              <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
                Discover curated articles and chapters designed for distraction-free reading and deep learning
              </p>
            </div>
          </div>
        </header>

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-3xl mx-auto">
            <div className="glass-card p-2">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 w-6 h-6" />
                <input
                  type="text"
                  placeholder="Search chapters, authors, or tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 text-lg bg-transparent text-white placeholder-white/50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="glass-card px-4 py-2">
              <div className="flex items-center space-x-3">
                <Filter className="w-5 h-5 text-white/70" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-black text-white">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="glass-card px-4 py-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-transparent text-white text-sm font-medium focus:outline-none cursor-pointer"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty} className="bg-black text-white">
                    {difficulty}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto mb-6"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500/60 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-xl text-white/70 font-medium">Loading chapters...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="text-center mb-10">
            <div className="glass-card inline-block px-6 py-3">
              <p className="text-lg text-white/80 font-medium">
                {filteredChapters.length} {filteredChapters.length === 1 ? 'chapter' : 'chapters'} found
              </p>
            </div>
          </div>
        )}

        {/* Chapter Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChapters.map((chapter, index) => (
              <div
                key={chapter.id}
                onClick={() => onChapterSelect(chapter)}
                className="glass-card glass-card-hover cursor-pointer p-6 group relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Content */}
                <div className="relative z-10">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(chapter.difficulty || 'Beginner')}`}>
                      {chapter.difficulty || 'Beginner'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5 text-yellow-400/60 group-hover:text-yellow-400 transition-colors" />
                      <BookOpen className="w-5 h-5 text-white/40 group-hover:text-white/70 transition-colors" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold mb-3 text-white group-hover:text-white transition-colors leading-tight">
                    {chapter.title || 'Untitled'}
                  </h3>

                  {/* Subtitle */}
                  {chapter.subtitle && (
                    <p className="text-base text-white/70 mb-6 leading-relaxed">
                      {chapter.subtitle}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center justify-between mb-6 text-sm text-white/60">
                    <div className="flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span className="font-medium">{chapter.author || 'Unknown Author'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{chapter.estimatedReadTime || 0} min</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-sm rounded-xl font-medium border border-blue-500/30">
                      {chapter.category || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(chapter.tags || []).filter(tag => tag && typeof tag === 'string').slice(0, 3).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-3 py-1 bg-white/10 text-white/70 text-xs rounded-lg font-medium border border-white/20"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {(chapter.tags || []).filter(tag => tag && typeof tag === 'string').length > 3 && (
                      <span className="text-xs text-white/50 font-medium px-3 py-1">
                        +{(chapter.tags || []).filter(tag => tag && typeof tag === 'string').length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Read Button */}
                  <button className="w-full py-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2 group/btn">
                    <Play className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                    <span>Start Reading</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredChapters.length === 0 && (
          <div className="text-center py-20">
            <div className="glass-card inline-block p-12">
              <div className="relative mb-8">
                <BookOpen className="w-24 h-24 text-white/30 mx-auto" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500/30 rounded-full animate-bounce"></div>
              </div>
              <h3 className="text-2xl font-bold text-white/80 mb-4">
                No chapters found
              </h3>
              <p className="text-lg text-white/60">
                Try adjusting your search terms or filters
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};