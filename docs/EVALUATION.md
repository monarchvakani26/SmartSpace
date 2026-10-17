# Layout optimizer evaluation

## Purpose

Provide reproducible FYP evidence that the **greedy AABB layout optimizer** and **layout score** behave measurably on synthetic stress rooms.

## Method

1. Build 12 synthetic rooms with intentional overlaps / boundary overflows (`frontend/src/utils/evaluation.ts`).
2. Measure before: `collisionIds`, `analyzeLayout.score`, walkability %.
3. Run `localOptimize` (same algorithm as FastAPI `/optimize-layout` polish).
4. Measure after; report deltas.

## How to run

- **In app:** navigate to `/evaluation` (Evidence → Evaluation). Results compute live in the browser.
- **Programmatic:** import `runEvaluation()` from `frontend/src/utils/evaluation.ts`.

## Metrics

| Metric | Definition |
|--------|------------|
| Collisions | Count of furniture ids in pairwise AABB overlap (doors/windows excluded) |
| Score | 0–100 from `analyzeLayout` (penalizes collisions, boundary, door clearance, low walkability) |
| Walkable % | Fraction of 1 ft grid samples not inside furniture footprints |

## Limits

- Synthetic rooms, not a client field study.
- Optimizer is greedy multi-pass separation — not global optimal ILP/MILP.
- Do not claim “AI accuracy %” without this (or a larger) table in the report.

## Cite

`layout3d.ts` · `aiService.localOptimize` · `EvaluationPage.tsx`
