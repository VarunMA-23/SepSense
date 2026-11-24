# Sepsense frontend

React + Vite dashboard for the Sepsense prototype.

```bash
npm install
npm run dev
npm run build
npm run lint
```

Set `VITE_API_URL` in a local `.env` file when the backend is not at `http://localhost:8000`.

The UI uses plain CSS tokens, React context for the simulation clock, custom hooks for SSE streams, and D3 for the timeline and charts.
