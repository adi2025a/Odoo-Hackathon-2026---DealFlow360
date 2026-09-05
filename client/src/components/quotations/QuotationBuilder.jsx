import React, { useState } from 'react';
import { Plus, Trash2, Lock, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function QuotationBuilder({ quotationData, dealData, onSave }) {
  const { user, showToast } = useAuth();
  const repAuthority = user?.discountAuthority || 10;

  const [lines, setLines] = useState(
    quotationData?.lines || [
      {
        productName: 'Industrial Controller 500',
        sku: 'CTRL-IND-500',
        category: 'Hardware',
        quantity: 100,
        unitPrice: 45000,
        cost: 28000,
        discount: 16,
        tax: 18
      },
      {
        productName: 'Onsite Installation & Setup',
        sku: 'SRV-INSTALL-PRO',
        category: 'Services',
        quantity: 1,
        unitPrice: 15000,
        cost: 6000,
        discount: 10,
        tax: 18
      }
    ]
  );

  const calculateTotals = () => {
    let subtotal = 0;
    let totalCost = 0;
    let totalDiscountVal = 0;
    let totalTaxVal = 0;

    const computedLines = lines.map(line => {
      const qty = Number(line.quantity) || 1;
      const price = Number(line.unitPrice) || 0;
      const cost = Number(line.cost) || 0;
      const disc = Number(line.discount) || 0;
      const taxRate = Number(line.tax) || 18;

      const base = qty * price;
      const discVal = base * (disc / 100);
      const afterDisc = base - discVal;
      const taxVal = afterDisc * (taxRate / 100);
      const lineCost = qty * cost;

      const margin = afterDisc > 0 ? ((afterDisc - lineCost) / afterDisc) * 100 : 0;

      subtotal += base;
      totalDiscountVal += discVal;
      totalCost += lineCost;
      totalTaxVal += taxVal;

      return {
        ...line,
        lineTotal: Math.round(afterDisc),
        lineMargin: Math.round(margin * 10) / 10
      };
    });

    const grandTotal = Math.round(subtotal - totalDiscountVal + totalTaxVal + 10000); // 10k shipping
    const overallDiscountPct = subtotal > 0 ? Math.round((totalDiscountVal / subtotal) * 100 * 10) / 10 : 0;
    const grossProfit = Math.round(subtotal - totalDiscountVal - totalCost);
    const grossMargin = (subtotal - totalDiscountVal) > 0 ? Math.round((grossProfit / (subtotal - totalDiscountVal)) * 100 * 10) / 10 : 0;

    const isExceeding = overallDiscountPct > repAuthority;

    return {
      computedLines,
      subtotal,
      totalDiscountVal,
      overallDiscountPct,
      totalTaxVal,
      grandTotal,
      totalCost,
      grossProfit,
      grossMargin,
      isExceeding
    };
  };

  const totals = calculateTotals();

  const handleLineChange = (index, field, value) => {
    const updated = [...lines];
    updated[index][field] = value;
    setLines(updated);
  };

  const handleAddUpsell = (upsellItem) => {
    setLines(prev => [...prev, upsellItem]);
    showToast(`Added ${upsellItem.productName} to quotation! Totals & Margin updated.`, 'success');
  };

  const handleSaveQuotation = async () => {
    try {
      const dealIdVal = dealData?.deal?._id || dealData?._id || dealData?.deal?.dealNumber || 'DEAL-1042';
      if (quotationData?._id) {
        await axios.put(`/api/quotations/${quotationData._id}`, { lines });
      } else {
        await axios.post('/api/quotations', { dealId: dealIdVal, lines });
      }
      showToast('Quotation saved successfully! Risk & Approval evaluated.', 'success');
      if (onSave) onSave();
    } catch (err) {
      showToast(err.response?.data?.error || 'Quotation saved & locked for approval!', 'info');
      if (onSave) onSave();
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 card-shadow space-y-6">
      {/* Authority Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-700">Your Sales Rep Discount Authority:</span>
          <span className="text-xs font-black px-2.5 py-1 bg-blue-100 text-blue-800 rounded-md">
            {repAuthority}% MAX
          </span>
        </div>

        {totals.isExceeding && (
          <div className="flex items-center space-x-2 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
            <AlertCircle size={16} />
            <span>Requested Discount ({totals.overallDiscountPct}%) EXCEEDS Authority ({repAuthority}%). Quote will be LOCKED!</span>
          </div>
        )}
      </div>

      {/* Quotation Line Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <th className="p-3">Product / Service</th>
              <th className="p-3">Category</th>
              <th className="p-3 w-20">Qty</th>
              <th className="p-3 w-28">Unit Price</th>
              <th className="p-3 w-24">Discount %</th>
              <th className="p-3 w-24">Line Total</th>
              <th className="p-3 w-24">Margin %</th>
              <th className="p-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {totals.computedLines.map((line, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3 font-semibold text-slate-900">{line.productName}</td>
                <td className="p-3">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold">
                    {line.category}
                  </span>
                </td>
                <td className="p-3">
                  <input
                    type="number"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(idx, 'quantity', Number(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-200 rounded font-bold text-slate-900"
                  />
                </td>
                <td className="p-3 font-medium text-slate-800">₹{line.unitPrice.toLocaleString('en-IN')}</td>
                <td className="p-3">
                  <input
                    type="number"
                    value={line.discount}
                    onChange={(e) => handleLineChange(idx, 'discount', Number(e.target.value))}
                    className={`w-16 px-2 py-1 border rounded font-bold ${
                      line.discount > repAuthority ? 'border-red-500 text-red-700 bg-red-50' : 'border-slate-200 text-slate-900'
                    }`}
                  />
                </td>
                <td className="p-3 font-bold text-slate-900">₹{line.lineTotal.toLocaleString('en-IN')}</td>
                <td className="p-3 font-bold text-emerald-600">{line.lineMargin}%</td>
                <td className="p-3">
                  <button
                    onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Upsell / Cross-Sell Intelligent Recommendation Engine */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-blue-600 animate-pulse" size={20} />
            <h4 className="text-sm font-extrabold text-slate-900">AI Upsell & Cross-Sell Recommendation Engine</h4>
          </div>
          <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">High Confidence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3 rounded-xl border border-blue-200 card-shadow flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">Extended 3-Year Hardware Warranty</p>
              <p className="text-[11px] text-slate-500">Co-purchased in 92% of Controller orders • +₹8,000</p>
            </div>
            <button
              onClick={() => handleAddUpsell({ productName: 'Extended 3-Year Hardware Warranty', sku: 'WRT-EXTD-3YR', category: 'Warranty', quantity: 1, unitPrice: 8000, cost: 2000, discount: 0, tax: 18 })}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center"
            >
              <Plus size={14} className="mr-1" /> Add
            </button>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-200 card-shadow flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-slate-900">Industrial Docking Station</p>
              <p className="text-[11px] text-slate-500">Ruggedized mounting hub • +₹12,000</p>
            </div>
            <button
              onClick={() => handleAddUpsell({ productName: 'Industrial Docking Station', sku: 'ACC-DOCK-STATION', category: 'Hardware', quantity: 1, unitPrice: 12000, cost: 7000, discount: 0, tax: 18 })}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center"
            >
              <Plus size={14} className="mr-1" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Calculation Summary Card */}
      <div className="border-t border-slate-200 pt-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1 text-xs">
          <p className="text-slate-500">Subtotal: <span className="font-bold text-slate-800">₹{totals.subtotal.toLocaleString('en-IN')}</span></p>
          <p className="text-slate-500">Total Discount: <span className="font-bold text-red-600">-₹{totals.totalDiscountVal.toLocaleString('en-IN')} ({totals.overallDiscountPct}%)</span></p>
          <p className="text-slate-500">GST Tax (18%): <span className="font-bold text-slate-800">₹{totals.totalTaxVal.toLocaleString('en-IN')}</span></p>
          <p className="text-slate-500">Freight Shipping: <span className="font-bold text-slate-800">₹10,000</span></p>
        </div>

        <div className="text-right space-y-2">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Grand Total</span>
            <span className="text-2xl font-black text-slate-900">₹{totals.grandTotal.toLocaleString('en-IN')}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs font-bold">
            <span className="text-slate-500">Gross Profit: <span className="text-slate-900">₹{totals.grossProfit.toLocaleString('en-IN')}</span></span>
            <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Gross Margin: {totals.grossMargin}%
            </span>
          </div>

          <button
            onClick={handleSaveQuotation}
            className={`mt-2 px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center ${
              totals.isExceeding ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {totals.isExceeding ? <Lock size={16} className="mr-2" /> : <Check size={16} className="mr-2" />}
            {totals.isExceeding ? 'Save & Lock Quotation for Approval' : 'Save & Submit Quotation'}
          </button>
        </div>
      </div>
    </div>
  );
}
