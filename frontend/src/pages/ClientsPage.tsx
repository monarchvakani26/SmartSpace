import React, { useState, useEffect } from 'react';
import { UserCheck, Plus, Search, Mail, Phone, MapPin } from 'lucide-react';
import { apiService } from '../services/api';
import { Client } from '../types';

export const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiService.getClients().then(setClients);
  }, []);

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.city && c.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clients</h1>
          <p className="text-xs text-slate-500 mt-0.5">Directory of active clients, site addresses, and contact records.</p>
        </div>
        <button className="btn-primary flex items-center gap-2 text-xs">
          <Plus className="w-4 h-4" />
          <span>+ Add Client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <div key={c.id} className="card hover:shadow-card-hover transition-all space-y-3">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary font-bold flex items-center justify-center text-sm">
                {c.name[0]}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                <p className="text-xs text-slate-400">Client ID: {c.id}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.phone}</span>
              </div>
              {c.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{c.email}</span>
                </div>
              )}
              {c.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{c.address}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
