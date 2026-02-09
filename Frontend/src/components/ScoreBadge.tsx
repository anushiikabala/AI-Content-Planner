import { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ScoreBadgeProps {
  score: 'High' | 'Med' | 'Low';
  value: number;
  reasons?: string[];
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function ScoreBadge({ score, value, reasons, size = 'md', showTooltip = false }: ScoreBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getScoreConfig = (score: string) => {
    switch (score) {
      case 'High':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-300 dark:border-green-700',
          dot: 'bg-green-500',
          emoji: '🔥'
        };
      case 'Med':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-300 dark:border-yellow-700',
          dot: 'bg-yellow-500',
          emoji: '⚡'
        };
      case 'Low':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-300 dark:border-red-700',
          dot: 'bg-red-500',
          emoji: '💡'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-900/30',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-300 dark:border-gray-700',
          dot: 'bg-gray-500',
          emoji: '•'
        };
    }
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const config = getScoreConfig(score);

  return (
    <div className="relative inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]} font-medium`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
        <span>{score}</span>
        {value !== undefined && <span className="opacity-75">({value})</span>}
        <span>{config.emoji}</span>
      </span>

      {showTooltip && reasons && reasons.length > 0 && (
        <button
          className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Info className="w-4 h-4 text-zinc-400" />
        </button>
      )}

      <AnimatePresence>
        {isHovered && reasons && reasons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-50 top-full mt-2 left-0 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-4"
            style={{ pointerEvents: 'none' }}
          >
            <h4 className="font-medium text-sm mb-2">Score Factors</h4>
            <ul className="space-y-1.5">
              {reasons.map((reason, index) => (
                <li key={index} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className={`${config.text} mt-0.5`}>•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
