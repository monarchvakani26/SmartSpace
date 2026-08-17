import React, { useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Send, Home, Printer, ArrowLeft, CheckCircle2, FileText, Sparkles } from 'lucide-react';
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
      doc.text('AI INTERIOR PLANNER', 40, 45);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('PREMIUM INTERIOR DESIGN & ESTIMATION STUDIO', 40, 60);

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
      doc.setTextColor(91, 79, 224);
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
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Quotation Preview</h1>
          <p className="text-xs text-slate-500 mt-0.5">Formal client quotation generated from design specifications.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate(`/projects/${id || 'proj-1'}/pricing`)}
            className="btn-outline flex items-center gap-1.5 text-xs py-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Pricing</span>
          </button>

          <button
            onClick={handleSendClient}
            className="btn-outline flex items-center gap-1.5 text-xs py-2 text-primary border-primary/30 hover:bg-primary/5 font-semibold"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send to Client</span>
          </button>

          <button
            onClick={handleDownloadPDF}
            className="btn-primary flex items-center gap-1.5 text-xs py-2 shadow-md shadow-primary/25"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Formal Document Card (Reference Screen 9) */}
      <div ref={quotationRef} className="card !p-8 md:!p-10 space-y-8 bg-white border border-slate-200/90 shadow-xl">
        
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-black tracking-wider text-slate-900 uppercase">
                AI INTERIOR PLANNER
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Design Studio & Estimation Engine
              </div>
            </div>
          </div>

          <div className="text-right">
            <h2 className="text-xl font-black tracking-wider text-slate-900 uppercase">
              QUOTATION
            </h2>
            <p className="text-xs font-bold text-primary mt-0.5">{quoteNumber}</p>
            <p className="text-xs text-slate-400 mt-0.5">Date: {quoteDate}</p>
          </div>
        </div>

        {/* Bill To & Project Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Bill To
            </span>
            <p className="font-bold text-sm text-slate-900">{clientName}</p>
            <p className="text-slate-600 mt-0.5">{clientLocation}</p>
            <p className="text-slate-500 mt-0.5">Ph: {clientContact}</p>
          </div>

          <div className="sm:text-right">
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Project
            </span>
            <p className="font-bold text-sm text-slate-900">{roomName || 'Modern Bedroom'}</p>
            <p className="text-slate-600 mt-0.5">Design ID: PRJ-2024-08</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-y border-slate-200 bg-slate-50/70">
                <th className="py-2.5 px-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Sr. No.</th>
                <th className="py-2.5 px-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Item</th>
                <th className="py-2.5 px-3 text-xs font-bold text-slate-600 uppercase tracking-wider">Description</th>
                <th className="py-2.5 px-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-center">Qty</th>
                <th className="py-2.5 px-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Rate (₹)</th>
                <th className="py-2.5 px-3 text-xs font-bold text-slate-600 uppercase tracking-wider text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {costBreakdown.items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-slate-400 font-semibold">{idx + 1}</td>
                  <td className="py-3 px-3 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 px-3 text-slate-600">{item.description}</td>
                  <td className="py-3 px-3 text-slate-800 text-center font-semibold">{item.quantity}</td>
                  <td className="py-3 px-3 text-slate-700 text-right font-medium">
                    ₹{item.rate.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3 text-slate-900 text-right font-bold">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
              <tr>
                <td className="py-3 px-3 text-slate-400 font-semibold">{costBreakdown.items.length + 1}</td>
                <td className="py-3 px-3 font-bold text-slate-900">Accessories & Handles</td>
                <td className="py-3 px-3 text-slate-600">Lights, Handles, Soft Close Dampers</td>
                <td className="py-3 px-3 text-slate-800 text-center font-semibold">1</td>
                <td className="py-3 px-3 text-slate-700 text-right font-medium">₹10,000</td>
                <td className="py-3 px-3 text-slate-900 text-right font-bold">₹10,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals Block (Bottom Right) */}
        <div className="flex flex-col sm:flex-row justify-between items-start pt-4 border-t border-slate-200 gap-6">
          {/* Terms & Conditions */}
          <div className="max-w-md text-xs text-slate-500 space-y-1.5">
            <p className="font-bold text-slate-800 uppercase tracking-wider">Terms & Conditions</p>
            <p>1. This quotation is valid for 30 days from date of issue.</p>
            <p>2. 50% advance payment required to initiate manufacturing.</p>
            <p>3. Balance payable upon delivery and installation completion.</p>
          </div>

          {/* Subtotal, GST, Total */}
          <div className="w-full sm:w-64 space-y-2 text-xs">
            <div className="flex justify-between py-1 text-slate-600">
              <span>Sub Total</span>
              <span className="font-semibold text-slate-900">
                ₹{costBreakdown.subTotal.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 text-slate-600">
              <span>GST ({costBreakdown.gstPercent}%)</span>
              <span className="font-semibold text-slate-900">
                ₹{costBreakdown.gstAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-2 border-t border-slate-200 text-sm font-black text-primary">
              <span>Total</span>
              <span className="text-base">
                ₹{costBreakdown.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
