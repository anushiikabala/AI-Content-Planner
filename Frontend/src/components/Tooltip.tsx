import { Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
      >
        {children || <Info className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-zinc-900 dark:bg-zinc-800 text-white text-xs rounded-lg p-3 shadow-xl border border-zinc-700"
            style={{ pointerEvents: 'none' }}
          >
            <div className="relative">
              {content}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-800" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
