import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  X, 
  HelpCircle, 
  Heart, 
  Zap, 
  ArrowRight, 
  Mail, 
  Inbox, 
  MessageSquare, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProgressCircle } from '@/components/ProgressCircle';
import { Widget } from '@/hooks/useWidgets';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface EmailHealthScoreWidgetProps {
  widget: Widget;
  data: any; // This would contain real metrics in a production app
  onRemove: (id: string) => void;
}

interface HealthScore {
  area: string;
  score: number;
  color: string;
  icon: React.ElementType;
  suggestions: string[];
}

// Create a progress circle component for reuse
export const ProgressCircle = ({ value, size = 64, strokeWidth = 8, color = '#6366f1' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#e9ecef"
        strokeWidth={strokeWidth}
      />
      {/* Foreground circle */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
      {/* Display text in the center */}
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#1f2937"
        className="transform rotate-90"
      >
        {value}
      </text>
    </svg>
  );
};

const EmailHealthScoreWidget: React.FC<EmailHealthScoreWidgetProps> = ({ widget, data, onRemove }) => {
  const [activeTab, setActiveTab] = useState<string>('overall');
  const [isAIAnalyzing, setIsAIAnalyzing] = useState<boolean>(false);
  const [showInsight, setShowInsight] = useState<boolean>(false);
  
  // Health scores calculation (would be from API in production)
  const healthScores: HealthScore[] = [
    {
      area: 'Deliverability',
      score: 82,
      color: '#10b981', // green
      icon: Mail,
      suggestions: [
        'Consider implementing DKIM/SPF authentication to improve trust',
        'Regularly clean your email list to remove invalid addresses',
        'Monitor your sending IP reputation with monitoring tools'
      ]
    },
    {
      area: 'Engagement',
      score: 68,
      color: '#f59e0b', // amber
      icon: MessageSquare,
      suggestions: [
        'Test different subject lines to improve open rates',
        'Segment your audience for more targeted content',
        'Add more interactive elements like polls or surveys'
      ]
    },
    {
      area: 'List Quality',
      score: 91,
      color: '#10b981', // green
      icon: Inbox,
      suggestions: [
        'Consider implementing a double opt-in process',
        'Continue regular list maintenance practices',
        'Monitor for potential spam traps in your list'
      ]
    },
  ];
  
  // Calculate overall score (weighted average)
  const weights = { Deliverability: 0.4, Engagement: 0.4, 'List Quality': 0.2 };
  const overallScore = Math.round(
    healthScores.reduce((acc, score) => 
      acc + score.score * weights[score.area as keyof typeof weights], 0)
  );
  
  // Determine overall health color
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };
  
  const overallColor = getHealthColor(overallScore);
  
  // Get the active score object
  const activeScore = activeTab === 'overall' 
    ? { 
        area: 'Overall', 
        score: overallScore, 
        color: overallColor,
        icon: Heart,
        suggestions: [
          'Focus on improving engagement metrics',
          'Continue monitoring deliverability rates',
          'Implement A/B testing for subject lines and content'
        ]
      } 
    : healthScores.find(s => s.area.toLowerCase() === activeTab) || healthScores[0];

  // Simulate AI analysis
  const runAIAnalysis = () => {
    setIsAIAnalyzing(true);
    setTimeout(() => {
      setIsAIAnalyzing(false);
      setShowInsight(true);
    }, 2000);
  };
  
  // Reset insight
  useEffect(() => {
    setShowInsight(false);
  }, [activeTab]);
  
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow col-span-1 md:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center">
          <Heart className="mr-2 h-5 w-5 text-purple-600" />
          <CardTitle className="text-lg font-semibold">{widget.title}</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p>This widget uses intelligent algorithms to analyze your email health across deliverability, engagement, and list quality. Higher scores indicate better email program health.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onRemove(widget.id)}>
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Column: Health Score Display */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-gray-700">Email Health Score</h3>
              <p className="text-sm text-gray-500">Based on your last 30 days</p>
            </div>
            
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg viewBox="0 0 100 100" width="100%" height="100%">
                {/* Outer circle background */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e9ecef"
                  strokeWidth="10"
                />
                
                {/* Animated progress circle */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={activeScore.color}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset="283"
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ 
                    strokeDashoffset: 283 - (283 * activeScore.score) / 100 
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
                
                {/* Score text */}
                <g>
                  <AnimatePresence mode="wait">
                    <motion.text
                      key={activeScore.score}
                      x="50"
                      y="50"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="24"
                      fontWeight="bold"
                      fill="#1f2937"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                    >
                      {activeScore.score}
                    </motion.text>
                  </AnimatePresence>
                  
                  <text
                    x="50"
                    y="65"
                    textAnchor="middle"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    out of 100
                  </text>
                </g>
              </svg>
              
              {/* Tabs for different metrics */}
              <div className="absolute -bottom-8 flex space-x-1">
                <Button 
                  variant={activeTab === 'overall' ? "default" : "outline"} 
                  size="sm"
                  className={`text-xs rounded-full px-3 py-1 ${activeTab === 'overall' ? 'bg-purple-600 text-white' : ''}`}
                  onClick={() => setActiveTab('overall')}
                >
                  Overall
                </Button>
                {healthScores.map((score) => (
                  <Button
                    key={score.area}
                    variant={activeTab === score.area.toLowerCase() ? "default" : "outline"}
                    size="sm"
                    className={`text-xs rounded-full px-3 py-1 ${activeTab === score.area.toLowerCase() ? 'bg-purple-600 text-white' : ''}`}
                    onClick={() => setActiveTab(score.area.toLowerCase())}
                  >
                    {score.area}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="mt-12 w-full">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
                onClick={runAIAnalysis}
                disabled={isAIAnalyzing}
              >
                {isAIAnalyzing ? (
                  <>
                    <Sparkles className="h-4 w-4 animate-pulse" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Get AI Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Right Column: Score Details */}
          <div className="w-full md:w-2/3">
            <div className="bg-slate-50 rounded-lg p-4 h-full border border-slate-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                <activeScore.icon className="h-5 w-5 mr-2 text-purple-600" />
                {activeScore.area} Health Details
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 font-medium">Score Health:</span>
                  <span 
                    className="text-sm font-semibold rounded-full px-3 py-1"
                    style={{ backgroundColor: `${activeScore.color}20`, color: activeScore.color }}
                  >
                    {activeScore.score >= 80 ? 'Excellent' : activeScore.score >= 60 ? 'Good' : 'Needs Improvement'}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <p className="mb-3">Based on your recent email performance, {activeScore.area.toLowerCase()} metrics are 
                  {activeScore.score >= 80 
                    ? ' strong and contributing positively to your email marketing results.' 
                    : activeScore.score >= 60 
                      ? ' performing adequately but could be improved to achieve better results.' 
                      : ' showing signs of issues that should be addressed to improve performance.'}
                  </p>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Key Insights:</h4>
                  <ul className="space-y-2">
                    {activeScore.suggestions.map((suggestion, index) => (
                      <motion.li 
                        key={index}
                        className="flex items-start gap-2 text-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2, duration: 0.3 }}
                      >
                        <ArrowRight className="h-4 w-4 mt-0.5 text-purple-600 flex-shrink-0" />
                        <span>{suggestion}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
                
                {/* AI Generated Insight */}
                <AnimatePresence>
                  {showInsight && (
                    <motion.div 
                      className="mt-6 bg-purple-50 border border-purple-100 rounded-lg p-4"
                      initial={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
                      animate={{ opacity: 1, height: 'auto', margin: '24px 0 0 0', padding: '16px' }}
                      exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-purple-600" />
                        <h4 className="text-sm font-medium text-purple-800">AI-Generated Insight</h4>
                      </div>
                      <p className="text-sm text-purple-700">
                        {activeTab === 'overall' 
                          ? "Your overall email health is strong but could benefit from improved engagement. Consider implementing more interactive content like polls or clickable elements to boost click rates, and segment your audience more specifically to deliver targeted content."
                          : activeTab === 'deliverability'
                            ? "While your deliverability score is good, implementing DKIM and SPF authentication would further improve inbox placement. Consider running a deliverability audit to identify specific areas for improvement."
                            : activeTab === 'engagement'
                              ? "Your engagement metrics show room for improvement. A/B testing different subject lines, send times, and content formats could help identify what resonates best with your audience. Consider personalizing content based on subscriber behavior."
                              : "Your list quality is excellent! Continue your current list hygiene practices and consider implementing a re-engagement campaign for subscribers who haven't opened emails in the past 90 days."
                        }
                      </p>
                      <div className="mt-3 flex justify-end">
                        <Button variant="ghost" size="sm" className="text-xs text-purple-600 hover:text-purple-800 flex items-center">
                          View detailed analysis
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailHealthScoreWidget;