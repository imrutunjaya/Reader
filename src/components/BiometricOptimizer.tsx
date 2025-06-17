import React, { useState, useEffect, useRef } from 'react';
import { Activity, Heart, Eye, Brain, Zap, TrendingUp, Settings, AlertCircle } from 'lucide-react';

interface BiometricData {
  heartRate: number;
  eyeStrain: number;
  focusLevel: number;
  cognitiveLoad: number;
  timestamp: number;
}

interface OptimizationSuggestion {
  type: 'break' | 'lighting' | 'posture' | 'speed' | 'environment';
  message: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
}

interface BiometricOptimizerProps {
  isActive: boolean;
  onOptimizationSuggestion: (suggestion: OptimizationSuggestion) => void;
  onBiometricUpdate: (data: BiometricData) => void;
}

export const BiometricOptimizer: React.FC<BiometricOptimizerProps> = ({
  isActive,
  onOptimizationSuggestion,
  onBiometricUpdate
}) => {
  const [biometricData, setBiometricData] = useState<BiometricData[]>([]);
  const [currentData, setCurrentData] = useState<BiometricData | null>(null);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [showDetailedView, setShowDetailedView] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated biometric monitoring (in real app, this would use actual sensors/camera)
  useEffect(() => {
    if (!isActive) return;

    const startMonitoring = () => {
      intervalRef.current = setInterval(() => {
        const newData: BiometricData = {
          heartRate: 60 + Math.random() * 40 + (Math.sin(Date.now() / 10000) * 10),
          eyeStrain: Math.random() * 100,
          focusLevel: 70 + Math.random() * 30 - (biometricData.length > 10 ? 10 : 0),
          cognitiveLoad: 30 + Math.random() * 50,
          timestamp: Date.now()
        };

        setCurrentData(newData);
        setBiometricData(prev => [...prev.slice(-50), newData]);
        onBiometricUpdate(newData);
        
        // Generate optimization suggestions
        generateSuggestions(newData);
      }, 2000);
    };

    startMonitoring();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, biometricData.length]);

  const generateSuggestions = (data: BiometricData) => {
    const newSuggestions: OptimizationSuggestion[] = [];

    if (data.eyeStrain > 70) {
      newSuggestions.push({
        type: 'break',
        message: 'High eye strain detected',
        priority: 'high',
        action: 'Take a 20-second break and look at something 20 feet away'
      });
    }

    if (data.heartRate > 90) {
      newSuggestions.push({
        type: 'environment',
        message: 'Elevated heart rate detected',
        priority: 'medium',
        action: 'Consider reducing environmental stressors or taking deep breaths'
      });
    }

    if (data.focusLevel < 50) {
      newSuggestions.push({
        type: 'speed',
        message: 'Focus level declining',
        priority: 'medium',
        action: 'Consider slowing down reading speed or taking a short break'
      });
    }

    if (data.cognitiveLoad > 80) {
      newSuggestions.push({
        type: 'break',
        message: 'High cognitive load detected',
        priority: 'high',
        action: 'Take a 5-minute break to process information'
      });
    }

    // Only add new unique suggestions
    const uniqueSuggestions = newSuggestions.filter(newSug => 
      !suggestions.some(existingSug => 
        existingSug.type === newSug.type && existingSug.message === newSug.message
      )
    );

    if (uniqueSuggestions.length > 0) {
      setSuggestions(prev => [...prev.slice(-5), ...uniqueSuggestions]);
      uniqueSuggestions.forEach(suggestion => onOptimizationSuggestion(suggestion));
    }
  };

  const startCalibration = async () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);

    // Simulate calibration process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setCalibrationProgress(i);
    }

    setIsCalibrating(false);
  };

  const getStatusColor = (value: number, type: 'heartRate' | 'eyeStrain' | 'focusLevel' | 'cognitiveLoad') => {
    switch (type) {
      case 'heartRate':
        if (value < 60 || value > 100) return 'text-red-600 bg-red-100';
        if (value > 80) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
      case 'eyeStrain':
        if (value > 70) return 'text-red-600 bg-red-100';
        if (value > 40) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
      case 'focusLevel':
        if (value < 50) return 'text-red-600 bg-red-100';
        if (value < 70) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
      case 'cognitiveLoad':
        if (value > 80) return 'text-red-600 bg-red-100';
        if (value > 60) return 'text-yellow-600 bg-yellow-100';
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-500 bg-green-50 text-green-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  const dismissSuggestion = (index: number) => {
    setSuggestions(prev => prev.filter((_, i) => i !== index));
  };

  if (!isActive) return null;

  return (
    <div className="fixed top-20 right-6 z-40 w-80">
      {/* Main Biometric Panel */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Biometric Monitor</h3>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDetailedView(!showDetailedView)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            </div>
          </div>
        </div>

        {/* Calibration */}
        {isCalibrating && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center space-x-2 mb-2">
              <Brain className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800 dark:text-blue-300">Calibrating...</span>
            </div>
            <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${calibrationProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Current Metrics */}
        {currentData && (
          <div className="p-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Heart Rate</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentData.heartRate, 'heartRate')}`}>
                  {Math.round(currentData.heartRate)} BPM
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Eye Strain</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentData.eyeStrain, 'eyeStrain')}`}>
                  {Math.round(currentData.eyeStrain)}%
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Focus</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentData.focusLevel, 'focusLevel')}`}>
                  {Math.round(currentData.focusLevel)}%
                </div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Brain className="w-4 h-4 text-purple-500" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Cognitive Load</span>
                </div>
                <div className={`px-2 py-1 rounded-full text-sm font-semibold ${getStatusColor(currentData.cognitiveLoad, 'cognitiveLoad')}`}>
                  {Math.round(currentData.cognitiveLoad)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed View */}
        {showDetailedView && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="space-y-3">
              <button
                onClick={startCalibration}
                disabled={isCalibrating}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {isCalibrating ? 'Calibrating...' : 'Recalibrate Sensors'}
              </button>
              
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>• Heart rate via camera photoplethysmography</p>
                <p>• Eye strain via blink rate analysis</p>
                <p>• Focus via attention tracking</p>
                <p>• Cognitive load via reading patterns</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div className="mt-4 space-y-2">
          {suggestions.slice(-3).map((suggestion, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(suggestion.priority)} shadow-lg`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium text-sm">{suggestion.message}</span>
                  </div>
                  <p className="text-xs opacity-80">{suggestion.action}</p>
                </div>
                <button
                  onClick={() => dismissSuggestion(suggestions.length - 3 + index)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden video element for camera access */}
      <video
        ref={videoRef}
        className="hidden"
        autoPlay
        muted
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
};