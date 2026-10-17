import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { apiService } from '../services/api';
import { InventoryItem } from '../types';
import toast from 'react-hot-toast';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Boards');
  const [unit, setUnit] = useState('Sheets');
  const [stock, setStock] = useState<number>(100);
  const [unitPrice, setUnitPrice] = useState<number>(1500);

  useEffect(() => {
    apiService.getInventory().then(setItems);
  }, []);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: InventoryItem = {
      id: 'inv-' + Date.now(),
      name,
      category,
      unit,
      stock,
      unitPrice,
    };
    setItems([newItem, ...items]);
    toast.success('Material added');
    setIsModalOpen(false);
    setName('');
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-space-rise">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Desk</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Materials</h1>
          <p className="text-sm text-ink-muted mt-2">Boards, laminates, hardware — stock for the shop floor.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus className="w-4 h-4" />
          <span>Add material</span>
        </button>
      </header>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search materials…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-studio pl-9"
        />
      </div>

      <div className="overflow-x-auto border border-surface-border bg-surface-card/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="table-header">Item</th>
              <th className="table-header">Category</th>
              <th className="table-header">Unit</th>
              <th className="table-header">Stock</th>
              <th className="table-header">Unit price</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((inv) => (
              <tr key={inv.id} className="hover:bg-plaster/40 transition-colors">
                <td className="table-cell font-semibold">{inv.name}</td>
                <td className="table-cell text-ink-muted">{inv.category}</td>
                <td className="table-cell text-xs text-ink-muted">{inv.unit}</td>
                <td className="table-cell">
                  <span className={`font-semibold ${inv.stock < 70 ? 'text-brass' : 'text-ink'}`}>
                    {inv.stock}
                  </span>
                </td>
                <td className="table-cell font-semibold text-primary">
                  ₹{inv.unitPrice.toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border max-w-md w-full p-6 animate-space-rise">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h3 className="font-display text-2xl text-ink">Add material</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-muted hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input-studio" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-studio">
                    <option value="Boards">Boards</option>
                    <option value="Laminates">Laminates</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Finishes">Finishes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Unit</label>
                  <input value={unit} onChange={(e) => setUnit(e.target.value)} className="input-studio" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Stock</label>
                  <input type="number" value={stock} onChange={(e) => setStock(parseFloat(e.target.value) || 0)} className="input-studio" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Unit price (₹)</label>
                  <input type="number" value={unitPrice} onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)} className="input-studio" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-surface-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline text-xs">Cancel</button>
                <button type="submit" className="btn-primary text-xs">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
