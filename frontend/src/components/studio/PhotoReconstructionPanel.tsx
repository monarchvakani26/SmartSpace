import { useRef, useState } from 'react';
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

const steps = ['Upload', 'Draw scale', 'Analyze', 'Review', 'Place'];

export function PhotoReconstructionPanel({ onClose, catalog, roomType, onImport }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [knownLengthFt, setKnownLengthFt] = useState('3');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState<SceneAnalysisResult | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number } | null>(null);
  const [drawing, setDrawing] = useState(false);
  const imgBoxRef = useRef<HTMLDivElement>(null);

  const pixelLength = line
    ? Math.hypot(line.x2 - line.x1, line.y2 - line.y1)
    : 0;

  const scaleFt =
    pixelLength > 8
      ? parseFloat(knownLengthFt) || 3
      : parseFloat(knownLengthFt) || 3;

  const methodBadge = result?.source === 'ai' ? 'approximate-photo · API' : 'approximate-photo · local';

  const onPointer = (e: React.PointerEvent, end: boolean) => {
    if (!imgBoxRef.current || !preview) return;
    const rect = imgBoxRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (!drawing && !end) {
      setDrawing(true);
      setLine({ x1: x, y1: y, x2: x, y2: y });
      return;
    }
    if (drawing && line) {
      setLine({ ...line, x2: x, y2: y });
      if (end) setDrawing(false);
    }
  };

  const analyze = async () => {
    if (!file) return;
    setStatus('analyzing');
    try {
      const analysis = await aiService.analyzeScene(file, scaleFt, roomType || 'BEDROOM');
      setResult(analysis);
      setMessage(
        `${analysis.message} Scale: ${knownLengthFt} ft across ${pixelLength > 8 ? 'drawn segment' : 'default reference'}.`
      );
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
          customizations: { materialName: 'From photo (approximate)' },
        };
      });

  const handlePlace = () => {
    if (!preview || !result) return;
    onImport({
      backdropUrl: preview,
      lengthFt: result.room_length_ft,
      widthFt: result.room_width_ft,
      items: toLayoutItems(result.detected_objects),
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
              Draw a known length on the photo (e.g. door width), then place approximate editable footprints.
              Not exact 3D reconstruction.
            </p>
            {result && (
              <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-[0.12em] text-brass border border-brass/40 px-2 py-0.5">
                {methodBadge}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 text-ink-muted hover:text-ink">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="my-4 flex flex-wrap gap-3">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2 text-[11px] font-medium text-ink-muted">
              <span
                className={`flex h-6 w-6 items-center justify-center text-[10px] font-bold ${
                  index <= (status === 'ready' ? 4 : line ? 2 : file ? 1 : 0)
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
          <div>
            <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center border border-dashed border-surface-border bg-plaster/40 p-3 text-center hover:border-primary">
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
                  setLine(null);
                }}
              />
              {!preview && (
                <>
                  <ImageUp className="mb-2 h-9 w-9 text-primary" />
                  <span className="text-sm font-semibold text-ink">Upload interior photo</span>
                </>
              )}
            </label>

            {preview && (
              <div
                ref={imgBoxRef}
                className="relative mt-2 border border-surface-border select-none touch-none cursor-crosshair"
                onPointerDown={(e) => onPointer(e, false)}
                onPointerMove={(e) => drawing && onPointer(e, false)}
                onPointerUp={(e) => onPointer(e, true)}
                onPointerLeave={() => setDrawing(false)}
              >
                <img src={preview} className="w-full max-h-56 object-contain bg-plaster/30 pointer-events-none" alt="Room" />
                {line && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <line
                      x1={`${line.x1}%`}
                      y1={`${line.y1}%`}
                      x2={`${line.x2}%`}
                      y2={`${line.y2}%`}
                      stroke="#2C4A3E"
                      strokeWidth="3"
                    />
                    <circle cx={`${line.x1}%`} cy={`${line.y1}%`} r="4" fill="#A67C52" />
                    <circle cx={`${line.x2}%`} cy={`${line.y2}%`} r="4" fill="#A67C52" />
                  </svg>
                )}
                <p className="absolute bottom-1 left-1 right-1 text-[10px] bg-ink/70 text-[#F7F6F2] px-2 py-1">
                  Drag on photo to mark a known length (door / wall segment)
                </p>
              </div>
            )}
          </div>

          <div className="border border-surface-border p-4 space-y-3">
            <div>
              <label className="text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em]">
                That segment equals (ft)
              </label>
              <input
                type="number"
                min="0.5"
                step="0.1"
                value={knownLengthFt}
                onChange={(e) => setKnownLengthFt(e.target.value)}
                className="input-studio mt-1"
              />
              <p className="mt-1 text-[11px] text-ink-muted">
                {pixelLength > 8
                  ? `Segment drawn (${pixelLength.toFixed(0)} px span) → ${knownLengthFt} ft`
                  : 'Draw a line on the photo, or use default door ≈ 3 ft'}
              </p>
            </div>

            <button
              disabled={!file || status === 'analyzing'}
              onClick={analyze}
              className="w-full btn-primary text-xs disabled:opacity-50"
            >
              {status === 'analyzing' ? (
                <span className="flex justify-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Analyzing…
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
                  Room ≈ {result.room_length_ft} × {result.room_width_ft} ft
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
                  className={`flex items-start gap-3 p-3 border cursor-pointer ${
                    selected[o.id] !== false ? 'border-primary/40 bg-primary-50/50' : 'border-surface-border'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected[o.id] !== false}
                    onChange={(e) => setSelected((s) => ({ ...s, [o.id]: e.target.checked }))}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-semibold text-ink">{o.name}</p>
                    <p className="text-[11px] text-ink-muted">
                      {o.widthFt}×{o.heightFt} ft · approximate
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
