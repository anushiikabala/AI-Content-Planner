"""
AI Content Creator — Streamlit frontend.

Run:
    streamlit run app.py

Make sure api.py (Flask backend) is already running on port 5000.
"""

import json
import requests
import streamlit as st

BACKEND_CONTENT_URL = "http://127.0.0.1:5000/generate-content"

MOODS = ["fun", "luxury", "adventure", "romantic", "aesthetic", "inspiring", "professional", "humorous"]
PLATFORMS_LIST = ["Instagram", "TikTok", "YouTube", "LinkedIn"]

st.set_page_config(page_title="AI Content Creator", page_icon="✨", layout="wide")
st.title("✨ AI Content Creator")
st.caption("Works for any subject — a trip, a project, a launch, a workout, anything.")

with st.form("content_form"):
    subject = st.text_input("Subject", value="Building an AI chatbot")
    highlights_raw = st.text_area(
        "Highlights (one per line)",
        value="Trained the model\nDeployed to production\nFirst 100 users",
    )
    moments_raw = st.text_area(
        "Moments / actions (one per line)",
        value="Debugged all night\nCelebrated the launch",
    )
    image_desc_raw = st.text_area("Photo/video descriptions (optional, one per line)", value="")
    mood = st.selectbox("Mood", MOODS)
    platforms_selected = st.multiselect("Platforms", PLATFORMS_LIST, default=["Instagram"])
    extra_notes = st.text_input("Extra notes (optional)", value="")

    submitted = st.form_submit_button("Generate Content Pack", type="primary", use_container_width=True)

if submitted:
    payload = {
        "form_data": {
            "subject": subject,
            "highlights": [h.strip() for h in highlights_raw.splitlines() if h.strip()],
            "moments": [m.strip() for m in moments_raw.splitlines() if m.strip()],
            "imageDescriptions": [i.strip() for i in image_desc_raw.splitlines() if i.strip()],
            "mood": mood,
            "platforms": platforms_selected or ["Instagram"],
            "extraNotes": extra_notes,
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

    data = resp.json()
    st.success(f"Content pack generated for: {data['metadata']['subject']}")

    st.markdown("### ✨ Hooks")
    for h in data.get("hooks", []):
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
    for style, text in data.get("captions", {}).items():
        with st.expander(style.capitalize()):
            st.write(text)

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