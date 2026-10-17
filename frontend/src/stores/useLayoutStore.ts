import { create } from 'zustand';
import { LayoutItem, PricingSettings, RoomLayoutState } from '../types';

interface LayoutStore extends RoomLayoutState {
  selectedItemId: string | null;
  history: LayoutItem[][];
  historyIndex: number;
  activeTool: 'select' | 'move' | 'rotate' | 'delete' | 'zoom';
  zoomLevel: number;
  pricingSettings: PricingSettings;
  is3DView: boolean;
  photoBackdropUrl: string | null;
  photoBackdropOpacity: number;
  isLayoutAnimating: boolean;
  isImmersive: boolean;
  showWalkability: boolean;

  // Actions
  setRoomDimensions: (lengthFt: number, widthFt: number, heightFt: number) => void;
  setRoomDetails: (roomName: string, roomType: string, projectId: string) => void;
  addItem: (item: Omit<LayoutItem, 'id'>) => string;
  updateItem: (id: string, updates: Partial<LayoutItem>) => void;
  removeItem: (id: string) => void;
  selectItem: (id: string | null) => void;
  setActiveTool: (tool: 'select' | 'move' | 'rotate' | 'delete' | 'zoom') => void;
  setZoomLevel: (zoom: number) => void;
  toggle3DView: () => void;
  setPricingSettings: (settings: Partial<PricingSettings>) => void;
  replaceItems: (items: LayoutItem[], opts?: { animate?: boolean }) => void;
  setItemsPositions: (items: LayoutItem[], opts?: { animate?: boolean }) => void;
  setPhotoBackdrop: (url: string | null, opacity?: number) => void;
  setLayoutAnimating: (value: boolean) => void;
  setImmersive: (value: boolean) => void;
  toggleWalkability: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  resetLayout: () => void;
}

const initialItems: LayoutItem[] = [
  {
    id: 'placed-bed-1',
    furnitureItemId: 'item-bed-king',
    name: 'King Size Bed',
    category: 'Beds',
    x: 3.2,
    y: 1.0,
    rotation: 0,
    widthFt: 6,
    heightFt: 6.5,
    verticalHeightFt: 1.5,
    customizations: {
      materialName: 'Dark Walnut Finish',
      materialPricePerSqFt: 85,
    }
  },
  {
    id: 'placed-wardrobe-1',
    furnitureItemId: 'item-wardrobe-2d',
    name: '2 Door Wardrobe',
    category: 'Wardrobes',
    x: 0.5,
    y: 0.5,
    rotation: 0,
    widthFt: 4,
    heightFt: 2,
    verticalHeightFt: 7,
    customizations: {
      materialName: 'Plywood + Sunmica Walnut',
      finishName: 'Matte',
      colorHex: '#5C4033',
      colorName: 'Dark Walnut',
      hardwareName: 'Steel Handle',
      internalSetup: '2 Doors + 4 Shelves + 2 Drawers',
      softClose: true,
    }
  },
  {
    id: 'placed-side-1',
    furnitureItemId: 'item-sidetable',
    name: 'Bed Side Table',
    category: 'Tables',
    x: 9.5,
    y: 1.5,
    rotation: 0,
    widthFt: 1.5,
    heightFt: 1.5,
    verticalHeightFt: 2,
  },
  {
    id: 'placed-tv-1',
    furnitureItemId: 'item-tvunit',
    name: 'TV Unit with Storage',
    category: 'Tables',
    x: 3.0,
    y: 8.2,
    rotation: 0,
    widthFt: 6,
    heightFt: 1.5,
    verticalHeightFt: 2,
  }
];

export const useLayoutStore = create<LayoutStore>((set, get) => ({
  roomId: 'room-101',
  projectId: 'proj-1',
  roomName: 'Master Bedroom',
  roomType: 'BEDROOM',
  lengthFt: 12,
  widthFt: 10,
  heightFt: 9,
  items: initialItems,
  selectedItemId: 'placed-wardrobe-1',
  history: [initialItems],
  historyIndex: 0,
  activeTool: 'select',
  zoomLevel: 1,
  is3DView: false,
  photoBackdropUrl: null,
  photoBackdropOpacity: 0.35,
  isLayoutAnimating: false,
  isImmersive: false,
  showWalkability: false,
  pricingSettings: {
    profitMargin: 20,
    discount: 5,
    contingency: 2,
    applyGst: true,
  },

  setRoomDimensions: (lengthFt, widthFt, heightFt) => set({ lengthFt, widthFt, heightFt }),
  
  setRoomDetails: (roomName, roomType, projectId) => set({ roomName, roomType, projectId }),

  setPhotoBackdrop: (url, opacity = 0.35) =>
    set({ photoBackdropUrl: url, photoBackdropOpacity: opacity }),

  setLayoutAnimating: (value) => set({ isLayoutAnimating: value }),
  setImmersive: (value) => set({ isImmersive: value }),
  toggleWalkability: () => set((s) => ({ showWalkability: !s.showWalkability })),

  replaceItems: (items, opts) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(items);
    set({
      items,
      selectedItemId: null,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isLayoutAnimating: !!opts?.animate,
    });
  },

  setItemsPositions: (items, opts) => {
    const { history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(items);
    set({
      items,
      history: newHistory,
      historyIndex: newHistory.length - 1,
      isLayoutAnimating: !!opts?.animate,
    });
  },

  addItem: (itemData) => {
    const newItem: LayoutItem = {
      ...itemData,
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    
    const { items, history, historyIndex } = get();
    const updatedItems = [...items, newItem];
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedItems);

    set({
      items: updatedItems,
      selectedItemId: newItem.id,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });

    return newItem.id;
  },

  updateItem: (id, updates) => {
    const { items, history, historyIndex } = get();
    const updatedItems = items.map((item) => (item.id === id ? { ...item, ...updates } : item));
    
    // Push to history for discrete updates
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedItems);

    set({
      items: updatedItems,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  removeItem: (id) => {
    const { items, selectedItemId, history, historyIndex } = get();
    const updatedItems = items.filter((item) => item.id !== id);
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(updatedItems);

    set({
      items: updatedItems,
      selectedItemId: selectedItemId === id ? null : selectedItemId,
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  selectItem: (id) => set({ selectedItemId: id }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  setZoomLevel: (zoomLevel) => set({ zoomLevel: Math.max(0.5, Math.min(2.5, zoomLevel)) }),

  toggle3DView: () => set((state) => ({ is3DView: !state.is3DView })),

  setPricingSettings: (newSettings) =>
    set((state) => ({
      pricingSettings: { ...state.pricingSettings, ...newSettings },
    })),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({
        historyIndex: prevIndex,
        items: history[prevIndex],
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({
        historyIndex: nextIndex,
        items: history[nextIndex],
      });
    }
  },

  resetLayout: () => {
    set({
      items: initialItems,
      history: [initialItems],
      historyIndex: 0,
      selectedItemId: null,
    });
  }
}));
