import { useState } from 'react';
import { TagInput } from './TagInput';
import { ChevronDown, ChevronUp, Loader2, Info } from 'lucide-react';
import { SuggestionsBox } from './SuggestionsBox';
import { Tooltip } from './Tooltip';

export interface FormData {
  creatorName: string;
  description: string;
  niche: string;
  audience: string[];
  region: string;
  contentGoals: string[];
  tone: string;
  brandKeywords: string[];
  bannedWords: string[];
  ctaStyle: string;
  platforms: {
    instagram: boolean;
    linkedin: boolean;
    youtube: boolean;
  };
  instagramPostTypes: string[];
  linkedinPostTypes: string[];
  youtubeContentTypes: string[];
  planLength: number;
  postsPerWeek: number;
  noWeekends: boolean;
  postingTimes: string[];
  startDate: string;
  contentPillars: string[];
  repurpose: boolean;
  variationCount: number;
}

interface InputFormProps {
  onGenerate: (data: FormData, isSample: boolean) => void;
  isLoading: boolean;
  loadingStep: string;
}

const niches = ['Content Creation', 'Fitness', 'Business', 'Technology', 'Food & Cooking', 'Travel', 'Fashion', 'Finance', 'Education', 'Custom'];
const audiences = ['Students', 'Working Professionals', 'Parents', 'Entrepreneurs', 'Teens', 'Retirees'];
const regions = ['US', 'India', 'UK', 'Canada', 'Australia', 'Global'];
const contentGoals = ['Engagement', 'Growth', 'Conversions', 'Brand Awareness'];
const tones = ['Funny', 'Aesthetic', 'Professional', 'Educational', 'Bold', 'Empathetic'];
const ctaStyles = ['Comment', 'Save', 'Share', 'DM', 'Link Click'];
const postingTimes = ['6:00 AM', '9:00 AM', '12:00 PM', '3:00 PM', '6:00 PM', '8:00 PM', '10:00 PM'];
const instagramTypes = ['Reels', 'Carousel', 'Story', 'Static'];
const linkedinTypes = ['Story post', 'Tips post', 'Case study', 'Carousel PDF idea'];
const youtubeTypes = ['Shorts', 'Long-form'];

export function InputForm({ onGenerate, isLoading, loadingStep }: InputFormProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    creatorName: '',
    description: '',
    niche: 'Content Creation',
    audience: ['Working Professionals'],
    region: 'Global',
    contentGoals: ['Engagement', 'Growth'],
    tone: 'Educational',
    brandKeywords: [],
    bannedWords: [],
    ctaStyle: 'Save',
    platforms: {
      instagram: true,
      linkedin: true,
      youtube: false
    },
    instagramPostTypes: ['Reels', 'Carousel'],
    linkedinPostTypes: ['Tips post', 'Story post'],
    youtubeContentTypes: ['Shorts'],
    planLength: 30,
    postsPerWeek: 7,
    noWeekends: false,
    postingTimes: ['9:00 AM', '6:00 PM'],
    startDate: new Date().toISOString().split('T')[0],
    contentPillars: ['Education', 'Inspiration', 'Behind-the-Scenes'],
    repurpose: true,
    variationCount: 3
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = <K extends keyof FormData>(field: K, item: string) => {
    const currentArray = formData[field] as string[];
    if (currentArray.includes(item)) {
      updateField(field, currentArray.filter(i => i !== item) as FormData[K]);
    } else {
      updateField(field, [...currentArray, item] as FormData[K]);
    }
  };

  // Validation function
  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Required fields
    if (!formData.creatorName.trim()) {
      errors.push('Creator Name is required');
    }
    if (!formData.description.trim()) {
      errors.push('Description is required');
    }
    if (formData.audience.length === 0) {
      errors.push('Please select at least one audience type');
    }
    if (formData.contentGoals.length === 0) {
      errors.push('Please select at least one content goal');
    }
    if (formData.contentPillars.length === 0) {
      errors.push('Please add at least one content pillar');
    }

    // Platform validation
    const hasSelectedPlatform = formData.platforms.instagram || formData.platforms.linkedin || formData.platforms.youtube;
    if (!hasSelectedPlatform) {
      errors.push('Please select at least one platform');
    }

    // Platform-specific validation
    if (formData.platforms.instagram && formData.instagramPostTypes.length === 0) {
      errors.push('Please select at least one Instagram post type');
    }
    if (formData.platforms.linkedin && formData.linkedinPostTypes.length === 0) {
      errors.push('Please select at least one LinkedIn post type');
    }
    if (formData.platforms.youtube && formData.youtubeContentTypes.length === 0) {
      errors.push('Please select at least one YouTube content type');
    }

    // Scheduling validation
    if (formData.postingTimes.length === 0) {
      errors.push('Please select at least one posting time');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleGenerate = (isSample: boolean) => {
    const validation = validateForm();
    if (!validation.isValid) {
      alert('Please complete all required fields:\n\n' + validation.errors.join('\n'));
      return;
    }
    onGenerate(formData, isSample);
  };

  return (
    
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      {/* Header - Always visible on mobile */}
      <div
        className="lg:hidden flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <h2 className="font-semibold">Input Settings</h2>
        {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
      </div>

      {/* Form Content */}
      <div className={`${isCollapsed ? 'hidden lg:block' : 'block'} p-6 space-y-8 max-h-[calc(100vh-140px)] overflow-y-auto`}>
        {/* Creator Profile */}
        <section>
          <h3 className="font-semibold mb-4 text-lg">Creator Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Creator Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.creatorName}
                onChange={(e) => updateField('creatorName', e.target.value)}
                placeholder="Your name or brand"
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Briefly describe what you create or your brand's mission..."
                rows={3}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 resize-none"
              />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                This helps AI understand your content style and generate more relevant posts
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Niche</label>
              <select
                value={formData.niche}
                onChange={(e) => updateField('niche', e.target.value)}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
              >
                {niches.map(niche => (
                  <option key={niche} value={niche}>{niche}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Audience <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {audiences.map(aud => (
                  <button
                    key={aud}
                    onClick={() => toggleArrayItem('audience', aud)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.audience.includes(aud)
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Region</label>
              <select
                value={formData.region}
                onChange={(e) => updateField('region', e.target.value)}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Content Goals <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {contentGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleArrayItem('contentGoals', goal)}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      formData.contentGoals.includes(goal)
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tone/Voice</label>
              <select
                value={formData.tone}
                onChange={(e) => updateField('tone', e.target.value)}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
              >
                {tones.map(tone => (
                  <option key={tone} value={tone}>{tone}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Brand Keywords</label>
              <TagInput
                tags={formData.brandKeywords}
                onTagsChange={(tags) => updateField('brandKeywords', tags)}
                placeholder="Add keywords and press Enter"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Banned Words</label>
              <TagInput
                tags={formData.bannedWords}
                onTagsChange={(tags) => updateField('bannedWords', tags)}
                placeholder="Words to avoid"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Call-to-Action Style</label>
              <select
                value={formData.ctaStyle}
                onChange={(e) => updateField('ctaStyle', e.target.value)}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
              >
                {ctaStyles.map(style => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Platforms */}
        <section>
          <h3 className="font-semibold mb-4 text-lg">
            Platforms <span className="text-red-500">*</span>
          </h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={formData.platforms.instagram}
                onChange={(e) => updateField('platforms', { ...formData.platforms, instagram: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-medium">Instagram</span>
            </label>
            {formData.platforms.instagram && (
              <div className="ml-8 flex flex-wrap gap-2">
                {instagramTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleArrayItem('instagramPostTypes', type)}
                    className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                      formData.instagramPostTypes.includes(type)
                        ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-500 text-pink-700 dark:text-pink-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={formData.platforms.linkedin}
                onChange={(e) => updateField('platforms', { ...formData.platforms, linkedin: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-medium">LinkedIn</span>
            </label>
            {formData.platforms.linkedin && (
              <div className="ml-8 flex flex-wrap gap-2">
                {linkedinTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleArrayItem('linkedinPostTypes', type)}
                    className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                      formData.linkedinPostTypes.includes(type)
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}

            <label className="flex items-center gap-3 p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800">
              <input
                type="checkbox"
                checked={formData.platforms.youtube}
                onChange={(e) => updateField('platforms', { ...formData.platforms, youtube: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-medium">YouTube</span>
            </label>
            {formData.platforms.youtube && (
              <div className="ml-8 flex flex-wrap gap-2">
                {youtubeTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => toggleArrayItem('youtubeContentTypes', type)}
                    className={`px-3 py-1 rounded-lg border text-sm transition-colors ${
                      formData.youtubeContentTypes.includes(type)
                        ? 'bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Scheduling */}
        <section>
          <h3 className="font-semibold mb-4 text-lg">Scheduling</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Plan Length</label>
              <div className="flex gap-2">
                {[7, 14, 30].map(days => (
                  <button
                    key={days}
                    onClick={() => updateField('planLength', days)}
                    className={`flex-1 py-3 rounded-lg border transition-all ${
                      formData.planLength === days
                        ? days === 30
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                          : 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    } ${days === 30 ? 'font-semibold' : ''}`}
                  >
                    {days} days
                    {days === 30 && (
                      <span className="block text-xs opacity-90">Recommended</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Posts Per Week: {formData.postsPerWeek}</label>
              <input
                type="range"
                min="1"
                max="14"
                value={formData.postsPerWeek}
                onChange={(e) => updateField('postsPerWeek', parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.noWeekends}
                onChange={(e) => updateField('noWeekends', e.target.checked)}
                className="w-5 h-5"
              />
              <span>No weekends</span>
            </label>

            <div>
              <label className="block text-sm font-medium mb-2">
                Preferred Posting Times <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {postingTimes.map(time => (
                  <button
                    key={time}
                    onClick={() => toggleArrayItem('postingTimes', time)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-colors ${
                      formData.postingTimes.includes(time)
                        ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-500 text-purple-700 dark:text-purple-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full p-3 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800"
              />
            </div>
          </div>
        </section>

        {/* Content Preferences */}
        <section>
          <h3 className="font-semibold mb-4 text-lg">Content Preferences</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium">
                  Content Pillars <span className="text-red-500">*</span>
                </label>
                <Tooltip content="Content themes that define your brand (e.g., Education, Inspiration). Aim for 3-5 pillars for consistency." />
              </div>
              <TagInput
                tags={formData.contentPillars}
                onTagsChange={(tags) => updateField('contentPillars', tags)}
                placeholder="Add content pillars"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium">Repurpose each idea across platforms</label>
                <Tooltip content="AI will adapt each content idea for Instagram, LinkedIn, and YouTube with platform-specific formatting." />
              </div>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.repurpose}
                  onChange={(e) => updateField('repurpose', e.target.checked)}
                  className="w-5 h-5"
                />
                <span>Enable cross-platform repurposing</span>
              </label>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="block text-sm font-medium">Variation Count</label>
                <Tooltip content="Generate multiple versions of each post for A/B testing to find what resonates best with your audience." />
              </div>
              <div className="flex gap-2">
                {[1, 2, 3].map(count => (
                  <button
                    key={count}
                    onClick={() => updateField('variationCount', count)}
                    className={`flex-1 py-2 rounded-lg border transition-colors ${
                      formData.variationCount === count
                        ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {count} {count === 1 ? 'version' : 'versions'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* AI Suggestions Box */}
        <SuggestionsBox 
          suggestions={[
            'Your audience prefers educational content (67% engagement rate)',
            'Reels perform 3x better than static posts in your niche',
            'Try increasing Community pillar posts by 20%'
          ]}
        />

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => handleGenerate(false)}
            disabled={isLoading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              `Generate ${formData.planLength}-Day Plan`
            )}
          </button>
          
          <button
            onClick={() => handleGenerate(true)}
            disabled={isLoading}
            className="w-full py-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Generate 7-Day Sample
          </button>

          {isLoading && (
            <div className="text-center text-sm text-zinc-600 dark:text-zinc-400 py-2">
              {loadingStep}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
