import { Lightbulb, TrendingUp, Target, Zap } from 'lucide-react';

interface InsightPanelProps {
  insights: string[];
  scoreReasons?: string[];
}

export function InsightPanel({ insights, scoreReasons }: InsightPanelProps) {
  return (
    <div className="space-y-4">
      {/* Why This May Perform Well */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold text-purple-900 dark:text-purple-100">
            Why This May Perform Well
          </h3>
        </div>
        
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mt-0.5">
                {index === 0 && <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                {index === 1 && <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                {index === 2 && <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                {index >= 3 && <span className="text-xs font-bold text-purple-600 dark:text-purple-400">✓</span>}
              </div>
              <span className="text-sm text-purple-900 dark:text-purple-100">{insight}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Score Breakdown */}
      {scoreReasons && scoreReasons.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700">
          <h4 className="font-medium text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Score Breakdown
          </h4>
          <ul className="space-y-2">
            {scoreReasons.map((reason, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                <span className="text-zinc-700 dark:text-zinc-300">{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
