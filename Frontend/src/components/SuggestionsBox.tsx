import { Sparkles, TrendingUp, Users, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

interface SuggestionsBoxProps {
  suggestions: string[];
}

export function SuggestionsBox({ suggestions }: SuggestionsBoxProps) {
  const icons = [TrendingUp, Users, Lightbulb, Sparkles];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 className="font-semibold text-purple-900 dark:text-purple-100">
          AI Suggestions
        </h3>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const Icon = icons[index % icons.length];
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-white/80 dark:bg-zinc-800/80 rounded-lg backdrop-blur-sm"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center">
                <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {suggestion}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
