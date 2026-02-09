import { useState, useRef, useEffect } from 'react';
import { Download, FileJson, FileText, FileCode } from 'lucide-react';
import { ContentPlan } from '../mockData';

interface ExportMenuProps {
  plan: ContentPlan | null;
}

export function ExportMenu({ plan }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportAsJSON = () => {
    if (!plan) return;
    const dataStr = JSON.stringify(plan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-plan.json';
    link.click();
    setIsOpen(false);
  };

  const exportAsCSV = () => {
    if (!plan) return;
    const headers = ['Date', 'Platform', 'Post Type', 'Pillar', 'Hook', 'Score'];
    const rows = plan.days.map(day => [
      day.date,
      day.platform,
      day.post_type,
      day.pillar,
      day.hook,
      day.predicted_score
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const dataBlob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-plan.csv';
    link.click();
    setIsOpen(false);
  };

  const exportAsNotion = () => {
    if (!plan) return;
    const notionContent = plan.days.map(day => {
      return `## ${day.date} - ${day.platform} (${day.post_type})

**Pillar:** ${day.pillar}
**Score:** ${day.predicted_score}

### Hook
${day.hook}

### Caption
${day.caption}

### Reel Script
${day.reel_script}

### LinkedIn Post
${day.linkedin_post}

### YouTube
**Title:** ${day.youtube_title}
**Description:** ${day.youtube_description}

**Hashtags:** ${day.hashtags.join(' ')}

---

`;
    }).join('\n');

    const dataBlob = new Blob([notionContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'content-plan-notion.md';
    link.click();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!plan}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Download className="w-4 h-4" />
        Export
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg overflow-hidden z-50">
          <button
            onClick={exportAsJSON}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-left"
          >
            <FileJson className="w-4 h-4" />
            <div>
              <div className="font-medium">Export as JSON</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Full data export</div>
            </div>
          </button>
          <button
            onClick={exportAsCSV}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-left border-t border-zinc-100 dark:border-zinc-700"
          >
            <FileText className="w-4 h-4" />
            <div>
              <div className="font-medium">Export as CSV</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Spreadsheet format</div>
            </div>
          </button>
          <button
            onClick={exportAsNotion}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-left border-t border-zinc-100 dark:border-zinc-700"
          >
            <FileCode className="w-4 h-4" />
            <div>
              <div className="font-medium">Notion-ready Markdown</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Import to Notion</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
