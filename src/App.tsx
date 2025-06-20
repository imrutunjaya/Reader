import React, { useState, useEffect } from 'react';
import { ChapterList } from './components/ChapterList';
import { ImmersiveReader } from './components/ImmersiveReader';
import { SettingsPanel } from './components/SettingsPanel';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { ProgressBar } from './components/ProgressBar';
import { ReadingAnalytics } from './components/ReadingAnalytics';
import { SmartBookmarks } from './components/SmartBookmarks';
import { BiometricOptimizer } from './components/BiometricOptimizer';
import { ImmersiveVisualization } from './components/ImmersiveVisualization';
import { AIReadingCoach } from './components/AIReadingCoach';
import { ReadingSettings, BookmarkData, Chapter } from './types';
import { useChapters } from './hooks/useChapters';
import { useAuth } from './hooks/useAuth';
import { chapters as fallbackChapters } from './data/sampleContent';

const defaultSettings: ReadingSettings = {
  fontSize: 18,
  lineHeight: 1.6,
  fontFamily: 'Inter, system-ui, sans-serif',
  theme: 'dark',
  showProgress: true
};

function App() {
  const { user, loading: authLoading } = useAuth();
  const { chapters: dbChapters, loading: chaptersLoading } = useChapters();
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    const saved = localStorage.getItem('reading-settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);
  const [isVisualizationOpen, setIsVisualizationOpen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [wordsRead, setWordsRead] = useState(0);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Advanced features state
  const [biometricOptimization, setBiometricOptimization] = useState(false);
  const [aiCoachActive, setAiCoachActive] = useState(true);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const [readingSessionStart, setReadingSessionStart] = useState<number>(Date.now());

  // Use database chapters if available, otherwise fallback to static chapters
  const chapters = dbChapters.length > 0 ? dbChapters : fallbackChapters;

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    root.className = 'dark'; // Force dark theme for black glassy design
    
    // Update page title based on current view
    const baseTitle = 'Advanced Knowledge Library • Black Glass Edition';
    
    if (selectedChapter) {
      document.title = `${selectedChapter.title} - ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }, [selectedChapter]);

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
      setReadingSessionStart(Date.now());
    }
  }, [selectedChapter]);

  const handleChapterSelect = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    setIsAdminOpen(false);
    setImmersiveMode(false);
  };

  const handleBackToLibrary = () => {
    setSelectedChapter(null);
    setReadingProgress(0);
    setWordsRead(0);
    setImmersiveMode(false);
    setIsVisualizationOpen(false);
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
    
    // Show a brief confirmation with glass morphism styling
    const notification = document.createElement('div');
    notification.textContent = 'Smart bookmark saved with AI insights!';
    notification.className = 'fixed top-20 right-6 glass-card text-white px-6 py-3 z-50 font-medium glow';
    notification.style.animation = 'fadeInOut 3s ease-in-out forwards';
    document.body.appendChild(notification);
    
    // Add fadeInOut animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translateY(-20px); }
        20%, 80% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-20px); }
      }
    `;
    document.head.appendChild(style);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 3000);
  };

  const handleAdminAccess = () => {
    if (user) {
      setIsAdminOpen(true);
    } else {
      setIsAuthOpen(true);
    }
  };

  const handleNavigateToBookmark = (chapterId: string, position: number) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setSelectedChapter(chapter);
      setReadingProgress(position);
      setIsBookmarksOpen(false);
    }
  };

  const toggleImmersiveMode = () => {
    setImmersiveMode(!immersiveMode);
  };

  const getCurrentReadingData = () => ({
    speed: Math.round(wordsRead / Math.max((Date.now() - readingSessionStart) / 60000, 1)), // WPM
    comprehension: Math.max(85 - (focusScore < 70 ? 20 : 0), 60), // Simulated
    focusScore,
    sessionTime: Date.now() - readingSessionStart,
    wordsRead
  });

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) {
        return;
      }

      // Existing shortcuts
      if (e.key === 's' || e.key === 'S') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsSettingsOpen(prev => !prev);
        }
      }
      
      if ((e.key === 'a' || e.key === 'A') && user) {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsAdminOpen(prev => !prev);
        }
      }
      
      if ((e.key === 'b' || e.key === 'B') && selectedChapter) {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleBookmark();
        }
      }

      // New advanced shortcuts
      if (e.key === 'v' || e.key === 'V') {
        if (!e.ctrlKey && !e.metaKey && selectedChapter) {
          e.preventDefault();
          setIsVisualizationOpen(prev => !prev);
        }
      }

      if (e.key === 'n' || e.key === 'N') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setIsAnalyticsOpen(prev => !prev);
        }
      }

      if (e.key === 'm' || e.key === 'M') {
        if (!e.ctrlKey && !e.metaKey && selectedChapter) {
          e.preventDefault();
          toggleImmersiveMode();
        }
      }

      if (e.key === 'o' || e.key === 'O') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          setBiometricOptimization(prev => !prev);
        }
      }
      
      if (e.key === 't' || e.key === 'T') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          const themes: ReadingSettings['theme'][] = ['light', 'dark', 'sepia'];
          const currentIndex = themes.indexOf(settings.theme);
          const nextTheme = themes[(currentIndex + 1) % themes.length];
          setSettings(prev => ({ ...prev, theme: nextTheme }));
        }
      }
      
      if (e.key === 'Escape') {
        if (isVisualizationOpen) {
          setIsVisualizationOpen(false);
        } else if (isAnalyticsOpen) {
          setIsAnalyticsOpen(false);
        } else if (isBookmarksOpen) {
          setIsBookmarksOpen(false);
        } else if (isAdminOpen) {
          setIsAdminOpen(false);
        } else if (isSettingsOpen) {
          setIsSettingsOpen(false);
        } else if (selectedChapter) {
          handleBackToLibrary();
        }
      }
    };

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [settings.theme, selectedChapter, isSettingsOpen, isAdminOpen, isAnalyticsOpen, isBookmarksOpen, isVisualizationOpen, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-white/20 border-t-white/60 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500/20 border-t-purple-500/60 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <div className="glass-card px-8 py-6">
            <p className="text-2xl text-white font-medium mb-2">Initializing Advanced Reading Experience...</p>
            <p className="text-white/60">Loading AI systems and biometric sensors</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      {selectedChapter && (
        <ProgressBar 
          progress={readingProgress} 
          showProgress={settings.showProgress}
        />
      )}
      
      {selectedChapter ? (
        immersiveMode ? (
          <ImmersiveReader
            chapter={selectedChapter}
            settings={settings}
            onProgressChange={setReadingProgress}
            onWordsRead={setWordsRead}
            onBack={handleBackToLibrary}
            onFocusScore={setFocusScore}
          />
        ) : (
          <div className="min-h-screen animated-bg">
            {/* Enhanced Reading Interface */}
            <div className="max-w-4xl mx-auto px-6 py-12">
              <header className="mb-12 text-center">
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={handleBackToLibrary}
                    className="glass-button px-6 py-3 flex items-center space-x-2 glow-hover"
                  >
                    ← Back to Library
                  </button>
                  
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setIsAnalyticsOpen(true)}
                      className="glass-button px-4 py-2 text-white/80 hover:text-white transition-colors"
                    >
                      📊 Analytics
                    </button>
                    <button
                      onClick={() => setIsBookmarksOpen(true)}
                      className="glass-button px-4 py-2 text-white/80 hover:text-white transition-colors"
                    >
                      🔖 Smart Bookmarks
                    </button>
                    <button
                      onClick={() => setIsVisualizationOpen(true)}
                      className="glass-button px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white hover:from-purple-500/30 hover:to-pink-500/30 transition-all"
                    >
                      ✨ Visualize
                    </button>
                    <button
                      onClick={toggleImmersiveMode}
                      className="glass-button px-4 py-2 bg-gradient-to-r from-green-500/20 to-teal-500/20 text-white hover:from-green-500/30 hover:to-teal-500/30 transition-all"
                    >
                      🎯 Immersive Mode
                    </button>
                  </div>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight gradient-text">
                  {selectedChapter.title}
                </h1>
                
                {selectedChapter.subtitle && (
                  <h2 className="text-xl md:text-2xl text-white/70 mb-6 font-light">
                    {selectedChapter.subtitle}
                  </h2>
                )}
                
                <div className="flex items-center justify-center space-x-4 text-sm text-white/60 mb-6">
                  <span>By {selectedChapter.author}</span>
                  <span>•</span>
                  <span>{selectedChapter.estimatedReadTime} min read</span>
                  <span>•</span>
                  <span>{selectedChapter.category}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    focusScore >= 80 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                    focusScore >= 60 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                    'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    Focus: {Math.round(focusScore)}%
                  </span>
                </div>

                <div className="flex flex-wrap justify-center gap-2">
                  {selectedChapter.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 glass-card text-blue-300 text-sm rounded-full border border-blue-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </header>

              <div 
                className="prose prose-lg max-w-none transition-all duration-300 text-white/90"
                style={{
                  fontSize: `${settings.fontSize}px`,
                  lineHeight: settings.lineHeight,
                  fontFamily: settings.fontFamily
                }}
              >
                {selectedChapter.content.split('\n\n').map((paragraph, index) => {
                  if (paragraph.startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold mb-6 mt-8 text-white">
                        {paragraph.replace('## ', '')}
                      </h2>
                    );
                  }
                  
                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                    return (
                      <h3 key={index} className="text-lg font-semibold mb-4 mt-6 text-white/90">
                        {paragraph.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }

                  const formattedParagraph = paragraph.replace(
                    /\*\*(.*?)\*\*/g, 
                    '<strong class="font-semibold text-white">$1</strong>'
                  );

                  return (
                    <p 
                      key={index} 
                      className="mb-6 text-white/80 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formattedParagraph }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : (
        <ChapterList
          chapters={chapters}
          onChapterSelect={handleChapterSelect}
          theme={settings.theme}
          loading={chaptersLoading}
          onAdminAccess={handleAdminAccess}
          isAuthenticated={!!user}
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

      <AdminPanel
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onChapterSelect={handleChapterSelect}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <ReadingAnalytics
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      <SmartBookmarks
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        onNavigateToBookmark={handleNavigateToBookmark}
      />

      <BiometricOptimizer
        isActive={biometricOptimization}
        onOptimizationSuggestion={(suggestion) => {
          console.log('Optimization suggestion:', suggestion);
        }}
        onBiometricUpdate={(data) => {
          console.log('Biometric data:', data);
        }}
      />

      <ImmersiveVisualization
        content={selectedChapter?.content || ''}
        isActive={isVisualizationOpen}
        onClose={() => setIsVisualizationOpen(false)}
        theme={settings.theme}
      />

      <AIReadingCoach
        isActive={aiCoachActive}
        readingData={getCurrentReadingData()}
        onGoalSet={(goal) => {
          console.log('New reading goal set:', goal);
        }}
      />
      
      {/* Enhanced Keyboard shortcuts hint */}
      <div className="fixed bottom-6 left-6 glass-card text-xs text-white/60 px-4 py-3 glow">
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">S</kbd> Settings</div>
          {user && <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">A</kbd> Admin</div>}
          {selectedChapter && <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">B</kbd> Bookmark</div>}
          <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">T</kbd> Theme</div>
          <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">N</kbd> Analytics</div>
          {selectedChapter && <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">V</kbd> Visualize</div>}
          {selectedChapter && <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">M</kbd> Immersive</div>}
          <div><kbd className="px-1 py-0.5 bg-white/20 rounded text-xs">O</kbd> Biometric</div>
        </div>
      </div>
    </div>
  );
}

export default App;