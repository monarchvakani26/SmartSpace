import React, { useState, useEffect } from 'react';
import { Plus, Search, Mail, Phone, MapPin } from 'lucide-react';
import { apiService } from '../services/api';
import { Client } from '../types';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiService.getClients().then(setClients);
  }, []);

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-space-rise">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Desk</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Clients</h1>
          <p className="text-sm text-ink-muted mt-2">People and sites you design for.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus className="w-4 h-4" />
          <span>Add client</span>
        </button>
      </header>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search clients…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-studio pl-9"
        />
      </div>

      <div className="divide-y divide-surface-border border-y border-surface-border">
        {filtered.map((c, i) => (
          <div
            key={c.id}
            className="py-5 flex flex-col sm:flex-row sm:items-center gap-4 animate-space-rise"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <div className="w-12 h-12 shrink-0 bg-primary text-[#F7F6F2] font-display text-xl flex items-center justify-center">
              {c.name[0]}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-xl text-ink">{c.name}</h3>
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> {c.phone}
                </span>
                {c.email && (
                  <span className="inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {c.email}
                  </span>
                )}
                {c.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {c.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
