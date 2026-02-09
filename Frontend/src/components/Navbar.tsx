import { Moon, Sun } from 'lucide-react';
import { ExportMenu } from './ExportMenu';
import { ContentPlan } from '../mockData';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  plan: ContentPlan | null;
}

export function Navbar({ darkMode, toggleDarkMode, plan }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              CreatorPilot
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <ExportMenu plan={plan} />
            
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
