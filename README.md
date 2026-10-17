# SmartSpace

> **Constraint-based parametric interior studio** with optional firm desk (CRM) and an explainable assist service.  
> Thesis framing: spatial layout analysis + greedy optimization + parametric costing — **not** black-box room reconstruction.

---

## What this is

SmartSpace helps interior designers:

1. Define a room and place furniture on a **scaled 2D plan** (synced **3D** view)
2. See **collisions, door clearance, walkability score**
3. Use **rules / heuristics** to furnish or untangle layouts (methods labeled in UI)
4. Customize materials → **parametric cost** → **quotation PDF**

Photo upload initializes an **approximate editable plan** from a drawn scale reference — it does **not** claim exact 3D reconstruction.

---

## What this is not

- Not BIM / structural CAD  
- Not trained computer vision depth/segmentation (unless you plug models in)  
- Not “just a CRM” — desk pages support the studio; demo from **Your spaces → Design studio**

---

## Stack

| Layer | Tech | Port |
|-------|------|------|
| Frontend | React, Vite, TypeScript, Zustand, R3F/Three | 5173 |
| Backend | Express, Prisma, JWT | 4000 |
| Assist | FastAPI (rules + heuristics + optional cost `.pkl`) | 8000 |
| DB | PostgreSQL (optional; frontend has mock fallback) | 5432 |

---

## Quick start

```bash
# Frontend (UI + local heuristics work alone)
cd frontend && npm install && npm run dev

# Backend (optional persistence)
cd backend && npm install && npx prisma generate && npm run dev

# Assist service (optional)
cd ai-service && pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Login:** `admin@aiinteriorplanner.com` / `admin123` (or mock login if API is down)

---

## Cost model (optional, for FYP honesty)

```bash
cd ai-service
python models/generate_synthetic_costs.py
python models/train_cost_model.py models/approved-project-costs.csv
```

This writes `models/cost_prediction.pkl`. Until that file exists, `/predict-cost` returns an **honest heuristic fallback** and the UI labels the method.

---

## Evaluation (FYP evidence)

Open **Evidence → Evaluation** in the app, or see `docs/EVALUATION.md`.  
In-browser suite runs 12 synthetic rooms through `analyzeLayout` + `localOptimize` and reports collision/score deltas — not mocked charts.

---

## Assist methods (UI badges)

| Action | Method label |
|--------|----------------|
| Furnish | `rules` |
| Suggest layout | `heuristic-optimizer` |
| Cost whisper | `trained model` or `local formula` |
| Photo → plan | `approximate-photo` |

---

## Project layout

```
SmartSpace/
├── frontend/          # Studio UI
├── backend/           # REST + Prisma costing
├── ai-service/        # Explainable assist API
├── docs/EVALUATION.md
└── docker-compose.yml
```

---

## Default credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@aiinteriorplanner.com | admin123 |
| Designer | designer@aiinteriorplanner.com | designer123 |

---

## Academic one-liner

> SmartSpace is a parametric interior studio with constraint-based spatial analysis and costing; assist features are explainable heuristics (and an optional cost regressor), not CV reconstruction.
