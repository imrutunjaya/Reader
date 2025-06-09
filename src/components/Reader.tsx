import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Chapter, ReadingSettings } from '../types';

interface ReaderProps {
  chapter: Chapter;
  settings: ReadingSettings;
  onProgressChange: (progress: number) => void;
  onWordsRead: (words: number) => void;
  onBack: () => void;
}

export const Reader: React.FC<ReaderProps> = ({ 
  chapter, 
  settings, 
  onProgressChange,
  onWordsRead,
  onBack
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    // Reset scroll position when chapter changes
    window.scrollTo(0, 0);
  }, [chapter.id]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

      onProgressChange(Math.min(progress, 100));

      // Calculate words read based on scroll position
      const totalWords = chapter.content.split(/\s+/).length;
      const wordsRead = Math.floor((progress / 100) * totalWords);
      onWordsRead(wordsRead);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter.content, onProgressChange, onWordsRead]);

  const formatContent = (content: string) => {
    return content.split('\n\n').map((paragraph, index) => {
      if (paragraph.startsWith('## ')) {
        return (
          <h2 key={index} className="text-2xl font-bold mb-6 mt-8 text-gray-900 dark:text-gray-100 sepia:text-amber-900">
            {paragraph.replace('## ', '')}
          </h2>
        );
      }
      
      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
        return (
          <h3 key={index} className="text-lg font-semibold mb-4 mt-6 text-gray-800 dark:text-gray-200 sepia:text-amber-800">
            {paragraph.replace(/\*\*/g, '')}
          </h3>
        );
      }

      // Handle bold text within paragraphs
      const formattedParagraph = paragraph.replace(
        /\*\*(.*?)\*\*/g, 
        '<strong class="font-semibold text-gray-900 dark:text-gray-100 sepia:text-amber-900">$1</strong>'
      );

      return (
        <p 
          key={index} 
          className="mb-6 text-gray-700 dark:text-gray-300 sepia:text-amber-800 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      );
    });
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900'
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 sepia:bg-green-200 sepia:text-green-900';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 sepia:bg-yellow-200 sepia:text-yellow-900';
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 sepia:bg-red-200 sepia:text-red-900';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 sepia:bg-amber-200 sepia:text-amber-900';
    }
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${themeClasses[settings.theme]} ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 p-3 bg-white dark:bg-gray-800 sepia:bg-amber-50 shadow-lg rounded-full hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300 sepia:text-amber-900" />
      </button>

      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(chapter.difficulty)}`}>
              {chapter.difficulty}
            </span>
          </div>
          
          <h1 
            className="text-4xl md:text-5xl font-bold mb-4 leading-tight text-gray-900 dark:text-gray-100 sepia:text-amber-900"
            style={{ fontFamily: settings.fontFamily }}
          >
            {chapter.title}
          </h1>
          
          {chapter.subtitle && (
            <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 sepia:text-amber-700 mb-6 font-light">
              {chapter.subtitle}
            </h2>
          )}
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400 sepia:text-amber-700 mb-6">
            <span>By {chapter.author}</span>
            <span>•</span>
            <span>{chapter.estimatedReadTime} min read</span>
            <span>•</span>
            <span>{chapter.category}</span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2">
            {chapter.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 sepia:bg-blue-200 text-blue-800 dark:text-blue-300 sepia:text-blue-900 text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Article Content */}
        <div 
          ref={contentRef}
          className="prose prose-lg max-w-none transition-all duration-300"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily
          }}
        >
          {formatContent(chapter.content)}
        </div>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 sepia:border-amber-200 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 sepia:text-amber-600 mb-4">
            Thank you for reading • Take a moment to reflect on what you've learned
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </button>
        </footer>
      </div>
    </div>
  );
};