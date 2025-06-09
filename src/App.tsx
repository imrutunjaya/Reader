import React, { useState, useEffect } from 'react';
import { ChapterList } from './components/ChapterList';
import { Reader } from './components/Reader';
import { SettingsPanel } from './components/SettingsPanel';
import { ProgressBar } from './components/ProgressBar';
import { ReadingSettings, BookmarkData, Chapter } from './types';
import { chapters } from './data/sampleContent';

const defaultSettings: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.6,
  fontFamily: 'Georgia, serif',
  theme: 'light',
  showProgress: true
};

function App() {
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    const saved = localStorage.getItem('reading-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.className = settings.theme;
    
    // Update page title based on theme and current view
    const baseTitles = {
      light: 'Reading Library',
      dark: 'Reading Library • Dark Mode',
      sepia: 'Reading Library • Sepia Mode'
    };
    
    if (selectedChapter) {
      document.title = `${selectedChapter.title} - ${baseTitles[settings.theme]}`;
    } else {
      document.title = baseTitles[settings.theme];
    }
  }, [settings.theme, selectedChapter]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('reading-settings', JSON.stringify(settings));
  }, [settings]);

  // Save bookmarks to localStorage
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  // Reset progress when changing chapters
  useEffect(() => {
    if (selectedChapter) {
      setReadingProgress(0);
      setWordsRead(0);
    }
  }, [selectedChapter]);

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
  };

  const handleBackToLibrary = () => {
    setSelectedChapter(null);
    setReadingProgress(0);
    setWordsRead(0);
  };

  const handleBookmark = () => {
    if (!selectedChapter) return;
    
    const newBookmark: BookmarkData = {
      position: readingProgress,
      timestamp: Date.now(),
      note: `${selectedChapter.title} - ${Math.round(readingProgress)}% completed`,
      chapterId: selectedChapter.id
    };
    
    setBookmarks(prev => [...prev, newBookmark]);
    
    // Show a brief confirmation
    const notification = document.createElement('div');
    notification.textContent = 'Bookmark saved!';
    notification.className = 'fixed top-20 right-6 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Toggle settings with 'S' key
      if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsSettingsOpen(prev => !prev);
        }
      }
      
      // Add bookmark with 'B' key (only when reading)
      if ((e.key === 'b' || e.key === 'B') && selectedChapter) {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleBookmark();
        }
      }
      
      // Toggle theme with 'T' key
      if (e.key === 't' || e.key === 'T') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const themes: ReadingSettings['theme'][] = ['light', 'dark', 'sepia'];
          const currentIndex = themes.indexOf(settings.theme);
          const nextTheme = themes[(currentIndex + 1) % themes.length];
          setSettings(prev => ({ ...prev, theme: nextTheme }));
        }
      }
      
      // Back to library with 'Escape' key
      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (selectedChapter) {
          handleBackToLibrary();
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [settings.theme, selectedChapter, isSettingsOpen]);

  return (
    <div className="relative">
      {selectedChapter && (
        <ProgressBar 
          progress={readingProgress} 
          showProgress={settings.showProgress}
        />
      )}
      
      {selectedChapter ? (
        <Reader
          chapter={selectedChapter}
          settings={settings}
          onProgressChange={setReadingProgress}
          onWordsRead={setWordsRead}
          onBack={handleBackToLibrary}
        />
      ) : (
        <ChapterList
          chapters={chapters}
          onChapterSelect={handleChapterSelect}
          theme={settings.theme}
        />
      )}
      
      <SettingsPanel
        settings={settings}
        onSettingsChange={setSettings}
        isOpen={isSettingsOpen}
        onToggle={() => setIsSettingsOpen(prev => !prev)}
        readingProgress={readingProgress}
        bookmarks={bookmarks.length}
        wordsRead={wordsRead}
        onBookmark={handleBookmark}
        isReading={!!selectedChapter}
      />
      
      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-6 left-6 text-xs text-gray-400 dark:text-gray-500 sepia:text-amber-600 bg-white/80 dark:bg-gray-900/80 sepia:bg-amber-50/80 backdrop-blur-sm px-3 py-2 rounded-lg">
        Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 sepia:bg-amber-200 rounded text-xs">S</kbd> for settings
        {selectedChapter && (
          <>
            , <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 sepia:bg-amber-200 rounded text-xs">B</kbd> to bookmark
          </>
        )}
        , <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 sepia:bg-amber-200 rounded text-xs">T</kbd> to toggle theme
        {selectedChapter && (
          <>
            , <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 sepia:bg-amber-200 rounded text-xs">Esc</kbd> to go back
          </>
        )}
      </div>
    </div>
  );
}

export default App;