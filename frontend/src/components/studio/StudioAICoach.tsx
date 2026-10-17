import React, { useEffect, useState } from 'react';
import { LoaderCircle, Sparkles, Wand2, LayoutGrid, MessageCircle } from 'lucide-react';
import { FurnitureCatalogItem, LayoutItem } from '../../types';
import { DesignAnalysis } from '../../utils/layout3d';
import { aiService, placeSuggestionsInRoom } from '../../services/aiService';
import toast from 'react-hot-toast';

interface CoachMessage {
  id: string;
  role: 'ai' | 'you';
  text: string;
}

interface Props {
  roomType: string;
  lengthFt: number;
  widthFt: number;
  heightFt: number;
  items: LayoutItem[];
  catalog: FurnitureCatalogItem[];
  analysis: DesignAnalysis;
  onReplaceItems: (items: LayoutItem[], animate?: boolean) => void;
  onSetPositions: (items: LayoutItem[], animate?: boolean) => void;
  onApplySuggestion: () => void;
  predictedCost: number | null;
  costRange: { min: number; max: number } | null;
  costSource: 'ai' | 'local' | null;
}

export const StudioAICoach: React.FC<Props> = ({
  roomType,
  lengthFt,
  widthFt,
  heightFt,
  items,
  catalog,
  analysis,
  onReplaceItems,
  onSetPositions,
  onApplySuggestion,
  predictedCost,
  costRange,
  costSource,
}) => {
  const [busy, setBusy] = useState<'furnish' | 'optimize' | null>(null);
  const [style, setStyle] = useState('MODERN');
  const [budget, setBudget] = useState('MEDIUM');
  const [messages, setMessages] = useState<CoachMessage[]>([
    {
      id: 'welcome',
      role: 'ai',
      text: 'I can furnish this room, untangle overlaps, or fix the issue highlighted in layout check.',
    },
  ]);

  useEffect(() => {
    if (!analysis.recommendation) return;
    const tip =
      analysis.collisionPairs.length || analysis.doorObstructions.length || analysis.boundaryItemIds.length
        ? analysis.recommendation
        : `Score ${analysis.score}/100 — ${analysis.recommendation}`;
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.text === tip) return prev;
      return [...prev.slice(-5), { id: `tip-${Date.now()}`, role: 'ai', text: tip }];
    });
  }, [analysis.recommendation, analysis.score, analysis.collisionPairs.length, analysis.doorObstructions.length, analysis.boundaryItemIds.length]);

  const push = (role: 'ai' | 'you', text: string) =>
    setMessages((prev) => [...prev.slice(-8), { id: `${role}-${Date.now()}`, role, text }]);

  const handleFurnish = async () => {
    setBusy('furnish');
    push('you', `Furnish as ${style.toLowerCase()} · ${budget.toLowerCase()} budget`);
    try {
      const result = await aiService.recommend({
        room_type: roomType || 'BEDROOM',
        style_preference: style,
        budget_tier: budget,
        room_area_sqft: lengthFt * widthFt,
      });
      const drafts = placeSuggestionsInRoom(result.suggested_items, catalog, lengthFt, widthFt);
      const withIds: LayoutItem[] = drafts.map((d, i) => ({
        ...d,
        id: `ai-${Date.now()}-${i}`,
      }));

      // Staggered replace for motion feel
      onReplaceItems([], false);
      await new Promise((r) => setTimeout(r, 80));
      onReplaceItems(withIds, true);
      setTimeout(() => onReplaceItems(withIds, false), 700);

      push(
        'ai',
        `Placed ${withIds.length} pieces (${result.source === 'ai' ? 'AI' : 'studio'} rules, ${(result.confidence_score * 100).toFixed(0)}% confidence). Drag to refine.`
      );
      toast.success('Room furnished');
    } catch {
      toast.error('Could not furnish room');
      push('ai', 'Furnish failed — try again or place pieces manually.');
    } finally {
      setBusy(null);
    }
  };

  const handleOptimize = async () => {
    if (!items.length) {
      toast.error('Add furniture first');
      return;
    }
    setBusy('optimize');
    push('you', 'Optimize this layout');
    try {
      const result = await aiService.optimize({
        room_length_ft: lengthFt,
        room_width_ft: widthFt,
        items,
      });
      onSetPositions(result.optimized_layout, true);
      setTimeout(() => onSetPositions(result.optimized_layout, false), 650);
      const n = result.issues_found.length;
      push(
        'ai',
        n
          ? `Resolved ${n} issue${n > 1 ? 's' : ''} (${result.source}). Watch the pieces settle.`
          : `Layout already clean (${result.source}).`
      );
      toast.success(n ? 'Layout optimized' : 'No conflicts found');
    } catch {
      toast.error('Optimize failed');
    } finally {
      setBusy(null);
    }
  };

  const hasFix =
    analysis.collisionPairs.length > 0 ||
    analysis.doorObstructions.length > 0 ||
    analysis.boundaryItemIds.length > 0;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-4 h-4 text-primary" />
        <h3 className="font-display text-lg text-ink">AI coach</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-2 mb-3 pr-0.5">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`text-xs leading-relaxed px-2.5 py-2 ${
              m.role === 'ai'
                ? 'bg-primary-50/80 text-ink border border-primary/15'
                : 'bg-plaster/70 text-ink-muted border border-surface-border ml-4'
            }`}
          >
            {m.role === 'ai' && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-primary mb-1">
                <Sparkles className="w-3 h-3" /> Coach
              </span>
            )}
            <p>{m.text}</p>
          </div>
        ))}
      </div>

      {(predictedCost != null || costRange) && (
        <div className="mb-3 p-2.5 border border-brass/30 bg-brass-soft/30 text-xs">
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brass mb-0.5">
            Cost whisper {costSource === 'ai' ? '· model' : '· estimate'}
          </p>
          <p className="font-display text-xl text-ink">
            ₹{(predictedCost || 0).toLocaleString('en-IN')}
          </p>
          {costRange && (
            <p className="text-[11px] text-ink-muted mt-0.5">
              Range ₹{costRange.min.toLocaleString('en-IN')} – ₹{costRange.max.toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 mb-2">
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="input-studio !py-1.5 text-[11px]"
        >
          <option value="MODERN">Modern</option>
          <option value="MINIMALIST">Minimalist</option>
          <option value="CLASSIC">Classic</option>
          <option value="BOHO">Boho</option>
        </select>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="input-studio !py-1.5 text-[11px]"
        >
          <option value="ECONOMY">Economy</option>
          <option value="MEDIUM">Medium</option>
          <option value="LUXURY">Luxury</option>
        </select>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          disabled={busy !== null || catalog.length === 0}
          onClick={handleFurnish}
          className="w-full btn-primary !py-2 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy === 'furnish' ? (
            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wand2 className="w-3.5 h-3.5" />
          )}
          Furnish this room
        </button>

        <button
          type="button"
          disabled={busy !== null}
          onClick={handleOptimize}
          className="w-full btn-outline !py-2 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy === 'optimize' ? (
            <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LayoutGrid className="w-3.5 h-3.5" />
          )}
          Suggest layout
        </button>

        {hasFix && (
          <button
            type="button"
            onClick={() => {
              onApplySuggestion();
              push('you', 'Apply suggested fix');
              push('ai', 'Applied the highlighted placement fix.');
            }}
            className="w-full px-3 py-2 text-xs font-semibold border border-brass/40 text-brass hover:bg-brass-soft/40 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Apply suggested fix
          </button>
        )}
      </div>

      <p className="mt-2 text-[10px] text-ink-muted leading-relaxed">
        Room {lengthFt}×{widthFt}×{heightFt} ft · {items.length} pieces
      </p>
    </div>
  );
};
