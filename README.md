# Sepsense

Sepsense is a lightweight real-time sepsis monitoring prototype. It replays MIMIC-IV style clinical events, scores sepsis risk as data arrives, and presents an interactive patient timeline in React.

This is a local prototype intended for a very small group of users. It has no Docker or cloud deployment configuration.

## What it does

- **Streaming pipeline:** Admissions, labs, ICU stays and vitals are replayed from SQLite into Kafka topics.
- **Real-time inference:** An XGBoost classifier uses 23 clinical features, with IterativeImputer for missing values and SOFA-based features.
- **Clinical recommendations:** Optional RAG over Surviving Sepsis Campaign PDFs using MongoDB Atlas and Gemini.
- **Live dashboard:** FastAPI Server-Sent Events feed a React dashboard with timeline, risk history, labs, vitals and simulation controls.

## Architecture

| Directory | Purpose |
| --- | --- |
| `producer_service/` | FastAPI service on port 9001 that owns the simulation clock and producer thread |
| `backend/` | FastAPI service on port 8000 that consumes Kafka and exposes REST + SSE endpoints |
| `coordinator/` | Simulation clock used by the producer |
| `producers/` | SQLite-to-Kafka event producers |
| `ml/` | Feature engineering, training scripts and streaming inference module |
| `rag/` | PDF ingestion, embeddings and recommendation generation |
| `frontend/` | React + Vite dashboard |
| `_data/` | Local database and credentials (not committed) |

## Prerequisites

- Python 3.11+
- Node.js 18+
- `uv` for Python dependencies
- A Kafka cluster with credentials (Confluent Cloud works)
- `mimic_demo.db` from MIMIC-IV demo data
- Optional: MongoDB Atlas and a Gemini API key for RAG recommendations

## Local setup

1. Install Python dependencies:

```bash
uv sync
source .venv/bin/activate
```

2. Add your local files to `_data/`:

```text
_data/
  mimic_demo.db       # MIMIC-IV demo SQLite database
  kafka_config.json   # Kafka credentials
  rag_config.json     # optional, enables RAG recommendations
```

`kafka_config.json` shape:

```json
{
  "bootstrap_servers": "host:port",
  "sasl_username": "...",
  "sasl_password": "...",
  "sasl_mechanism": "PLAIN",
  "security_protocol": "SASL_SSL"
}
```

`rag_config.json` shape:

```json
{
  "mongodb_connection_string": "cluster0.xxxxx.mongodb.net",
  "mongodb_username": "...",
  "mongodb_password": "...",
  "mongodb_database": "sepsis_guidelines",
  "mongodb_collection": "guideline_chunks",
  "gemini_api_key": "...",
  "rag_enabled": true,
  "rag_probability_threshold": 0.5
}
```

Environment variables override the JSON files with the `SEPSENSE_` prefix, for example `SEPSENSE_KAFKA_BOOTSTRAP_SERVERS` and `SEPSENSE_GEMINI_API_KEY`.

3. Train the model if the artifacts are not present:

```bash
python -m ml.training.train_local
```

This writes `sepsis_model.pkl`, `imputer.pkl`, `label_encoder.pkl` and `feature_names.json` to `ml/models/local/`.

4. Ingest the guideline PDFs if you configured RAG:

```bash
python -m rag.ingest_guidelines
```

## Run locally

Start the backend and producer in separate terminals:

```bash
uvicorn backend.api.main:app --reload --port 8000
```

```bash
uvicorn producer_service.main:app --reload --port 9001
```

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Set `VITE_API_URL` in `frontend/.env` if your backend is not at `http://localhost:8000`.

To preview with preloaded sample patients instead of the live stream, set `VITE_DEMO_MODE=true` in `frontend/.env` and restart Vite. Set it to `false` when connecting the real backend.

## Run a simulation

Use the dashboard's **Controls** panel, or call the producer service directly:

```bash
curl -X POST http://localhost:9001/start \
  -H "Content-Type: application/json" \
  -d '{
    "subject_ids": [10000032, 10000980],
    "start_time": "2110-01-01 00:00:00",
    "tick_minutes": 15,
    "tick_interval": 2
  }'
```

Stop it with `POST http://localhost:9001/stop`.

## Frontend notes

The UI is built with React and Vite. D3 powers the timeline and charts. Styling is plain CSS with a small token file, no UI framework, no animation library and no external font downloads. It supports light and dark themes via a local toggle.

## Model details

The classifier uses 23 features: demographics, comorbidities, vital signs, selected labs, SOFA score components and mechanical ventilation. Alerts are grouped into `LOW`, `MEDIUM`, `HIGH` and `CRITICAL` risk levels. Predictions are throttled to reduce alert fatigue, with exceptions for critical events.

## Data notice

MIMIC-IV data requires credentialed access. Keep `_data/` private and never commit database files, credentials or API keys.
