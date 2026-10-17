import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Percent, Calculator } from 'lucide-react';
import { useLayoutStore } from '../stores/useLayoutStore';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items, pricingSettings, setPricingSettings } = useLayoutStore();

  const costBreakdown = apiService.calculateCost(items, pricingSettings);

  const handleNext = () => {
    toast.success('Cost locked — generating quotation');
    navigate(`/projects/${id || 'proj-1'}/quotation`);
  };

  const rows = [
    { label: 'Items total', value: costBreakdown.itemsTotal },
    { label: 'Material customization', value: costBreakdown.materialCustomization },
    { label: 'Labor', value: costBreakdown.laborCharges },
    { label: 'Transport', value: costBreakdown.transport },
    { label: 'Other', value: costBreakdown.otherCharges },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-space-rise">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Studio</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Pricing</h1>
          <p className="text-sm text-ink-muted mt-2 max-w-md">
            Parametric client-side calc from the live layout (items + material adders + margin/GST).
            Server engine available when backend layout IDs are persisted.
          </p>
        </div>
        <Link to={`/projects/${id || 'proj-1'}/design`} className="btn-outline flex items-center gap-2 text-sm self-start">
          <ArrowLeft className="w-4 h-4" />
          Back to studio
        </Link>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-7 panel-quiet p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-surface-border">
            <h2 className="font-display text-2xl text-ink">Breakdown</h2>
            <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" /> Parametric
            </span>
          </div>

          <div className="space-y-2 text-sm">
            {rows.map((r) => (
              <div key={r.label} className="flex justify-between py-2 border-b border-surface-border/60">
                <span className="text-ink-muted">{r.label}</span>
                <span className="font-semibold text-ink">₹{r.value.toLocaleString('en-IN')}</span>
              </div>
            ))}

            <div className="flex justify-between py-2.5 px-3 bg-plaster/50 font-bold text-ink">
              <span>Subtotal</span>
              <span>₹{costBreakdown.subTotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between py-2 px-3 text-ink-muted">
              <span>GST ({costBreakdown.gstPercent}%)</span>
              <span className="font-semibold text-ink">₹{costBreakdown.gstAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="flex justify-between p-4 bg-primary text-[#F7F6F2] font-bold">
              <span className="font-display text-xl">Total</span>
              <span className="font-display text-2xl">₹{costBreakdown.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 panel-quiet p-6 space-y-5">
          <div className="pb-3 border-b border-surface-border">
            <h2 className="font-display text-2xl text-ink">Commercial</h2>
            <p className="text-xs text-ink-muted mt-0.5">Margin, discount, contingency</p>
          </div>

          {[
            { key: 'profitMargin' as const, label: 'Profit margin (%)', max: 100 },
            { key: 'discount' as const, label: 'Discount (%)', max: 50 },
            { key: 'contingency' as const, label: 'Contingency (%)', max: 25 },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={field.max}
                  value={pricingSettings[field.key]}
                  onChange={(e) => setPricingSettings({ [field.key]: parseFloat(e.target.value) || 0 })}
                  className="input-studio pr-8 font-semibold"
                />
                <Percent className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>
          ))}

          <label className="flex items-center gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              checked={pricingSettings.applyGst}
              onChange={(e) => setPricingSettings({ applyGst: e.target.checked })}
              className="w-4 h-4 border-surface-border text-primary focus:ring-primary/20"
            />
            <span className="text-xs font-bold text-ink">Apply GST (18%)</span>
          </label>

          <div className="flex justify-between pt-6 border-t border-surface-border">
            <button onClick={() => navigate(`/projects/${id || 'proj-1'}/design`)} className="btn-outline text-sm">
              Back
            </button>
            <button onClick={handleNext} className="btn-primary flex items-center gap-2 text-sm">
              Quotation <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
