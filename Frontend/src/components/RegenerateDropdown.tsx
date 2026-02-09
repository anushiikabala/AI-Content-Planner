import { useState, useRef, useEffect } from 'react';
import { RefreshCw, ChevronDown, Sparkles, Heart, Briefcase, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RegenerateDropdownProps {
  onRegenerate: (type: string) => void;
}

export function RegenerateDropdown({ onRegenerate }: RegenerateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options = [
    { id: 'full', label: 'Regenerate Everything', icon: RefreshCw, color: 'text-blue-600' },
    { id: 'hook', label: 'Regenerate Hook', icon: Sparkles, color: 'text-purple-600' },
    { id: 'caption', label: 'Regenerate Caption', icon: Zap, color: 'text-pink-600' },
    { id: 'emotional', label: 'Make More Emotional', icon: Heart, color: 'text-red-600' },
    { id: 'professional', label: 'Make More Professional', icon: Briefcase, color: 'text-blue-600' },
    { id: 'cta', label: 'Add Stronger CTA', icon: Zap, color: 'text-green-600' }
  ];

  const handleSelect = (type: string) => {
    onRegenerate(type);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 transition-all border border-purple-200 dark:border-purple-800"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="font-medium">Regenerate</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-64 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl overflow-hidden z-50"
          >
            {options.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors text-left ${
                    index !== 0 ? 'border-t border-zinc-100 dark:border-zinc-700' : ''
                  }`}
                >
                  <div className={`p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg ${option.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
