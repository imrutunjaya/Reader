import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Tag, Calendar, Star, Trash2, Eye, Brain, Lightbulb, Link, Filter } from 'lucide-react';

interface SmartBookmark {
  id: string;
  chapterId: string;
  chapterTitle: string;
  position: number;
  timestamp: number;
  note: string;
  tags: string[];
  context: string; // surrounding text
  importance: 'low' | 'medium' | 'high';
  category: string;
  aiInsight?: string;
  connections: string[]; // IDs of related bookmarks
  emotionalState: 'curious' | 'confused' | 'excited' | 'thoughtful' | 'neutral';
  readingSpeed: number;
  comprehensionScore: number;
}

interface SmartBookmarksProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToBookmark: (chapterId: string, position: number) => void;
}

export const SmartBookmarks: React.FC<SmartBookmarksProps> = ({
  isOpen,
  onClose,
  onNavigateToBookmark
}) => {
  const [bookmarks, setBookmarks] = useState<SmartBookmark[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImportance, setSelectedImportance] = useState('All');
  const [selectedEmotion, setSelectedEmotion] = useState('All');
  const [sortBy, setSortBy] = useState<'date' | 'importance' | 'chapter' | 'connections' | 'comprehension'>('date');
  const [showConnections, setShowConnections] = useState(false);
  const [selectedBookmark, setSelectedBookmark] = useState<SmartBookmark | null>(null);

  useEffect(() => {
    const savedBookmarks = localStorage.getItem('smart-bookmarks');
    if (savedBookmarks) {
      setBookmarks(JSON.parse(savedBookmarks));
    }
  }, []);

  const saveBookmarks = (newBookmarks: SmartBookmark[]) => {
    setBookmarks(newBookmarks);
    localStorage.setItem('smart-bookmarks', JSON.stringify(newBookmarks));
  };

  // AI-powered bookmark analysis
  const generateAIInsight = (bookmark: SmartBookmark) => {
    const insights = [
      "This concept connects to the growth mindset theory discussed in psychology literature.",
      "Consider how this relates to the compound effect mentioned in productivity frameworks.",
      "This principle appears in multiple disciplines - worth exploring cross-connections.",
      "The author's perspective here contrasts with traditional approaches in this field.",
      "This could be a key insight for practical application in daily routines."
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  };

  // Find semantic connections between bookmarks
  const findConnections = (bookmark: SmartBookmark) => {
    return bookmarks
      .filter(b => b.id !== bookmark.id)
      .filter(b => {
        const contextWords = bookmark.context.toLowerCase().split(' ');
        const otherContextWords = b.context.toLowerCase().split(' ');
        const commonWords = contextWords.filter(word => 
          otherContextWords.includes(word) && word.length > 4
        );
        return commonWords.length > 2 || 
               bookmark.tags.some(tag => b.tags.includes(tag)) ||
               bookmark.category === b.category;
      })
      .map(b => b.id);
  };

  const filteredBookmarks = bookmarks
    .filter(bookmark => {
      const matchesSearch = 
        bookmark.chapterTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.context.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bookmark.aiInsight && bookmark.aiInsight.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All' || bookmark.category === selectedCategory;
      const matchesImportance = selectedImportance === 'All' || bookmark.importance === selectedImportance;
      const matchesEmotion = selectedEmotion === 'All' || bookmark.emotionalState === selectedEmotion;
      
      return matchesSearch && matchesCategory && matchesImportance && matchesEmotion;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.timestamp - a.timestamp;
        case 'importance':
          const importanceOrder = { high: 3, medium: 2, low: 1 };
          return importanceOrder[b.importance] - importanceOrder[a.importance];
        case 'chapter':
          return a.chapterTitle.localeCompare(b.chapterTitle);
        case 'connections':
          return b.connections.length - a.connections.length;
        case 'comprehension':
          return b.comprehensionScore - a.comprehensionScore;
        default:
          return 0;
      }
    });

  const categories = ['All', ...Array.from(new Set(bookmarks.map(b => b.category)))];
  const emotions = ['All', 'curious', 'confused', 'excited', 'thoughtful', 'neutral'];

  const deleteBookmark = (id: string) => {
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    saveBookmarks(newBookmarks);
  };

  const updateBookmark = (id: string, updates: Partial<SmartBookmark>) => {
    const newBookmarks = bookmarks.map(b => 
      b.id === id ? { ...b, ...updates } : b
    );
    saveBookmarks(newBookmarks);
  };

  const enhanceBookmark = (bookmark: SmartBookmark) => {
    const enhanced = {
      ...bookmark,
      aiInsight: generateAIInsight(bookmark),
      connections: findConnections(bookmark)
    };
    updateBookmark(bookmark.id, enhanced);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'curious': return 'text-blue-600 bg-blue-100';
      case 'confused': return 'text-purple-600 bg-purple-100';
      case 'excited': return 'text-orange-600 bg-orange-100';
      case 'thoughtful': return 'text-indigo-600 bg-indigo-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getEmotionEmoji = (emotion: string) => {
    switch (emotion) {
      case 'curious': return '🤔';
      case 'confused': return '😕';
      case 'excited': return '🤩';
      case 'thoughtful': return '💭';
      default: return '😐';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Smart Bookmarks</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">AI-powered insights and connections</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowConnections(!showConnections)}
              className={`px-4 py-2 rounded-lg transition-all ${showConnections ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Link className="w-4 h-4 mr-2 inline" />
              Connections
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="p-6 border-b bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search bookmarks, insights, connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={selectedImportance}
              onChange={(e) => setSelectedImportance(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="All">All Priority</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <select
              value={selectedEmotion}
              onChange={(e) => setSelectedEmotion(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              {emotions.map(emotion => (
                <option key={emotion} value={emotion}>
                  {emotion === 'All' ? 'All Emotions' : `${getEmotionEmoji(emotion)} ${emotion}`}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="importance">Sort by Priority</option>
              <option value="chapter">Sort by Chapter</option>
              <option value="connections">Sort by Connections</option>
              <option value="comprehension">Sort by Comprehension</option>
            </select>
          </div>
        </div>

        {/* Bookmarks Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredBookmarks.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No smart bookmarks found</p>
              <p className="text-sm">Create bookmarks while reading to see AI-powered insights</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 overflow-hidden group"
                >
                  {/* Bookmark Header */}
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getImportanceColor(bookmark.importance)}`}>
                          {bookmark.importance}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getEmotionColor(bookmark.emotionalState)}`}>
                          {getEmotionEmoji(bookmark.emotionalState)} {bookmark.emotionalState}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => enhanceBookmark(bookmark)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Generate AI Insight"
                        >
                          <Lightbulb className="w-4 h-4 text-yellow-600" />
                        </button>
                        <button
                          onClick={() => onNavigateToBookmark(bookmark.chapterId, bookmark.position)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Go to bookmark"
                        >
                          <Eye className="w-4 h-4 text-blue-600" />
                        </button>
                        <button
                          onClick={() => deleteBookmark(bookmark.id)}
                          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title="Delete bookmark"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
                      {bookmark.chapterTitle}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(bookmark.timestamp).toLocaleDateString()} • 
                      {bookmark.readingSpeed} WPM • 
                      {bookmark.comprehensionScore}% comprehension
                    </p>
                  </div>

                  {/* Context Preview */}
                  <div className="p-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3">
                        "{bookmark.context}"
                      </p>
                    </div>

                    {/* User Note */}
                    {bookmark.note && (
                      <div className="mb-3">
                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                          {bookmark.note}
                        </p>
                      </div>
                    )}

                    {/* AI Insight */}
                    {bookmark.aiInsight && (
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg p-3 mb-3">
                        <div className="flex items-start space-x-2">
                          <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-800 dark:text-purple-300">
                            {bookmark.aiInsight}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {bookmark.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Connections */}
                    {showConnections && bookmark.connections.length > 0 && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <Link className="w-4 h-4 text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                            Connected to {bookmark.connections.length} other bookmarks
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {bookmark.connections.slice(0, 3).map(connectionId => {
                            const connectedBookmark = bookmarks.find(b => b.id === connectionId);
                            return connectedBookmark ? (
                              <button
                                key={connectionId}
                                onClick={() => setSelectedBookmark(connectedBookmark)}
                                className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              >
                                {connectedBookmark.chapterTitle.substring(0, 20)}...
                              </button>
                            ) : null;
                          })}
                          {bookmark.connections.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{bookmark.connections.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};