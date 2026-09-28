import React, { forwardRef } from 'react';
import { Report, formatCurrency, formatDate } from '../utils/storage';

interface ReportPreviewProps {
  title: string;
  date: string;
  items: { productName: string; size: string; quantity: number; price: number; total: number }[];
  totalAmount: number;
  currency?: string;
  template?: 'classic-blue' | 'minimal-white' | 'dark-professional';
}

export const ReportPreview = forwardRef<HTMLDivElement, ReportPreviewProps>(
  ({ title, date, items, totalAmount, currency = "so'm", template = 'classic-blue' }, ref) => {
    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          return `${parts[2]}.${parts[1]}.${parts[0].slice(-2)}`;
        }
        return dateStr;
      }
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    };

    const templates = {
      'classic-blue': {
        headerBg: 'bg-gradient-to-r from-blue-900 to-blue-700',
        headerText: 'text-white',
        bodyBg: 'bg-white',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-600',
        tableHeaderBg: 'bg-blue-50',
        tableHeaderText: 'text-blue-900',
        tableRowEven: 'bg-white',
        tableRowOdd: 'bg-blue-50/30',
        footerBg: 'bg-blue-900',
        footerText: 'text-white',
        borderColor: 'border-blue-200',
        accentColor: 'text-blue-600',
      },
      'minimal-white': {
        headerBg: 'bg-gray-900',
        headerText: 'text-white',
        bodyBg: 'bg-white',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        tableHeaderBg: 'bg-gray-50',
        tableHeaderText: 'text-gray-900',
        tableRowEven: 'bg-white',
        tableRowOdd: 'bg-gray-50/50',
        footerBg: 'bg-gray-900',
        footerText: 'text-white',
        borderColor: 'border-gray-200',
        accentColor: 'text-gray-700',
      },
      'dark-professional': {
        headerBg: 'bg-slate-800',
        headerText: 'text-white',
        bodyBg: 'bg-slate-900',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-400',
        tableHeaderBg: 'bg-slate-800',
        tableHeaderText: 'text-slate-200',
        tableRowEven: 'bg-slate-900',
        tableRowOdd: 'bg-slate-800/50',
        footerBg: 'bg-blue-600',
        footerText: 'text-white',
        borderColor: 'border-slate-700',
        accentColor: 'text-blue-400',
      },
    };

    const t = templates[template];

    return (
      <div ref={ref} className={`w-full max-w-[600px] mx-auto rounded-2xl overflow-hidden shadow-xl ${t.bodyBg}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <div className={`${t.headerBg} ${t.headerText} px-6 py-5 text-center`}>
          <div className="w-12 h-1 bg-white/30 rounded mx-auto mb-3"></div>
          <h1 className="text-2xl font-bold tracking-tight">{title || 'Sarlavha'}</h1>
          <div className="w-12 h-1 bg-white/30 rounded mx-auto mt-3"></div>
        </div>

        {/* Date */}
        <div className={`px-6 py-3 text-right ${t.textSecondary} text-sm border-b ${t.borderColor}`}>
          Sana: <span className={`font-semibold ${t.textPrimary}`}>{formatDateStr(date)}</span>
        </div>

        {/* Table */}
        <div className="px-4 py-3">
          <table className="w-full text-sm">
            <thead>
              <tr className={`${t.tableHeaderBg} ${t.tableHeaderText}`}>
                <th className="px-3 py-2.5 text-left font-semibold rounded-l-lg w-8">№</th>
                <th className="px-3 py-2.5 text-left font-semibold">Mahsulot</th>
                <th className="px-3 py-2.5 text-center font-semibold">Hajmi</th>
                <th className="px-3 py-2.5 text-center font-semibold">Miqdor × Narx</th>
                <th className="px-3 py-2.5 text-right font-semibold rounded-r-lg">Jami</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? t.tableRowEven : t.tableRowOdd} ${t.textPrimary}`}>
                  <td className="px-3 py-2.5 font-medium">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-medium">{item.productName || '-'}</td>
                  <td className="px-3 py-2.5 text-center">{item.size || '-'}</td>
                  <td className="px-3 py-2.5 text-center">{item.quantity} × {item.price.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-semibold">{item.total.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer - Total */}
        <div className={`${t.footerBg} ${t.footerText} px-6 py-5 text-center`}>
          <p className="text-sm font-medium opacity-80 mb-1">JAMI</p>
          <p className="text-3xl font-bold tracking-tight">
            {totalAmount.toLocaleString()} <span className="text-lg font-medium opacity-80">{currency}</span>
          </p>
        </div>
      </div>
    );
  }
);

ReportPreview.displayName = 'ReportPreview';

// Combined Report Preview
interface CombinedPreviewProps {
  reports: Report[];
  currency?: string;
  template?: 'classic-blue' | 'minimal-white' | 'dark-professional';
}

export const CombinedPreview = forwardRef<HTMLDivElement, CombinedPreviewProps>(
  ({ reports, currency = "so'm", template = 'classic-blue' }, ref) => {
    const formatDateStr = (dateStr: string) => {
      if (!dateStr) return '';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      return `${day}.${month}.${year}`;
    };

    const combinedTotal = reports.reduce((sum, r) => sum + r.totalAmount, 0);

    const templates: Record<string, any> = {
      'classic-blue': {
        headerBg: 'bg-gradient-to-r from-blue-900 to-blue-700',
        bodyBg: 'bg-white',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-600',
        tableHeaderBg: 'bg-blue-50',
        tableHeaderText: 'text-blue-900',
        footerBg: 'bg-blue-900',
        footerText: 'text-white',
        borderColor: 'border-blue-200',
        grandFooterBg: 'bg-gradient-to-r from-blue-800 to-blue-600',
      },
      'minimal-white': {
        headerBg: 'bg-gray-900',
        bodyBg: 'bg-white',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-500',
        tableHeaderBg: 'bg-gray-50',
        tableHeaderText: 'text-gray-900',
        footerBg: 'bg-gray-900',
        footerText: 'text-white',
        borderColor: 'border-gray-200',
        grandFooterBg: 'bg-gray-900',
      },
      'dark-professional': {
        headerBg: 'bg-slate-800',
        bodyBg: 'bg-slate-900',
        textPrimary: 'text-slate-100',
        textSecondary: 'text-slate-400',
        tableHeaderBg: 'bg-slate-800',
        tableHeaderText: 'text-slate-200',
        footerBg: 'bg-blue-600',
        footerText: 'text-white',
        borderColor: 'border-slate-700',
        grandFooterBg: 'bg-blue-600',
      },
    };

    const t = templates[template];

    return (
      <div ref={ref} className={`w-full max-w-[800px] mx-auto rounded-2xl overflow-hidden shadow-xl ${t.bodyBg}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        {/* Header */}
        <div className={`${t.headerBg} text-white px-6 py-5 text-center`}>
          <div className="w-12 h-1 bg-white/30 rounded mx-auto mb-3"></div>
          <h1 className="text-2xl font-bold">{reports[0]?.title || 'Birlashtirilgan hisob-kitob'}</h1>
          <div className="w-12 h-1 bg-white/30 rounded mx-auto mt-3"></div>
        </div>

        {/* Reports */}
        <div className={`p-4 ${reports.length > 2 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-wrap gap-4 justify-center'}`}>
          {reports.map((report, rIdx) => (
            <div key={report.id} className={`flex-1 min-w-[280px] rounded-xl border ${t.borderColor} overflow-hidden`}>
              <div className={`px-4 py-2 text-center ${t.textSecondary} text-sm border-b ${t.borderColor}`}>
                {formatDateStr(report.date)}
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className={`${t.tableHeaderBg} ${t.tableHeaderText}`}>
                    <th className="px-2 py-2 text-left">№</th>
                    <th className="px-2 py-2 text-left">Mahsulot</th>
                    <th className="px-2 py-2 text-center">Miqdor×Narx</th>
                    <th className="px-2 py-2 text-right">Jami</th>
                  </tr>
                </thead>
                <tbody>
                  {report.items.map((item, idx) => (
                    <tr key={idx} className={`${t.textPrimary} ${idx % 2 === 0 ? '' : 'bg-black/[0.02]'}`}>
                      <td className="px-2 py-1.5">{idx + 1}</td>
                      <td className="px-2 py-1.5 font-medium">{item.productName}</td>
                      <td className="px-2 py-1.5 text-center">{item.quantity}×{item.price}</td>
                      <td className="px-2 py-1.5 text-right font-semibold">{item.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={`px-4 py-2 text-right font-bold ${t.textPrimary} border-t ${t.borderColor}`}>
                {report.totalAmount.toLocaleString()} {currency}
              </div>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className={`${t.grandFooterBg} text-white px-6 py-5 text-center`}>
          <p className="text-sm font-medium opacity-80 mb-1">IKKI KUNLIK JAMI</p>
          <p className="text-3xl font-bold">
            {combinedTotal.toLocaleString()} <span className="text-lg font-medium opacity-80">{currency}</span>
          </p>
        </div>
      </div>
    );
  }
);

CombinedPreview.displayName = 'CombinedPreview';
