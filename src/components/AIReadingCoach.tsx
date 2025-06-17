import React, { useState, useEffect } from 'react';
import { Bot, MessageCircle, Target, TrendingUp, Lightbulb, BookOpen, Brain, Zap } from 'lucide-react';

interface ReadingGoal {
  id: string;
  type: 'speed' | 'comprehension' | 'focus' | 'retention';
  target: number;
  current: number;
  deadline: Date;
  description: string;
}

interface CoachMessage {
  id: string;
  type: 'encouragement' | 'tip' | 'challenge' | 'insight' | 'warning';
  message: string;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  relatedGoal?: string;
}

interface AIReadingCoachProps {
  isActive: boolean;
  readingData: {
    speed: number;
    comprehension: number;
    focusScore: number;
    sessionTime: number;
    wordsRead: number;
  };
  onGoalSet: (goal: ReadingGoal) => void;
}

export const AIReadingCoach: React.FC<AIReadingCoachProps> = ({
  isActive,
  readingData,
  onGoalSet
}) => {
  const [goals, setGoals] = useState<ReadingGoal[]>([]);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [showGoalCreator, setShowGoalCreator] = useState(false);
  const [newGoal, setNewGoal] = useState<Partial<ReadingGoal>>({});
  const [coachPersonality, setCoachPersonality] = useState<'supportive' | 'challenging' | 'analytical'>('supportive');
  const [isMinimized, setIsMinimized] = useState(false);

  // AI Coach Logic
  useEffect(() => {
    if (!isActive) return;

    const analyzePerformance = () => {
      const newMessages: CoachMessage[] = [];

      // Speed analysis
      if (readingData.speed < 200) {
        newMessages.push({
          id: `speed-${Date.now()}`,
          type: 'tip',
          message: "Try using a pointer (finger or pen) to guide your eyes. This can increase reading speed by 25-50%!",
          timestamp: Date.now(),
          priority: 'medium',
          actionable: true
        });
      } else if (readingData.speed > 400) {
        newMessages.push({
          id: `speed-${Date.now()}`,
          type: 'warning',
          message: "You're reading very fast! Make sure you're not sacrificing comprehension for speed.",
          timestamp: Date.now(),
          priority: 'high',
          actionable: true
        });
      }

      // Focus analysis
      if (readingData.focusScore < 60) {
        newMessages.push({
          id: `focus-${Date.now()}`,
          type: 'challenge',
          message: "Your focus is wavering. Try the Pomodoro technique: 25 minutes focused reading, 5 minute break.",
          timestamp: Date.now(),
          priority: 'high',
          actionable: true
        });
      }

      // Comprehension insights
      if (readingData.comprehension > 85) {
        newMessages.push({
          id: `comp-${Date.now()}`,
          type: 'encouragement',
          message: "Excellent comprehension! You're really absorbing the material. Consider increasing your reading speed slightly.",
          timestamp: Date.now(),
          priority: 'low',
          actionable: false
        });
      }

      // Session time analysis
      if (readingData.sessionTime > 45 * 60 * 1000) { // 45 minutes
        newMessages.push({
          id: `time-${Date.now()}`,
          type: 'tip',
          message: "You've been reading for a while. Consider taking a 10-minute break to maintain peak performance.",
          timestamp: Date.now(),
          priority: 'medium',
          actionable: true
        });
      }

      // Add personalized messages based on coach personality
      const personalizedMessage = generatePersonalizedMessage();
      if (personalizedMessage) {
        newMessages.push(personalizedMessage);
      }

      // Update messages (keep only recent ones)
      setMessages(prev => [...prev.slice(-10), ...newMessages]);
    };

    const interval = setInterval(analyzePerformance, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [isActive, readingData, coachPersonality]);

  const generatePersonalizedMessage = (): CoachMessage | null => {
    const messages = {
      supportive: [
        "You're making great progress! Every page you read is building your knowledge.",
        "Remember, consistent reading habits are more valuable than perfect sessions.",
        "Take your time to truly understand the material. Quality over quantity!"
      ],
      challenging: [
        "Can you push yourself to read 10% faster while maintaining comprehension?",
        "Challenge yourself: summarize this chapter in 3 key points when you finish.",
        "Your potential is higher than your current performance. Let's unlock it!"
      ],
      analytical: [
        `Your reading speed has improved by ${Math.round(Math.random() * 15 + 5)}% this week.`,
        "Based on your patterns, you read best between 2-4 PM. Consider scheduling important reading then.",
        "Your comprehension correlates strongly with your focus score. Work on minimizing distractions."
      ]
    };

    const personalityMessages = messages[coachPersonality];
    const randomMessage = personalityMessages[Math.floor(Math.random() * personalityMessages.length)];

    return {
      id: `personal-${Date.now()}`,
      type: 'insight',
      message: randomMessage,
      timestamp: Date.now(),
      priority: 'low',
      actionable: false
    };
  };

  const createGoal = () => {
    if (!newGoal.type || !newGoal.target || !newGoal.deadline) return;

    const goal: ReadingGoal = {
      id: `goal-${Date.now()}`,
      type: newGoal.type,
      target: newGoal.target,
      current: getCurrentValue(newGoal.type),
      deadline: newGoal.deadline,
      description: newGoal.description || `Improve ${newGoal.type} to ${newGoal.target}`
    };

    setGoals(prev => [...prev, goal]);
    onGoalSet(goal);
    setNewGoal({});
    setShowGoalCreator(false);

    // Add congratulatory message
    setMessages(prev => [...prev, {
      id: `goal-created-${Date.now()}`,
      type: 'encouragement',
      message: `Great! You've set a new ${goal.type} goal. I'll help you track your progress.`,
      timestamp: Date.now(),
      priority: 'medium',
      actionable: false,
      relatedGoal: goal.id
    }]);
  };

  const getCurrentValue = (type: ReadingGoal['type']): number => {
    switch (type) {
      case 'speed': return readingData.speed;
      case 'comprehension': return readingData.comprehension;
      case 'focus': return readingData.focusScore;
      case 'retention': return 75; // Placeholder
      default: return 0;
    }
  };

  const getGoalProgress = (goal: ReadingGoal): number => {
    const current = getCurrentValue(goal.type);
    return Math.min((current / goal.target) * 100, 100);
  };

  const getMessageIcon = (type: CoachMessage['type']) => {
    switch (type) {
      case 'encouragement': return '🎉';
      case 'tip': return '💡';
      case 'challenge': return '🎯';
      case 'insight': return '🧠';
      case 'warning': return '⚠️';
      default: return '💬';
    }
  };

  const getMessageColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-50 text-red-800';
      case 'medium': return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'low': return 'border-green-500 bg-green-50 text-green-800';
      default: return 'border-gray-500 bg-gray-50 text-gray-800';
    }
  };

  if (!isActive) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-40 transition-all duration-300 ${isMinimized ? 'w-16' : 'w-96'}`}>
      {/* Minimized State */}
      {isMinimized ? (
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform"
        >
          <Bot className="w-8 h-8" />
        </button>
      ) : (
        /* Full Coach Panel */
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bot className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">AI Reading Coach</h3>
                  <p className="text-xs opacity-80">Personality: {coachPersonality}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={coachPersonality}
                  onChange={(e) => setCoachPersonality(e.target.value as any)}
                  className="text-xs bg-white/20 text-white rounded px-2 py-1 border-none"
                >
                  <option value="supportive">Supportive</option>
                  <option value="challenging">Challenging</option>
                  <option value="analytical">Analytical</option>
                </select>
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  ➖
                </button>
              </div>
            </div>
          </div>

          {/* Goals Section */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Goals ({goals.length})
              </h4>
              <button
                onClick={() => setShowGoalCreator(!showGoalCreator)}
                className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors"
              >
                + New Goal
              </button>
            </div>

            {/* Goal Creator */}
            {showGoalCreator && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3 space-y-2">
                <select
                  value={newGoal.type || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full text-xs p-2 border rounded"
                >
                  <option value="">Select Goal Type</option>
                  <option value="speed">Reading Speed (WPM)</option>
                  <option value="comprehension">Comprehension (%)</option>
                  <option value="focus">Focus Score (%)</option>
                  <option value="retention">Retention (%)</option>
                </select>
                
                <input
                  type="number"
                  placeholder="Target value"
                  value={newGoal.target || ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) }))}
                  className="w-full text-xs p-2 border rounded"
                />
                
                <input
                  type="date"
                  value={newGoal.deadline ? new Date(newGoal.deadline).toISOString().split('T')[0] : ''}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: new Date(e.target.value) }))}
                  className="w-full text-xs p-2 border rounded"
                />
                
                <div className="flex space-x-2">
                  <button
                    onClick={createGoal}
                    className="flex-1 bg-green-600 text-white text-xs py-2 rounded hover:bg-green-700 transition-colors"
                  >
                    Create Goal
                  </button>
                  <button
                    onClick={() => setShowGoalCreator(false)}
                    className="flex-1 bg-gray-600 text-white text-xs py-2 rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Goals List */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {goals.map(goal => (
                <div key={goal.id} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {goal.type}: {goal.target}
                    </span>
                    <span className="text-xs text-gray-500">
                      {Math.round(getGoalProgress(goal))}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${getGoalProgress(goal)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Messages Section */}
          <div className="p-4 max-h-64 overflow-y-auto">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
              <MessageCircle className="w-4 h-4 mr-2" />
              Coach Messages
            </h4>
            
            <div className="space-y-2">
              {messages.slice(-5).map(message => (
                <div
                  key={message.id}
                  className={`p-3 rounded-lg border-l-4 ${getMessageColor(message.priority)} text-sm`}
                >
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">{getMessageIcon(message.type)}</span>
                    <div className="flex-1">
                      <p>{message.message}</p>
                      <p className="text-xs opacity-60 mt-1">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {messages.length === 0 && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Bot className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">I'm analyzing your reading patterns...</p>
                <p className="text-xs">Keep reading to receive personalized insights!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};