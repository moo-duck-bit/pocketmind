# POCKET-MIND

A human–AI collaborative journaling web application built as the research apparatus for a study on
LLM-supported emotional exploration and goal attainment.

> **Human-AI Collaborative Journaling with POCKET-MIND: A Dual-Prompt Framework for Emotional Exploration and Goal Attainment**
> HaeJi Yang, **JinGyeong Park**, JinKwon Lee, Hayoung Oh
> *International Journal of Human–Computer Interaction*, Vol. 42, No. 14, pp. 11366–11378 (2025)
> DOI: [10.1080/10447318.2025.2593550](https://doi.org/10.1080/10447318.2025.2593550)

This repository is the **software artifact** behind that paper — a research prototype, not a
production product. It is published to document how the study system was actually built. Please
read [Scope and honest limitations](#scope-and-honest-limitations) before judging the code.

---

## What the system does

A user writes a journal entry through a guided conversation with an LLM rather than facing a blank
page. The conversation is turn-limited; once enough context is gathered, the system generates a
diary entry from the exchange and returns a reflective response.

The study compared how the same journal entry is interpreted under different prompting personas:

| Condition | Endpoint | Role |
|---|---|---|
| `standalone` | `/chat/standalone` | Conversational turn-taking partner during writing |
| `counselor` | `/chat/counselor` | Counselor-perspective reading of the finished entry |
| `doctor` | `/chat/doctor` | Clinical-perspective reading of the same entry |
| `pocket` | `/chat/pocket` | The POCKET-MIND dual-prompt condition |

`src/pages/Writing.js` issues the counselor / doctor / POCKET-MIND requests concurrently against a
single diary entry and renders the three responses side by side — this is the comparison surface
used to evaluate the conditions.

---

## Repository layout

```
frontend/          React 18 (Create React App) + Chakra UI + Bootstrap
  src/pages/         Auth, Signup, Home, Writing2, Result, AllDiary, Chart
  src/pages/Writing.js   Four-condition comparison interface (see caveat below)
  src/component/     Chat box, diary view, navigation
  src/api/user.js    Axios client for the backend
  src/firebase-config.js  Firebase init (Auth, Firestore, Messaging/FCM)

backend/           FastAPI (Python 3.12)
  app/main.py            App + CORS setup
  app/routes/user_routes.py   Signup, login, journal create/list
  app/routes/agent_routes.py  Conversation turns, summarization, journal save
```

Data is persisted in Cloud Firestore. Push reminders use Firebase Cloud Messaging.

---

## Scope and honest limitations

This is a snapshot of research code. Several things are worth stating plainly rather than letting a
reader discover them:

**The backend here does not fully serve the frontend.** `user_routes.py` implements the auth and
journal endpoints the app calls (`/signup`, `/login`, `/journals`, `/journals/{user_id}`). The
conversation endpoints the deployed study build called — `/standalone/{userId}` and
`/chat/diary/{userId}` — are **not** present in this snapshot. `agent_routes.py` contains equivalent
conversation logic under different paths (`/start-conversation`, `/continue-conversation`). The two
halves of this repository therefore do not compose into a running system as-is.

**`Writing.js` is superseded and not routed.** `App.js` routes `/writing` to `Writing2.js`, the
simplified deployed interface. `Writing.js` — the richer four-condition comparison view described
above — is retained because it documents the study design, but it is unreachable from the router and
imports `component/Write/UserInput`, which is not part of this snapshot. It will not compile if
re-enabled without that component.

**Deployment targets are dead.** The Heroku hostnames hardcoded in the frontend
(`expressive-journal-*`, `pocket-mind-bot-*`) were the study deployment and are no longer live.

**Security posture is that of a short-lived study instrument, not a product.** Specifically:
`user_routes.py` stores and compares passwords in plaintext (the bcrypt hashing path is present but
commented out), and `main.py` sets `allow_origins=["*"]`. These were acceptable for a closed
participant pool on a temporary deployment and are **not** acceptable patterns to copy. They are
left as-run so the artifact matches what the study used.

**No participant data is included.** Journal entries, survey responses, and any other
human-subjects data collected during the study are not in this repository and will not be added.

---

## Running it

Credentials are supplied via environment variables; nothing sensitive is committed. You will need
your own OpenAI key and your own Firebase project.

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                               # then fill in OPENAI_API_KEY
uvicorn app.main:app --reload
```

Place your Firebase service-account JSON at the path named by `FIREBASE_CREDENTIALS`
(default `app/firebase_key.json`). Generate one at Firebase Console → Project Settings →
Service accounts. It is gitignored.

`openai==0.28.0` is pinned deliberately: the code uses the legacy `openai.ChatCompletion`
interface, which was removed in the 1.x SDK.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env                               # then fill in your Firebase web config
npm start
```

Note that the frontend points at the dead Heroku hosts listed above; to run it end to end you would
need to repoint `src/api/user.js` and the fetch calls in `src/pages/Writing2.js` at a local backend,
and implement the two missing conversation endpoints.

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
