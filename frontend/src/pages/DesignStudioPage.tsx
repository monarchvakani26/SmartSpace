import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { 
  MousePointer, 
  Move, 
  RotateCw, 
  Trash2, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Layers, 
  Sliders, 
  Sparkles, 
  ArrowRight, 
  Bed, 
  Armchair, 
  Table, 
  Grid, 
  Maximize2, 
  Square, 
  DoorClosed, 
  Flower2, 
  MoreHorizontal,
  ChevronDown,
  Box,
  Eye,
  Settings2
} from 'lucide-react';
import { useLayoutStore } from '../stores/useLayoutStore';
import { apiService } from '../services/api';
import { FurnitureCatalogItem, FurnitureCategory, LayoutItem } from '../types';
import toast from 'react-hot-toast';
import { Scene3D } from '../components/studio/Scene3D';
import { PhotoReconstructionPanel } from '../components/studio/PhotoReconstructionPanel';
import { analyzeLayout, clampAndSnap, collisionIds } from '../utils/layout3d';

export const DesignStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { 
    lengthFt, 
    widthFt, 
    heightFt, 
    items, 
    selectedItemId, 
    activeTool, 
    zoomLevel,
    is3DView,
    addItem, 
    updateItem, 
    removeItem, 
    selectItem, 
    setActiveTool, 
    setZoomLevel,
    toggle3DView,
    undo, 
    redo 
  } = useLayoutStore();

  const [categories, setCategories] = useState<FurnitureCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('cat-all');
  const [catalogItems, setCatalogItems] = useState<FurnitureCatalogItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isPhotoWorkflowOpen, setIsPhotoWorkflowOpen] = useState(false);

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const selectedItem = items.find((i) => i.id === selectedItemId);
  const invalidItemIds = collisionIds(items);
  const analysis = analyzeLayout(items, lengthFt, widthFt);

  const updatePlacement = (itemId: string, updates: Partial<LayoutItem>) => {
    const item = items.find(candidate => candidate.id === itemId);
    if (!item) return;
    const next = { ...item, ...updates };
    const position = clampAndSnap(next, next.x, next.y, lengthFt, widthFt);
    updateItem(itemId, { ...updates, ...position });
  };
  const saveLayout = async () => {
    if (invalidItemIds.size) { toast.error('Resolve furniture collisions before saving'); return; }
    try {
      await apiService.saveRoomLayout(useLayoutStore.getState().roomId, { length: lengthFt, width: widthFt, height: heightFt, items });
      toast.success('Layout saved');
    } catch { toast.error('Could not save layout. Check that this room exists on the server.'); }
  };

  useEffect(() => {
    apiService.getFurnitureCategories().then(setCategories);
    apiService.getFurnitureItems().then(setCatalogItems);
  }, []);

  // Filter items by category
  const filteredCatalog = activeCategory === 'cat-all'
    ? catalogItems
    : catalogItems.filter((i) => i.categoryId === activeCategory);

  // Drag & drop handlers from palette
  const handleDragStart = (e: React.DragEvent, item: FurnitureCatalogItem) => {
    e.dataTransfer.setData('application/json', JSON.stringify(item));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    
    // Calculate feet relative to room canvas
    const pixelX = e.clientX - rect.left;
    const pixelY = e.clientY - rect.top;
    
    // Scale factors (Canvas is centered and fixed aspect ratio)

    try {
      const itemData: FurnitureCatalogItem = JSON.parse(e.dataTransfer.getData('application/json'));
      const dropXFt = (pixelX / rect.width) * lengthFt - itemData.defaultWidthFt / 2;
      const dropYFt = (pixelY / rect.height) * widthFt - itemData.defaultHeightFt / 2;
      const position = clampAndSnap({ furnitureItemId: itemData.id, name: itemData.name, category: itemData.categoryName, x: dropXFt, y: dropYFt, rotation: 0, widthFt: itemData.defaultWidthFt, heightFt: itemData.defaultHeightFt, verticalHeightFt: itemData.defaultHeightM, id: '' }, dropXFt, dropYFt, lengthFt, widthFt);
      const newId = addItem({
        furnitureItemId: itemData.id,
        name: itemData.name,
        category: itemData.categoryName,
        x: position.x,
        y: position.y,
        rotation: 0,
        widthFt: itemData.defaultWidthFt,
        heightFt: itemData.defaultHeightFt,
        verticalHeightFt: itemData.defaultHeightM,
      });
      toast.success(`Added ${itemData.name} to canvas`);
      selectItem(newId);
    } catch {
      // Ignored
    }
  };

  // Add on click fallback
  const handleAddDirect = (itemData: FurnitureCatalogItem) => {
    const newId = addItem({
      furnitureItemId: itemData.id,
      name: itemData.name,
      category: itemData.categoryName,
      x: Math.max(0.5, lengthFt / 2 - itemData.defaultWidthFt / 2),
      y: Math.max(0.5, widthFt / 2 - itemData.defaultHeightFt / 2),
      rotation: 0,
      widthFt: itemData.defaultWidthFt,
      heightFt: itemData.defaultHeightFt,
      verticalHeightFt: itemData.defaultHeightM,
    });
    toast.success(`Placed ${itemData.name}`);
    selectItem(newId);
  };

  // Canvas interaction
  const [draggingCanvasItemId, setDraggingCanvasItemId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleCanvasItemMouseDown = (e: React.MouseEvent, item: LayoutItem) => {
    e.stopPropagation();
    selectItem(item.id);

    if (activeTool === 'delete') {
      removeItem(item.id);
      toast.success(`Removed ${item.name}`);
      return;
    }

    if (activeTool === 'rotate') {
      const newRotation = (item.rotation + 45) % 360;
      updateItem(item.id, { rotation: newRotation });
      return;
    }

    setDraggingCanvasItemId(item.id);
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    setDragOffset({ x: e.clientX - (rect?.left || 0) - item.x * pxScale, y: e.clientY - (rect?.top || 0) - item.y * pxScale });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!draggingCanvasItemId) return;
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const newXFt = (e.clientX - rect.left - dragOffset.x) / pxScale;
    const newYFt = (e.clientY - rect.top - dragOffset.y) / pxScale;
    
    updatePlacement(draggingCanvasItemId, { x: newXFt, y: newYFt });
  };

  const handleCanvasMouseUp = () => {
    setDraggingCanvasItemId(null);
  };

  const getCategoryIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'beds': return <Bed className="w-4 h-4" />;
      case 'wardrobes': return <Layers className="w-4 h-4" />;
      case 'sofas': return <Armchair className="w-4 h-4" />;
      case 'tables': return <Table className="w-4 h-4" />;
      case 'doors': return <DoorClosed className="w-4 h-4" />;
      case 'windows': return <Square className="w-4 h-4" />;
      case 'decor': return <Flower2 className="w-4 h-4" />;
      default: return <Grid className="w-4 h-4" />;
    }
  };

  const pxScale = 36 * zoomLevel;

  return (
    <div className="space-y-4 select-none" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}>
      
      {/* Top Studio Bar & Toolbar (Reference Screen 6) */}
      <div className="card !p-3 flex flex-wrap items-center justify-between gap-3 bg-white">
        
        {/* Left Toolbar Action Icons */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTool('select')}
            title="Select tool"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'select' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>

          <button
            onClick={() => setActiveTool('move')}
            title="Move tool"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'move' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <Move className="w-3.5 h-3.5" />
            <span>Move</span>
          </button>

          <button
            onClick={() => {
              if (selectedItemId) {
                const itm = items.find(i => i.id === selectedItemId);
                if (itm) updateItem(itm.id, { rotation: (itm.rotation + 45) % 360 });
              } else {
                setActiveTool('rotate');
              }
            }}
            title="Rotate selected"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'rotate' ? 'bg-primary text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Rotate</span>
          </button>

          <button
            onClick={() => {
              if (selectedItemId) {
                removeItem(selectedItemId);
                toast.success('Item deleted');
              } else {
                setActiveTool('delete');
              }
            }}
            title="Delete item"
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'delete' ? 'bg-rose-600 text-white shadow-sm' : 'hover:bg-rose-50 text-rose-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
          <button
            onClick={() => {
              if (!selectedItem) return toast.error('Select an item to duplicate');
              const position = clampAndSnap(selectedItem, selectedItem.x + 0.5, selectedItem.y + 0.5, lengthFt, widthFt);
              const id = addItem({ ...selectedItem, ...position });
              selectItem(id);
              toast.success(`${selectedItem.name} duplicated`);
            }}
            title="Duplicate selected item"
            className="px-2 py-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-semibold"
          >Duplicate</button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <button
            onClick={undo}
            title="Undo"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={redo}
            title="Redo"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-medium flex items-center gap-1"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          <div className="h-5 w-px bg-slate-200 mx-1" />

          <button
            onClick={() => setZoomLevel(zoomLevel + 0.15)}
            title="Zoom In"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel(zoomLevel - 0.15)}
            title="Zoom Out"
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Right Action: 3D View & Proceed to Pricing */}
        <div className="flex items-center gap-2.5">
          <button onClick={saveLayout} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-emerald-200 text-emerald-700 hover:bg-emerald-50">Save Layout</button>
          <button onClick={() => setIsPhotoWorkflowOpen(true)} className="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-primary/25 text-primary hover:bg-indigo-50">
            <Sparkles className="w-3.5 h-3.5" /><span>Photo → 3D</span>
          </button>
          <button
            onClick={toggle3DView}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              is3DView 
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30' 
                : 'bg-primary text-white shadow-md shadow-primary/25 hover:bg-primary-600'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{is3DView ? '2D Floor Plan' : '3D View'}</span>
          </button>

          <button
            onClick={() => navigate(`/projects/${id || 'proj-1'}/pricing`)}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
          >
            <span>Proceed to Pricing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main 3-Column Studio Grid: Palette (Left) + Canvas (Center) + Properties (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start min-h-[620px]">
        
        {/* Left Panel: Furniture Palette (Reference Screen 6 Left) */}
        <div className="lg:col-span-3 card !p-0 overflow-hidden flex flex-col h-[620px]">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/60">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Add Items</h2>
            <p className="text-[11px] text-slate-400">Drag or click to place in layout</p>
          </div>

          {/* Category Tabs */}
          <div className="p-2 border-b border-slate-100 bg-white flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {getCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          {/* Catalog Items Grid */}
          <div className="p-3 overflow-y-auto flex-1 grid grid-cols-2 gap-2.5">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleAddDirect(item)}
                className="p-2.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200/80 hover:border-primary hover:shadow-card transition-all cursor-grab active:cursor-grabbing flex flex-col items-center text-center group"
              >
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-primary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  {getCategoryIcon(item.categoryName || 'Beds')}
                </div>
                <span className="text-xs font-semibold text-slate-800 line-clamp-1">{item.name}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 font-medium">
                  {item.defaultWidthFt}ft × {item.defaultHeightFt}ft
                </span>
                <span className="text-[10px] font-bold text-primary mt-1">
                  ₹{item.basePrice.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Center Panel: 2D Interactive Layout Canvas (Reference Screen 6 Center) */}
        <div 
          ref={canvasContainerRef}
          onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          onClick={() => selectItem(null)}
          className={`lg:col-span-6 card !p-6 h-[620px] bg-[#EAE8E3] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all ${
            isDraggingOver ? 'ring-4 ring-primary/40 bg-indigo-50/50' : ''
          }`}
        >
          {/* Canvas Blueprint Grid Background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#64748B_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* The 3D scene uses the same Zustand layout objects as the 2D plan. */}
          {is3DView ? (
            <div className="relative z-10 h-full w-full"><Scene3D lengthFt={lengthFt} widthFt={widthFt} heightFt={heightFt} items={items} selectedItemId={selectedItemId} activeTool={activeTool} onSelect={(itemId) => selectItem(itemId || null)} onUpdate={updatePlacement} /></div>
          ) : (
            /* 2D Floor Plan Canvas (To Scale) */
            <div 
              className="relative bg-[#DFD8CC] border-4 border-[#3D3A37] rounded shadow-2xl transition-all"
              style={{
                width: `${lengthFt * pxScale}px`,
                height: `${widthFt * pxScale}px`,
                maxWidth: '92%',
                maxHeight: '92%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Floor Wood Plank Texture Simulation */}
              <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,#CBBFA8,#CBBFA8_20px,#B9AC95_20px,#B9AC95_40px)]" />

              {/* Edge Dimension Labels (Matching Screen 6) */}
              {/* Top Edge (Length) */}
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 text-[11px] font-bold text-slate-800">
                {lengthFt} ft
              </div>
              {/* Right Edge (Width) */}
              <div className="absolute -right-9 top-1/2 -translate-y-1/2 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-200 text-[11px] font-bold text-slate-800 rotate-90">
                {widthFt} ft
              </div>

              {/* Placed Furniture Items on Canvas */}
              {items.map((item) => {
                const isSelected = selectedItemId === item.id;
                const widthPx = item.widthFt * pxScale;
                const heightPx = item.heightFt * pxScale;
                const leftPx = item.x * pxScale;
                const topPx = item.y * pxScale;

                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleCanvasItemMouseDown(e, item)}
                    className={`absolute select-none cursor-move transition-shadow rounded flex items-center justify-center text-center border ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary bg-amber-100/90 shadow-lg z-20'
                        : 'border-slate-700/60 bg-amber-50/90 hover:border-primary shadow-sm z-10'
                    }`}
                    style={{
                      left: `${leftPx}px`,
                      top: `${topPx}px`,
                      width: `${widthPx}px`,
                      height: `${heightPx}px`,
                      transform: `rotate(${item.rotation}deg)`,
                      transformOrigin: 'center center',
                    }}
                  >
                    {/* Visual Item Blueprint Design */}
                    <div className="p-1 flex flex-col items-center justify-center overflow-hidden w-full h-full pointer-events-none">
                      <span className="text-[10px] font-bold text-slate-900 leading-tight truncate max-w-full">
                        {item.name}
                      </span>
                      <span className="text-[8px] text-slate-600 font-semibold truncate">
                        {item.widthFt}' × {item.heightFt}'
                      </span>
                    </div>

                    {/* Resize/Rotation Handles when Selected */}
                    {isSelected && (
                      <>
                        <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-primary border border-white rounded-full" />
                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary border border-white rounded-full" />
                        <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-primary border border-white rounded-full" />
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-primary border border-white rounded-full" />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Canvas Floating Overlay Info */}
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-700 shadow-sm border border-slate-200">
            Scale: 1 ft = {Math.round(pxScale)}px • {items.length} items placed
          </div>
          {invalidItemIds.size > 0 && <div className="absolute bottom-3 right-3 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-semibold text-red-700">{invalidItemIds.size} item(s) overlap — reposition before saving</div>}
        </div>

        {/* Right Panel: Properties Inspector (Reference Screen 6 Right) */}
        <div className="lg:col-span-3 card !p-5 h-[620px] flex flex-col justify-between overflow-y-auto">
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 text-xs">
            <div className="mb-2 flex items-center gap-1.5 font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Live design analysis</div>
            <div className="grid grid-cols-2 gap-y-1.5 text-slate-600"><span>{items.length} furniture items</span><span>{analysis.walkablePercent.toFixed(0)}% walkable</span><span>{analysis.utilizationPercent.toFixed(0)}% utilized</span><span>{analysis.freeAreaSqFt.toFixed(1)} ft² free</span></div>
            <p className={`mt-2 font-semibold ${analysis.collisionPairs.length || analysis.boundaryItemIds.length ? 'text-amber-700' : 'text-emerald-700'}`}>{analysis.collisionPairs.length ? `⚠ ${analysis.collisionPairs.length} collision${analysis.collisionPairs.length > 1 ? 's' : ''}` : analysis.boundaryItemIds.length ? '⚠ Boundary issue' : '✓ Layout boundary valid'}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">{analysis.recommendation}</p>
          </div>
          {selectedItem ? (
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Properties</h3>
                <p className="text-sm font-bold text-primary mt-1">{selectedItem.name}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Length (ft)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={selectedItem.widthFt}
                    onChange={(e) => updateItem(selectedItem.id, { widthFt: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Width / Depth (ft)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={selectedItem.heightFt}
                    onChange={(e) => updateItem(selectedItem.id, { heightFt: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Height (ft)
                  </label>
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    value={selectedItem.verticalHeightFt || 2.5}
                    onChange={(e) => updateItem(selectedItem.id, { verticalHeightFt: parseFloat(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Rotation (°)
                  </label>
                  <input
                    type="number"
                    step={15}
                    value={selectedItem.rotation}
                    onChange={(e) => updateItem(selectedItem.id, { rotation: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Material Customization Summary Tag */}
              {selectedItem.customizations?.materialName && (
                <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 text-xs space-y-1 text-primary">
                  <div className="font-bold">Custom Specs:</div>
                  <div className="text-[11px] text-slate-700">{selectedItem.customizations.materialName}</div>
                  {selectedItem.customizations.finishName && (
                    <div className="text-[11px] text-slate-500">Finish: {selectedItem.customizations.finishName}</div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center h-full text-slate-400 py-12">
              <Sliders className="w-10 h-10 mb-2 opacity-50" />
              <p className="text-xs font-medium">Select an item on the canvas to inspect & configure properties</p>
            </div>
          )}

          {/* Action: Open Customize Item Screen (Reference Screen 7) */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <button
              onClick={() => {
                if (selectedItem) {
                  navigate(`/projects/${id || 'proj-1'}/design/customize/${selectedItem.id}`);
                } else {
                  toast.error('Please select an item to customize');
                }
              }}
              disabled={!selectedItem}
              className="w-full py-2.5 bg-primary hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-primary/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Customize Item</span>
            </button>
          </div>

        </div>

      </div>
      {isPhotoWorkflowOpen && <PhotoReconstructionPanel onClose={() => setIsPhotoWorkflowOpen(false)} />}
    </div>
  );
};
