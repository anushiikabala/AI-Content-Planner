import os
import json
import re
from typing import Any, Dict, List

from dotenv import load_dotenv
from pathlib import Path
from anthropic import Anthropic

load_dotenv(dotenv_path=Path(__file__).resolve().parent / ".env")

# ---- Anthropic config ----
# Two models: Haiku for structured/formatting stages (cheap, fast),
# Sonnet for the creative voice-defining stages (narrative + localization).
MODEL_HAIKU = os.getenv("ANTHROPIC_MODEL_HAIKU", "claude-haiku-4-5")
MODEL_SONNET = os.getenv("ANTHROPIC_MODEL_SONNET", "claude-sonnet-5")
client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
print("✅ Using Anthropic models — creative:", MODEL_SONNET, "| structured:", MODEL_HAIKU)

PLATFORM_REPURPOSE_MAP = {
    "Instagram": [
        "instagram_posts (list of 3 short post ideas)",
        "story_ideas (list of 6 quick story-slide ideas)",
    ],
    "LinkedIn": ["linkedin_post (a professional-toned post, 80-120 words)"],
    "TikTok": ["tiktok_script (a punchy script with on-screen text cues, 80-120 words)"],
    "X": [
        "x_post (a punchy post under 280 characters)",
        "x_post_variants (list of 2 alternate short versions)",
    ],
    "Threads": ["threads_post (a casual, conversational post, 60-100 words)"],
    "YouTube Shorts": ["youtube_shorts_script (a short vertical-video script, 100-150 words)"],
}

LANGUAGE_INSTRUCTIONS = {
    "hinglish": (
        "Hindi and English mixed the way people actually type it casually online, in ROMAN "
        "(Latin) script, NOT Devanagari. Spoken register, not formal grammar. Keep tech terms, "
        "brand names, and common filler words in English (e.g. 'basically', 'vibe', 'launch') "
        "rather than translating them — real Hinglish doesn't mix at random, certain word "
        "categories stay in English almost every time. This must read like a native bilingual "
        "creator wrote it themselves, NOT like a formal translation."
    ),
    "spanish": (
        "Natural, casual, spoken-register Spanish — how someone would actually caption a post "
        "in Spanish. Not textbook-formal, not a literal word-for-word translation."
    ),
    "french": (
        "Natural, casual, spoken-register French — how someone would actually caption a post "
        "in French. Not textbook-formal, not a literal word-for-word translation."
    ),
}


# ----------------------------
# Helpers
# ----------------------------
def _safe_list(x, fallback=None):
    if fallback is None:
        fallback = []
    return x if isinstance(x, list) else fallback


def _call_llm(*args, stage: str = "unknown", prefill: str = "", model: str = None, **kwargs) -> str:
    """
    Supports:
      _call_llm(prompt, temperature=..., max_tokens=..., stage=..., prefill=..., model=...)
      _call_llm(system, user, temperature=..., max_tokens=..., stage=..., prefill=..., model=...)

    `model` defaults to MODEL_HAIKU (structured/cheap). Pass model=MODEL_SONNET for
    the creative voice-defining stages.
    """
    temperature = kwargs.pop("temperature", 0.6)
    max_tokens = kwargs.pop("max_tokens", 1500)
    model_name = model or MODEL_HAIKU

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
        "\n\nRespond with valid JSON only, starting with { or [ as the very first "
        "character of your reply. No markdown fences, no commentary, no explanation "
        "before or after the JSON."
    )

    messages = [{"role": "user", "content": str(prompt)}]

    response = client.messages.create(
        model=model_name,
        max_tokens=max_tokens,
        system=system_txt,
        messages=messages,
    )

    text_block = next((block for block in response.content if getattr(block, "type", None) == "text"), None)
    if text_block is None:
        raise ValueError(f"[{stage}] No text block found in response (model={model_name}, may be all thinking/tool blocks)")
    text = text_block.text

    if response.stop_reason == "max_tokens":
        raise ValueError(
            f"[{stage}] LLM output truncated at max_tokens={max_tokens} (model={model_name}). "
            "Increase max_tokens for this call, or shrink the request."
        )
    return text


def _extract_json(text: str) -> Any:
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


def _unwrap_dict(data, stage_name: str) -> Dict[str, Any]:
    """Defensive unwrap for accidental [ {...} ] wrapping."""
    if isinstance(data, list) and len(data) == 1 and isinstance(data[0], dict):
        data = data[0]
    if not isinstance(data, dict):
        raise ValueError(f"{stage_name} did not return a JSON object (got {type(data).__name__})")
    return data


# ----------------------------
# Input normalization
# ----------------------------
def _content_payload(payload: dict) -> dict:
    fd = payload.get("form_data", {}) or payload
    return {
        "content_type": fd.get("contentType", "other"),
        "one_liner": fd.get("subject", "My experience"),
        "story": fd.get("story", ""),
        "category_answers": fd.get("categoryAnswers") or {},
        "raw_highlights": _safe_list(fd.get("highlights"), [])[:10],  # legacy/manual fallback
        "raw_moments": _safe_list(fd.get("moments"), [])[:10],
        "image_descriptions": _safe_list(fd.get("imageDescriptions"), [])[:8],
        "mood": fd.get("mood", "aesthetic"),
        "platforms": _safe_list(fd.get("platforms"), ["Instagram"])[:6],
        "extraNotes": fd.get("extraNotes", ""),
        "languages": _safe_list(fd.get("languages"), ["english"]) or ["english"],
    }


# ----------------------------
# Stage 0: Story parser — derives highlights/moments from free text
# ----------------------------
def _story_parser(payload: dict) -> Dict[str, Any]:
    system = (
        "You are an expert story editor who extracts the specific, usable content beats from "
        "a person's raw story so a content writer can use them. Output STRICT JSON only."
    )
    user = f"""
Content type: {payload['content_type']}
One-liner: {payload['one_liner']}
Story (in the person's own words): {payload['story']}
Category-specific details: {json.dumps(payload['category_answers'], indent=2)}

Extract:
- highlights: 4-8 short, specific, punchy phrases capturing the key things worth mentioning
  (achievements, features, places, standout facts). Not generic — pull from what was actually said.
- moments: 3-6 short phrases capturing specific actions/experiences/emotional beats from the
  story, roughly in the order they happened.

Return ONLY JSON with EXACT keys: highlights, moments.
"""
    txt = _call_llm(system, user, temperature=0.5, max_tokens=800, stage="story_parser", prefill="{", model=MODEL_HAIKU)
    data = _unwrap_dict(_extract_json(txt), "story_parser")
    data.setdefault("highlights", [])
    data.setdefault("moments", [])
    return data


# ----------------------------
# Stage 1: Core narrative (CREATIVE — Sonnet)
# ----------------------------
def _core_narrative(payload: dict) -> Dict[str, Any]:
    system = "You are a viral short-form content director. Output STRICT JSON only."
    user = f"""
Subject: {payload['one_liner']}
Highlights: {payload['highlights']}
Moments/actions: {payload['moments']}
Image descriptions (from user-planned photos/videos): {payload['image_descriptions']}
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
  tailored to THIS subject (not generic unless the subject calls for it).
- journal_entry: a short (40-60 word) diary-style reflective summary.

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(system, user, temperature=0.8, max_tokens=1800, stage="core_narrative", prefill="{", model=MODEL_SONNET)
    return _unwrap_dict(_extract_json(txt), "core_narrative")


# ----------------------------
# Stage 2: Captions — English base (structured — Haiku)
# ----------------------------
def _captions_pack(payload: dict) -> Dict[str, str]:
    system = "You are a social media copywriter who writes in distinct, non-generic voices. Output STRICT JSON only."
    user = f"""
Subject: {payload['one_liner']}
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
    txt = _call_llm(system, user, temperature=0.85, max_tokens=1200, stage="captions_pack", prefill="{", model=MODEL_HAIKU)
    return _unwrap_dict(_extract_json(txt), "captions_pack")


# ----------------------------
# Stage 3: Hashtags + music (structured — Haiku)
# ----------------------------
def _seo_and_music(payload: dict) -> Dict[str, Any]:
    system = "You are a social trends and audio specialist. Output STRICT JSON only."
    user = f"""
Subject: {payload['one_liner']}
Highlights: {payload['highlights']}
Mood: {payload['mood']}
Platforms: {payload['platforms']}

Output JSON with EXACT keys:
- hashtags: object with keys "topic" (5-8 hashtags specific to the subject),
  "broad" (5-8 general/reach hashtags), "trending" (3-5 currently-common
  hashtag patterns for this content type), "niche" (5-8 specific/community
  hashtags). Every hashtag string must start with #.
- music_suggestions: list of 4-6 objects, each with keys "vibe" and "suggestion"
  (describe the STYLE of track/sound — do not invent fake specific song titles).

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(system, user, temperature=0.6, max_tokens=1200, stage="seo_and_music", prefill="{", model=MODEL_HAIKU)
    return _unwrap_dict(_extract_json(txt), "seo_and_music")


# ----------------------------
# Stage 4: Editing + repurposing (structured — Haiku)
# ----------------------------
def _editing_and_repurpose(payload: dict) -> Dict[str, Any]:
    platforms = payload["platforms"]

    repurpose_targets = []
    for p in platforms:
        repurpose_targets.extend(PLATFORM_REPURPOSE_MAP.get(p, []))
    repurpose_targets.append("blog_post (a short blog-style writeup, 120-180 words)")

    system = "You are a senior video editor and cross-platform content repurposing strategist. Output STRICT JSON only."
    user = f"""
Subject: {payload['one_liner']}
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
    txt = _call_llm(system, user, temperature=0.7, max_tokens=3000, stage="editing_and_repurpose", prefill="{", model=MODEL_HAIKU)
    return _unwrap_dict(_extract_json(txt), "editing_and_repurpose")


# ----------------------------
# Stage 5: Language localization — core narrative + captions (CREATIVE — Sonnet)
# ----------------------------
def _localize_core_one(payload: dict, core: Dict[str, Any], captions: Dict[str, str], lang: str) -> Dict[str, Any]:
    caption_keys = list(captions.keys())
    hooks = core.get("hooks", [])
    reel_script = core.get("reel_script", {})
    num_scenes = len(reel_script.get("scenes", []))
    shot_sequence = core.get("shot_sequence", [])

    system = (
        "You are a bilingual/multilingual creator localizing your OWN content into another "
        "language you speak natively. You are NOT a translator — write it as if it's your own "
        "original content in that language/style, matching the same meaning and energy as the "
        "source, not a stiff conversion. Output STRICT JSON only."
    )
    user = f"""
Here is the FINAL, locked content — do not change its meaning or add new ideas, just localize it:

Hooks: {json.dumps(hooks)}
Reel script: {json.dumps(reel_script, indent=2)}
Voiceover script: {core.get('voiceover_script', '')}
Shot sequence: {json.dumps(shot_sequence)}
Journal entry: {core.get('journal_entry', '')}
Captions: {json.dumps(captions, indent=2)}

Localize into this language style — {lang}: {LANGUAGE_INSTRUCTIONS[lang]}

Output a single JSON object with keys:
- hooks: list of exactly {len(hooks)} items, same order, localized
- reel_script: object with keys opening, scenes (list of exactly {num_scenes} items), ending
- voiceover_script: string
- shot_sequence: list of exactly {len(shot_sequence)} items, same order
- journal_entry: string
- captions: object with EXACTLY these keys, unchanged, do NOT translate/rename/omit
  any of them, only translate the VALUES: {caption_keys}

CRITICAL: preserve exact list lengths and key names for every field above. Only
translate/localize the actual text content, never the structure.

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(
        system, user, temperature=0.75, max_tokens=2200, stage=f"localize_core:{lang}", prefill="{", model=MODEL_SONNET
    )
    data = _unwrap_dict(_extract_json(txt), f"localize_core:{lang}")

    got_keys = set(data.get("captions", {}).keys())
    missing = set(caption_keys) - got_keys
    if missing:
        print(f"⚠️  [localize_core:{lang}] missing caption styles: {missing}")
    return data


def _localize_core(payload: dict, core: Dict[str, Any], captions: Dict[str, str]) -> Dict[str, Any]:
    languages = [l for l in payload["languages"] if l != "english" and l in LANGUAGE_INSTRUCTIONS]
    if not languages:
        return {}

    result = {}
    for lang in languages:
        try:
            result[lang] = _localize_core_one(payload, core, captions, lang)
        except Exception as e:
            print(f"⚠️  [localize_core:{lang}] failed, skipping this language: {e}")
    return result


# ----------------------------
# Stage 6: Language localization — music + repurposed content (CREATIVE — Sonnet)
# ----------------------------
def _localize_extras_one(payload: dict, music_suggestions: List[Dict[str, str]], repurposed_content: Dict[str, Any], lang: str) -> Dict[str, Any]:
    repurposed_keys = list(repurposed_content.keys())

    system = (
        "You are a bilingual/multilingual creator localizing your OWN content into another "
        "language you speak natively. You are NOT a translator — write it as if it's your own "
        "original content in that language/style. Output STRICT JSON only."
    )
    user = f"""
Here is the FINAL, locked content — do not change its meaning or add new ideas, just localize it:

Music suggestions (only localize the "suggestion" text, keep "vibe" as-is):
{json.dumps(music_suggestions, indent=2)}

Repurposed content:
{json.dumps(repurposed_content, indent=2)}

Localize into this language style — {lang}: {LANGUAGE_INSTRUCTIONS[lang]}

Output a single JSON object with keys:
- music_suggestions: list of exactly {len(music_suggestions)} objects, each with
  keys "vibe" (keep unchanged) and "suggestion" (localized)
- repurposed_content: object with EXACTLY these keys, unchanged, do NOT
  rename/omit any of them: {repurposed_keys}. Preserve whether each value is a
  string or a list, and preserve list lengths exactly — only translate content.

Return ONLY JSON. No extra text.
"""
    txt = _call_llm(
        system, user, temperature=0.75, max_tokens=2200, stage=f"localize_extras:{lang}", prefill="{", model=MODEL_SONNET
    )
    data = _unwrap_dict(_extract_json(txt), f"localize_extras:{lang}")

    got_keys = set(data.get("repurposed_content", {}).keys())
    missing = set(repurposed_keys) - got_keys
    if missing:
        print(f"⚠️  [localize_extras:{lang}] missing repurposed_content keys: {missing}")
    return data


def _localize_extras(payload: dict, music_suggestions: List[Dict[str, str]], repurposed_content: Dict[str, Any]) -> Dict[str, Any]:
    languages = [l for l in payload["languages"] if l != "english" and l in LANGUAGE_INSTRUCTIONS]
    if not languages or (not music_suggestions and not repurposed_content):
        return {}

    result = {}
    for lang in languages:
        try:
            result[lang] = _localize_extras_one(payload, music_suggestions, repurposed_content, lang)
        except Exception as e:
            print(f"⚠️  [localize_extras:{lang}] failed, skipping this language: {e}")
    return result


# ----------------------------
# Main entry (used by api.py)
# ----------------------------
def generate_content_pack(payload: dict) -> Dict[str, Any]:
    payload = _content_payload(payload)

    if payload["story"].strip() or any(v for v in payload["category_answers"].values()):
        parsed = _story_parser(payload)
        payload["highlights"] = parsed.get("highlights") or payload["raw_highlights"]
        payload["moments"] = parsed.get("moments") or payload["raw_moments"]
    else:
        payload["highlights"] = payload["raw_highlights"]
        payload["moments"] = payload["raw_moments"]

    core = _core_narrative(payload)
    captions_en = _captions_pack(payload)
    seo_music = _seo_and_music(payload)
    editing_repurpose = _editing_and_repurpose(payload)

    music_en = seo_music.get("music_suggestions", [])
    repurposed_en = editing_repurpose.get("repurposed_content", {})

    localized_core = _localize_core(payload, core, captions_en)
    localized_extras = _localize_extras(payload, music_en, repurposed_en)

    # ---- Merge English + localized versions for every section that supports language ----
    hooks_final = {"english": core.get("hooks", [])}
    reel_script_final = {"english": core.get("reel_script", {})}
    voiceover_final = {"english": core.get("voiceover_script", "")}
    shot_sequence_final = {"english": core.get("shot_sequence", [])}
    journal_final = {"english": core.get("journal_entry", "")}
    captions_final = {style: {"english": text} for style, text in captions_en.items()}
    music_final = {"english": music_en}
    repurposed_final = {"english": repurposed_en}

    for lang, content in localized_core.items():
        hooks_final[lang] = content.get("hooks", [])
        reel_script_final[lang] = content.get("reel_script", {})
        voiceover_final[lang] = content.get("voiceover_script", "")
        shot_sequence_final[lang] = content.get("shot_sequence", [])
        journal_final[lang] = content.get("journal_entry", "")
        for style, text in content.get("captions", {}).items():
            if style in captions_final:
                captions_final[style][lang] = text

    for lang, content in localized_extras.items():
        music_final[lang] = content.get("music_suggestions", [])
        repurposed_final[lang] = content.get("repurposed_content", {})

    return {
        "metadata": {
            "subject": payload["one_liner"],
            "content_type": payload["content_type"],
            "mood": payload["mood"],
            "platforms": payload["platforms"],
            "languages": payload["languages"],
        },
        "hooks": hooks_final,
        "reel_script": reel_script_final,
        "voiceover_script": voiceover_final,
        "shot_sequence": shot_sequence_final,
        "journal_entry": journal_final,
        "captions": captions_final,
        "hashtags": seo_music.get("hashtags", {}),  # English-only: hashtags aren't localized
        "music_suggestions": music_final,
        "editing_suggestions": editing_repurpose.get("editing_suggestions", {}),  # English-only: internal/technical
        "repurposed_content": repurposed_final,
    }