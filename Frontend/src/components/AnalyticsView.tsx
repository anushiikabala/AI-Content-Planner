import { Analytics } from '../mockData';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, Award, Clock, Brain, Lightbulb } from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyticsViewProps {
  analytics: Analytics | null;
}

export function AnalyticsView({ analytics }: AnalyticsViewProps) {
  if (!analytics) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">No analytics data available</p>
      </div>
    );
  }

  const pillarData = Object.entries(analytics.pillar_counts).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Target className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.total_posts}</div>
          <div className="text-sm opacity-90">Total Posts</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.high_performers_count}</div>
          <div className="text-sm opacity-90">High Performers</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Award className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.pillar_balance}</div>
          <div className="text-sm opacity-90">Pillar Balance</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-8 h-8 opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{analytics.best_posting_times.length}</div>
          <div className="text-sm opacity-90">Optimal Times</div>
        </motion.div>
      </div>

      {/* AI Optimization Score - Prominent Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl p-8 shadow-2xl relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-white/10"
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">AI Optimization Score</h3>
                <p className="text-sm opacity-90">ML-powered content analysis</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-5xl font-bold mb-1">{analytics.optimization_score}%</div>
              <div className="text-sm opacity-90">Optimized</div>
            </div>
          </div>
          
          <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full bg-white rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${analytics.optimization_score}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
            />
          </div>
          
          <p className="mt-4 text-sm opacity-90">
            Your content plan is well-optimized based on engagement patterns, timing, and audience preferences.
          </p>
        </div>
      </motion.div>

      {/* AI Insights Panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Lightbulb className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="font-semibold">AI-Powered Insights</h3>
        </div>
        <div className="space-y-3">
          {analytics.ai_insights.map((insight, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg"
            >
              <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{insight}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pillar Distribution */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="font-semibold mb-4">Content Pillar Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pillarData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pillarData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Pillar Counts Bar Chart */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
          <h3 className="font-semibold mb-4">Posts per Pillar</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pillarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights Panel */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="font-semibold mb-4">Content Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Best Posting Times */}
          <div>
            <h4 className="font-medium text-sm text-zinc-600 dark:text-zinc-400 mb-3">Best Posting Times</h4>
            <div className="space-y-2">
              {analytics.recommended_times.map((time, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
                >
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">{time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Keywords */}
          <div>
            <h4 className="font-medium text-sm text-zinc-600 dark:text-zinc-400 mb-3">Top Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {analytics.top_keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm"
                >
                  #{keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <h4 className="font-medium text-sm text-zinc-600 dark:text-zinc-400 mb-3">Recommendations</h4>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                <span>Great pillar variety - keep this balance</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                <span>Strong high-performer ratio</span>
              </li>
              <li className="flex items-start gap-2 text-sm">
                <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">→</span>
                <span>Consider testing more carousel formats</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-6 border border-zinc-200 dark:border-zinc-700">
        <h3 className="font-semibold mb-4">Pillar Breakdown</h3>
        <div className="space-y-3">
          {pillarData.map((pillar, index) => {
            const percentage = (pillar.value / analytics.total_posts) * 100;
            return (
              <div key={pillar.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{pillar.name}</span>
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {pillar.value} posts ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
