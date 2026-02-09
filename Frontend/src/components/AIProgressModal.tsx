import { motion, AnimatePresence } from 'motion/react';
import { Brain, TrendingUp, Pencil, Beaker, CheckCircle2, Sparkles } from 'lucide-react';

interface AIProgressModalProps {
  isOpen: boolean;
  currentStep: number;
}

const steps = [
  { icon: Brain, label: 'Strategist designing content pillars...', color: 'text-purple-600' },
  { icon: TrendingUp, label: 'Trend Analyzer predicting high-performing topics...', color: 'text-blue-600' },
  { icon: Pencil, label: 'Writer drafting platform-specific content...', color: 'text-pink-600' },
  { icon: Beaker, label: 'ML Model scoring engagement potential...', color: 'text-green-600' },
  { icon: CheckCircle2, label: 'Plan optimization complete', color: 'text-emerald-600' }
];

export function AIProgressModal({ isOpen, currentStep }: AIProgressModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-white/20"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'linear'
                }}
              />
              <div className="relative z-10 flex items-center gap-3">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-8 h-8" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold">AI Content Engine</h3>
                  <p className="text-sm text-white/90">Generating your personalized plan</p>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="p-6 space-y-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStep;
                const isComplete = index < currentStep;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800' 
                        : isComplete
                        ? 'bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800'
                        : 'bg-zinc-50 dark:bg-zinc-800 border border-transparent'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isActive 
                        ? 'bg-blue-100 dark:bg-blue-900/50' 
                        : isComplete
                        ? 'bg-green-100 dark:bg-green-900/50'
                        : 'bg-zinc-200 dark:bg-zinc-700'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <StepIcon className={`w-5 h-5 ${
                          isActive 
                            ? step.color 
                            : 'text-zinc-400 dark:text-zinc-500'
                        }`} />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isActive || isComplete
                          ? 'text-zinc-900 dark:text-zinc-100'
                          : 'text-zinc-500 dark:text-zinc-400'
                      }`}>
                        {step.label}
                      </p>
                    </div>

                    {isActive && (
                      <motion.div
                        className="flex gap-1"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-600 rounded-full"
                            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="px-6 pb-6">
              <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
