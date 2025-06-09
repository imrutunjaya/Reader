import React from 'react';
import { Settings, X, Sun, Moon, FileText, Bookmark, BarChart3 } from 'lucide-react';
import { ReadingSettings } from '../types';

interface SettingsPanelProps {
  settings: ReadingSettings;
  onSettingsChange: (settings: ReadingSettings) => void;
  isOpen: boolean;
  onToggle: () => void;
  readingProgress: number;
  bookmarks: number;
  wordsRead: number;
  onBookmark: () => void;
  isReading: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  isOpen,
  onToggle,
  readingProgress,
  bookmarks,
  wordsRead,
  onBookmark,
  isReading
}) => {
  const fontOptions = [
    'Inter, system-ui, sans-serif',
    'Georgia, serif', 
    'Crimson Text, serif',
    'Source Code Pro, monospace'
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'sepia', label: 'Sepia', icon: FileText }
  ] as const;

  return (
    <>
      {/* Settings Toggle Button */}
      <button
        onClick={onToggle}
        className="fixed top-6 right-6 z-50 p-3 bg-white dark:bg-gray-800 sepia:bg-amber-50 shadow-lg rounded-full hover:shadow-xl transition-all duration-200 hover:scale-105"
      >
        <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300 sepia:text-amber-900" />
      </button>

      {/* Settings Panel */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-white dark:bg-gray-900 sepia:bg-amber-50 shadow-2xl transform transition-transform duration-300 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 sepia:text-amber-900">
              Reading Settings
            </h2>
            <button
              onClick={onToggle}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 sepia:hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400 sepia:text-amber-800" />
            </button>
          </div>

          {/* Reading Stats - Only show when reading */}
          {isReading && (
            <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 sepia:bg-amber-100 rounded-lg">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 sepia:text-amber-900 mb-3 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Reading Stats
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 sepia:text-amber-700">Progress</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 sepia:text-amber-900">
                    {Math.round(readingProgress)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 sepia:text-amber-700">Words Read</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 sepia:text-amber-900">
                    {wordsRead.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 sepia:text-amber-700">Total Bookmarks</span>
                  <span className="font-medium text-gray-800 dark:text-gray-200 sepia:text-amber-900">
                    {bookmarks}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bookmark Button - Only show when reading */}
          {isReading && (
            <button
              onClick={onBookmark}
              className="w-full mb-6 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Bookmark Current Position
            </button>
          )}

          {/* Font Size */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sepia:text-amber-800 mb-2">
              Font Size: {settings.fontSize}px
            </label>
            <input
              type="range"
              min="14"
              max="24"
              value={settings.fontSize}
              onChange={(e) => onSettingsChange({ ...settings, fontSize: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Line Height */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sepia:text-amber-800 mb-2">
              Line Height: {settings.lineHeight}
            </label>
            <input
              type="range"
              min="1.4"
              max="2.0"
              step="0.1"
              value={settings.lineHeight}
              onChange={(e) => onSettingsChange({ ...settings, lineHeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Font Family */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sepia:text-amber-800 mb-2">
              Font Family
            </label>
            <select
              value={settings.fontFamily}
              onChange={(e) => onSettingsChange({ ...settings, fontFamily: e.target.value })}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 sepia:border-amber-300 rounded-lg bg-white dark:bg-gray-800 sepia:bg-amber-50 text-gray-800 dark:text-gray-200 sepia:text-amber-900"
            >
              {fontOptions.map((font) => (
                <option key={font} value={font}>
                  {font.split(',')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Theme */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 sepia:text-amber-800 mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onSettingsChange({ ...settings, theme: value })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.theme === value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 sepia:bg-amber-200'
                      : 'border-gray-200 dark:border-gray-700 sepia:border-amber-200 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-5 h-5 mx-auto mb-1 text-gray-600 dark:text-gray-400 sepia:text-amber-700" />
                  <div className="text-xs text-gray-600 dark:text-gray-400 sepia:text-amber-700">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Show Progress - Only show when reading */}
          {isReading && (
            <div className="mb-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.showProgress}
                  onChange={(e) => onSettingsChange({ ...settings, showProgress: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 sepia:text-amber-800">
                  Show Reading Progress
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
};