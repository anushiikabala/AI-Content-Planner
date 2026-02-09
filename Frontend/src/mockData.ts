// Mock data structure for the content planner
export interface ContentVariant {
  id: string;
  label: string;
  hook: string;
  caption: string;
  reel_script: string;
  hashtags: string[];
  linkedin_post: string;
  youtube_title: string;
  youtube_description: string;
  youtube_tags: string[];
}

export interface DayPlan {
  date: string;
  platform: string;
  post_type: string;
  pillar: string;
  topic: string;
  hook: string;
  caption: string;
  reel_script: string;
  hashtags: string[];
  linkedin_post: string;
  youtube_title: string;
  youtube_description: string;
  youtube_tags: string[];
  variants: ContentVariant[];
  predicted_score: 'High' | 'Med' | 'Low';
  score_value: number;
  score_reasons: string[];
  ai_insights: string[];
  rationale: string[];
}

export interface PlanMetadata {
  niche: string;
  platforms: string[];
  tone: string;
  start_date: string;
  creator_name: string;
  audience: string[];
  region: string;
  content_goals: string[];
}

export interface Analytics {
  pillar_counts: { [key: string]: number };
  recommended_times: string[];
  top_keywords: string[];
  total_posts: number;
  high_performers_count: number;
  pillar_balance: string;
  best_posting_times: string[];
  optimization_score: number;
  ai_insights: string[];
}

export interface ContentPlan {
  metadata: PlanMetadata;
  days: DayPlan[];
  analytics: Analytics;
}

// Generate mock data
export const generateMockPlan = (): ContentPlan => {
  const pillars = ['Education', 'Inspiration', 'Behind-the-Scenes', 'Community', 'Product'];
  const platforms = ['Instagram', 'LinkedIn', 'YouTube'];
  const postTypes = {
    Instagram: ['Reels', 'Carousel', 'Story', 'Static'],
    LinkedIn: ['Story post', 'Tips post', 'Case study', 'Carousel PDF idea'],
    YouTube: ['Shorts', 'Long-form']
  };

  const days: DayPlan[] = [];
  const startDate = new Date('2026-03-01');

  const hooks = [
    '3 mistakes killing your growth',
    'The secret nobody tells you about',
    'Stop doing this immediately',
    'Why 99% of creators fail at',
    'The one thing that changed everything for'
  ];

  const topics = [
    'Content Strategy That Actually Works',
    'Building Authentic Connections',
    'Scaling Your Creative Business',
    'Monetization Secrets Revealed',
    'Viral Content Formula'
  ];

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    const dateString = currentDate.toISOString().split('T')[0];

    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const pillar = pillars[Math.floor(Math.random() * pillars.length)];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const hookTemplate = hooks[Math.floor(Math.random() * hooks.length)];
    const postTypeArray = postTypes[platform as keyof typeof postTypes];
    const postType = postTypeArray[Math.floor(Math.random() * postTypeArray.length)];
    const scoreTypes: ('High' | 'Med' | 'Low')[] = ['High', 'Med', 'Low'];
    const predictedScore = scoreTypes[Math.floor(Math.random() * 3)];
    const scoreValue = predictedScore === 'High' ? 80 + Math.random() * 20 : 
                       predictedScore === 'Med' ? 50 + Math.random() * 30 : 
                       30 + Math.random() * 20;

    const aiInsights = [
      'Uses number-based hook (proven 3x engagement)',
      'Matches high-engagement pillar pattern',
      'Optimal posting time for target audience',
      'Strong CTA encourages specific action',
      'Emotionally engaging language detected'
    ];

    const scoreReasons = 
      predictedScore === 'High' 
        ? ['Number-based hook increases click rate by 34%', 'Peak audience activity window', 'High-performing pillar for your niche']
        : predictedScore === 'Med'
        ? ['Good hook structure but competitive timing', 'Moderate engagement pillar', 'CTA could be stronger']
        : ['Generic hook pattern', 'Off-peak posting time', 'Low-performing pillar historically'];

    const variants: ContentVariant[] = ['A', 'B', 'C'].map(label => ({
      id: `${i}-${label}`,
      label: `Variant ${label}`,
      hook: `${hookTemplate} ${pillar.toLowerCase()}`,
      caption: `Caption ${label}: Today we're diving into ${topic}! Here's what you need to know... 👇\n\n💡 Key insight about this topic\n✨ Action step you can take today\n🎯 Why this matters for your journey\n\nDouble tap if this resonates! 💙`,
      reel_script: `🎬 REEL SCRIPT - Variant ${label}\n\nHOOK (0-3s):\n"${hookTemplate} ${pillar.toLowerCase()}..."\n\nVALUE (3-15s):\n- Point 1: Key insight\n- Point 2: Why it works\n- Point 3: How to implement\n\nCTA (15-20s):\n"Save this for later and follow for more ${pillar} tips!"`,
      hashtags: [`#${pillar.toLowerCase()}`, '#contentcreator', '#socialmediatips', '#creatoreconomy', '#digitalmarketing'],
      linkedin_post: `${topic} 💼\n\nHere's what most people get wrong about ${pillar.toLowerCase()}...\n\n→ The common mistake\n→ Why it's holding you back\n→ The better approach\n\nI've tested this approach with 50+ clients, and the results speak for themselves.\n\nWhat's your take on this? Drop a comment below. 👇`,
      youtube_title: `${topic} | ${pillar} Strategy for Creators`,
      youtube_description: `In this video, I'm breaking down the ${pillar} strategy that transformed my content.\n\n📌 Timestamps:\n0:00 - Intro\n0:45 - The Problem\n2:30 - The Solution\n5:15 - Implementation Steps\n7:00 - Results\n\n🔗 Resources mentioned:\n[Link to resource]\n\n💬 Let me know in the comments what you want to see next!\n\n#${pillar} #ContentCreation #CreatorTips`,
      youtube_tags: [pillar.toLowerCase(), 'content creator', 'social media tips', 'creator economy', 'digital marketing']
    }));

    days.push({
      date: dateString,
      platform,
      post_type: postType,
      pillar,
      topic,
      hook: variants[0].hook,
      caption: variants[0].caption,
      reel_script: variants[0].reel_script,
      hashtags: variants[0].hashtags,
      linkedin_post: variants[0].linkedin_post,
      youtube_title: variants[0].youtube_title,
      youtube_description: variants[0].youtube_description,
      youtube_tags: variants[0].youtube_tags,
      variants,
      predicted_score: predictedScore,
      score_value: Math.round(scoreValue),
      score_reasons: scoreReasons,
      ai_insights: aiInsights.slice(0, 3 + Math.floor(Math.random() * 2)),
      rationale: [
        `Strong ${pillar.toLowerCase()} angle appeals to target audience`,
        'Hook follows proven engagement pattern',
        'CTA encourages specific action',
        'Optimal posting time for platform'
      ]
    });
  }

  return {
    metadata: {
      niche: 'Content Creation',
      platforms: ['Instagram', 'LinkedIn', 'YouTube'],
      tone: 'Educational',
      start_date: '2026-03-01',
      creator_name: 'Sample Creator',
      audience: ['Students', 'Working Professionals'],
      region: 'Global',
      content_goals: ['Engagement', 'Growth']
    },
    days,
    analytics: {
      pillar_counts: {
        'Education': 8,
        'Inspiration': 7,
        'Behind-the-Scenes': 5,
        'Community': 6,
        'Product': 4
      },
      recommended_times: ['9:00 AM', '12:00 PM', '6:00 PM', '8:00 PM'],
      top_keywords: ['tips', 'strategy', 'growth', 'content', 'creator'],
      total_posts: 30,
      high_performers_count: 12,
      pillar_balance: 'Well-balanced',
      best_posting_times: ['9:00 AM', '6:00 PM'],
      optimization_score: 82,
      ai_insights: [
        'Your audience prefers educational content (67% engagement rate)',
        'Reels perform 3x better than static posts in your niche',
        'Try increasing Community pillar posts by 20%',
        'Peak engagement occurs at 9 AM and 6 PM in your region'
      ]
    }
  };
};
