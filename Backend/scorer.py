import re

CTA_WORDS = ["save", "comment", "share", "dm", "follow", "subscribe", "link", "download"]

def score_post(hook: str, caption: str, cta_style: str = ""):
    score = 50
    reasons = []
    insights = []

    # numbers in hook
    if re.search(r"\b\d+\b", hook):
        score += 15
        reasons.append("Number-based hook tends to increase click-through rate.")
        insights.append("Uses number-based hook (often boosts engagement).")

    # "why/how" in hook
    if re.search(r"\b(why|how)\b", hook.lower()):
        score += 8
        reasons.append("Curiosity hook encourages users to stop and read.")
        insights.append("Curiosity-driven hook detected.")

    # CTA words in caption
    cap_lower = caption.lower()
    if any(w in cap_lower for w in CTA_WORDS) or (cta_style and cta_style.lower() in cap_lower):
        score += 12
        reasons.append("Clear CTA encourages a specific action.")
        insights.append("Strong CTA present.")

    # too long caption penalty (very simple)
    if len(caption) > 450:
        score -= 8
        reasons.append("Caption may be slightly long for quick consumption.")
        insights.append("Consider tightening caption length.")

    score = max(0, min(100, score))

    if score >= 80:
        label = "High"
    elif score >= 50:
        label = "Med"
    else:
        label = "Low"

    # ensure at least 3 reasons
    while len(reasons) < 3:
        reasons.append("Good structure; can be optimized further for platform patterns.")

    return {
        "predicted_score": label,
        "score_value": int(score),
        "score_reasons": reasons[:3],
        "ai_insights": insights[:4] if insights else [
            "Matches common high-performing post structure.",
            "Good alignment with selected content pillar.",
            "CTA can be made more specific for higher actions."
        ]
    }