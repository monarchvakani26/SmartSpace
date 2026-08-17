import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Check, 
  Save, 
  Sliders, 
  Sparkles,
  Layers,
  Box
} from 'lucide-react';
import { useLayoutStore } from '../stores/useLayoutStore';
import toast from 'react-hot-toast';

export const CustomizeItemPage: React.FC = () => {
  const navigate = useNavigate();
  const { id, itemId } = useParams<{ id: string; itemId: string }>();
  const { items, updateItem } = useLayoutStore();

  const currentItem = items.find((i) => i.id === itemId) || items[0];

  // Customization Form State (Matching Reference Screen 7)
  const [material, setMaterial] = useState(currentItem?.customizations?.materialName || 'Plywood 18mm');
  const [finish, setFinish] = useState(currentItem?.customizations?.finishName || 'Sunmica - Dark Walnut');
  const [selectedColor, setSelectedColor] = useState(currentItem?.customizations?.colorHex || '#5C4033');
  const [handleType, setHandleType] = useState(currentItem?.customizations?.hardwareName || 'Steel Handle');
  const [internalSetup, setInternalSetup] = useState(currentItem?.customizations?.internalSetup || '2 Doors + 4 Shelves + 2 Drawers');
  const [softClose, setSoftClose] = useState(currentItem?.customizations?.softClose ?? true);

  // Color Swatches
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
          colorName: colorOptions.find(c => c.hex === selectedColor)?.name || 'Custom',
          hardwareName: handleType,
          internalSetup,
          softClose,
        }
      });
      toast.success('Customization specs saved');
    }
    navigate(`/projects/${id || 'proj-1'}/design`);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(`/projects/${id || 'proj-1'}/design`)}
          className="btn-outline flex items-center gap-2 text-xs py-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Item Customizer</span>
          <button
            onClick={handleSave}
            className="btn-primary flex items-center gap-2 text-xs py-2 shadow-md shadow-primary/25"
          >
            <Save className="w-4 h-4" />
            <span>Apply Changes</span>
          </button>
        </div>
      </div>

      {/* Screen 7 3-Column Layout: Mini Left Sidebar + Center Visualizer + Right Config Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch min-h-[580px]">
        
        {/* Left Dark Sidebar: Active Item Header (Reference Screen 7 Left) */}
        <div className="lg:col-span-2 bg-sidebar rounded-2xl p-4 text-white flex flex-col justify-between shadow-sidebar">
          <div>
            <div className="flex items-center gap-2 text-primary-300 mb-6 pb-3 border-b border-slate-800">
              <Sliders className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Customization</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-primary/20 border border-primary/40 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-primary-300 tracking-wider">Target Item</span>
                <h3 className="text-sm font-bold text-white mt-0.5">{currentItem?.name || 'Wardrobe'}</h3>
                <p className="text-[11px] text-slate-400 mt-1">{currentItem?.widthFt}' × {currentItem?.heightFt}' Footprint</p>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Live Cost Adder</span>
                <p className="text-sm font-black text-emerald-400">+₹8,500</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            Precision joinery and hardware specs will be synced into the quotation PDF.
          </div>
        </div>

        {/* Center: Large 3D / Render Product Preview (Reference Screen 7 Center) */}
        <div className="lg:col-span-6 card !p-0 bg-slate-100/80 rounded-2xl flex flex-col items-center justify-between relative overflow-hidden">
          
          {/* Top Floating Mini Toolbar */}
          <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-white/90 backdrop-blur p-1 rounded-xl shadow-sm border border-slate-200">
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
              <RotateCw className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600">
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Render Preview Visual */}
          <div className="flex-1 w-full flex items-center justify-center p-8">
            <div className="relative w-64 h-80 rounded-2xl shadow-2xl transition-all duration-300 flex items-center justify-center border-4 border-slate-800/20"
                 style={{ backgroundColor: selectedColor }}>
              
              {/* Simulated Furniture Render Detail */}
              <div className="w-full h-full p-4 flex flex-col justify-between relative overflow-hidden rounded-xl">
                {/* Wood Grain Overlay */}
                <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(0deg,#000,#000_10px,transparent_10px,transparent_20px)]" />

                {/* Door Panels Split */}
                <div className="absolute inset-y-2 left-1/2 w-0.5 bg-slate-900/60 -translate-x-1/2" />
                
                {/* Handles Simulation */}
                <div className="absolute left-[45%] top-1/2 -translate-y-1/2 w-2 h-10 bg-slate-300 rounded shadow-md" />
                <div className="absolute right-[45%] top-1/2 -translate-y-1/2 w-2 h-10 bg-slate-300 rounded shadow-md" />

                <div className="relative z-10 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-md text-white text-[10px] font-bold self-start">
                  {finish}
                </div>

                <div className="relative z-10 bg-white/90 px-2.5 py-1 rounded-md text-slate-900 text-[10px] font-bold self-end shadow-sm">
                  {material}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Preview Badge */}
          <div className="w-full p-3 bg-white/80 border-t border-slate-200 text-center text-xs font-semibold text-slate-600">
            Interactive Material & Finish Preview • 360° Raytraced Mesh
          </div>
        </div>

        {/* Right Panel: Customization Form (Reference Screen 7 Right) */}
        <div className="lg:col-span-4 card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Material */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Material
              </label>
              <select
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Plywood 18mm">Plywood 18mm (Commercial Grade)</option>
                <option value="Plywood 12mm">Plywood 12mm</option>
                <option value="Blockboard">Blockboard (Moisture Resistant)</option>
                <option value="MDF 18mm">MDF 18mm High Density</option>
                <option value="Solid Teak">Solid Teak Wood</option>
              </select>
            </div>

            {/* Finish / Laminate */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Finish / Laminate
              </label>
              <select
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Sunmica - Dark Walnut">Sunmica - Dark Walnut</option>
                <option value="Sunmica - White Matte">Sunmica - White Matte</option>
                <option value="Sunmica - Natural Oak">Sunmica - Natural Oak</option>
                <option value="Acrylic High Gloss">Acrylic High Gloss</option>
                <option value="PU Matte Polyurethane">PU Matte Polyurethane</option>
              </select>
            </div>

            {/* Color Swatches */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Color Swatches
              </label>
              <div className="flex items-center gap-2.5 flex-wrap">
                {colorOptions.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.name}
                    className={`w-7 h-7 rounded-full transition-all shadow-sm flex items-center justify-center ${
                      selectedColor === c.hex
                        ? 'ring-2 ring-primary ring-offset-2 scale-110'
                        : 'hover:scale-105 border border-slate-300'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {selectedColor === c.hex && (
                      <Check className={`w-3.5 h-3.5 ${c.hex === '#FDFBF7' ? 'text-slate-900' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Handles */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Handles & Hardware
              </label>
              <select
                value={handleType}
                onChange={(e) => setHandleType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="Steel Handle">Brushed Steel Handle</option>
                <option value="Gold Brass Handle">Gold Brass Concealed Handle</option>
                <option value="Black Matte Handle">Black Matte Handle</option>
                <option value="Push-to-Open (No Handles)">Push-to-Open (No Handles)</option>
              </select>
            </div>

            {/* Internal Setup */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Internal Setup
              </label>
              <select
                value={internalSetup}
                onChange={(e) => setInternalSetup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="2 Doors + 4 Shelves + 2 Drawers">2 Doors + 4 Shelves + 2 Drawers</option>
                <option value="Full Hanging Rod + Top Shelf">Full Hanging Rod + Top Shelf</option>
                <option value="Modular Storage + Organizer">Modular Storage + Organizer</option>
              </select>
            </div>

            {/* Soft Close Toggle Switch */}
            <div className="flex items-center justify-between pt-2 pb-1">
              <div>
                <span className="text-xs font-bold text-slate-800">Soft Close Hinges</span>
                <p className="text-[11px] text-slate-400">Hydraulic silent dampening hinges</p>
              </div>
              <button
                type="button"
                onClick={() => setSoftClose(!softClose)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                  softClose ? 'bg-primary' : 'bg-slate-300'
                }`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  softClose ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </button>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleSave}
              className="w-full py-3 bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Save & Return to Studio</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
