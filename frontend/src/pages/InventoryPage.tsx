import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
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
    toast.success('Inventory item added');
    setIsModalOpen(false);
    setName('');
  };

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">Raw materials, hardware stock, and unit procurement prices.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Item</span>
        </button>
      </div>

      {/* Inventory Table (Reference Screen 11) */}
      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search inventory items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Item</th>
                <th className="table-header">Category</th>
                <th className="table-header">Unit</th>
                <th className="table-header">Stock</th>
                <th className="table-header">Unit Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="table-cell font-bold text-slate-900">
                    {inv.name}
                  </td>
                  <td className="table-cell text-slate-600 font-medium">
                    {inv.category}
                  </td>
                  <td className="table-cell text-slate-500 text-xs">
                    {inv.unit}
                  </td>
                  <td className="table-cell">
                    <span className={`font-bold ${inv.stock < 70 ? 'text-amber-600' : 'text-slate-800'}`}>
                      {inv.stock}
                    </span>
                  </td>
                  <td className="table-cell font-bold text-primary">
                    ₹{inv.unitPrice.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 to {filteredItems.length} of 50 results</span>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-primary text-white font-semibold">1</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">2</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">3</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">4</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">5</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add Inventory Item</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Plywood 19mm Commercial"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                  >
                    <option value="Boards">Boards</option>
                    <option value="Laminates">Laminates</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Finishes">Finishes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Stock Qty</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-outline text-xs py-2">Cancel</button>
                <button type="submit" className="btn-primary text-xs py-2">Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
