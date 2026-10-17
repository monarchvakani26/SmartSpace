import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Send, ArrowLeft } from 'lucide-react';
import { useLayoutStore } from '../stores/useLayoutStore';
import { apiService } from '../services/api';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export const QuotationPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, roomName, pricingSettings } = useLayoutStore();
  const quotationRef = useRef<HTMLDivElement>(null);

  const costBreakdown = apiService.calculateCost(items, pricingSettings);
  const quoteNumber = `HQTH-2024-0012`;
  const quoteDate = `20 May 2024`;
  const clientName = `Rohan Mehta`;
  const clientLocation = `Mumbai, Maharashtra`;
  const clientContact = `9876543210`;

  // Real jsPDF document generation
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
      });

      // Header
      doc.setFillColor(15, 22, 41); // #0F1629
      doc.rect(0, 0, 595, 80, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('SMARTSPACE', 40, 45);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('INTERIOR STUDIO & ESTIMATION', 40, 60);

      doc.setFontSize(16);
      doc.text('QUOTATION', 450, 45);
      doc.setFontSize(9);
      doc.text(`Ref: ${quoteNumber}`, 450, 60);
      doc.text(`Date: ${quoteDate}`, 450, 72);

      // Bill To & Project Info
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 40, 115);
      doc.setFont('helvetica', 'normal');
      doc.text(clientName, 40, 130);
      doc.text(clientLocation, 40, 145);
      doc.text(`Contact: ${clientContact}`, 40, 160);

      doc.setFont('helvetica', 'bold');
      doc.text('PROJECT DETAILS:', 340, 115);
      doc.setFont('helvetica', 'normal');
      doc.text(`Project: ${roomName || 'Modern Bedroom'}`, 340, 130);
      doc.text('Type: Parametric 2D/3D Design', 340, 145);
      doc.text('Status: Approved & Costed', 340, 160);

      // Table Header
      let y = 195;
      doc.setFillColor(245, 246, 250);
      doc.rect(40, y, 515, 24, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(70, 70, 70);
      doc.text('Sr.', 48, y + 16);
      doc.text('Item & Description', 85, y + 16);
      doc.text('Qty', 330, y + 16);
      doc.text('Rate (INR)', 380, y + 16);
      doc.text('Amount (INR)', 470, y + 16);

      // Table Rows
      y += 30;
      doc.setFont('helvetica', 'normal');
      costBreakdown.items.forEach((item, index) => {
        doc.text(`${index + 1}`, 48, y);
        doc.text(`${item.description}`, 85, y);
        doc.text(`${item.quantity}`, 335, y);
        doc.text(`₹${item.rate.toLocaleString('en-IN')}`, 380, y);
        doc.text(`₹${item.amount.toLocaleString('en-IN')}`, 470, y);
        y += 22;
      });

      // Extra accessory row
      doc.text(`${costBreakdown.items.length + 1}`, 48, y);
      doc.text(`Hardware, Joinery & Finishes`, 85, y);
      doc.text(`1`, 335, y);
      doc.text(`₹10,000`, 380, y);
      doc.text(`₹10,000`, 470, y);
      y += 30;

      // Divider
      doc.setDrawColor(220, 220, 220);
      doc.line(40, y, 555, y);
      y += 20;

      // Totals
      doc.setFont('helvetica', 'normal');
      doc.text('Sub Total:', 380, y);
      doc.text(`₹${costBreakdown.subTotal.toLocaleString('en-IN')}`, 470, y);
      y += 18;

      doc.text(`GST (${costBreakdown.gstPercent}%):`, 380, y);
      doc.text(`₹${costBreakdown.gstAmount.toLocaleString('en-IN')}`, 470, y);
      y += 22;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(44, 74, 62);
      doc.text('Total Amount:', 380, y);
      doc.text(`₹${costBreakdown.totalAmount.toLocaleString('en-IN')}`, 470, y);
      y += 40;

      // Terms & Conditions
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Terms & Conditions:', 40, y);
      doc.setFont('helvetica', 'normal');
      y += 15;
      doc.text('1. This quotation is valid for 30 calendar days from issue date.', 40, y);
      y += 14;
      doc.text('2. 50% advance payment required to confirm and initiate procurement.', 40, y);
      y += 14;
      doc.text('3. Site handover and delivery subject to standard civil tolerances.', 40, y);

      doc.save(`Quotation_${quoteNumber}.pdf`);
      toast.success('Quotation PDF generated & downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Could not generate PDF');
    }
  };

  const handleSendClient = () => {
    toast.success(`Quotation sent to client at ${clientContact}!`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-space-rise">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted mb-2">Document</p>
          <h1 className="font-display text-4xl text-ink tracking-tight">Quotation</h1>
          <p className="text-sm text-ink-muted mt-2">Client-ready sheet from the studio layout.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => navigate(`/projects/${id || 'proj-1'}/pricing`)} className="btn-outline flex items-center gap-1.5 text-xs">
            <ArrowLeft className="w-4 h-4" /> Pricing
          </button>
          <button onClick={handleSendClient} className="btn-outline flex items-center gap-1.5 text-xs text-primary border-primary/30">
            <Send className="w-3.5 h-3.5" /> Send
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" /> PDF
          </button>
        </div>
      </div>

      <div ref={quotationRef} className="bg-surface-card border border-surface-border p-8 md:p-10 space-y-8 shadow-card-hover">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-surface-border">
          <div>
            <p className="font-display text-2xl text-ink">SmartSpace</p>
            <p className="text-[11px] text-ink-muted font-medium mt-0.5">Interior studio · Estimation</p>
          </div>
          <div className="sm:text-right">
            <h2 className="font-display text-2xl text-ink">Quotation</h2>
            <p className="text-xs font-bold text-primary mt-0.5">{quoteNumber}</p>
            <p className="text-xs text-ink-muted mt-0.5">{quoteDate}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-ink-muted uppercase tracking-[0.12em] block mb-1">Bill to</span>
            <p className="font-semibold text-sm text-ink">{clientName}</p>
            <p className="text-ink-muted mt-0.5">{clientLocation}</p>
            <p className="text-ink-muted mt-0.5">Ph: {clientContact}</p>
          </div>
          <div className="sm:text-right">
            <span className="font-bold text-ink-muted uppercase tracking-[0.12em] block mb-1">Project</span>
            <p className="font-semibold text-sm text-ink">{roomName || 'Modern Bedroom'}</p>
            <p className="text-ink-muted mt-0.5">PRJ-2024-08</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-surface-border bg-plaster/40">
                <th className="py-2.5 px-3 text-[11px] font-bold text-ink-muted uppercase tracking-[0.1em]">#</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-ink-muted uppercase tracking-[0.1em]">Item</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-ink-muted uppercase tracking-[0.1em]">Description</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-ink-muted uppercase tracking-[0.1em] text-center">Qty</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-ink-muted uppercase tracking-[0.1em] text-right">Rate</th>
                <th className="py-2.5 px-3 text-[11px] font-bold text-ink-muted uppercase tracking-[0.1em] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/70 text-xs">
              {costBreakdown.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3 px-3 text-ink-muted font-semibold">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-ink">{item.name}</td>
                  <td className="py-3 px-3 text-ink-muted">{item.description}</td>
                  <td className="py-3 px-3 text-center font-semibold">{item.quantity}</td>
                  <td className="py-3 px-3 text-right">₹{item.rate.toLocaleString('en-IN')}</td>
                  <td className="py-3 px-3 text-right font-bold">₹{item.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
              <tr>
                <td className="py-3 px-3 text-ink-muted font-semibold">{costBreakdown.items.length + 1}</td>
                <td className="py-3 px-3 font-bold text-ink">Accessories & handles</td>
                <td className="py-3 px-3 text-ink-muted">Hardware, soft-close, fittings</td>
                <td className="py-3 px-3 text-center font-semibold">1</td>
                <td className="py-3 px-3 text-right">₹10,000</td>
                <td className="py-3 px-3 text-right font-bold">₹10,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-surface-border gap-6">
          <div className="max-w-md text-xs text-ink-muted space-y-1.5">
            <p className="font-bold text-ink uppercase tracking-[0.12em]">Terms</p>
            <p>1. Valid for 30 days from issue.</p>
            <p>2. 50% advance to start manufacturing.</p>
            <p>3. Balance on delivery and installation.</p>
          </div>
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between py-1 text-ink-muted">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">₹{costBreakdown.subTotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-1 text-ink-muted">
              <span>GST ({costBreakdown.gstPercent}%)</span>
              <span className="font-semibold text-ink">₹{costBreakdown.gstAmount.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between py-2 border-t border-surface-border font-display text-xl text-primary">
              <span>Total</span>
              <span>₹{costBreakdown.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
