import React, { useMemo } from 'react';
import { runEvaluation } from '../utils/evaluation';

export const EvaluationPage: React.FC = () => {
  const { rows, summary } = useMemo(() => runEvaluation(), []);

  return (
    <div className="space-y-8 animate-space-rise">
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">FYP evidence</p>
        <h1 className="font-display text-4xl text-ink tracking-tight">Layout evaluation</h1>
        <p className="text-sm text-ink-muted mt-2 max-w-2xl">
          Offline benchmark of the greedy constraint optimizer on {summary.rooms} synthetic rooms with
          known overlaps / boundary issues. Method: heuristic AABB separation — not ML.
        </p>
      </header>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 border-y border-surface-border py-6">
        {[
          { label: 'Rooms', value: String(summary.rooms) },
          { label: 'Avg collision Δ', value: summary.avgCollisionReduction.toFixed(2) },
          { label: 'Avg score gain', value: `+${summary.avgScoreGain.toFixed(1)}` },
          {
            label: 'Collision-free after',
            value: `${summary.roomsCollisionFreeAfter}/${summary.rooms}`,
          },
        ].map((m) => (
          <div key={m.label}>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-muted">{m.label}</p>
            <p className="font-display text-3xl text-ink mt-1">{m.value}</p>
          </div>
        ))}
      </div>

      <p className="text-xs text-ink-muted">
        Rooms improved (score↑ or collisions↓): <strong className="text-ink">{summary.roomsImproved}</strong> /{' '}
        {summary.rooms}
      </p>

      <div className="overflow-x-auto border border-surface-border bg-surface-card/60">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr>
              <th className="table-header">Room</th>
              <th className="table-header">Collisions before</th>
              <th className="table-header">After</th>
              <th className="table-header">Score before</th>
              <th className="table-header">After</th>
              <th className="table-header">Walkable % Δ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hover:bg-plaster/40">
                <td className="table-cell font-semibold">{r.name}</td>
                <td className="table-cell">{r.collisionsBefore}</td>
                <td className="table-cell font-semibold text-primary">{r.collisionsAfter}</td>
                <td className="table-cell">{r.scoreBefore}</td>
                <td className="table-cell font-semibold">{r.scoreAfter}</td>
                <td className="table-cell">
                  {(r.walkableAfter - r.walkableBefore).toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="panel-quiet p-5 text-xs text-ink-muted space-y-2 max-w-2xl">
        <p className="font-bold text-ink uppercase tracking-[0.12em] text-[11px]">How to cite</p>
        <p>
          Metric definitions live in <code className="text-ink">layout3d.analyzeLayout</code> and{' '}
          <code className="text-ink">aiService.localOptimize</code>. Re-run anytime from this page —
          results are computed in-browser, not mocked.
        </p>
      </div>
    </div>
  );
};
