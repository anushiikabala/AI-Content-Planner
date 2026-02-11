import random
from datetime import datetime, timedelta
from scorer import score_post

HOOKS = [
    "3 mistakes killing your growth",
    "The secret nobody tells you about",
    "Stop doing this immediately",
    "Why 99% of creators fail at",
    "The one thing that changed everything for"
]

TOPICS = [
    "Content Strategy That Actually Works",
    "Building Authentic Connections",
    "Scaling Your Creative Business",
    "Monetization Secrets Revealed",
    "Viral Content Formula"
]

DEFAULT_PILLARS = ["Education", "Inspiration", "Behind-the-Scenes", "Community", "Product"]

POST_TYPES = {
    "Instagram": ["Reels", "Carousel", "Story", "Static"],
    "LinkedIn": ["Story post", "Tips post", "Case study", "Carousel PDF idea"],
    "YouTube": ["Shorts", "Long-form"]
}

def _selected_platforms(payload: dict):
    p = payload.get("platforms", {}) or {}
    selected = []
    if p.get("instagram"): selected.append("Instagram")
    if p.get("linkedin"): selected.append("LinkedIn")
    if p.get("youtube"): selected.append("YouTube")
    return selected or ["Instagram"]

def _selected_post_types(payload: dict, platform: str):
    if platform == "Instagram":
        return payload.get("instagramPostTypes") or POST_TYPES["Instagram"]
    if platform == "LinkedIn":
        return payload.get("linkedinPostTypes") or POST_TYPES["LinkedIn"]
    if platform == "YouTube":
        return payload.get("youtubeContentTypes") or POST_TYPES["YouTube"]
    return POST_TYPES.get(platform, ["Post"])

def _variants_for_day(i: int, variation_count: int, hook_template: str, pillar: str, topic: str):
    labels = ["A", "B", "C"][:max(1, min(3, variation_count))]
    variants = []
    for lab in labels:
        hook = f"{hook_template} {pillar.lowerCase()}" if hasattr(str, "lowerCase") else f"{hook_template} {pillar.lower()}"
        variants.append({
            "id": f"{i}-{lab}",
            "label": f"Variant {lab}",
            "hook": hook,
            "caption": (
                f"Caption {lab}: Today we're diving into {topic}! Here's what you need to know... 👇\n\n"
                f"💡 Key insight\n✨ Action step\n🎯 Why this matters\n\n"
                f"Save this if it helped!"
            ),
            "reel_script": (
                f"🎬 REEL SCRIPT - Variant {lab}\n\n"
                f"HOOK (0-3s): \"{hook_template} {pillar.lower()}...\"\n\n"
                f"VALUE (3-15s):\n- Point 1\n- Point 2\n- Point 3\n\n"
                f"CTA (15-20s): \"Save & follow for more {pillar} tips!\""
            ),
            "hashtags": [f"#{pillar.lower()}", "#contentcreator", "#socialmediatips", "#creatoreconomy", "#digitalmarketing"],
            "linkedin_post": (
                f"{topic} 💼\n\nHere's what most people get wrong about {pillar.lower()}...\n\n"
                "→ The common mistake\n→ Why it's holding you back\n→ The better approach\n\n"
                "What’s your take? Comment below. 👇"
            ),
            "youtube_title": f"{topic} | {pillar} Strategy for Creators",
            "youtube_description": (
                f"In this video, I'm breaking down the {pillar} strategy that can improve your content.\n\n"
                "📌 Timestamps:\n0:00 Intro\n1:00 Key ideas\n5:00 Action steps\n\n"
                "💬 Comment what you want next!"
            ),
            "youtube_tags": [pillar.lower(), "content creator", "social media tips", "creator economy", "digital marketing"]
        })
    return variants

def generate_plan(payload: dict):
    is_sample = bool(payload.get("isSample", False))
    plan_length = 7 if is_sample else int(payload.get("planLength", 30))
    variation_count = int(payload.get("variationCount", 3))

    start_date_str = payload.get("startDate") or datetime.utcnow().strftime("%Y-%m-%d")
    start_dt = datetime.strptime(start_date_str, "%Y-%m-%d")

    pillars = payload.get("contentPillars") or DEFAULT_PILLARS
    platforms = _selected_platforms(payload)
    cta_style = payload.get("ctaStyle", "Save")

    days = []
    for i in range(plan_length):
        dt = start_dt + timedelta(days=i)
        date_string = dt.strftime("%Y-%m-%d")

        platform = random.choice(platforms)
        pillar = random.choice(pillars)
        topic = random.choice(TOPICS)
        hook_template = random.choice(HOOKS)
        post_type = random.choice(_selected_post_types(payload, platform))

        variants = _variants_for_day(i, variation_count, hook_template, pillar, topic)
        base = variants[0]

        scoring = score_post(base["hook"], base["caption"], cta_style)

        days.append({
            "date": date_string,
            "platform": platform,
            "post_type": post_type,
            "pillar": pillar,
            "topic": topic,

            "hook": base["hook"],
            "caption": base["caption"],
            "reel_script": base["reel_script"],
            "hashtags": base["hashtags"],
            "linkedin_post": base["linkedin_post"],
            "youtube_title": base["youtube_title"],
            "youtube_description": base["youtube_description"],
            "youtube_tags": base["youtube_tags"],

            "variants": variants,

            "predicted_score": scoring["predicted_score"],
            "score_value": scoring["score_value"],
            "score_reasons": scoring["score_reasons"],
            "ai_insights": scoring["ai_insights"],

            "rationale": [
                f"Strong {pillar.lower()} angle appeals to target audience",
                "Hook follows a proven engagement pattern",
                "CTA encourages a specific action",
                "Fits selected platform format"
            ]
        })

    # analytics summary (simple v1)
    pillar_counts = {}
    high_count = 0
    for d in days:
        pillar_counts[d["pillar"]] = pillar_counts.get(d["pillar"], 0) + 1
        if d["predicted_score"] == "High":
            high_count += 1

    analytics = {
        "pillar_counts": pillar_counts,
        "recommended_times": payload.get("postingTimes") or ["9:00 AM", "6:00 PM"],
        "top_keywords": (payload.get("brandKeywords") or ["tips", "strategy", "growth", "content", "creator"])[:5],
        "total_posts": len(days),
        "high_performers_count": high_count,
        "pillar_balance": "Well-balanced",
        "best_posting_times": payload.get("postingTimes") or ["9:00 AM", "6:00 PM"],
        "optimization_score": 82,
        "ai_insights": [
            "Your audience prefers educational content patterns.",
            "Short-form formats generally outperform static posts in many niches.",
            "Try testing stronger CTAs on Medium-scoring posts."
        ]
    }

    metadata = {
        "niche": payload.get("niche", "Content Creation"),
        "platforms": platforms,
        "tone": payload.get("tone", "Educational"),
        "start_date": start_date_str,
        "creator_name": payload.get("creatorName", ""),
        "audience": payload.get("audience", []),
        "region": payload.get("region", "Global"),
        "content_goals": payload.get("contentGoals", [])
    }

    return {"metadata": metadata, "days": days, "analytics": analytics}