import { useState } from 'react';
import { AlertCircle, CheckCircle2, ImageUp, LoaderCircle, X, ArrowRight } from 'lucide-react';
import { FurnitureCatalogItem, LayoutItem } from '../../types';
import { aiService, matchCatalogItem, SceneAnalysisResult, SceneObject } from '../../services/aiService';

interface Props {
  onClose: () => void;
  catalog: FurnitureCatalogItem[];
  roomType: string;
  onImport: (payload: {
    backdropUrl: string;
    lengthFt: number;
    widthFt: number;
    items: LayoutItem[];
    message: string;
  }) => void;
}

const steps = ['Upload photo', 'Set scale', 'Analyze', 'Review footprints', 'Place on canvas'];

export function PhotoReconstructionPanel({ onClose, catalog, roomType, onImport }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scale, setScale] = useState('3');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<SceneAnalysisResult | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const analyze = async () => {
    if (!file) return;
    setStatus('analyzing');
    try {
      const analysis = await aiService.analyzeScene(file, parseFloat(scale) || 3, roomType || 'BEDROOM');
      setResult(analysis);
      setMessage(analysis.message);
      const sel: Record<string, boolean> = {};
      analysis.detected_objects.forEach((o) => {
        sel[o.id] = true;
      });
      setSelected(sel);
      setStatus(analysis.detected_objects.length ? 'ready' : 'error');
    } catch {
      setMessage('Could not analyze photo.');
      setStatus('error');
    }
  };

  const toLayoutItems = (objects: SceneObject[]): LayoutItem[] =>
    objects
      .filter((o) => selected[o.id] !== false)
      .map((o, i) => {
        const cat = matchCatalogItem(o.name, catalog);
        return {
          id: `photo-${Date.now()}-${i}`,
          furnitureItemId: cat?.id || `approx-${o.id}`,
          name: cat?.name || o.name,
          category: cat?.categoryName || o.category,
          x: o.x,
          y: o.y,
          rotation: 0,
          widthFt: cat?.defaultWidthFt || o.widthFt,
          heightFt: cat?.defaultHeightFt || o.heightFt,
          verticalHeightFt: cat?.defaultHeightM || o.verticalHeightFt || 2.5,
          customizations: {
            materialName: 'From photo (approximate)',
          },
        };
      });

  const handlePlace = () => {
    if (!preview || !result) return;
    const items = toLayoutItems(result.detected_objects);
    onImport({
      backdropUrl: preview,
      lengthFt: result.room_length_ft,
      widthFt: result.room_width_ft,
      items,
      message: result.message,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-surface-card border border-surface-border p-6 shadow-card-hover animate-space-rise">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-ink">Design from photo</h2>
            <p className="mt-1 text-xs text-ink-muted">
              Photo becomes a backdrop; AI places approximate editable footprints. Refine in the studio.
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-5 flex flex-wrap gap-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
              <span
                className={`flex h-6 w-6 items-center justify-center text-[10px] font-bold ${
                  index <= (status === 'ready' ? 4 : status === 'analyzing' ? 2 : file ? 1 : 0)
                    ? 'bg-primary text-[#F7F6F2]'
                    : 'bg-plaster'
                }`}
              >
                {index + 1}
              </span>
              {step}
            </div>
          ))}
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex min-h-56 cursor-pointer flex-col items-center justify-center border border-dashed border-surface-border bg-plaster/40 p-4 text-center hover:border-primary">
            <input
              className="hidden"
              type="file"
              accept="image/jpeg,image/png"
              onChange={(e) => {
                const next = e.target.files?.[0] || null;
                setFile(next);
                if (preview) URL.revokeObjectURL(preview);
                setPreview(next ? URL.createObjectURL(next) : null);
                setStatus('idle');
                setResult(null);
              }}
            />
            {preview ? (
              <img src={preview} className="max-h-48 object-contain" alt="Upload preview" />
            ) : (
              <>
                <ImageUp className="mb-2 h-9 w-9 text-primary" />
                <span className="text-sm font-semibold text-ink">Upload interior photo</span>
                <span className="mt-1 text-xs text-ink-muted">JPG or PNG</span>
              </>
            )}
          </label>

          <div className="border border-surface-border p-4 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em]">
                Reference width (ft)
              </label>
              <p className="mb-2 text-[11px] text-ink-muted">
                Measure a door or known wall segment in the photo to set scale.
              </p>
              <input
                type="number"
                min="0.5"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                className="input-studio"
              />
            </div>

            <button
              disabled={!file || status === 'analyzing'}
              onClick={analyze}
              className="w-full btn-primary text-xs disabled:opacity-50"
            >
              {status === 'analyzing' ? (
                <span className="flex justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Analyzing room…
                </span>
              ) : (
                'Analyze room'
              )}
            </button>

            {status === 'ready' && (
              <p className="flex gap-2 text-xs text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {message}
              </p>
            )}
            {status === 'error' && (
              <p className="flex gap-2 text-xs text-brass">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {message}
              </p>
            )}
          </div>
        </div>

        {result && result.detected_objects.length > 0 && (
          <div className="mt-5 border-t border-surface-border pt-5">
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <div>
                <h3 className="font-display text-xl text-ink">Suggested footprints</h3>
                <p className="text-[11px] text-ink-muted">
                  Room ≈ {result.room_length_ft} × {result.room_width_ft} ft · toggle what to place
                </p>
              </div>
              <button onClick={handlePlace} className="btn-primary text-xs flex items-center gap-1.5">
                Place on canvas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              {result.detected_objects.map((o) => (
                <label
                  key={o.id}
                  className={`flex items-start gap-3 p-3 border cursor-pointer transition-colors ${
                    selected[o.id] !== false
                      ? 'border-primary/40 bg-primary-50/50'
                      : 'border-surface-border bg-plaster/30'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected[o.id] !== false}
                    onChange={(e) => setSelected((s) => ({ ...s, [o.id]: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{o.name}</p>
                    <p className="text-[11px] text-ink-muted">
                      {o.widthFt}×{o.heightFt} ft · {(o.confidence * 100).toFixed(0)}% · approximate
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
