import React, { useState, useEffect } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { apiService } from '../services/api';
import { Lead, LeadSource, LeadStatus } from '../types';
import toast from 'react-hot-toast';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [source, setSource] = useState<LeadSource>('WEBSITE');
  const [status, setStatus] = useState<LeadStatus>('NEW');

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const data = await apiService.getLeads();
    setLeads(data);
  };

  const handleAddLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Please enter name and phone number');
      return;
    }
    await apiService.createLead({ name, phone, email, source, status });
    toast.success('Lead added');
    setIsModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    loadLeads();
  };

  const getStatusPill = (st: LeadStatus) => {
    const map: Record<string, string> = {
      INTERESTED: 'text-primary border-primary/40',
      CONTACTED: 'text-[#3D5A80] border-[#3D5A80]/40',
      NOT_INTERESTED: 'text-[#9B3B2E] border-[#9B3B2E]/40',
      CONVERTED: 'text-primary border-primary/40',
      NEW: 'text-ink-muted border-surface-border',
    };
    const labels: Record<string, string> = {
      INTERESTED: 'Interested',
      CONTACTED: 'Contacted',
      NOT_INTERESTED: 'Not interested',
      CONVERTED: 'Converted',
      NEW: 'New',
    };
    return <span className={`status-pill ${map[st] || map.NEW}`}>{labels[st] || st}</span>;
  };

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.phone.includes(searchTerm) ||
      (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'ALL' || l.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-8 animate-space-rise">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Desk</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Leads</h1>
          <p className="text-sm text-ink-muted mt-2">Enquiries waiting to become spaces.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 text-sm self-start">
          <Plus className="w-4 h-4" />
          <span>Add lead</span>
        </button>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-studio pl-9"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input-studio max-w-[12rem]"
        >
          <option value="ALL">All statuses</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="INTERESTED">Interested</option>
          <option value="NOT_INTERESTED">Not interested</option>
        </select>
      </div>

      <div className="overflow-x-auto border border-surface-border bg-surface-card/60">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Contact</th>
              <th className="table-header">Source</th>
              <th className="table-header">Status</th>
              <th className="table-header">Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="hover:bg-plaster/40 transition-colors">
                <td className="table-cell font-semibold">{lead.name}</td>
                <td className="table-cell">
                  <div className="flex flex-col text-xs">
                    <span className="font-medium">{lead.phone}</span>
                    {lead.email && <span className="text-ink-muted text-[11px]">{lead.email}</span>}
                  </div>
                </td>
                <td className="table-cell text-xs capitalize text-ink-muted">
                  {lead.source.toLowerCase()}
                </td>
                <td className="table-cell">{getStatusPill(lead.status)}</td>
                <td className="table-cell text-xs text-ink-muted">{lead.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-surface-card border border-surface-border max-w-md w-full p-6 animate-space-rise">
            <div className="flex items-center justify-between pb-3 border-b border-surface-border mb-4">
              <h3 className="font-display text-2xl text-ink">Add lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-ink-muted hover:text-ink">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Name *</label>
                <input required value={name} onChange={(e) => setName(e.target.value)} className="input-studio" placeholder="Rahul Sharma" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Phone *</label>
                <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-studio" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input-studio" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Source</label>
                  <select value={source} onChange={(e) => setSource(e.target.value as LeadSource)} className="input-studio">
                    <option value="WEBSITE">Website</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WALK_IN">Walk In</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-ink-muted uppercase tracking-[0.12em] mb-1">Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as LeadStatus)} className="input-studio">
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                  </select>
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
