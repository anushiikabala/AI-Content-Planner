import { DayPlan } from '../mockData';
import { Instagram, Linkedin, Youtube } from 'lucide-react';
import { ScoreBadge } from './ScoreBadge';
import { motion } from 'motion/react';

interface CalendarViewProps {
  days: DayPlan[];
  onDayClick: (day: DayPlan) => void;
}

export function CalendarView({ days, onDayClick }: CalendarViewProps) {
  if (days.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-zinc-500 dark:text-zinc-400">No calendar data available</p>
      </div>
    );
  }

  const startDate = new Date(days[0].date);
  const endDate = new Date(days[days.length - 1].date);
  
  const firstDayOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const lastDayOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
  
  const startOffset = firstDayOfMonth.getDay();
  
  const calendarDays: (DayPlan | null)[] = [];
  
  for (let i = 0; i < startOffset; i++) {
    calendarDays.push(null);
  }
  
  const daysMap = new Map(days.map(day => [day.date, day]));
  
  const currentDate = new Date(firstDayOfMonth);
  while (currentDate <= lastDayOfMonth) {
    const dateString = currentDate.toISOString().split('T')[0];
    calendarDays.push(daysMap.get(dateString) || null);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const monthName = firstDayOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Instagram': 
        return <Instagram className="w-4 h-4 text-pink-500" />;
      case 'LinkedIn': 
        return <Linkedin className="w-4 h-4 text-blue-600" />;
      case 'YouTube': 
        return <Youtube className="w-4 h-4 text-red-600" />;
      default: 
        return null;
    }
  };

  const getPlatformAccent = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'border-l-4 border-l-pink-500';
      case 'LinkedIn': return 'border-l-4 border-l-blue-600';
      case 'YouTube': return 'border-l-4 border-l-red-600';
      default: return '';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{monthName}</h2>
      
      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center font-medium text-sm text-zinc-600 dark:text-zinc-400 py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`min-h-[140px] p-3 border rounded-xl ${
              day 
                ? `bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 cursor-pointer hover:shadow-lg hover:scale-105 hover:border-blue-500 dark:hover:border-blue-500 transition-all ${getPlatformAccent(day.platform)}` 
                : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-100 dark:border-zinc-800'
            }`}
            onClick={() => day && onDayClick(day)}
          >
            {day && (
              <div className="h-full flex flex-col justify-between space-y-2">
                {/* Header with Date and Platform */}
                <div className="flex items-start justify-between">
                  <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {new Date(day.date).getDate()}
                  </span>
                  <div className="p-1.5 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                    {getPlatformIcon(day.platform)}
                  </div>
                </div>

                {/* Hook Preview */}
                <p className="text-xs line-clamp-2 text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                  {day.hook}
                </p>
                
                {/* Footer with Pillar and Score */}
                <div className="space-y-2">
                  <span className="inline-block text-xs px-2 py-1 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-md font-medium">
                    {day.pillar}
                  </span>
                  
                  <div className="flex items-center justify-between">
                    <ScoreBadge 
                      score={day.predicted_score} 
                      value={day.score_value}
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
