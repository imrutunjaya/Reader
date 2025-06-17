import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Pause, Play, SkipForward, SkipBack, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';
import { Chapter, ReadingSettings } from '../types';

interface ImmersiveReaderProps {
  chapter: Chapter;
  settings: ReadingSettings;
  onProgressChange: (progress: number) => void;
  onWordsRead: (words: number) => void;
  onBack: () => void;
  onFocusScore: (score: number) => void;
}

export const ImmersiveReader: React.FC<ImmersiveReaderProps> = ({
  chapter,
  settings,
  onProgressChange,
  onWordsRead,
  onBack,
  onFocusScore
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState(250); // WPM
  const [isMuted, setIsMuted] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [eyeTrackingActive, setEyeTrackingActive] = useState(false);
  const [focusScore, setFocusScore] = useState(100);
  const [distractionCount, setDistractionCount] = useState(0);
  
  const contentRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const lastActiveRef = useRef<number>(Date.now());

  const words = chapter.content.split(/\s+/).filter(word => word.length > 0);

  // Simulated eye tracking and focus monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setDistractionCount(prev => prev + 1);
        updateFocusScore();
      } else {
        lastActiveRef.current = Date.now();
      }
    };

    const handleMouseMove = () => {
      lastActiveRef.current = Date.now();
    };

    const handleKeyPress = () => {
      lastActiveRef.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keypress', handleKeyPress);

    // Check for inactivity every 5 seconds
    const inactivityCheck = setInterval(() => {
      const timeSinceActive = Date.now() - lastActiveRef.current;
      if (timeSinceActive > 10000) { // 10 seconds of inactivity
        setDistractionCount(prev => prev + 1);
        updateFocusScore();
      }
    }, 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keypress', handleKeyPress);
      clearInterval(inactivityCheck);
    };
  }, []);

  const updateFocusScore = () => {
    const sessionDuration = Date.now() - startTimeRef.current;
    const sessionMinutes = sessionDuration / (1000 * 60);
    const distractionsPerMinute = distractionCount / Math.max(sessionMinutes, 1);
    
    // Calculate focus score (100 - penalty for distractions)
    const penalty = Math.min(distractionsPerMinute * 10, 50);
    const newScore = Math.max(100 - penalty, 0);
    
    setFocusScore(newScore);
    onFocusScore(newScore);
  };

  useEffect(() => {
    if (isPlaying) {
      const interval = 60000 / readingSpeed; // milliseconds per word
      intervalRef.current = setInterval(() => {
        setCurrentWordIndex(prev => {
          if (prev >= words.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, readingSpeed, words.length]);

  useEffect(() => {
    const progress = (currentWordIndex / words.length) * 100;
    onProgressChange(progress);
    onWordsRead(currentWordIndex);
  }, [currentWordIndex, words.length, onProgressChange, onWordsRead]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      lastActiveRef.current = Date.now();
    }
  };

  const skipForward = () => {
    setCurrentWordIndex(prev => Math.min(prev + 10, words.length - 1));
  };

  const skipBackward = () => {
    setCurrentWordIndex(prev => Math.max(prev - 10, 0));
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const toggleEyeTracking = () => {
    setEyeTrackingActive(!eyeTrackingActive);
  };

  const getHighlightedText = () => {
    return words.map((word, index) => {
      let className = 'transition-all duration-200 ';
      
      if (index === currentWordIndex) {
        className += 'bg-yellow-300 dark:bg-yellow-600 px-1 rounded font-bold scale-110 ';
      } else if (index < currentWordIndex) {
        className += 'text-gray-400 dark:text-gray-600 ';
      } else {
        className += 'text-gray-700 dark:text-gray-300 ';
      }
      
      return (
        <span key={index} className={className}>
          {word}{' '}
        </span>
      );
    });
  };

  const themeClasses = {
    light: 'bg-white text-gray-900',
    dark: 'bg-gray-900 text-gray-100',
    sepia: 'bg-amber-50 text-amber-900'
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${themeClasses[settings.theme]} ${focusMode ? 'bg-black text-white' : ''}`}>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="fixed top-6 left-6 z-50 p-3 bg-white dark:bg-gray-800 shadow-lg rounded-full hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Focus Score Indicator */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-4">
        <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
          focusScore >= 80 ? 'bg-green-100 text-green-800' :
          focusScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
          'bg-red-100 text-red-800'
        }`}>
          Focus: {Math.round(focusScore)}%
        </div>
        <button
          onClick={toggleFocusMode}
          className={`p-3 rounded-full transition-all ${focusMode ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
        >
          {focusMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Reading Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 flex items-center space-x-4">
          <button
            onClick={skipBackward}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <SkipBack className="w-5 h-5" />
          </button>
          
          <button
            onClick={togglePlayPause}
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          
          <button
            onClick={skipForward}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <SkipForward className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">Speed:</span>
            <input
              type="range"
              min="100"
              max="500"
              value={readingSpeed}
              onChange={(e) => setReadingSpeed(parseInt(e.target.value))}
              className="w-20"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{readingSpeed}</span>
          </div>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-20">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            {chapter.title}
          </h1>
          {chapter.subtitle && (
            <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-6 font-light">
              {chapter.subtitle}
            </h2>
          )}
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>By {chapter.author}</span>
            <span>•</span>
            <span>{chapter.estimatedReadTime} min read</span>
            <span>•</span>
            <span>Word {currentWordIndex + 1} of {words.length}</span>
          </div>
        </header>

        <div
          ref={contentRef}
          className="prose prose-lg max-w-none leading-relaxed"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            fontFamily: settings.fontFamily
          }}
        >
          {getHighlightedText()}
        </div>
      </div>
    </div>
  );
};