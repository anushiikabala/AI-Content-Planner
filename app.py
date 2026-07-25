"""
AI Content Creator — multi-step wizard UI.

Run:
    streamlit run app.py

Make sure api.py (Flask backend) is already running on port 5000.

NOTE: This step only ships the wizard shell + a temporary payload mapping
so you can test the flow today. The backend "story parser" stage (which
will properly turn the free-text story into highlights/moments) comes next —
until then, the story text is folded into `highlights` as a best-effort
stand-in so /generate-content still runs.
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

st.set_page_config(page_title="AI Content Creator", page_icon="✨", layout="centered")

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
        st.write("")
        if st.button("➕ Add", key=f"{key}_add_{counter}"):
            if new_item.strip():
                st.session_state[key].append(new_item.strip())
                st.session_state[f"{key}_counter"] += 1  # forces a fresh, empty input box next run
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
        if cols[i % len(cols)].button(suggestion, key=f"note_chip_{i}"):
            current = st.session_state[key]
            st.session_state[key] = (current + ". " + suggestion if current else suggestion)
            st.rerun()

    return st.text_area("Anything else? (optional)", key=key)


st.title("✨ Create Your Content")
st.progress(min(st.session_state.step, 4) / 4)

# =============================================================================
# STEP 1: Content type
# =============================================================================
if st.session_state.step == 1:
    st.subheader("What are you creating today?")

    labels = [label for _, label in CONTENT_TYPES]
    choice = st.radio("Pick one", labels, label_visibility="collapsed")
    selected_key = next(k for k, label in CONTENT_TYPES if label == choice)

    if st.button("Next →", type="primary", use_container_width=True):
        st.session_state.data["content_type"] = selected_key
        st.session_state.data["content_type_label"] = choice
        go_to(2)

# =============================================================================
# STEP 2: Tell your story (+ category-specific fields)
# =============================================================================
elif st.session_state.step == 2:
    st.subheader("Tell your story")

    one_liner = st.text_input(
        "What's your content about?",
        placeholder="I built an AI chatbot that answers questions using my PDFs.",
    )
    story = st.text_area(
        "Tell the story",
        placeholder=(
            "Spent the last 3 weeks building this after work. Almost gave up when "
            "the vector search kept breaking, but got it working over the weekend "
            "and shipped it. Posted it on Reddit and woke up to 100 signups."
        ),
        height=120,
    )

    category_answers = {}
    ctype = st.session_state.data.get("content_type", "other")

    if ctype == "ai_project":
        category_answers["project_name"] = st.text_input("What's your project called?", placeholder="AI Resume Analyzer")
        category_answers["tech_stack"] = st.text_input("Tech stack (optional)", placeholder="React, FastAPI, OpenAI, LangChain")
        category_answers["challenge"] = st.text_input("Biggest challenge (optional)", placeholder="The vector search kept returning garbage results")
        category_answers["wins"] = chip_list_input("Any wins? (optional)", "wins_chips", "First 500 users")

    elif ctype == "travel":
        category_answers["destination"] = st.text_input("Where did you go?", placeholder="Goa")
        category_answers["companions"] = st.text_input("Who with? (optional)", placeholder="Friends")
        category_answers["places_activities"] = chip_list_input("Places / activities", "travel_chips", "Baga Beach")
        category_answers["favorite_memory"] = st.text_input("Favorite memory (optional)", placeholder="Watching the sunset from the fort")

    elif ctype == "startup":
        category_answers["product_name"] = st.text_input("Product name", placeholder="Notion for Recipes")
        category_answers["problem"] = st.text_input("Problem it solves", placeholder="Nobody can find their own saved recipes")
        category_answers["features"] = chip_list_input("Key features", "feature_chips", "Auto-import from any site")
        category_answers["cta"] = st.text_input("Call-to-action (optional)", placeholder="Link in bio, free during launch week")

    elif ctype == "event":
        category_answers["event_name"] = st.text_input("What was the event?", placeholder="My sister's wedding")
        category_answers["role"] = st.text_input("Your role (optional)", placeholder="Best man")
        category_answers["best_moments"] = chip_list_input("Best moments", "event_chips", "The speech")

    elif ctype == "fitness":
        category_answers["goal"] = st.text_input("What's the goal or milestone?", placeholder="Ran my first half marathon")
        category_answers["timeframe"] = st.text_input("Timeframe (optional)", placeholder="12 weeks of training")
        category_answers["wins"] = chip_list_input("Key stats or wins", "fitness_chips", "Lost 8kg")

    else:  # personal / other
        category_answers["happenings"] = chip_list_input("What happened?", "personal_chips", "Got promoted")
        category_answers["extra"] = st.text_input("Anything else worth mentioning?", placeholder="")

    col1, col2 = st.columns(2)
    if col1.button("← Back", use_container_width=True):
        go_to(1)
    if col2.button("Next →", type="primary", use_container_width=True):
        st.session_state.data["one_liner"] = one_liner
        st.session_state.data["story"] = story
        st.session_state.data["category_answers"] = category_answers
        go_to(3)

# =============================================================================
# STEP 3: Scene descriptions (optional, text-only)
# =============================================================================
elif st.session_state.step == 3:
    st.subheader("What are we looking at?")
    st.caption("Describe any photos or clips you're planning to use — we'll work them into the story.")

    scenes = chip_list_input("Add a scene", "scene_chips", "Coding setup at 2am")

    col1, col2 = st.columns(2)
    if col1.button("← Back", use_container_width=True):
        go_to(2)
    if col2.button("Next →", type="primary", use_container_width=True):
        st.session_state.data["scenes"] = scenes
        go_to(4)

# =============================================================================
# STEP 4: Vibe, platforms, languages, notes
# =============================================================================
elif st.session_state.step == 4:
    st.subheader("What's the vibe?")
    vibe = st.radio("Pick one", VIBES, label_visibility="collapsed")

    st.subheader("Where are you posting?")
    platforms = st.multiselect("Platforms", PLATFORMS_LIST, default=["Instagram"], label_visibility="collapsed")

    st.subheader("Languages")
    st.checkbox("English (always included)", value=True, disabled=True)
    lang_hinglish = st.checkbox("Hinglish")
    lang_spanish = st.checkbox("Spanish")
    lang_french = st.checkbox("French")

    st.subheader("Anything else?")
    notes = chip_toggle_notes("extra_notes")

    col1, col2 = st.columns(2)
    if col1.button("← Back", use_container_width=True):
        go_to(3)

    if col2.button("🚀 Generate Everything", type="primary", use_container_width=True):
        languages = ["english"]
        if lang_hinglish:
            languages.append("hinglish")
        if lang_spanish:
            languages.append("spanish")
        if lang_french:
            languages.append("french")

        st.session_state.data["vibe"] = vibe
        st.session_state.data["platforms"] = platforms or ["Instagram"]
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

        with st.spinner("Generating your content pack..."):
            try:
                resp = requests.post(BACKEND_CONTENT_URL, json=payload, timeout=180)
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
        go_to(5)

# =============================================================================
# STEP 5: Results
# =============================================================================
elif st.session_state.step == 5:
    data = st.session_state.get("result", {})

    if st.button("← Start over"):
        st.session_state.step = 1
        st.session_state.data = {}
        st.rerun()

    st.success(f"Content pack generated for: {data.get('metadata', {}).get('subject', '')}")

    lang_labels = {"english": "English", "hinglish": "Hinglish", "spanish": "Spanish", "french": "French"}
    available_langs = list(data.get("hooks", {}).keys()) or ["english"]

    st.markdown("### ✨ Hooks")
    if len(available_langs) > 1:
        lang_tabs = st.tabs([lang_labels.get(l, l.title()) for l in available_langs])
        for tab, lang in zip(lang_tabs, available_langs):
            with tab:
                for h in data.get("hooks", {}).get(lang, []):
                    st.markdown(f"- {h}")
    else:
        for h in data.get("hooks", {}).get("english", []):
            st.markdown(f"- {h}")

    st.markdown("### 🎬 Reel Script")
    rs = data.get("reel_script", {})
    st.write(f"**Opening:** {rs.get('opening','')}")
    for i, scene in enumerate(rs.get("scenes", []), 1):
        st.write(f"Scene {i}: {scene}")
    st.write(f"**Ending:** {rs.get('ending','')}")

    st.markdown("### 🎤 Voiceover Script")
    st.write(data.get("voiceover_script", ""))

    st.markdown("### 🎥 Shot Sequence")
    st.write(" → ".join(data.get("shot_sequence", [])))

    st.markdown("### 📱 Captions")
    for style, by_lang in data.get("captions", {}).items():
        with st.expander(style.capitalize()):
            if len(available_langs) > 1:
                cap_tabs = st.tabs([lang_labels.get(l, l.title()) for l in available_langs if l in by_lang])
                shown_langs = [l for l in available_langs if l in by_lang]
                for tab, lang in zip(cap_tabs, shown_langs):
                    with tab:
                        st.write(by_lang.get(lang, ""))
            else:
                st.write(by_lang.get("english", ""))

    st.markdown("### 🏷️ Hashtags")
    for group, tags in data.get("hashtags", {}).items():
        st.write(f"**{group.capitalize()}:** " + " ".join(tags))

    st.markdown("### 🎵 Music Suggestions")
    for m in data.get("music_suggestions", []):
        st.write(f"- **{m.get('vibe','')}:** {m.get('suggestion','')}")

    st.markdown("### 🎨 Editing Suggestions")
    st.json(data.get("editing_suggestions", {}))

    st.markdown("### 📅 Repurposed Content")
    for k, v in data.get("repurposed_content", {}).items():
        with st.expander(k.replace("_", " ").title()):
            if isinstance(v, list):
                for item in v:
                    st.write(f"- {item}")
            else:
                st.write(v)

    st.markdown("### 🧳 Journal Entry")
    st.write(data.get("journal_entry", ""))

    st.divider()
    st.download_button(
        "Download full content pack (JSON)",
        data=json.dumps(data, indent=2),
        file_name="content_pack.json",
        mime="application/json",
    )