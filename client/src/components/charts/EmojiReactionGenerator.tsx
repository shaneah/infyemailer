import React from 'react';
import { Tooltip } from '@/components/ui/tooltip';
import {
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Determines the appropriate emoji and message based on the performance metric
 * 
 * @param type The type of metric (e.g., 'openRate', 'clickRate', 'conversionRate')
 * @param value The current value of the metric
 * @param benchmark Optional benchmark value to compare against
 * @returns Object containing emoji, message, and color
 */
export function getEmojiReaction(type: string, value: number, benchmark?: number): {
  emoji: string;
  message: string;
  color: string;
} {
  // Default benchmark values if not provided
  const benchmarks = {
    openRate: benchmark || 21.33, // Industry average open rate
    clickRate: benchmark || 2.62, // Industry average click rate
    conversionRate: benchmark || 3.0, // Industry average conversion rate
    deliverability: benchmark || 98.0, // Good deliverability
    engagement: benchmark || 30.0, // Good engagement
    roi: benchmark || 35.0, // Good ROI percentage
  };

  let result = {
    emoji: '😐',
    message: 'Average performance',
    color: 'text-amber-500'
  };

  // Helper function to determine emoji based on performance
  const getPerformanceLevel = (current: number, benchmark: number): string => {
    const ratio = current / benchmark;
    if (ratio >= 1.5) return 'exceptional';
    if (ratio >= 1.2) return 'excellent';
    if (ratio >= 1.0) return 'good';
    if (ratio >= 0.8) return 'fair';
    if (ratio >= 0.5) return 'poor';
    return 'critical';
  };

  // Get the benchmark value for the specific type
  const typeBenchmark = benchmarks[type as keyof typeof benchmarks] || benchmark || 0;
  const performanceLevel = getPerformanceLevel(value, typeBenchmark);

  // Determine emoji and message based on metric type and performance level
  switch (type) {
    case 'openRate':
      switch (performanceLevel) {
        case 'exceptional':
          result = { emoji: '🥳', message: 'Outstanding open rate! Your subject lines are highly effective.', color: 'text-green-600' };
          break;
        case 'excellent':
          result = { emoji: '😄', message: 'Great open rate! Your audience is engaged with your emails.', color: 'text-green-500' };
          break;
        case 'good':
          result = { emoji: '🙂', message: 'Good open rate, performing better than average.', color: 'text-green-400' };
          break;
        case 'fair':
          result = { emoji: '😐', message: 'Fair open rate, close to industry average.', color: 'text-amber-500' };
          break;
        case 'poor':
          result = { emoji: '😕', message: 'Below average open rate. Consider testing new subject lines.', color: 'text-orange-500' };
          break;
        case 'critical':
          result = { emoji: '😢', message: 'Low open rate. Review your subject lines and sending practices.', color: 'text-red-500' };
          break;
      }
      break;

    case 'clickRate':
      switch (performanceLevel) {
        case 'exceptional':
          result = { emoji: '🚀', message: 'Phenomenal click rate! Your CTAs are highly effective.', color: 'text-green-600' };
          break;
        case 'excellent':
          result = { emoji: '👍', message: 'Excellent click rate! Your content is resonating well.', color: 'text-green-500' };
          break;
        case 'good':
          result = { emoji: '👌', message: 'Good click rate, above industry average.', color: 'text-green-400' };
          break;
        case 'fair':
          result = { emoji: '🤔', message: 'Average click rate. There\'s room for improvement.', color: 'text-amber-500' };
          break;
        case 'poor':
          result = { emoji: '👎', message: 'Below average click rate. Review your CTAs and content.', color: 'text-orange-500' };
          break;
        case 'critical':
          result = { emoji: '⚠️', message: 'Critical click rate. Your content may not be resonating with your audience.', color: 'text-red-500' };
          break;
      }
      break;

    case 'conversionRate':
      switch (performanceLevel) {
        case 'exceptional':
          result = { emoji: '💰', message: 'Exceptional conversion rate! Your emails are driving strong results.', color: 'text-green-600' };
          break;
        case 'excellent':
          result = { emoji: '🎯', message: 'Excellent conversion rate! Your offers are compelling.', color: 'text-green-500' };
          break;
        case 'good':
          result = { emoji: '💼', message: 'Good conversion rate, better than industry average.', color: 'text-green-400' };
          break;
        case 'fair':
          result = { emoji: '📊', message: 'Fair conversion rate, around industry average.', color: 'text-amber-500' };
          break;
        case 'poor':
          result = { emoji: '📉', message: 'Below average conversion rate. Consider reevaluating your offers.', color: 'text-orange-500' };
          break;
        case 'critical':
          result = { emoji: '🆘', message: 'Very low conversion rate. Your sales funnel may need significant improvement.', color: 'text-red-500' };
          break;
      }
      break;

    case 'deliverability':
      switch (performanceLevel) {
        case 'exceptional':
        case 'excellent':
          result = { emoji: '📬', message: 'Excellent deliverability rate! Your emails are reaching inboxes reliably.', color: 'text-green-500' };
          break;
        case 'good':
          result = { emoji: '📨', message: 'Good deliverability rate. Most of your emails are reaching inboxes.', color: 'text-green-400' };
          break;
        case 'fair':
          result = { emoji: '📩', message: 'Fair deliverability. Some emails may be going to spam folders.', color: 'text-amber-500' };
          break;
        case 'poor':
        case 'critical':
          result = { emoji: '⚠️', message: 'Poor deliverability. Review your sending practices and domain reputation.', color: 'text-red-500' };
          break;
      }
      break;

    case 'engagement':
      switch (performanceLevel) {
        case 'exceptional':
          result = { emoji: '🤩', message: 'Exceptional engagement! Your audience loves your content.', color: 'text-green-600' };
          break;
        case 'excellent':
          result = { emoji: '😍', message: 'Excellent engagement levels across your campaigns.', color: 'text-green-500' };
          break;
        case 'good':
          result = { emoji: '👏', message: 'Good engagement, above industry standards.', color: 'text-green-400' };
          break;
        case 'fair':
          result = { emoji: '👋', message: 'Average engagement with your campaigns.', color: 'text-amber-500' };
          break;
        case 'poor':
          result = { emoji: '😴', message: 'Below average engagement. Your content may not be resonating.', color: 'text-orange-500' };
          break;
        case 'critical':
          result = { emoji: '🚫', message: 'Very low engagement. Consider a content strategy overhaul.', color: 'text-red-500' };
          break;
      }
      break;

    case 'roi':
      switch (performanceLevel) {
        case 'exceptional':
          result = { emoji: '💎', message: 'Outstanding ROI! Your email marketing is highly profitable.', color: 'text-green-600' };
          break;
        case 'excellent':
          result = { emoji: '💵', message: 'Excellent ROI! Your campaigns are delivering strong returns.', color: 'text-green-500' };
          break;
        case 'good':
          result = { emoji: '💲', message: 'Good ROI, better than average returns.', color: 'text-green-400' };
          break;
        case 'fair':
          result = { emoji: '💱', message: 'Average ROI. You\'re breaking even or making modest returns.', color: 'text-amber-500' };
          break;
        case 'poor':
          result = { emoji: '💸', message: 'Below average ROI. Your campaigns may need optimization.', color: 'text-orange-500' };
          break;
        case 'critical':
          result = { emoji: '📡', message: 'Negative or very low ROI. Re-evaluate your email marketing strategy.', color: 'text-red-500' };
          break;
      }
      break;

    default:
      // For any other metrics
      if (value >= typeBenchmark * 1.5) {
        result = { emoji: '🔥', message: 'Exceptional performance!', color: 'text-green-600' };
      } else if (value >= typeBenchmark * 1.2) {
        result = { emoji: '✨', message: 'Excellent performance!', color: 'text-green-500' };
      } else if (value >= typeBenchmark) {
        result = { emoji: '👍', message: 'Good performance, above benchmark.', color: 'text-green-400' };
      } else if (value >= typeBenchmark * 0.8) {
        result = { emoji: '😐', message: 'Fair performance, close to benchmark.', color: 'text-amber-500' };
      } else if (value >= typeBenchmark * 0.5) {
        result = { emoji: '👎', message: 'Below benchmark performance.', color: 'text-orange-500' };
      } else {
        result = { emoji: '⚠️', message: 'Performance needs significant improvement.', color: 'text-red-500' };
      }
  }

  return result;
}

interface EmojiReactionProps {
  type: string;
  value: number;
  benchmark?: number;
  showValue?: boolean;
  valueFormat?: string; // e.g., 'percent', 'currency', 'number'
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const EmojiReactionGenerator: React.FC<EmojiReactionProps> = ({
  type,
  value,
  benchmark,
  showValue = true,
  valueFormat = 'percent',
  size = 'medium',
  className = '',
}) => {
  const { emoji, message, color } = getEmojiReaction(type, value, benchmark);

  // Format the value based on the specified format
  const formattedValue = (() => {
    switch (valueFormat) {
      case 'percent':
        return `${value.toFixed(2)}%`;
      case 'currency':
        return `$${value.toFixed(2)}`;
      case 'number':
        return value.toFixed(0);
      default:
        return `${value}`;
    }
  })();

  // Determine emoji size based on the size prop
  const emojiSize = (() => {
    switch (size) {
      case 'small':
        return 'text-lg';
      case 'large':
        return 'text-4xl';
      case 'medium':
      default:
        return 'text-2xl';
    }
  })();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 ${className}`}>
            <span className={`${emojiSize} ${color}`}>{emoji}</span>
            {showValue && (
              <span className={`font-medium ${color}`}>{formattedValue}</span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{message}</p>
          {benchmark && (
            <p className="text-xs text-muted-foreground mt-1">
              Industry benchmark: {valueFormat === 'percent' ? `${benchmark}%` : benchmark}
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EmojiReactionGenerator;