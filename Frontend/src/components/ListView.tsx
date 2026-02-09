import { useState } from 'react';
import { DayPlan } from '../mockData';
import { Instagram, Linkedin, Youtube, Copy, Edit2, Search } from 'lucide-react';
import { RegenerateDropdown } from './RegenerateDropdown';
import { ScoreBadge } from './ScoreBadge';

interface ListViewProps {
  days: DayPlan[];
  onDayClick: (day: DayPlan) => void;
  onRegenerate: (date: string, type: string) => void;
}

export function ListView({ days, onDayClick, onRegenerate }: ListViewProps) {
  const [platformFilter, setPlatformFilter] = useState<string>('All');
  const [pillarFilter, setPillarFilter] = useState<string>('All');
  const [scoreFilter, setScoreFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  if (days.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">No content available</p>
      </div>
    );
  }

  const platforms = ['All', ...Array.from(new Set(days.map(d => d.platform)))];
  const pillars = ['All', ...Array.from(new Set(days.map(d => d.pillar)))];
  const scores = ['All', 'High', 'Med', 'Low'];

  const filteredDays = days.filter(day => {
    const matchesPlatform = platformFilter === 'All' || day.platform === platformFilter;
    const matchesPillar = pillarFilter === 'All' || day.pillar === pillarFilter;
    const matchesScore = scoreFilter === 'All' || day.predicted_score === scoreFilter;
    const matchesSearch = searchTerm === '' || 
      day.hook.toLowerCase().includes(searchTerm.toLowerCase()) ||
      day.caption.toLowerCase().includes(searchTerm.toLowerCase()) ||
      day.topic.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPlatform && matchesPillar && matchesScore && matchesSearch;
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'LinkedIn': return <Linkedin className="w-5 h-5 text-blue-600" />;
      case 'YouTube': return <Youtube className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getPlatformBorder = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'border-l-4 border-l-pink-500';
      case 'LinkedIn': return 'border-l-4 border-l-blue-600';
      case 'YouTube': return 'border-l-4 border-l-red-600';
      default: return 'border-l-4 border-l-gray-500';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by keyword..."
            className="w-full pl-10 pr-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Platform</label>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
            >
              {platforms.map(platform => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Pillar</label>
            <select
              value={pillarFilter}
              onChange={(e) => setPillarFilter(e.target.value)}
              className="w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
            >
              {pillars.map(pillar => (
                <option key={pillar} value={pillar}>{pillar}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Score</label>
            <select
              value={scoreFilter}
              onChange={(e) => setScoreFilter(e.target.value)}
              className="w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-sm"
            >
              {scores.map(score => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing {filteredDays.length} of {days.length} posts
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredDays.map((day, index) => (
          <div
            key={`${day.date}-${day.platform}-${day.post_type}-${index}`}
            className={`bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer ${getPlatformBorder(day.platform)}`}
            onClick={() => onDayClick(day)}
          >
            <div className="flex items-start gap-4">
              {/* Date & Platform */}
              <div className="flex-shrink-0 text-center">
                <div className="text-2xl font-bold">
                  {new Date(day.date).getDate()}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {new Date(day.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="mt-2 p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                  {getPlatformIcon(day.platform)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{day.topic}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs font-medium">
                        {day.platform} • {day.post_type}
                      </span>
                      <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-700 rounded text-xs">
                        {day.pillar}
                      </span>
                    </div>
                  </div>
                  
                  <ScoreBadge 
                    score={day.predicted_score} 
                    value={day.score_value}
                    reasons={day.score_reasons}
                    showTooltip={true}
                  />
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-3">
                  {day.hook}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(day.caption);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
                  >
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDayClick(day);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors border border-purple-200 dark:border-purple-800"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <div onClick={(e) => e.stopPropagation()}>
                    <RegenerateDropdown onRegenerate={(type) => onRegenerate(day.date, type)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
