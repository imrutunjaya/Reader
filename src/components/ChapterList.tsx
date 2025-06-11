import React, { useState } from 'react';
import { Clock, User, Tag, BookOpen, Search, Filter, Settings, LogOut } from 'lucide-react';
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
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 sepia:bg-green-200 sepia:text-green-900';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 sepia:bg-yellow-200 sepia:text-yellow-900';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 sepia:bg-red-200 sepia:text-red-900';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 sepia:bg-amber-200 sepia:text-amber-900';
    }
  };

  const themeClasses = {
    light: 'bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900',
    dark: 'bg-gradient-to-br from-gray-900 via-gray-800 to-blue-900 text-gray-100',
    sepia: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 text-amber-900'
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses[theme]}`}>
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="flex justify-between items-start mb-8">
            <div></div>
            <div className="flex items-center space-x-3">
              {isAuthenticated && (
                <>
                  <button
                    onClick={onAdminAccess}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Admin Panel</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </>
              )}
              {!isAuthenticated && (
                <button
                  onClick={onAdminAccess}
                  className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <Settings className="w-5 h-5" />
                  <span className="font-medium">Admin Login</span>
                </button>
              )}
            </div>
          </div>
          
          <div className="relative">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent leading-tight">
              Knowledge Library
            </h1>
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-200 dark:bg-blue-800 sepia:bg-amber-200 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-purple-200 dark:bg-purple-800 sepia:bg-orange-200 rounded-full opacity-20 animate-pulse delay-1000"></div>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 sepia:text-amber-700 max-w-3xl mx-auto leading-relaxed">
            Discover curated articles and chapters designed for distraction-free reading and deep learning
          </p>
        </header>

        {/* Search and Filters */}
        <div className="mb-12 space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            <input
              type="text"
              placeholder="Search chapters, authors, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 sepia:border-amber-300 rounded-2xl bg-white/80 dark:bg-gray-800/80 sepia:bg-amber-50/80 backdrop-blur-sm text-gray-900 dark:text-gray-100 sepia:text-amber-900 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 shadow-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 sepia:bg-amber-50/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 sepia:border-amber-300 rounded-lg bg-white dark:bg-gray-800 sepia:bg-amber-50 text-gray-900 dark:text-gray-100 sepia:text-amber-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-3 bg-white/60 dark:bg-gray-800/60 sepia:bg-amber-50/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 sepia:border-amber-300 rounded-lg bg-white dark:bg-gray-800 sepia:bg-amber-50 text-gray-900 dark:text-gray-100 sepia:text-amber-900 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-6"></div>
              <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-400 sepia:text-amber-700 font-medium">Loading chapters...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="text-center mb-10">
            <p className="text-lg text-gray-600 dark:text-gray-400 sepia:text-amber-700 font-medium">
              {filteredChapters.length} {filteredChapters.length === 1 ? 'chapter' : 'chapters'} found
            </p>
          </div>
        )}

        {/* Chapter Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredChapters.map((chapter) => (
              <div
                key={chapter.id}
                onClick={() => onChapterSelect(chapter)}
                className="group cursor-pointer bg-white/80 dark:bg-gray-800/80 sepia:bg-amber-100/80 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200/50 dark:border-gray-700/50 sepia:border-amber-200/50 hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600"
              >
                {/* Chapter Header */}
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getDifficultyColor(chapter.difficulty || 'Beginner')}`}>
                      {chapter.difficulty || 'Beginner'}
                    </span>
                    <BookOpen className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-gray-100 sepia:text-amber-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-tight">
                    {chapter.title || 'Untitled'}
                  </h3>

                  {chapter.subtitle && (
                    <p className="text-base text-gray-600 dark:text-gray-400 sepia:text-amber-700 mb-6 leading-relaxed">
                      {chapter.subtitle}
                    </p>
                  )}

                  {/* Author and Reading Time */}
                  <div className="flex items-center justify-between mb-6 text-sm text-gray-500 dark:text-gray-400 sepia:text-amber-600">
                    <div className="flex items-center font-medium">
                      <User className="w-4 h-4 mr-2" />
                      {chapter.author || 'Unknown Author'}
                    </div>
                    <div className="flex items-center font-medium">
                      <Clock className="w-4 h-4 mr-2" />
                      {chapter.estimatedReadTime || 0} min
                    </div>
                  </div>

                  {/* Category */}
                  <div className="mb-6">
                    <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 sepia:from-blue-200 sepia:to-blue-300 text-blue-800 dark:text-blue-300 sepia:text-blue-900 text-sm rounded-xl font-medium">
                      {chapter.category || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(chapter.tags || []).filter(tag => tag && typeof tag === 'string').slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 sepia:bg-amber-200 text-gray-700 dark:text-gray-300 sepia:text-amber-800 text-xs rounded-lg font-medium"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {(chapter.tags || []).filter(tag => tag && typeof tag === 'string').length > 3 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 sepia:text-amber-600 font-medium">
                        +{(chapter.tags || []).filter(tag => tag && typeof tag === 'string').length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Read Button */}
                  <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                    Start Reading
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && filteredChapters.length === 0 && (
          <div className="text-center py-16">
            <div className="relative mb-8">
              <BookOpen className="w-24 h-24 text-gray-300 dark:text-gray-600 sepia:text-amber-300 mx-auto" />
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-200 dark:bg-blue-800 sepia:bg-amber-200 rounded-full opacity-50 animate-bounce"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-600 dark:text-gray-400 sepia:text-amber-700 mb-4">
              No chapters found
            </h3>
            <p className="text-lg text-gray-500 dark:text-gray-500 sepia:text-amber-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};