import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, IndianRupee, FileText, CheckCircle2, Percent, Calculator, Sparkles } from 'lucide-react';
import { useLayoutStore } from '../stores/useLayoutStore';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { items, pricingSettings, setPricingSettings } = useLayoutStore();

  const costBreakdown = apiService.calculateCost(items, pricingSettings);

  const handleNext = () => {
    toast.success('Cost calculation locked! Generating quotation...');
    navigate(`/projects/${id || 'proj-1'}/quotation`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pricing & Estimation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated costing engine calculated from parametric room layout and material specifications.
          </p>
        </div>

        <Link
          to={`/projects/${id || 'proj-1'}/design`}
          className="btn-outline flex items-center gap-2 text-xs py-2 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Design</span>
        </Link>
      </div>

      {/* Two Column Layout (Reference Screen 8) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left Card: Cost Breakdown (Reference Screen 8 Left) */}
        <div className="md:col-span-7 card space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Cost Breakdown</h2>
              <p className="text-xs text-slate-400">Itemized expenses & taxes</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-primary border border-indigo-100 flex items-center gap-1">
              <Calculator className="w-3.5 h-3.5" />
              <span>Parametric Calc</span>
            </span>
          </div>

          <div className="space-y-3 text-sm">
            {/* Items Total */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Items Total</span>
              <span className="font-semibold text-slate-900">
                ₹{costBreakdown.itemsTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Material Customization */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Material Customization</span>
              <span className="font-semibold text-slate-900">
                ₹{costBreakdown.materialCustomization.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Labor Charges */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Labor Charges</span>
              <span className="font-semibold text-slate-900">
                ₹{costBreakdown.laborCharges.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Transport */}
            <div className="flex items-center justify-between py-2 border-b border-slate-50">
              <span className="text-slate-600 font-medium">Transport</span>
              <span className="font-semibold text-slate-900">
                ₹{costBreakdown.transport.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Other Charges */}
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Other Charges</span>
              <span className="font-semibold text-slate-900">
                ₹{costBreakdown.otherCharges.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Sub Total (Bold) */}
            <div className="flex items-center justify-between py-2.5 bg-slate-50/80 px-3 rounded-lg font-bold text-slate-900">
              <span>Sub Total</span>
              <span className="text-base">
                ₹{costBreakdown.subTotal.toLocaleString('en-IN')}
              </span>
            </div>

            {/* GST (18%) */}
            <div className="flex items-center justify-between py-2 px-3 text-slate-600 font-medium">
              <span>GST ({costBreakdown.gstPercent}%)</span>
              <span className="font-semibold text-slate-800">
                ₹{costBreakdown.gstAmount.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Total Row (Bold & Highlighted) */}
            <div className="flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-xl font-black text-primary">
              <span className="text-base">Total</span>
              <span className="text-xl">
                ₹{costBreakdown.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Pricing Settings (Reference Screen 8 Right) */}
        <div className="md:col-span-5 card space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Pricing Settings</h2>
            <p className="text-xs text-slate-400">Commercial parameters & margins</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Profit Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={pricingSettings.profitMargin}
                  onChange={(e) => setPricingSettings({ profitMargin: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary pr-8"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={pricingSettings.discount}
                  onChange={(e) => setPricingSettings({ discount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary pr-8"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contingency (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={25}
                  value={pricingSettings.contingency}
                  onChange={(e) => setPricingSettings({ contingency: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary pr-8"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={pricingSettings.applyGst}
                  onChange={(e) => setPricingSettings({ applyGst: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                />
                <span className="text-xs font-bold text-slate-800">Apply GST (18%)</span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-slate-100">
            <button
              onClick={() => navigate(`/projects/${id || 'proj-1'}/design`)}
              className="btn-outline text-xs px-4 py-2.5"
            >
              Back
            </button>
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 text-xs px-6 py-2.5 shadow-md shadow-primary/30"
            >
              <span>Next (Quotation)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
