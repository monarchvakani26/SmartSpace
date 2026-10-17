import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, RotateCw, ZoomIn, ZoomOut, Check, Save, Sliders } from 'lucide-react';
import { useLayoutStore } from '../stores/useLayoutStore';
import toast from 'react-hot-toast';

export const CustomizeItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const { items, updateItem } = useLayoutStore();

  const currentItem = items.find((i) => i.id === itemId) || items[0];

  const [material, setMaterial] = useState(currentItem?.customizations?.materialName || 'Plywood 18mm');
  const [finish, setFinish] = useState(currentItem?.customizations?.finishName || 'Sunmica - Dark Walnut');
  const [selectedColor, setSelectedColor] = useState(currentItem?.customizations?.colorHex || '#5C4033');
  const [handleType, setHandleType] = useState(currentItem?.customizations?.hardwareName || 'Steel Handle');
  const [internalSetup, setInternalSetup] = useState(currentItem?.customizations?.internalSetup || '2 Doors + 4 Shelves + 2 Drawers');
  const [softClose, setSoftClose] = useState(currentItem?.customizations?.softClose ?? true);

  const colorOptions = [
    { name: 'Dark Walnut', hex: '#5C4033' },
    { name: 'Warm Teak', hex: '#8B6914' },
    { name: 'Ivory White', hex: '#FDFBF7' },
    { name: 'Slate Charcoal', hex: '#36454F' },
    { name: 'Navy Blue', hex: '#1E293B' },
    { name: 'Muted Forest', hex: '#2D4F3B' },
  ];

  const handleSave = () => {
    if (currentItem) {
      updateItem(currentItem.id, {
        customizations: {
          materialName: material,
          materialPricePerSqFt: 85,
          finishName: finish,
          colorHex: selectedColor,
          colorName: colorOptions.find((c) => c.hex === selectedColor)?.name || 'Custom',
          hardwareName: handleType,
          internalSetup,
          softClose,
        },
      });
      toast.success('Specs saved');
    }
    navigate(`/projects/${id || 'proj-1'}/design`);
  };

  return (
    <div className="space-y-4 animate-space-fade">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => navigate(`/projects/${id || 'proj-1'}/design`)}
          className="btn-outline flex items-center gap-2 text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Studio
        </button>
        <button onClick={handleSave} className="btn-primary flex items-center gap-2 text-xs">
          <Save className="w-4 h-4" />
          Apply
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch min-h-[580px]">
        <div className="lg:col-span-2 bg-sidebar p-4 text-[#F7F6F2] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-brass-soft mb-6 pb-3 border-b border-sidebar-border">
              <Sliders className="w-4 h-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]">Customize</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 border border-primary/40 bg-primary/20">
                <span className="text-[10px] uppercase font-bold text-brass-soft tracking-[0.12em]">Piece</span>
                <h3 className="font-display text-lg text-[#F7F6F2] mt-0.5">{currentItem?.name || 'Wardrobe'}</h3>
                <p className="text-[11px] text-[#A8A498] mt-1">
                  {currentItem?.widthFt}' × {currentItem?.heightFt}'
                </p>
              </div>
              <div className="p-3 border border-sidebar-border text-xs">
                <span className="text-[10px] text-[#7A756C] uppercase font-semibold">Est. adder</span>
                <p className="font-display text-xl text-brass-soft mt-0.5">+₹8,500</p>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-[#7A756C] leading-relaxed">
            Joinery and hardware sync into the quotation.
          </p>
        </div>

        <div className="lg:col-span-6 bg-plaster/50 border border-surface-border flex flex-col relative overflow-hidden min-h-[420px]">
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1 bg-surface-card/95 p-1 border border-surface-border">
            <button className="p-1.5 text-ink-muted hover:text-ink"><RotateCw className="w-4 h-4" /></button>
            <button className="p-1.5 text-ink-muted hover:text-ink"><ZoomIn className="w-4 h-4" /></button>
            <button className="p-1.5 text-ink-muted hover:text-ink"><ZoomOut className="w-4 h-4" /></button>
          </div>

          <div className="flex-1 w-full flex items-center justify-center p-8">
            <div
              className="relative w-64 h-80 shadow-card-hover border-[3px] border-ink/20 flex items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: selectedColor }}
            >
              <div className="w-full h-full p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,#000,#000_10px,transparent_10px,transparent_20px)]" />
                <div className="absolute inset-y-2 left-1/2 w-0.5 bg-ink/50 -translate-x-1/2" />
                <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-2 h-10 bg-[#D4D0C8] shadow-sm" />
                <div className="absolute right-[45%] top-1/2 -translate-y-1/2 w-2 h-10 bg-[#D4D0C8] shadow-sm" />
                <div className="relative z-10 bg-ink/50 px-2.5 py-1 text-[#F7F6F2] text-[10px] font-bold self-start">
                  {finish}
                </div>
                <div className="relative z-10 bg-surface-card/95 px-2.5 py-1 text-ink text-[10px] font-bold self-end border border-surface-border">
                  {material}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full p-3 border-t border-surface-border text-center text-xs font-semibold text-ink-muted bg-surface-card/70">
            Material preview · live swatch
          </div>
        </div>

        <div className="lg:col-span-4 panel-quiet p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">Material</label>
              <select value={material} onChange={(e) => setMaterial(e.target.value)} className="input-studio text-xs">
                <option value="Plywood 18mm">Plywood 18mm</option>
                <option value="Plywood 12mm">Plywood 12mm</option>
                <option value="Blockboard">Blockboard</option>
                <option value="MDF 18mm">MDF 18mm</option>
                <option value="Solid Teak">Solid Teak</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">Finish</label>
              <select value={finish} onChange={(e) => setFinish(e.target.value)} className="input-studio text-xs">
                <option value="Sunmica - Dark Walnut">Sunmica - Dark Walnut</option>
                <option value="Sunmica - White Matte">Sunmica - White Matte</option>
                <option value="Sunmica - Natural Oak">Sunmica - Natural Oak</option>
                <option value="Acrylic High Gloss">Acrylic High Gloss</option>
                <option value="PU Matte Polyurethane">PU Matte</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-2">Color</label>
              <div className="flex items-center gap-2 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.name}
                    className={`w-7 h-7 transition-all flex items-center justify-center ${
                      selectedColor === c.hex ? 'ring-2 ring-primary ring-offset-2 ring-offset-plaster scale-105' : 'border border-surface-border'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.hex && (
                      <Check className={`w-3.5 h-3.5 ${c.hex === '#FDFBF7' ? 'text-ink' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">Hardware</label>
              <select value={handleType} onChange={(e) => setHandleType(e.target.value)} className="input-studio text-xs">
                <option value="Steel Handle">Brushed Steel</option>
                <option value="Gold Brass Handle">Brass Concealed</option>
                <option value="Black Matte Handle">Black Matte</option>
                <option value="Push-to-Open (No Handles)">Push-to-Open</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1.5">Internal</label>
              <select value={internalSetup} onChange={(e) => setInternalSetup(e.target.value)} className="input-studio text-xs">
                <option value="2 Doors + 4 Shelves + 2 Drawers">2 Doors + 4 Shelves + 2 Drawers</option>
                <option value="Full Hanging Rod + Top Shelf">Full Hanging Rod + Top Shelf</option>
                <option value="Modular Storage + Organizer">Modular Storage + Organizer</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-bold text-ink">Soft close</span>
                <p className="text-[11px] text-ink-muted">Hydraulic dampers</p>
              </div>
              <button
                type="button"
                onClick={() => setSoftClose(!softClose)}
                className={`w-11 h-6 flex items-center p-1 transition-colors ${softClose ? 'bg-primary' : 'bg-surface-border'}`}
              >
                <div className={`bg-surface-card w-4 h-4 shadow-sm transform transition-transform ${softClose ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          <button onClick={handleSave} className="w-full btn-primary !py-3 text-xs flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Save & return
          </button>
        </div>
      </div>
    </div>
  );
};
