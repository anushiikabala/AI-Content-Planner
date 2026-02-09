import { X, Copy, CheckCircle, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { DayPlan } from '../mockData';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InsightPanel } from './InsightPanel';
import { RegenerateDropdown } from './RegenerateDropdown';
import { ScoreBadge } from './ScoreBadge';

interface DayDetailsDrawerProps {
  day: DayPlan | null;
  onClose: () => void;
  onRegenerate: (date: string, type: string) => void;
}

export function DayDetailsDrawer({ day, onClose, onRegenerate }: DayDetailsDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [expandedVariant, setExpandedVariant] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  if (!day) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'Instagram': return 'from-pink-500 to-purple-600';
      case 'LinkedIn': return 'from-blue-600 to-blue-800';
      case 'YouTube': return 'from-red-500 to-red-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${getPlatformColor(day.platform)} p-6 text-white relative overflow-hidden`}>
            <motion.div
              className="absolute inset-0 bg-white/10"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm opacity-90 mb-1">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <h2 className="text-2xl font-semibold mb-2">{day.platform} - {day.post_type}</h2>
                  <h3 className="text-lg opacity-95 mb-3">{day.topic}</h3>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      {day.pillar}
                    </span>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                      <ScoreBadge 
                        score={day.predicted_score} 
                        value={day.score_value}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
              >
                <Edit2 className="w-4 h-4" />
                {isEditing ? 'Done Editing' : 'Edit Mode'}
              </button>
              <RegenerateDropdown onRegenerate={(type) => onRegenerate(day.date, type)} />
            </div>

            {/* AI Insights */}
            <InsightPanel insights={day.ai_insights} scoreReasons={day.score_reasons} />

            {/* Topic */}
            <ContentSection
              title="Topic"
              content={day.topic}
              onCopy={() => copyToClipboard(day.topic, 'topic')}
              copied={copiedField === 'topic'}
              isEditing={isEditing}
            />

            {/* Hook */}
            <ContentSection
              title="Hook"
              content={day.hook}
              onCopy={() => copyToClipboard(day.hook, 'hook')}
              copied={copiedField === 'hook'}
              isEditing={isEditing}
            />

            {/* Reel Script */}
            {(day.platform === 'Instagram' || day.platform === 'YouTube') && (
              <ContentSection
                title={`${day.platform} ${day.platform === 'Instagram' ? 'Reel' : 'Short'} Script`}
                content={day.reel_script}
                onCopy={() => copyToClipboard(day.reel_script, 'reel')}
                copied={copiedField === 'reel'}
                isEditing={isEditing}
                multiline
              />
            )}

            {/* Caption */}
            <ContentSection
              title="Instagram Caption"
              content={day.caption}
              onCopy={() => copyToClipboard(day.caption, 'caption')}
              copied={copiedField === 'caption'}
              isEditing={isEditing}
              multiline
            />

            {/* Hashtags */}
            <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium">Hashtags</h3>
                <button
                  onClick={() => copyToClipboard(day.hashtags.join(' '), 'hashtags')}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {copiedField === 'hashtags' ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {day.hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* LinkedIn Post */}
            <ContentSection
              title="LinkedIn Version"
              content={day.linkedin_post}
              onCopy={() => copyToClipboard(day.linkedin_post, 'linkedin')}
              copied={copiedField === 'linkedin'}
              isEditing={isEditing}
              multiline
            />

            {/* YouTube */}
            {day.platform === 'YouTube' && (
              <>
                <ContentSection
                  title="YouTube Title"
                  content={day.youtube_title}
                  onCopy={() => copyToClipboard(day.youtube_title, 'yt-title')}
                  copied={copiedField === 'yt-title'}
                  isEditing={isEditing}
                />
                <ContentSection
                  title="YouTube Description"
                  content={day.youtube_description}
                  onCopy={() => copyToClipboard(day.youtube_description, 'yt-desc')}
                  copied={copiedField === 'yt-desc'}
                  isEditing={isEditing}
                  multiline
                />
                <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">YouTube Tags</h3>
                    <button
                      onClick={() => copyToClipboard(day.youtube_tags.join(', '), 'yt-tags')}
                      className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      {copiedField === 'yt-tags' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {day.youtube_tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Variants */}
            <div className="space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                Content Variants (A/B/C Testing)
                <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-full">
                  Test different versions
                </span>
              </h3>
              {day.variants.map((variant) => (
                <div
                  key={variant.id}
                  className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedVariant(expandedVariant === variant.id ? null : variant.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="font-medium">{variant.label}</span>
                    {expandedVariant === variant.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                  <AnimatePresence>
                    {expandedVariant === variant.id && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 'auto' }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 space-y-3 bg-zinc-50 dark:bg-zinc-800/50">
                          <div>
                            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Hook</div>
                            <p className="text-sm">{variant.hook}</p>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Caption Preview</div>
                            <p className="text-sm">{variant.caption.substring(0, 150)}...</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function ContentSection({
  title,
  content,
  onCopy,
  copied,
  isEditing,
  multiline = false
}: {
  title: string;
  content: string;
  onCopy: () => void;
  copied: boolean;
  isEditing: boolean;
  multiline?: boolean;
}) {
  const [editValue, setEditValue] = useState(content);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{title}</h3>
        <button
          onClick={onCopy}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          {copied ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </button>
      </div>
      {isEditing ? (
        multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900 resize-none"
            rows={6}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full p-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-900"
          />
        )
      ) : (
        <p className="text-sm whitespace-pre-wrap">{content}</p>
      )}
    </div>
  );
}
