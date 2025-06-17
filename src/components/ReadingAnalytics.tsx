import React, { useState, useEffect } from 'react';
import { BarChart3, Clock, Target, TrendingUp, Eye, Brain, Zap, Award } from 'lucide-react';

interface ReadingSession {
  id: string;
  chapterId: string;
  chapterTitle: string;
  startTime: number;
  endTime: number;
  wordsRead: number;
  focusScore: number;
  comprehensionScore: number;
  readingSpeed: number;
}

interface ReadingAnalyticsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReadingAnalytics: React.FC<ReadingAnalyticsProps> = ({ isOpen, onClose }) => {
  const [sessions, setSessions] = useState<ReadingSession[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    // Load reading sessions from localStorage
    const savedSessions = localStorage.getItem('reading-sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  const getFilteredSessions = () => {
    const now = Date.now();
    const ranges = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000
    };
    
    return sessions.filter(session => 
      now - session.startTime <= ranges[timeRange]
    );
  };

  const filteredSessions = getFilteredSessions();
  
  const totalReadingTime = filteredSessions.reduce((acc, session) => 
    acc + (session.endTime - session.startTime), 0
  );
  
  const totalWordsRead = filteredSessions.reduce((acc, session) => 
    acc + session.wordsRead, 0
  );
  
  const averageFocusScore = filteredSessions.length > 0 
    ? filteredSessions.reduce((acc, session) => acc + session.focusScore, 0) / filteredSessions.length
    : 0;
  
  const averageReadingSpeed = filteredSessions.length > 0
    ? filteredSessions.reduce((acc, session) => acc + session.readingSpeed, 0) / filteredSessions.length
    : 0;

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Reading Analytics</h2>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-8 h-8 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{formatTime(totalReadingTime)}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reading Time</h3>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Eye className="w-8 h-8 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{totalWordsRead.toLocaleString()}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Words Read</h3>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Brain className="w-8 h-8 text-purple-600" />
                <span className={`text-2xl font-bold px-3 py-1 rounded-full ${getScoreColor(averageFocusScore)}`}>
                  {Math.round(averageFocusScore)}%
                </span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Focus Score</h3>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <Zap className="w-8 h-8 text-orange-600" />
                <span className="text-2xl font-bold text-orange-600">{Math.round(averageReadingSpeed)}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">WPM Average</h3>
            </div>
          </div>

          {/* Reading Sessions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6 flex items-center">
              <Award className="w-6 h-6 mr-2 text-yellow-600" />
              Recent Reading Sessions
            </h3>
            
            {filteredSessions.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No reading sessions found</p>
                <p className="text-sm">Start reading to see your analytics!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSessions.slice(0, 10).map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{session.chapterTitle}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(session.startTime).toLocaleDateString()} • {formatTime(session.endTime - session.startTime)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{session.wordsRead}</div>
                        <div className="text-gray-500">words</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">{session.readingSpeed}</div>
                        <div className="text-gray-500">wpm</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getScoreColor(session.focusScore)}`}>
                        {session.focusScore}% focus
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};