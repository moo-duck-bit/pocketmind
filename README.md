# POCKET-MIND

A goal-oriented journaling web app for mental health self-reflection. Instead of facing a blank
page, the user writes through a guided conversation with an LLM, which composes a summary from the
exchange and links it back to a personal mental health goal.

> **Human-AI Collaborative Journaling with POCKET-MIND: A Dual-Prompt Framework for Emotional Exploration and Goal Attainment**
> HaeJi Yang, **JinGyeong Park**, JinKwon Lee, Hayoung Oh
> *International Journal of Human–Computer Interaction*, Vol. 42, No. 14, pp. 11366–11378 (2025)
> DOI: [10.1080/10447318.2025.2593550](https://doi.org/10.1080/10447318.2025.2593550)

Evaluated in a one-week study with 30 participants (ages 19–34).

---

## Core features

| Feature | Where |
|---|---|
| **Goal setting** — user registers a mental health goal at signup | `pages/Signup.js`, `routes/user_routes.py` |
| **Diary writing** — conversational journaling, summarized into an entry | `pages/Writing2.js`, `routes/agent_routes.py` |
| **Goal-based visualization** — post-entry survey scored onto a calendar-linked graph | `pages/LikertScaleSurvey.js`, `pages/Chart.js` |

## Dual-prompt framework

The conversation runs in two phases. The **Main Prompt** opens with empathic, open-ended questions
that help the user identify and explore an emotion. The **Wrapping Prompt** then closes the session
by tying the day's experience back to the user's stated goal. A final summarization pass condenses
the exchange into the journal entry that gets persisted.

`agent_routes.py` implements the turn loop and the summarization step; the model is given a
mental-health-coach role via the system prompt.

After each entry, a five-item Likert survey (adapted from the Goal Commitment Scale) is scored and
plotted against the calendar so progress is visible over time.

---

## Stack

**Frontend** — React 18 (CRA), Chakra UI, React Bootstrap, Chart.js; installable as a PWA with
push reminders via Firebase Cloud Messaging
**Backend** — FastAPI on Python 3.12, OpenAI API
**Data** — Cloud Firestore, Firebase Authentication

```
frontend/
  src/pages/          Auth, Signup, Home, Writing2, Result, AllDiary, Chart, LikertScaleSurvey
  src/component/      Chat box, diary view, navigation
  src/api/user.js     Axios client
backend/
  app/main.py                 App + CORS
  app/routes/user_routes.py   Signup, login, journal create/list
  app/routes/agent_routes.py  Conversation turns, summarization, journal save
```

`pages/Writing.js` is the earlier multi-disciplinary feedback design (counselor / doctor / combined
readings of one entry), which was dropped after usability testing found the per-discipline feedback
too long and hard to distinguish. It is kept for reference and is not routed.

---

## Running it

Credentials come from environment variables; nothing sensitive is committed. You will need your own
OpenAI key and Firebase project.

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                               # fill in OPENAI_API_KEY
uvicorn app.main:app --reload
```

Put your Firebase service-account JSON at the path named by `FIREBASE_CREDENTIALS`
(default `app/firebase_key.json`), from Firebase Console → Project Settings → Service accounts.
It is gitignored.

`openai==0.28.0` is pinned deliberately: the code uses the legacy `openai.ChatCompletion`
interface, removed in the 1.x SDK.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env                               # fill in your Firebase web config
npm start
```

---

## Notes

A snapshot of the study prototype rather than a maintained product. The Heroku hosts referenced in
the frontend were the study deployment and are retired, so the two packages need repointing at a
local backend to run together. No participant data is included.

---

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
