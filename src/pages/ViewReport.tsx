import React, { useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getReportById, formatDate } from '../utils/storage';
import { ReportPreview } from '../components/ReportPreview';
import { exportToPNG, exportToJPG, exportToPDF, printReport, generateFilename } from '../utils/export';
import { ArrowLeft, Printer, Edit, Image, FileText } from 'lucide-react';

export function ViewReportPage() {
  const { id } = useParams();
  const { user, addToast, theme } = useApp();
  const navigate = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState('');

  if (!user || !id) return null;

  const report = getReportById(id);
  if (!report || report.userId !== user.id) {
    return (
      <div className="text-center py-20">
        <p className="text-lg font-medium">Hisob-kitob topilmadi</p>
        <Link to="/history" className="mt-4 inline-block text-blue-600 hover:underline">Tarixga qaytish</Link>
      </div>
    );
  }

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setExporting('png');
    try {
      await exportToPNG(previewRef.current, generateFilename(report.title, report.date, 'png'));
      addToast('PNG yuklandi!', 'success');
    } catch {
      addToast('Xatolik', 'error');
    }
    setExporting('');
  };

  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    setExporting('jpg');
    try {
      await exportToJPG(previewRef.current, generateFilename(report.title, report.date, 'jpg'));
      addToast('JPG yuklandi!', 'success');
    } catch {
      addToast('Xatolik', 'error');
    }
    setExporting('');
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setExporting('pdf');
    try {
      await exportToPDF(previewRef.current, generateFilename(report.title, report.date, 'pdf'));
      addToast('PDF yuklandi!', 'success');
    } catch {
      addToast('Xatolik', 'error');
    }
    setExporting('');
  };

  const handlePrint = () => {
    if (!previewRef.current) return;
    printReport(previewRef.current);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-xl ${theme === 'dark' ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">{report.title}</h1>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
              {formatDate(report.date)} • {report.items.length} mahsulot
            </p>
          </div>
        </div>
        <Link
          to={`/create/${report.id}`}
          className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 text-sm"
        >
          <Edit size={16} />
          Tahrirlash
        </Link>
      </div>

      {/* Preview */}
      <div className="flex justify-center">
        <ReportPreview
          ref={previewRef}
          title={report.title}
          date={report.date}
          items={report.items}
          totalAmount={report.totalAmount}
          currency={user.settings.currency}
          template="classic-blue"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={handleExportPNG}
          disabled={!!exporting}
          className={`flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
            theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Image size={18} />
          {exporting === 'png' ? 'Yuklanmoqda...' : 'PNG yuklash'}
        </button>
        <button
          onClick={handleExportJPG}
          disabled={!!exporting}
          className={`flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
            theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Image size={18} />
          {exporting === 'jpg' ? 'Yuklanmoqda...' : 'JPG yuklash'}
        </button>
        <button
          onClick={handleExportPDF}
          disabled={!!exporting}
          className={`flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
            theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FileText size={18} />
          {exporting === 'pdf' ? 'Yuklanmoqda...' : 'PDF yuklash'}
        </button>
        <button
          onClick={handlePrint}
          className={`flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl border transition-colors ${
            theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Printer size={18} />
          Chop etish
        </button>
      </div>
    </div>
  );
}
