import React, { useState } from 'react';
import { Clock, User, Tag, BookOpen, Search, Filter } from 'lucide-react';
import { Chapter } from '../types';

interface ChapterListProps {
  chapters: Chapter[];
  onChapterSelect: (chapter: Chapter) => void;
  theme: 'light' | 'dark' | 'sepia';
}

export const ChapterList: React.FC<ChapterListProps> = ({ 
  chapters, 
  onChapterSelect, 
  theme 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const categories = ['All', ...Array.from(new Set(chapters.map(c => c.category)))];
  const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredChapters = chapters.filter(chapter => {
    const matchesSearch = chapter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         chapter.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || chapter.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || chapter.difficulty === selectedDifficulty;
    
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
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900'
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses[theme]}`}>
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900 dark:text-gray-100 sepia:text-amber-900">
            Knowledge Library
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 sepia:text-amber-700 max-w-2xl mx-auto">
            Discover curated articles and chapters designed for distraction-free reading and deep learning
          </p>
        </header>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search chapters, authors, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 sepia:border-amber-300 rounded-lg bg-white dark:bg-gray-800 sepia:bg-amber-50 text-gray-900 dark:text-gray-100 sepia:text-amber-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 sepia:border-amber-300 rounded-lg bg-white dark:bg-gray-800 sepia:bg-amber-50 text-gray-900 dark:text-gray-100 sepia:text-amber-900 text-sm"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 sepia:border-amber-300 rounded-lg bg-white dark:bg-gray-800 sepia:bg-amber-50 text-gray-900 dark:text-gray-100 sepia:text-amber-900 text-sm"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="text-center mb-8">
          <p className="text-gray-600 dark:text-gray-400 sepia:text-amber-700">
            {filteredChapters.length} {filteredChapters.length === 1 ? 'chapter' : 'chapters'} found
          </p>
        </div>

        {/* Chapter Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              onClick={() => onChapterSelect(chapter)}
              className="group cursor-pointer bg-white dark:bg-gray-800 sepia:bg-amber-100 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700 sepia:border-amber-200 hover:scale-105"
            >
              {/* Chapter Header */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(chapter.difficulty)}`}>
                    {chapter.difficulty}
                  </span>
                  <BookOpen className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>

                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 sepia:text-amber-900 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {chapter.title}
                </h3>

                {chapter.subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 sepia:text-amber-700 mb-4">
                    {chapter.subtitle}
                  </p>
                )}

                {/* Author and Reading Time */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400 sepia:text-amber-600">
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {chapter.author}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {chapter.estimatedReadTime} min
                  </div>
                </div>

                {/* Category */}
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 sepia:bg-blue-200 text-blue-800 dark:text-blue-300 sepia:text-blue-900 text-xs rounded-full">
                    {chapter.category}
                  </span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {chapter.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-gray-100 dark:bg-gray-700 sepia:bg-amber-200 text-gray-700 dark:text-gray-300 sepia:text-amber-800 text-xs rounded-md"
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                  {chapter.tags.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 sepia:text-amber-600">
                      +{chapter.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Read Button */}
              <div className="px-6 pb-6">
                <button className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium">
                  Start Reading
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredChapters.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 sepia:text-amber-700 mb-2">
              No chapters found
            </h3>
            <p className="text-gray-500 dark:text-gray-500 sepia:text-amber-600">
              Try adjusting your search terms or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
};