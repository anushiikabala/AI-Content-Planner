"""
AI Content Creator — multi-step wizard UI.

Run:
    streamlit run app.py

Make sure api.py (Flask backend) is already running on port 5000.
"""

import json
import requests
import streamlit as st

BACKEND_CONTENT_URL = "http://127.0.0.1:5000/generate-content"

CONTENT_TYPES = [
    ("ai_project", "🤖 AI Project"),
    ("travel", "✈️ Travel"),
    ("event", "🎉 Event"),
    ("fitness", "💪 Fitness"),
    ("startup", "🚀 Startup / Product Launch"),
    ("personal", "📣 Personal Update"),
    ("other", "🧩 Something Else"),
]

VIBES = ["😊 Casual", "🚀 Professional", "🔥 Motivational", "✨ Aesthetic", "😂 Funny", "❤️ Personal", "🎉 Celebration"]
PLATFORMS_LIST = ["Instagram", "LinkedIn", "TikTok", "X", "Threads", "YouTube Shorts"]
NOTE_SUGGESTIONS = [
    "Mention my tech stack",
    "Keep it under 200 words",
    "Add emojis",
    "Sound like a founder",
    "Make it recruiter-friendly",
]
LANG_LABELS = {"english": "English", "hinglish": "Hinglish", "spanish": "Spanish", "french": "French"}

TOTAL_STEPS = 5  # steps before results

st.set_page_config(page_title="AI Content Creator", page_icon="✨", layout="centered")

st.markdown(
    """
    <style>
    /* Reduce Streamlit's default top/bottom page padding — this alone was
       adding a large empty margin above and below content on every page. */
    .block-container {
        padding-top: 2rem !important;
        padding-bottom: 2rem !important;
        max-width: 900px;
    }
    /* Quiet, flat suggestion chips instead of default boxy buttons */
    div[data-testid="column"] button {
        border-radius: 999px !important;
        border: 1px solid #444 !important;
        background: transparent !important;
        font-size: 0.82rem !important;
        padding: 4px 14px !important;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ----------------------------
# Session state init
# ----------------------------
if "step" not in st.session_state:
    st.session_state.step = 1
if "data" not in st.session_state:
    st.session_state.data = {}


def go_to(step):
    st.session_state.step = step
    st.rerun()


def chip_list_input(label, key, placeholder=""):
    """Reusable '+ Add another' chip-list widget backed by session_state."""
    if key not in st.session_state:
        st.session_state[key] = []
    if f"{key}_counter" not in st.session_state:
        st.session_state[f"{key}_counter"] = 0

    counter = st.session_state[f"{key}_counter"]
    input_key = f"{key}_input_{counter}"

    col1, col2 = st.columns([4, 1])
    with col1:
        new_item = st.text_input(label, key=input_key, placeholder=placeholder)
    with col2:
        st.write("")
        if st.button("➕ Add", key=f"{key}_add_{counter}"):
            if new_item.strip():
                st.session_state[key].append(new_item.strip())
                st.session_state[f"{key}_counter"] += 1
                st.rerun()

    for i, item in enumerate(st.session_state[key]):
        c1, c2 = st.columns([6, 1])
        c1.write(f"➕ {item}")
        if c2.button("✕", key=f"{key}_remove_{i}_{counter}"):
            st.session_state[key].pop(i)
            st.rerun()

    return st.session_state[key]


def chip_toggle_notes(key):
    """Tappable suggestion chips that append into a free-text notes box."""
    if key not in st.session_state:
        st.session_state[key] = ""

    cols = st.columns(len(NOTE_SUGGESTIONS))
    for i, suggestion in enumerate(NOTE_SUGGESTIONS):
        if cols[i].button(suggestion, key=f"note_chip_{i}"):
            current = st.session_state[key]
            st.session_state[key] = (current + ". " + suggestion if current else suggestion)
            st.rerun()

    return st.text_area("Anything else? (optional)", key=key)


def render_lang_tabs(available_langs, render_fn):
    """Given a list of language keys, render a tab per language and call render_fn(lang) inside each."""
    if len(available_langs) > 1:
        tabs = st.tabs([LANG_LABELS.get(l, l.title()) for l in available_langs])
        for tab, lang in zip(tabs, available_langs):
            with tab:
                render_fn(lang)
    else:
        render_fn(available_langs[0] if available_langs else "english")


if st.session_state.step <= TOTAL_STEPS:
    st.title("✨ Create Your Content")
    st.progress(st.session_state.step / TOTAL_STEPS)

# =============================================================================
# STEP 1: Content type
# =============================================================================
if st.session_state.step == 1:
    st.subheader("What are you creating today?")

    labels = [label for _, label in CONTENT_TYPES]
    prev_label = st.session_state.data.get("content_type_label", labels[0])
    default_index = labels.index(prev_label) if prev_label in labels else 0

    choice = st.radio("Pick one", labels, index=default_index, key="w_content_type", label_visibility="collapsed")
    selected_key = next(k for k, label in CONTENT_TYPES if label == choice)

    if st.button("Next →", type="primary", use_container_width=True):
        st.session_state.data["content_type"] = selected_key
        st.session_state.data["content_type_label"] = choice
        go_to(2)

# =============================================================================
# STEP 2: Where are you posting? (moved up per request)
# =============================================================================
elif st.session_state.step == 2:
    st.subheader("Where are you posting?")
    platforms = st.multiselect(
        "Platforms", PLATFORMS_LIST,
        default=st.session_state.data.get("platforms", ["Instagram"]),
        key="w_platforms",
    )

    col1, col2 = st.columns(2)
    if col1.button("← Back", use_container_width=True):
        go_to(1)
    if col2.button("Next →", type="primary", use_container_width=True):
        st.session_state.data["platforms"] = platforms or ["Instagram"]
        go_to(3)

# =============================================================================
# STEP 3: Tell your story (+ category-specific fields)
# =============================================================================
elif st.session_state.step == 3:
    st.subheader("Tell your story")

    one_liner = st.text_input(
        "What's your content about?",
        value=st.session_state.data.get("one_liner", ""),
        placeholder="I built an AI chatbot that answers questions using my PDFs.",
        key="w_one_liner",
    )
    story = st.text_area(
        "Tell the story",
        value=st.session_state.data.get("story", ""),
        placeholder=(
            "Spent the last 3 weeks building this after work. Almost gave up when "
            "the vector search kept breaking, but got it working over the weekend "
            "and shipped it. Posted it on Reddit and woke up to 100 signups."
        ),
        height=120,
        key="w_story",
    )

    prev_answers = st.session_state.data.get("category_answers", {})
    category_answers = {}
    ctype = st.session_state.data.get("content_type", "other")

    def _saved(name, fallback=""):
        return prev_answers.get(name, fallback)

    if ctype == "ai_project":
        category_answers["project_name"] = st.text_input("What's your project called?", value=_saved("project_name"), placeholder="AI Resume Analyzer", key="w_project_name")
        category_answers["tech_stack"] = st.text_input("Tech stack (optional)", value=_saved("tech_stack"), placeholder="React, FastAPI, OpenAI, LangChain", key="w_tech_stack")
        category_answers["challenge"] = st.text_input("Biggest challenge (optional)", value=_saved("challenge"), placeholder="The vector search kept returning garbage results", key="w_challenge")
        category_answers["wins"] = chip_list_input("Any wins? (optional)", "wins_chips", "First 500 users")

    elif ctype == "travel":
        category_answers["destination"] = st.text_input("Where did you go?", value=_saved("destination"), placeholder="Goa", key="w_destination")
        category_answers["companions"] = st.text_input("Who with? (optional)", value=_saved("companions"), placeholder="Friends", key="w_companions")
        category_answers["places_activities"] = chip_list_input("Places / activities", "travel_chips", "Baga Beach")
        category_answers["favorite_memory"] = st.text_input("Favorite memory (optional)", value=_saved("favorite_memory"), placeholder="Watching the sunset from the fort", key="w_favorite_memory")

    elif ctype == "startup":
        category_answers["product_name"] = st.text_input("Product name", value=_saved("product_name"), placeholder="Notion for Recipes", key="w_product_name")
        category_answers["problem"] = st.text_input("Problem it solves", value=_saved("problem"), placeholder="Nobody can find their own saved recipes", key="w_problem")
        category_answers["features"] = chip_list_input("Key features", "feature_chips", "Auto-import from any site")
        category_answers["cta"] = st.text_input("Call-to-action (optional)", value=_saved("cta"), placeholder="Link in bio, free during launch week", key="w_cta")

    elif ctype == "event":
        category_answers["event_name"] = st.text_input("What was the event?", value=_saved("event_name"), placeholder="My sister's wedding", key="w_event_name")
        category_answers["role"] = st.text_input("Your role (optional)", value=_saved("role"), placeholder="Best man", key="w_role")
        category_answers["best_moments"] = chip_list_input("Best moments", "event_chips", "The speech")

    elif ctype == "fitness":
        category_answers["goal"] = st.text_input("What's the goal or milestone?", value=_saved("goal"), placeholder="Ran my first half marathon", key="w_goal")
        category_answers["timeframe"] = st.text_input("Timeframe (optional)", value=_saved("timeframe"), placeholder="12 weeks of training", key="w_timeframe")
        category_answers["wins"] = chip_list_input("Key stats or wins", "fitness_chips", "Lost 8kg")

    else:  # personal / other
        category_answers["happenings"] = chip_list_input("What happened?", "personal_chips", "Got promoted")
        category_answers["extra"] = st.text_input("Anything else worth mentioning?", value=_saved("extra"), placeholder="", key="w_extra")

    col1, col2 = st.columns(2)
    if col1.button("← Back", use_container_width=True):
        go_to(2)
    if col2.button("Next →", type="primary", use_container_width=True):
        st.session_state.data["one_liner"] = one_liner
        st.session_state.data["story"] = story
        st.session_state.data["category_answers"] = category_answers
        go_to(4)

# =============================================================================
# STEP 4: Scene descriptions (optional, text-only)
# =============================================================================
elif st.session_state.step == 4:
    st.subheader("What are we looking at?")
    st.caption("Describe any photos or clips you're planning to use — we'll work them into the story.")

    scenes = chip_list_input("Add a scene", "scene_chips", "Coding setup at 2am")

    col1, col2 = st.columns(2)
    if col1.button("← Back", use_container_width=True):
        go_to(3)
    if col2.button("Next →", type="primary", use_container_width=True):
        st.session_state.data["scenes"] = scenes
        go_to(5)

# =============================================================================
# STEP 5: Vibe, languages, notes, generate
# =============================================================================
elif st.session_state.step == 5:
    col_vibe, col_lang = st.columns(2)

    with col_vibe:
        st.subheader("Vibe")
        prev_vibe = st.session_state.data.get("vibe", VIBES[0])
        vibe_index = VIBES.index(prev_vibe) if prev_vibe in VIBES else 0
        vibe = st.radio("Pick one", VIBES, index=vibe_index, key="w_vibe", label_visibility="collapsed")

    with col_lang:
        st.subheader("Languages")
        prev_langs = st.session_state.data.get("languages", ["english"])
        st.checkbox("English (always included)", value=True, disabled=True)
        lang_hinglish = st.checkbox("Hinglish", value=("hinglish" in prev_langs), key="w_lang_hinglish")
        lang_spanish = st.checkbox("Spanish", value=("spanish" in prev_langs), key="w_lang_spanish")
        lang_french = st.checkbox("French", value=("french" in prev_langs), key="w_lang_french")

    st.subheader("Anything else?")
    notes = chip_toggle_notes("extra_notes")

    col1, col2 = st.columns(2)
    if col1.button("← Back", use_container_width=True):
        go_to(4)

    if col2.button("🚀 Generate Everything", type="primary", use_container_width=True):
        languages = ["english"]
        if lang_hinglish:
            languages.append("hinglish")
        if lang_spanish:
            languages.append("spanish")
        if lang_french:
            languages.append("french")

        st.session_state.data["vibe"] = vibe
        st.session_state.data["languages"] = languages
        st.session_state.data["notes"] = notes

        d = st.session_state.data

        payload = {
            "form_data": {
                "subject": d.get("one_liner") or d.get("content_type_label", "My content"),
                "contentType": d.get("content_type"),
                "story": d.get("story", ""),
                "categoryAnswers": d.get("category_answers", {}),
                "imageDescriptions": d.get("scenes", []),
                "mood": d.get("vibe", "aesthetic"),
                "platforms": d.get("platforms", ["Instagram"]),
                "extraNotes": d.get("notes", ""),
                "languages": d.get("languages", ["english"]),
            }
        }

        with st.spinner("Generating your content pack... this can take a minute with multiple languages."):
            try:
                resp = requests.post(BACKEND_CONTENT_URL, json=payload, timeout=240)
            except requests.exceptions.ConnectionError:
                st.error("Could not reach the backend. Is `python api.py` running on port 5000?")
                st.stop()
            except requests.exceptions.Timeout:
                st.error("Request timed out.")
                st.stop()

        if resp.status_code != 200:
            try:
                msg = resp.json().get("error", resp.text)
            except Exception:
                msg = resp.text
            st.error(f"Error: {msg}")
            st.stop()

        st.session_state.result = resp.json()
        go_to(6)

# =============================================================================
# STEP 6: Results — tabs across the top, no sidebar
# =============================================================================
elif st.session_state.step == 6:
    data = st.session_state.get("result", {})
    meta = data.get("metadata", {})
    available_langs = list(data.get("hooks", {}).keys()) or ["english"]

    st.markdown(
        """
        <style>
        .callout { border-left: 3px solid #2F80ED; background: #F7F9FC;
                   padding: 14px 18px; border-radius: 4px; margin-bottom: 10px; }
        .callout-gold { border-left-color: #C9A227; background: #FBF7EC; }
        .callout-gray { border-left-color: #9B9A97; background: #F7F7F5; }
        .pill { display:inline-block; padding: 3px 10px; margin: 3px 6px 3px 0;
                border-radius: 4px; background:#F1F1EF; color:#37352F;
                font-size: 0.78rem; border: 1px solid #E9E9E7; }
        .section-divider { border-top: 1px solid #E9E9E7; margin: 6px 0 16px 0; }
        </style>
        """,
        unsafe_allow_html=True,
    )

    top1, top2, top3 = st.columns([5, 1.3, 1.3])
    with top1:
        st.markdown(f"**{meta.get('subject', 'Your content')}**")
        st.caption(f"{meta.get('mood', '')} · {', '.join(meta.get('platforms', []))}")
    with top2:
        st.download_button(
            "⬇️ JSON", data=json.dumps(data, indent=2),
            file_name="content_pack.json", mime="application/json",
            use_container_width=True,
        )
    with top3:
        if st.button("← Start over", use_container_width=True):
            st.session_state.step = 1
            st.session_state.data = {}
            st.rerun()

    SECTION_LABELS = [
        "Hooks", "Reel Script", "Voiceover", "Shot Sequence", "Captions",
        "Hashtags", "Music", "Editing", "Repurposed", "Journal",
    ]
    tabs = st.tabs(SECTION_LABELS)

    with tabs[0]:
        def render_hooks(lang):
            for h in data.get("hooks", {}).get(lang, []):
                st.markdown(f'<div class="callout">{h}</div>', unsafe_allow_html=True)
        render_lang_tabs(available_langs, render_hooks)

    with tabs[1]:
        def render_script(lang):
            rs = data.get("reel_script", {}).get(lang, {})
            st.markdown(f'<div class="callout"><b>Opening</b><br>{rs.get("opening","")}</div>', unsafe_allow_html=True)
            st.caption("Scenes")
            for i, scene in enumerate(rs.get("scenes", []), 1):
                st.markdown(f'<div class="callout callout-gray"><b>Scene {i}</b> — {scene}</div>', unsafe_allow_html=True)
            st.markdown(f'<div class="callout"><b>Ending</b><br>{rs.get("ending","")}</div>', unsafe_allow_html=True)
        render_lang_tabs(available_langs, render_script)

    with tabs[2]:
        def render_voiceover(lang):
            st.markdown(f'<div class="callout callout-gray">{data.get("voiceover_script", {}).get(lang, "")}</div>', unsafe_allow_html=True)
        render_lang_tabs(available_langs, render_voiceover)

    with tabs[3]:
        def render_shots(lang):
            shots = data.get("shot_sequence", {}).get(lang, [])
            for i, shot in enumerate(shots, 1):
                st.markdown(f"**{i}.** {shot}")
        render_lang_tabs(available_langs, render_shots)

    with tabs[4]:
        for style, by_lang in data.get("captions", {}).items():
            with st.expander(style.capitalize(), expanded=False):
                shown_langs = [l for l in available_langs if l in by_lang]
                def render_caption(lang, by_lang=by_lang):
                    st.write(by_lang.get(lang, ""))
                render_lang_tabs(shown_langs or ["english"], render_caption)

    with tabs[5]:
        st.caption("Hashtags stay in English/original form regardless of language selection.")
        for group, tags in data.get("hashtags", {}).items():
            st.caption(group.capitalize())
            st.markdown("".join(f'<span class="pill">{t}</span>' for t in tags), unsafe_allow_html=True)
            st.markdown('<div class="section-divider"></div>', unsafe_allow_html=True)

    with tabs[6]:
        def render_music(lang):
            for m in data.get("music_suggestions", {}).get(lang, []):
                st.markdown(
                    f'<div class="callout callout-gray"><b>{m.get("vibe","").capitalize()}</b><br>{m.get("suggestion","")}</div>',
                    unsafe_allow_html=True,
                )
        render_lang_tabs(available_langs, render_music)

    with tabs[7]:
        st.caption("Editing suggestions are format/technical guidance and stay in English regardless of language selection.")
        edit = data.get("editing_suggestions", {})
        if edit.get("clip_order"):
            st.caption("Clip order")
            for i, c in enumerate(edit["clip_order"], 1):
                st.write(f"{i}. {c}")
        if edit.get("transitions"):
            st.caption("Transitions")
            for t in edit["transitions"]:
                st.write(f"- {t}")
        if edit.get("slow_motion_moments"):
            st.caption("Slow-motion moments")
            for s in edit["slow_motion_moments"]:
                st.write(f"- {s}")
        if edit.get("text_overlays"):
            st.caption("Text overlays")
            for t in edit["text_overlays"]:
                st.write(f"- {t}")
        if edit.get("filters_and_color"):
            st.caption("Filters & color")
            st.write(edit["filters_and_color"])
        if edit.get("beat_sync_notes"):
            st.caption("Beat-sync notes")
            st.write(edit["beat_sync_notes"])

    with tabs[8]:
        def render_repurposed(lang):
            for k, v in data.get("repurposed_content", {}).get(lang, {}).items():
                with st.expander(k.replace("_", " ").title(), expanded=False):
                    if isinstance(v, list):
                        for item in v:
                            st.write(f"- {item}")
                    else:
                        st.write(v)
        render_lang_tabs(available_langs, render_repurposed)

    with tabs[9]:
        def render_journal(lang):
            st.markdown(f'<div class="callout callout-gold">{data.get("journal_entry", {}).get(lang, "")}</div>', unsafe_allow_html=True)
        render_lang_tabs(available_langs, render_journal)