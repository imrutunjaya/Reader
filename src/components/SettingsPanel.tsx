import React from 'react';
import { Settings, X, Sun, Moon, FileText, Bookmark, BarChart3, Palette, Volume2 } from 'lucide-react';
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
        className="fixed top-6 right-6 z-50 glass-button p-4 glow-hover"
      >
        <Settings className="w-6 h-6 text-white" />
      </button>

      {/* Settings Panel */}
      <div className={`fixed top-0 right-0 h-full w-96 glass-card border-l border-white/20 transform transition-transform duration-500 z-40 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Reading Settings
              </h2>
            </div>
            <button
              onClick={onToggle}
              className="glass-button p-2 hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Reading Stats - Only show when reading */}
          {isReading && (
            <div className="mb-8 glass-card p-6">
              <h3 className="font-medium text-white mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                Reading Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Progress</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                        style={{ width: `${readingProgress}%` }}
                      />
                    </div>
                    <span className="font-medium text-white text-sm">
                      {Math.round(readingProgress)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Words Read</span>
                  <span className="font-medium text-white">
                    {wordsRead.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/70">Total Bookmarks</span>
                  <span className="font-medium text-white">
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
              className="w-full mb-6 p-4 bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 font-medium"
            >
              <Bookmark className="w-5 h-5" />
              <span>Bookmark Current Position</span>
            </button>
          )}

          {/* Font Size */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Font Size: {settings.fontSize}px
            </label>
            <div className="glass-card p-4">
              <input
                type="range"
                min="14"
                max="24"
                value={settings.fontSize}
                onChange={(e) => onSettingsChange({ ...settings, fontSize: parseInt(e.target.value) })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Line Height */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Line Height: {settings.lineHeight}
            </label>
            <div className="glass-card p-4">
              <input
                type="range"
                min="1.4"
                max="2.0"
                step="0.1"
                value={settings.lineHeight}
                onChange={(e) => onSettingsChange({ ...settings, lineHeight: parseFloat(e.target.value) })}
                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              />
            </div>
          </div>

          {/* Font Family */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Font Family
            </label>
            <div className="glass-card p-2">
              <select
                value={settings.fontFamily}
                onChange={(e) => onSettingsChange({ ...settings, fontFamily: e.target.value })}
                className="w-full p-3 bg-transparent text-white focus:outline-none cursor-pointer"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font} className="bg-black text-white">
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-3">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onSettingsChange({ ...settings, theme: value })}
                  className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                    settings.theme === value
                      ? 'border-blue-500 bg-blue-500/20 glow'
                      : 'border-white/20 glass-card hover:border-white/30'
                  }`}
                >
                  <Icon className="w-6 h-6 mx-auto mb-2 text-white" />
                  <div className="text-xs text-white font-medium">{label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Show Progress - Only show when reading */}
          {isReading && (
            <div className="mb-8">
              <div className="glass-card p-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showProgress}
                    onChange={(e) => onSettingsChange({ ...settings, showProgress: e.target.checked })}
                    className="sr-only"
                  />
                  <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                    settings.showProgress ? 'bg-blue-500' : 'bg-white/20'
                  }`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${
                      settings.showProgress ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="ml-3 text-sm font-medium text-white">
                    Show Reading Progress
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Audio Settings */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/80 mb-3">
              Audio Settings
            </label>
            <div className="glass-card p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-5 h-5 text-white/70" />
                  <span className="text-white text-sm">Ambient Sounds</span>
                </div>
                <div className="w-12 h-6 bg-white/20 rounded-full relative cursor-pointer">
                  <div className="absolute top-1 left-1 w-4 h-4 bg-white/50 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={onToggle}
        />
      )}

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          cursor: pointer;
          border: 2px solid rgba(255, 255, 255, 0.3);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
};