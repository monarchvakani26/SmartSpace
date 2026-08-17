import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { apiService } from '../services/api';
import { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiService.getOrders().then(setOrders);
  }, []);

  const getStatusPill = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">Confirmed</span>;
      case 'IN_PROGRESS':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">In Progress</span>;
      case 'ON_HOLD':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">On Hold</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-600 border border-purple-200">Completed</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">Pending</span>;
    }
  };

  const filteredOrders = orders.filter(o => 
    o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (o.projectName && o.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (o.clientName && o.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track production, procurement status, and fulfillment milestones.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" />
          <span>+ New Order</span>
        </button>
      </div>

      {/* Orders Table (Reference Screen 10) */}
      <div className="card !p-0 overflow-hidden">
        {/* Table Search */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Order ID</th>
                <th className="table-header">Project</th>
                <th className="table-header">Client</th>
                <th className="table-header">Amount</th>
                <th className="table-header">Status</th>
                <th className="table-header">Order Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="table-cell font-bold text-primary">
                    {ord.orderNumber}
                  </td>
                  <td className="table-cell font-semibold text-slate-900">
                    {ord.projectName || 'Modern Bedroom'}
                  </td>
                  <td className="table-cell text-slate-600">
                    {ord.clientName || 'Rohan Mehta'}
                  </td>
                  <td className="table-cell font-bold text-slate-800">
                    ₹{ord.totalAmount.toLocaleString('en-IN')}
                  </td>
                  <td className="table-cell">
                    {getStatusPill(ord.status)}
                  </td>
                  <td className="table-cell text-slate-500 text-xs">
                    {ord.orderDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 to {filteredOrders.length} of 29 results</span>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-7 h-7 rounded-lg bg-primary text-white font-semibold">1</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">2</button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-50 text-slate-600 font-medium">3</button>
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
