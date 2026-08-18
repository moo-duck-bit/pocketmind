# POCKET-MIND

A goal-oriented journaling web app for mental health self-reflection. Instead of facing a blank
page, the user writes through a guided conversation with an LLM, which summarizes the exchange into
a diary entry and ties it back to a personal mental health goal.

Software artifact for **"Human-AI Collaborative Journaling with POCKET-MIND: A Dual-Prompt Framework
for Emotional Exploration and Goal Attainment"** — Yang, **Park**, Lee & Oh, *International Journal
of Human–Computer Interaction* 42(14), 11366–11378 (2025).
[DOI](https://doi.org/10.1080/10447318.2025.2593550) · one-week study, 30 participants.

## Features

| | |
|---|---|
| **Goal setting** — mental health goal registered at signup | `pages/Signup.js`, `routes/user_routes.py` |
| **Diary writing** — conversational journaling, summarized into an entry | `pages/Writing2.js`, `routes/agent_routes.py` |
| **Goal-based visualization** — post-entry Likert survey scored onto a calendar graph | `pages/LikertScaleSurvey.js`, `pages/Chart.js` |

## Dual-prompt framework

Conversations run in two phases: a **Main Prompt** opens with empathic, open-ended questions for
emotional exploration, then a **Wrapping Prompt** closes the session by connecting the day's
experience to the user's goal. A final summarization pass produces the stored entry.

## Stack

React 18 (CRA) + Chakra UI + Chart.js, installable as a PWA · FastAPI on Python 3.12 + OpenAI API ·
Cloud Firestore, Firebase Auth & Cloud Messaging.

## Setup

Bring your own OpenAI key and Firebase project — no credentials are committed.

```bash
# backend
cd backend && python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env          # OPENAI_API_KEY, FIREBASE_CREDENTIALS
uvicorn app.main:app --reload

# frontend
cd frontend && npm install
cp .env.example .env          # Firebase web config
npm start
```

A snapshot of the study prototype, not a maintained product; the original Heroku hosts are retired.
No participant data is included.

## Citation

```bibtex
@article{yang2025pocketmind,
  title   = {Human-AI Collaborative Journaling with POCKET-MIND:
             A Dual-Prompt Framework for Emotional Exploration and Goal Attainment},
  author  = {Yang, HaeJi and Park, JinGyeong and Lee, JinKwon and Oh, Hayoung},
  journal = {International Journal of Human--Computer Interaction},
  volume  = {42},
  number  = {14},
  pages   = {11366--11378},
  year    = {2025},
  doi     = {10.1080/10447318.2025.2593550}
}
```
