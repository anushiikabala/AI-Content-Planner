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

  try {
    const response = await fetch("http://127.0.0.1:5000/generate-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        form_data: formData,
        is_sample: isSample
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Backend error");
    }

    setPlan(data);

  } catch (error) {
    console.error("Error generating plan:", error);
    alert("Backend connection failed. Is Flask running?");
  }

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
