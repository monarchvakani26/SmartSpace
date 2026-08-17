import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Phone, Mail, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { apiService } from '../services/api';
import { Lead, LeadSource, LeadStatus } from '../types';
import toast from 'react-hot-toast';

export const LeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form State
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
    toast.success('Lead added successfully');
    setIsModalOpen(false);
    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    loadLeads();
  };

  const getStatusPill = (st: LeadStatus) => {
    switch (st) {
      case 'INTERESTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">Interested</span>;
      case 'CONTACTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-200">Contacted</span>;
      case 'NOT_INTERESTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">Not Interested</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">New</span>;
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          l.phone.includes(searchTerm) || 
                          (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'ALL' || l.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Leads</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage enquiries, client pipeline, and conversion tracking.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 text-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Lead</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="card !p-0 overflow-hidden">
        
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-primary"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="CONTACTED">Contacted</option>
              <option value="INTERESTED">Interested</option>
              <option value="NOT_INTERESTED">Not Interested</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="table-header">Name</th>
                <th className="table-header">Contact</th>
                <th className="table-header">Source</th>
                <th className="table-header">Status</th>
                <th className="table-header">Created On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="table-cell font-semibold text-slate-900">
                    {lead.name}
                  </td>
                  <td className="table-cell text-slate-600">
                    <div className="flex flex-col text-xs">
                      <span className="font-medium text-slate-800">{lead.phone}</span>
                      {lead.email && <span className="text-slate-400 text-[11px]">{lead.email}</span>}
                    </div>
                  </td>
                  <td className="table-cell text-slate-600 text-xs font-medium">
                    <span className="capitalize">{lead.source.toLowerCase()}</span>
                  </td>
                  <td className="table-cell">
                    {getStatusPill(lead.status)}
                  </td>
                  <td className="table-cell text-slate-500 text-xs">
                    {lead.createdAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing 1 to {filteredLeads.length} of 25 results</span>
          
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500 disabled:opacity-40">
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

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Lead</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddLead} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Source
                  </label>
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value as LeadSource)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="INSTAGRAM">Instagram</option>
                    <option value="FACEBOOK">Facebook</option>
                    <option value="REFERRAL">Referral</option>
                    <option value="WALK_IN">Walk In</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800"
                  >
                    <option value="NEW">New</option>
                    <option value="CONTACTED">Contacted</option>
                    <option value="INTERESTED">Interested</option>
                    <option value="NOT_INTERESTED">Not Interested</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-outline text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs py-2"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
