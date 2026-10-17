import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Square, 
  DoorClosed, 
  Flower2, 
  Box,
  Settings2
} from 'lucide-react';
import { useLayoutStore } from '../stores/useLayoutStore';
import { apiService } from '../services/api';
import { aiService } from '../services/aiService';
import { FurnitureCatalogItem, FurnitureCategory, LayoutItem } from '../types';
import toast from 'react-hot-toast';
import { Scene3D } from '../components/studio/Scene3D';
import { PhotoReconstructionPanel } from '../components/studio/PhotoReconstructionPanel';
import { StudioAICoach } from '../components/studio/StudioAICoach';
import { analyzeLayout, clampAndSnap, collisionIds } from '../utils/layout3d';

export const DesignStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const { 
    lengthFt, 
    widthFt, 
    heightFt,
    roomType,
    items, 
    selectedItemId, 
    activeTool, 
    zoomLevel,
    is3DView,
    photoBackdropUrl,
    photoBackdropOpacity,
    isLayoutAnimating,
    addItem, 
    updateItem, 
    removeItem, 
    selectItem, 
    setActiveTool, 
    setZoomLevel,
    toggle3DView,
    undo, 
    redo,
    replaceItems,
    setItemsPositions,
    setRoomDimensions,
    setPhotoBackdrop,
  } = useLayoutStore();

  const [categories, setCategories] = useState<FurnitureCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('cat-all');
  const [catalogItems, setCatalogItems] = useState<FurnitureCatalogItem[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isPhotoWorkflowOpen, setIsPhotoWorkflowOpen] = useState(false);
  const [rightTab, setRightTab] = useState<'coach' | 'props'>('coach');
  const [predictedCost, setPredictedCost] = useState<number | null>(null);
  const [costRange, setCostRange] = useState<{ min: number; max: number } | null>(null);
  const [costSource, setCostSource] = useState<'ai' | 'local' | null>(null);

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
  const applySuggestion = () => {
    const target = analysis.collisionPairs[0]?.[1] || analysis.doorObstructions[0]?.item;
    if (!target) { toast.success('No placement correction is needed'); return; }
    const position = clampAndSnap(target, lengthFt - target.widthFt, widthFt - target.heightFt, lengthFt, widthFt);
    updateItem(target.id, position);
    selectItem(target.id);
    toast.success(`Applied placement suggestion to ${target.name}`);
  };

  useEffect(() => {
    apiService.getFurnitureCategories().then(setCategories);
    apiService.getFurnitureItems().then(setCatalogItems);
  }, []);

  // Live cost whisper — debounced as pieces change
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const result = await aiService.predictCost({
        room_type: roomType || 'BEDROOM',
        length_ft: lengthFt,
        width_ft: widthFt,
        height_ft: heightFt,
        item_count: Math.max(1, items.length),
      });
      if (cancelled) return;
      setPredictedCost(result.predicted_cost_inr);
      setCostRange(result.predicted_range);
      setCostSource(result.source);
    }, 450);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [items.length, lengthFt, widthFt, heightFt, roomType, items.map((i) => i.id).join(',')]);

  useEffect(() => {
    if (selectedItemId) setRightTab('props');
  }, [selectedItemId]);

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
    <div className="space-y-3 select-none animate-space-fade" onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp}>
      
      {/* Top Studio Bar */}
      <div className="panel-quiet !p-2.5 flex flex-wrap items-center justify-between gap-3">
        
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={() => setActiveTool('select')}
            title="Select tool"
            className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'select' ? 'bg-primary text-[#F7F6F2]' : 'hover:bg-plaster/80 text-ink-muted'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
            <span>Select</span>
          </button>

          <button
            onClick={() => setActiveTool('move')}
            title="Move tool"
            className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'move' ? 'bg-primary text-[#F7F6F2]' : 'hover:bg-plaster/80 text-ink-muted'
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
            className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'rotate' ? 'bg-primary text-[#F7F6F2]' : 'hover:bg-plaster/80 text-ink-muted'
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
            className={`px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTool === 'delete' ? 'bg-[#9B3B2E] text-white' : 'hover:bg-[#9B3B2E]/10 text-[#9B3B2E]'
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
            className="px-2 py-1.5 hover:bg-plaster/80 text-ink-muted text-xs font-semibold"
          >Duplicate</button>

          <div className="h-5 w-px bg-surface-border mx-1" />

          <button
            onClick={undo}
            title="Undo"
            className="p-1.5 hover:bg-plaster/80 text-ink-muted text-xs font-medium flex items-center gap-1"
          >
            <Undo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={redo}
            title="Redo"
            className="p-1.5 hover:bg-plaster/80 text-ink-muted text-xs font-medium flex items-center gap-1"
          >
            <Redo2 className="w-4 h-4" />
            <span className="hidden sm:inline">Redo</span>
          </button>

          <div className="h-5 w-px bg-surface-border mx-1" />

          <button
            onClick={() => setZoomLevel(zoomLevel + 0.15)}
            title="Zoom In"
            className="p-1.5 hover:bg-plaster/80 text-ink-muted"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => setZoomLevel(zoomLevel - 0.15)}
            title="Zoom Out"
            className="p-1.5 hover:bg-plaster/80 text-ink-muted"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={saveLayout} className="px-3.5 py-1.5 text-xs font-semibold border border-primary/30 text-primary hover:bg-primary-50">Save</button>
          <button onClick={() => setIsPhotoWorkflowOpen(true)} className="px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 border border-brass/40 text-brass hover:bg-brass-soft/40">
            <Sparkles className="w-3.5 h-3.5" /><span>Photo → 3D</span>
          </button>
          <button
            onClick={toggle3DView}
            className={`px-3.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 transition-all ${
              is3DView 
                ? 'bg-brass text-[#F7F6F2]' 
                : 'bg-primary text-[#F7F6F2] hover:bg-primary-600'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>{is3DView ? '2D plan' : '3D view'}</span>
          </button>

          <button
            onClick={() => navigate(`/projects/${id || 'proj-1'}/pricing`)}
            className="btn-primary !py-1.5 text-xs flex items-center gap-1.5"
          >
            <span>Pricing</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-start min-h-[calc(100vh-8rem)]">
        
        <div className="lg:col-span-3 panel-quiet !p-0 overflow-hidden flex flex-col h-[calc(100vh-8rem)] min-h-[560px]">
          <div className="p-3.5 border-b border-surface-border">
            <h2 className="font-display text-lg text-ink">Furniture</h2>
            <p className="text-[11px] text-ink-muted">Drag onto the floor plan</p>
          </div>

          <div className="p-2 border-b border-surface-border flex flex-wrap gap-1 max-h-32 overflow-y-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 text-[11px] font-semibold flex items-center gap-1 transition-all ${
                  activeCategory === cat.id
                    ? 'bg-primary text-[#F7F6F2]'
                    : 'bg-plaster/70 text-ink-muted hover:bg-plaster'
                }`}
              >
                {getCategoryIcon(cat.name)}
                <span>{cat.name}</span>
              </button>
            ))}
          </div>

          <div className="p-3 overflow-y-auto flex-1 grid grid-cols-2 gap-2">
            {filteredCatalog.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item)}
                onClick={() => handleAddDirect(item)}
                className="p-2.5 bg-surface-card/80 hover:bg-surface-card border border-surface-border hover:border-primary transition-all cursor-grab active:cursor-grabbing flex flex-col items-center text-center group"
              >
                <div className="w-9 h-9 bg-primary-100 text-primary flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                  {getCategoryIcon(item.categoryName || 'Beds')}
                </div>
                <span className="text-xs font-semibold text-ink line-clamp-1">{item.name}</span>
                <span className="text-[10px] text-ink-muted mt-0.5 font-medium">
                  {item.defaultWidthFt}ft × {item.defaultHeightFt}ft
                </span>
                <span className="text-[10px] font-bold text-brass mt-1">
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
          className={`lg:col-span-6 h-[calc(100vh-8rem)] min-h-[560px] bg-[#C9B8A0]/45 border border-surface-border flex flex-col items-center justify-center relative overflow-hidden transition-all ${
            isDraggingOver ? 'ring-2 ring-primary/50 bg-primary-50/40' : ''
          }`}
        >
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#5C574E_1px,transparent_1px)] [background-size:16px_16px]" />

          {/* The 3D scene uses the same Zustand layout objects as the 2D plan. */}
          {is3DView ? (
            <div className="relative z-10 h-full w-full"><Scene3D lengthFt={lengthFt} widthFt={widthFt} heightFt={heightFt} items={items} selectedItemId={selectedItemId} activeTool={activeTool} onSelect={(itemId) => selectItem(itemId || null)} onUpdate={updatePlacement} /></div>
          ) : (
            /* 2D Floor Plan Canvas (To Scale) */
            <div 
              className="relative bg-[#DFD8CC] border-[3px] border-ink shadow-card-hover transition-all"
              style={{
                width: `${lengthFt * pxScale}px`,
                height: `${widthFt * pxScale}px`,
                maxWidth: '92%',
                maxHeight: '92%',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {photoBackdropUrl ? (
                <img
                  src={photoBackdropUrl}
                  alt="Room photo reference"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  style={{ opacity: photoBackdropOpacity }}
                />
              ) : (
                <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(90deg,#CBBFA8,#CBBFA8_20px,#B9AC95_20px,#B9AC95_40px)]" />
              )}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#5C574E_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

              <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-surface-card px-2 py-0.5 border border-surface-border text-[11px] font-bold text-ink">
                {lengthFt} ft
              </div>
              <div className="absolute -right-9 top-1/2 -translate-y-1/2 bg-surface-card px-2 py-0.5 border border-surface-border text-[11px] font-bold text-ink rotate-90">
                {widthFt} ft
              </div>

              {items.map((item) => {
                const isSelected = selectedItemId === item.id;
                const widthPx = item.widthFt * pxScale;
                const heightPx = item.heightFt * pxScale;
                const leftPx = item.x * pxScale;
                const topPx = item.y * pxScale;
                const isInvalid = invalidItemIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleCanvasItemMouseDown(e, item)}
                    className={`absolute select-none cursor-move flex items-center justify-center text-center border ${
                      isLayoutAnimating ? 'transition-[left,top,transform] duration-500 ease-out' : 'transition-shadow'
                    } ${
                      isSelected
                        ? 'ring-2 ring-primary border-primary bg-brass-soft/90 shadow-lg z-20'
                        : isInvalid
                          ? 'border-[#9B3B2E] bg-[#9B3B2E]/20 z-10'
                          : 'border-ink/50 bg-[#E8DCC8]/90 hover:border-primary shadow-sm z-10'
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
                      <span className="text-[10px] font-bold text-ink leading-tight truncate max-w-full">
                        {item.name}
                      </span>
                      <span className="text-[8px] text-ink-muted font-semibold truncate">
                        {item.widthFt}' × {item.heightFt}'
                      </span>
                    </div>

                    {isSelected && (
                      <>
                        <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary border border-surface-card" />
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary border border-surface-card" />
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary border border-surface-card" />
                        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary border border-surface-card" />
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="absolute bottom-3 left-3 bg-surface-card/95 px-2.5 py-1 text-[10px] font-semibold text-ink border border-surface-border flex items-center gap-2">
            <span>Scale: 1 ft = {Math.round(pxScale)}px · {items.length} pieces</span>
            {predictedCost != null && (
              <span className="text-brass font-bold">· ≈ ₹{predictedCost.toLocaleString('en-IN')}</span>
            )}
          </div>
          {photoBackdropUrl && (
            <button
              type="button"
              onClick={() => setPhotoBackdrop(null)}
              className="absolute top-3 right-3 bg-surface-card/95 px-2 py-1 text-[10px] font-semibold text-ink-muted border border-surface-border hover:text-ink"
            >
              Clear photo
            </button>
          )}
          {invalidItemIds.size > 0 && <div className="absolute bottom-3 right-3 border border-[#9B3B2E]/40 bg-[#9B3B2E]/10 px-2.5 py-1 text-[10px] font-semibold text-[#9B3B2E]">{invalidItemIds.size} overlap — fix before saving</div>}
        </div>

        <div className="lg:col-span-3 panel-quiet !p-4 h-[calc(100vh-8rem)] min-h-[560px] flex flex-col overflow-hidden">
          <div className="flex gap-1 mb-3 border-b border-surface-border pb-2">
            <button
              type="button"
              onClick={() => setRightTab('coach')}
              className={`flex-1 py-1.5 text-[11px] font-semibold ${rightTab === 'coach' ? 'bg-primary text-[#F7F6F2]' : 'text-ink-muted hover:bg-plaster/60'}`}
            >
              AI coach
            </button>
            <button
              type="button"
              onClick={() => setRightTab('props')}
              className={`flex-1 py-1.5 text-[11px] font-semibold ${rightTab === 'props' ? 'bg-primary text-[#F7F6F2]' : 'text-ink-muted hover:bg-plaster/60'}`}
            >
              Properties
            </button>
          </div>

          {rightTab === 'coach' ? (
            <div className="flex-1 min-h-0 overflow-hidden">
              <StudioAICoach
                roomType={roomType || 'BEDROOM'}
                lengthFt={lengthFt}
                widthFt={widthFt}
                heightFt={heightFt}
                items={items}
                catalog={catalogItems}
                analysis={analysis}
                onReplaceItems={(next, animate) => replaceItems(next, { animate })}
                onSetPositions={(next, animate) => setItemsPositions(next, { animate })}
                onApplySuggestion={applySuggestion}
                predictedCost={predictedCost}
                costRange={costRange}
                costSource={costSource}
              />
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-between">
              <div className="mb-3 border border-primary/20 bg-primary-50/50 p-3 text-xs">
                <div className="mb-2 flex items-center gap-1.5 font-bold text-primary"><Sparkles className="h-3.5 w-3.5" /> Layout check</div>
                <div className="grid grid-cols-2 gap-y-1.5 text-ink-muted">
                  <span>Score: {analysis.score}/100</span>
                  <span>{analysis.walkablePercent.toFixed(0)}% walkable</span>
                </div>
                <p className="mt-2 text-[11px] text-ink-muted leading-relaxed">{analysis.recommendation}</p>
              </div>

              {selectedItem ? (
                <div className="space-y-4 flex-1">
                  <div className="pb-3 border-b border-surface-border">
                    <h3 className="text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em]">Properties</h3>
                    <p className="font-display text-xl text-ink mt-1">{selectedItem.name}</p>
                  </div>
                  <div className="space-y-3">
                    {([
                      { label: 'Length (ft)', key: 'widthFt' as const, step: 0.5 },
                      { label: 'Width / Depth (ft)', key: 'heightFt' as const, step: 0.5 },
                      { label: 'Height (ft)', key: 'verticalHeightFt' as const, step: 0.5 },
                      { label: 'Rotation (°)', key: 'rotation' as const, step: 15 },
                    ]).map((field) => (
                      <div key={field.label}>
                        <label className="block text-[11px] font-semibold text-ink-muted uppercase tracking-[0.1em] mb-1">
                          {field.label}
                        </label>
                        <input
                          type="number"
                          step={field.step}
                          min={field.key === 'rotation' ? undefined : 0.5}
                          value={
                            field.key === 'verticalHeightFt'
                              ? selectedItem.verticalHeightFt || 2.5
                              : selectedItem[field.key]
                          }
                          onChange={(e) =>
                            updateItem(selectedItem.id, {
                              [field.key]: parseFloat(e.target.value) || 0,
                            })
                          }
                          className="input-studio !py-2 text-xs font-semibold"
                        />
                      </div>
                    ))}
                  </div>
                  {selectedItem.customizations?.materialName && (
                    <div className="p-3 bg-primary-50 border border-primary/15 text-xs space-y-1 text-primary">
                      <div className="font-bold">Specs</div>
                      <div className="text-[11px] text-ink">{selectedItem.customizations.materialName}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center flex-1 text-ink-muted py-8">
                  <Sliders className="w-8 h-8 mb-2 opacity-40" />
                  <p className="text-xs font-medium">Select a piece on the plan to edit</p>
                </div>
              )}

              <div className="pt-4 border-t border-surface-border space-y-2">
                <button
                  onClick={() => {
                    if (selectedItem) {
                      navigate(`/projects/${id || 'proj-1'}/design/customize/${selectedItem.id}`);
                    } else {
                      toast.error('Please select an item to customize');
                    }
                  }}
                  disabled={!selectedItem}
                  className="w-full btn-primary !py-2.5 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Customize piece</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
      {isPhotoWorkflowOpen && (
        <PhotoReconstructionPanel
          onClose={() => setIsPhotoWorkflowOpen(false)}
          catalog={catalogItems}
          roomType={roomType || 'BEDROOM'}
          onImport={({ backdropUrl, lengthFt: L, widthFt: W, items: imported, message }) => {
            setPhotoBackdrop(backdropUrl, 0.38);
            setRoomDimensions(L, W, heightFt);
            replaceItems(imported, { animate: true });
            setTimeout(() => replaceItems(imported, { animate: false }), 700);
            setIsPhotoWorkflowOpen(false);
            setRightTab('coach');
            toast.success('Photo scene placed — refine footprints');
            if (message) toast(message, { duration: 4000 });
          }}
        />
      )}
    </div>
  );
};
