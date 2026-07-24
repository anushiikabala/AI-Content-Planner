import os
import json
import re
from typing import Any, Dict

from dotenv import load_dotenv
from pathlib import Path
from anthropic import Anthropic

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# ---- Anthropic config ----
MODEL_NAME = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5")
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
print("✅ Using Anthropic model:", MODEL_NAME)


# ----------------------------
# Helpers
# ----------------------------
def _safe_list(x, fallback=None):
    if fallback is None:
        fallback = []
    return x if isinstance(x, list) else fallback


def _call_llm(*args, stage: str = "unknown", prefill: str = "", **kwargs) -> str:
    """
    Supports:
      _call_llm(prompt, temperature=..., max_tokens=..., stage=..., prefill=...)
      _call_llm(system, user, temperature=..., max_tokens=..., stage=..., prefill=...)
    """
    temperature = kwargs.pop("temperature", 0.6)
    max_tokens = kwargs.pop("max_tokens", 1500)

    if "prompt" in kwargs:
        system_txt = "You are an expert AI content strategist."
        prompt = kwargs.pop("prompt")
    elif len(args) == 1:
        system_txt = "You are an expert AI content strategist."
        prompt = args[0]
    elif len(args) >= 2:
        system_txt = args[0] or "You are an expert AI content strategist."
        prompt = args[1] or ""
    else:
        raise ValueError("No prompt provided to _call_llm")

    system_txt += (
        "\n\nRespond with valid JSON only. No markdown fences, "
        "no commentary, no explanation before or after the JSON."
    )

    messages = [{"role": "user", "content": str(prompt)}]
    if prefill:
        messages.append({"role": "assistant", "content": prefill})

    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=max_tokens,
        temperature=temperature,
        system=system_txt,
        messages=messages,
    )

    text = response.content[0].text
    if prefill:
        text = prefill + text  # add back the bracket we primed it with

    if response.stop_reason == "max_tokens":
        raise ValueError(
            f"[{stage}] LLM output truncated at max_tokens={max_tokens}. "
            "Increase max_tokens for this call, or shrink the request."
        )
    return text


def _extract_json(text: str) -> Any:
    """
    Extract JSON from text (handles cases where model adds extra commentary).
    """
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text, flags=re.MULTILINE).strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    first_obj = text.find("{")
    first_arr = text.find("[")
    candidates = []
    if first_obj != -1:
        candidates.append(first_obj)
    if first_arr != -1:
        candidates.append(first_arr)
    if not candidates:
        raise ValueError("No JSON start found")

    start = min(candidates)
    end_obj = text.rfind("}")
    end_arr = text.rfind("]")
    end = max(end_obj, end_arr)
    if end == -1 or end <= start:
        raise ValueError("No JSON end found")

    snippet = text[start : end + 1]
    return json.loads(snippet)


# =============================================================================
# GENERIC AI CONTENT CREATOR
# Works for ANY subject (a trip, a project, a launch, a workout, anything).
# =============================================================================

def _content_payload(payload: dict) -> dict:
    fd = payload.get("form_data", {}) or payload
    return {
        "subject": fd.get("subject", "My experience"),
        "highlights": _safe_list(fd.get("highlights"), [])[:10],
        "moments": _safe_list(fd.get("moments"), [])[:10],
        "image_descriptions": _safe_list(fd.get("imageDescriptions"), [])[:8],
        "mood": fd.get("mood", "aesthetic"),
        "platforms": _safe_list(fd.get("platforms"), ["Instagram"])[:4],
        "extraNotes": fd.get("extraNotes", ""),
    }


def _core_narrative(payload: dict) -> Dict[str, Any]:
    system = "You are a viral short-form content director. Output STRICT JSON only."
    user = f"""
Subject: {payload['subject']}
Highlights: {payload['highlights']}
Moments/actions: {payload['moments']}
Image descriptions (from user-uploaded photos/videos): {payload['image_descriptions']}
Mood: {payload['mood']}
Extra notes: {payload['extraNotes']}

Generate the following. Output JSON with EXACT keys:

- hooks: list of 4 short, scroll-stopping opening lines (different angles).
- reel_script: object with keys:
    opening (1 punchy line),
    scenes (list of 4-6 short scene descriptions, each starting with what's shown),
    ending (1 closing line).
- voiceover_script: a natural, conversational narration (60-90 words) matching
  the mood, written as if spoken aloud.
- shot_sequence: list of 6-10 short shot labels in a sensible filming/editing order
  tailored to THIS subject (not generic travel shots unless the subject is travel).
- journal_entry: a short (40-60 word) diary-style reflective summary.

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(system, user, temperature=0.8, max_tokens=1800, stage="core_narrative", prefill="{")
    data = _extract_json(txt)
    if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
        data = data[0]
    if not isinstance(data, dict):
        raise ValueError(f"core_narrative did not return a JSON object (got {type(data).__name__})")
    return data


def _captions_pack(payload: dict) -> Dict[str, str]:
    system = "You are a social media copywriter who writes in distinct, non-generic voices. Output STRICT JSON only."
    user = f"""
Subject: {payload['subject']}
Highlights: {payload['highlights']}
Moments/actions: {payload['moments']}
Mood: {payload['mood']}

Write ONE caption per style below (2-4 sentences each, natural, not templated).
Output JSON object with EXACT keys:
- aesthetic
- funny
- storytelling
- emotional
- professional
- influencer

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(system, user, temperature=0.85, max_tokens=1200, stage="captions_pack", prefill="{")
    data = _extract_json(txt)
    if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
        data = data[0]
    if not isinstance(data, dict):
        raise ValueError(f"captions_pack did not return a JSON object (got {type(data).__name__})")
    return data


def _seo_and_music(payload: dict) -> Dict[str, Any]:
    system = "You are a social trends and audio specialist. Output STRICT JSON only."
    user = f"""
Subject: {payload['subject']}
Highlights: {payload['highlights']}
Mood: {payload['mood']}
Platforms: {payload['platforms']}

Output JSON with EXACT keys:
- hashtags: object with keys "topic" (5-8 hashtags specific to the subject),
  "broad" (5-8 general/reach hashtags), "trending" (3-5 currently-common
  hashtag patterns for this content type), "niche" (5-8 specific/community
  hashtags). Every hashtag string must start with #.
- music_suggestions: list of 4-6 objects, each with keys "vibe" (e.g. "upbeat",
  "chill", "cinematic") and "suggestion" (a short description of the STYLE of
  track/sound to use — do not invent fake specific song titles).

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(system, user, temperature=0.6, max_tokens=1200, stage="seo_and_music", prefill="{")
    data = _extract_json(txt)
    if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
        data = data[0]
    if not isinstance(data, dict):
        raise ValueError(f"seo_and_music did not return a JSON object (got {type(data).__name__})")
    return data


def _editing_and_repurpose(payload: dict) -> Dict[str, Any]:
    platforms = payload["platforms"]

    repurpose_targets = []
    if "Instagram" in platforms:
        repurpose_targets += ["instagram_posts (list of 3 short post ideas)", "story_ideas (list of 6 quick story-slide ideas)"]
    if "YouTube" in platforms:
        repurpose_targets.append("youtube_shorts_script (a short vertical-video script, 100-150 words)")
    if "LinkedIn" in platforms:
        repurpose_targets.append("linkedin_post (a professional-toned post, 80-120 words)")
    if "TikTok" in platforms:
        repurpose_targets.append("tiktok_script (a punchy script with on-screen text cues, 80-120 words)")
    repurpose_targets.append("blog_post (a short blog-style writeup, 120-180 words)")

    system = "You are a senior video editor and cross-platform content repurposing strategist. Output STRICT JSON only."
    user = f"""
Subject: {payload['subject']}
Highlights: {payload['highlights']}
Moments/actions: {payload['moments']}
Mood: {payload['mood']}
Platforms requested: {platforms}

Output JSON with EXACT keys:
- editing_suggestions: object with keys:
    clip_order (list matching a sensible edit order),
    transitions (list of 3-5 transition ideas),
    slow_motion_moments (list of 2-3 moments worth slowing down),
    text_overlays (list of 3-5 short on-screen text ideas),
    filters_and_color (1-2 sentence suggestion),
    beat_sync_notes (1-2 sentence suggestion for syncing cuts to music).
- repurposed_content: object containing ONLY these keys (do not add others,
  do not fill platforms that weren't requested):
  {", ".join(repurpose_targets)}

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(system, user, temperature=0.7, max_tokens=3000, stage="editing_and_repurpose", prefill="{")
    data = _extract_json(txt)
    if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
        data = data[0]
    if not isinstance(data, dict):
        raise ValueError(f"editing_and_repurpose did not return a JSON object (got {type(data).__name__})")
    return data


def generate_content_pack(payload: dict) -> Dict[str, Any]:
    payload = _content_payload(payload)

    core = _core_narrative(payload)
    captions = _captions_pack(payload)
    seo_music = _seo_and_music(payload)
    editing_repurpose = _editing_and_repurpose(payload)

    return {
        "metadata": {
            "subject": payload["subject"],
            "mood": payload["mood"],
            "platforms": payload["platforms"],
        },
        "hooks": core.get("hooks", []),
        "reel_script": core.get("reel_script", {}),
        "voiceover_script": core.get("voiceover_script", ""),
        "shot_sequence": core.get("shot_sequence", []),
        "journal_entry": core.get("journal_entry", ""),
        "captions": captions,
        "hashtags": seo_music.get("hashtags", {}),
        "music_suggestions": seo_music.get("music_suggestions", []),
        "editing_suggestions": editing_repurpose.get("editing_suggestions", {}),
        "repurposed_content": editing_repurpose.get("repurposed_content", {}),
    }