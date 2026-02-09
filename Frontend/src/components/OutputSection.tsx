import { useState } from 'react';
import { ContentPlan, DayPlan } from '../mockData';
import { CalendarView } from './CalendarView';
import { ListView } from './ListView';
import { AnalyticsView } from './AnalyticsView';
import { DayDetailsDrawer } from './DayDetailsDrawer';
import { Calendar, List, BarChart3, Sparkles } from 'lucide-react';

interface OutputSectionProps {
  plan: ContentPlan | null;
  isLoading: boolean;
}

export function OutputSection({ plan, isLoading }: OutputSectionProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'analytics'>('calendar');
  const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null);

  const handleRegenerate = (date: string, type: string) => {
    console.log('Regenerating content for:', date, 'Type:', type);
    // In a real app, this would call the backend API
    alert(`Regenerating ${type} for ${date}...`);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-12">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-lg font-medium">Generating your content plan...</p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 p-12">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Ready to Create Your Content Plan?</h3>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-md">
              Fill in your creator profile and preferences on the left, then hit "Generate" to create your personalized 30-day content calendar.
            </p>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-6 max-w-md">
            <h4 className="font-medium mb-3">What you'll get:</h4>
            <ul className="space-y-2 text-sm text-left">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Platform-specific content for Instagram, LinkedIn & YouTube</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Ready-to-use scripts, captions, and hashtags</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-600">•</span>
                <span>3 variations per post for A/B testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">•</span>
                <span>Engagement predictions and optimization tips</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'calendar' as const, label: 'Calendar View', icon: Calendar },
    { id: 'list' as const, label: 'List View', icon: List },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <>
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'calendar' && (
            <CalendarView days={plan.days} onDayClick={setSelectedDay} />
          )}
          {activeTab === 'list' && (
            <ListView 
              days={plan.days} 
              onDayClick={setSelectedDay}
              onRegenerate={handleRegenerate}
            />
          )}
          {activeTab === 'analytics' && (
            <AnalyticsView analytics={plan.analytics} />
          )}
        </div>
      </div>

      {/* Day Details Drawer */}
      {selectedDay && (
        <DayDetailsDrawer
          day={selectedDay}
          onClose={() => setSelectedDay(null)}
          onRegenerate={handleRegenerate}
        />
      )}
    </>
  );
}
