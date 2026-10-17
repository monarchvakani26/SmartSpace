import React, { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { apiService } from '../services/api';
import { Order } from '../types';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiService.getOrders().then(setOrders);
  }, []);

  const getStatusPill = (status: string) => {
    const styles: Record<string, string> = {
      CONFIRMED: 'text-primary border-primary/40',
      IN_PROGRESS: 'text-[#3D5A80] border-[#3D5A80]/40',
      ON_HOLD: 'text-brass border-brass/40',
      COMPLETED: 'text-primary border-primary/40',
    };
    const labels: Record<string, string> = {
      CONFIRMED: 'Confirmed',
      IN_PROGRESS: 'In progress',
      ON_HOLD: 'On hold',
      COMPLETED: 'Completed',
    };
    return (
      <span className={`status-pill ${styles[status] || 'text-ink-muted border-surface-border'}`}>
        {labels[status] || 'Pending'}
      </span>
    );
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.projectName && o.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (o.clientName && o.clientName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-space-rise">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Desk</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Orders</h1>
          <p className="text-sm text-ink-muted mt-2">Production and delivery for approved layouts.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus className="w-4 h-4" />
          <span>New order</span>
        </button>
      </header>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search orders…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-studio pl-9"
        />
      </div>

      <div className="overflow-x-auto border border-surface-border bg-surface-card/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="table-header">Order</th>
              <th className="table-header">Project</th>
              <th className="table-header">Client</th>
              <th className="table-header">Amount</th>
              <th className="table-header">Status</th>
              <th className="table-header">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((ord) => (
              <tr key={ord.id} className="hover:bg-plaster/40 transition-colors">
                <td className="table-cell font-bold text-primary">{ord.orderNumber}</td>
                <td className="table-cell font-semibold">{ord.projectName || 'Modern Bedroom'}</td>
                <td className="table-cell text-ink-muted">{ord.clientName || 'Rohan Mehta'}</td>
                <td className="table-cell font-semibold">₹{ord.totalAmount.toLocaleString('en-IN')}</td>
                <td className="table-cell">{getStatusPill(ord.status)}</td>
                <td className="table-cell text-xs text-ink-muted">{ord.orderDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
