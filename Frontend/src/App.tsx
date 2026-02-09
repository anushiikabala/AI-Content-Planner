import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { InputForm, FormData } from './components/InputForm';
import { OutputSection } from './components/OutputSection';
import { AIProgressModal } from './components/AIProgressModal';
import { ContentPlan, generateMockPlan } from './mockData';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [plan, setPlan] = useState<ContentPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [aiProgressStep, setAiProgressStep] = useState(0);
  const [showAiProgress, setShowAiProgress] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleGenerate = async (formData: FormData, isSample: boolean) => {
    setIsLoading(true);
    setPlan(null);
    setShowAiProgress(true);
    setAiProgressStep(0);

    // AI Progress steps
    const steps = [
      { step: 0, delay: 1000 },
      { step: 1, delay: 1200 },
      { step: 2, delay: 1500 },
      { step: 3, delay: 1000 },
      { step: 4, delay: 800 }
    ];

    for (let i = 0; i < steps.length; i++) {
      setAiProgressStep(steps[i].step);
      await new Promise(resolve => setTimeout(resolve, steps[i].delay));
    }

    // Generate mock plan
    const mockPlan = generateMockPlan();
    
    // Adjust based on form data
    if (isSample) {
      mockPlan.days = mockPlan.days.slice(0, 7);
      mockPlan.analytics.total_posts = 7;
    } else {
      mockPlan.days = mockPlan.days.slice(0, formData.planLength);
      mockPlan.analytics.total_posts = formData.planLength;
    }

    // Update metadata from form
    mockPlan.metadata = {
      niche: formData.niche,
      platforms: Object.entries(formData.platforms)
        .filter(([_, enabled]) => enabled)
        .map(([platform]) => platform.charAt(0).toUpperCase() + platform.slice(1)),
      tone: formData.tone,
      start_date: formData.startDate,
      creator_name: formData.creatorName,
      audience: formData.audience,
      region: formData.region,
      content_goals: formData.contentGoals
    };

    setPlan(mockPlan);
    setIsLoading(false);
    setShowAiProgress(false);
    setLoadingStep('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} plan={plan} />
      
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Form (Sticky on desktop) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <InputForm 
                onGenerate={handleGenerate} 
                isLoading={isLoading}
                loadingStep={loadingStep}
              />
            </div>
          </div>

          {/* Right Column - Output Section */}
          <div className="lg:col-span-2">
            <OutputSection plan={plan} isLoading={isLoading} />
          </div>
        </div>
      </main>

      {/* AI Progress Modal */}
      <AIProgressModal isOpen={showAiProgress} currentStep={aiProgressStep} />
    </div>
  );
}
