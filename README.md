# POCKET-MIND

A human–AI collaborative journaling web application: instead of facing a blank page, the user
writes a journal entry through a guided conversation with an LLM, which then composes the entry
from the exchange and responds to it.

Built as the software artifact for:

> **Human-AI Collaborative Journaling with POCKET-MIND: A Dual-Prompt Framework for Emotional Exploration and Goal Attainment**
> HaeJi Yang, **JinGyeong Park**, JinKwon Lee, Hayoung Oh
> *International Journal of Human–Computer Interaction*, Vol. 42, No. 14, pp. 11366–11378 (2025)
> DOI: [10.1080/10447318.2025.2593550](https://doi.org/10.1080/10447318.2025.2593550)

---

## Stack

**Frontend** — React 18 (Create React App), Chakra UI, React Bootstrap, Chart.js
**Backend** — FastAPI on Python 3.12, OpenAI API
**Data & messaging** — Cloud Firestore, Firebase Authentication, Firebase Cloud Messaging

---

## Layout

```
frontend/
  src/pages/          Auth, Signup, Home, Writing2, Result, AllDiary, Chart
  src/pages/Writing.js    Multi-persona comparison view (counselor / doctor / pocket)
  src/component/      Chat box, diary view, navigation
  src/api/user.js     Axios client
  src/firebase-config.js  Firebase init

backend/
  app/main.py                 App + CORS
  app/routes/user_routes.py   Signup, login, journal create/list
  app/routes/agent_routes.py  Conversation turns, summarization, journal save
```

### Conversation flow

`agent_routes.py` holds the turn loop: each user message is appended to the running message list and
sent to the chat model under a therapist system prompt. Once an exchange reaches six messages, a
second summarization pass condenses it, and that summary becomes the journal entry persisted to
Firestore.

`Writing.js` sends one finished entry to three persona endpoints concurrently — `/chat/counselor`,
`/chat/doctor`, `/chat/pocket` — and renders the three readings side by side.

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
(default `app/firebase_key.json`) — generate one at Firebase Console → Project Settings →
Service accounts. It is gitignored.

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

This is a snapshot of the study prototype rather than a maintained product. The Heroku hosts
referenced in the frontend were the study deployment and are retired, so the two packages need to be
repointed at a local backend to run together. No participant data is included.

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
