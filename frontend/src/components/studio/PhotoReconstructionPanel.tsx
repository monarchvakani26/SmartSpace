import { useState } from 'react';
import { AlertCircle, CheckCircle2, ImageUp, LoaderCircle, X } from 'lucide-react';

interface Props { onClose: () => void; }

const steps = ['Upload photo', 'Set scale', 'Analyze scene', 'Review objects', 'Generate editable scene'];

export function PhotoReconstructionPanel({ onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scale, setScale] = useState('3');
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'error'>('idle');
  const analyze = async () => {
    if (!file) return;
    setStatus('analyzing');
    try {
      const form = new FormData(); form.append('image', file); form.append('reference_width_ft', scale);
      const response = await fetch(`${import.meta.env.VITE_AI_SERVICE_URL || 'http://localhost:8000'}/scene-analysis`, { method: 'POST', body: form });
      if (!response.ok) throw new Error('Analysis unavailable');
      setStatus('ready');
    } catch { setStatus('error'); }
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
    <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
      <div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-bold text-slate-900">Create design from photo</h2><p className="mt-1 text-xs text-slate-500">Creates an approximate, editable scene. A single photo cannot establish exact dimensions.</p></div><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="h-5 w-5" /></button></div>
      <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-5">{steps.map((step, index) => <div key={step} className="flex items-center gap-2 text-[11px] font-medium text-slate-600"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${index === 0 ? 'bg-primary text-white' : 'bg-slate-100'}`}>{index + 1}</span>{step}</div>)}</div>
      <div className="grid gap-5 md:grid-cols-2"><label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center hover:border-primary"><input className="hidden" type="file" accept="image/jpeg,image/png" onChange={e => { const next = e.target.files?.[0] || null; setFile(next); setPreview(next ? URL.createObjectURL(next) : null); setStatus('idle'); }} />{preview ? <img src={preview} className="max-h-48 rounded-lg object-contain" /> : <><ImageUp className="mb-2 h-9 w-9 text-primary" /><span className="text-sm font-semibold text-slate-700">Upload interior photo</span><span className="mt-1 text-xs text-slate-400">JPG, JPEG or PNG</span></>}</label>
      <div className="rounded-xl border border-slate-200 p-4"><label className="text-xs font-bold text-slate-700">Known reference width (ft)</label><p className="mb-2 text-[11px] text-slate-400">For example, measure a door width to establish approximate scale.</p><input type="number" min="0.5" step="0.1" value={scale} onChange={e => setScale(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
      <button disabled={!file || status === 'analyzing'} onClick={analyze} className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">{status === 'analyzing' ? <span className="flex justify-center gap-2"><LoaderCircle className="h-4 w-4 animate-spin" />Analyzing room…</span> : 'Analyze room'}</button>
      {status === 'ready' && <p className="mt-3 flex gap-2 text-xs text-emerald-700"><CheckCircle2 className="h-4 w-4" />Scene analysis complete. Review detected objects before generating the editable scene.</p>}
      {status === 'error' && <p className="mt-3 flex gap-2 text-xs text-amber-700"><AlertCircle className="h-4 w-4" />AI service is unavailable. You can continue with the manual 2D/3D designer.</p>}</div></div>
    </div></div>;
}
