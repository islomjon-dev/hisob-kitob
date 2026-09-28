import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { ReportItem, getTodayDate, calculateRowTotal, calculateGrandTotal, validateReport, createReport, getReportById, updateReport, generateId } from '../utils/storage';
import { ReportPreview } from '../components/ReportPreview';
import { exportToPNG, exportToJPG, exportToPDF, printReport, generateFilename } from '../utils/export';
import { Plus, Trash2, Save, Printer, Image, FileText } from 'lucide-react';

export function CreatePage() {
  const { user, addToast, theme } = useApp();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(getTodayDate());
  const [items, setItems] = useState<ReportItem[]>([
    { id: generateId(), productName: '', size: '', quantity: 1, price: 0, total: 0 }
  ]);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState('');
  const [template, setTemplate] = useState<'classic-blue' | 'minimal-white' | 'dark-professional'>('classic-blue');
  const [errors, setErrors] = useState<string[]>([]);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.settings.defaultTitle) {
      setTitle(user.settings.defaultTitle);
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && user) {
      const report = getReportById(id!);
      if (report && report.userId === user.id) {
        setTitle(report.title);
        setDate(report.date);
        setItems(report.items);
      } else {
        addToast('Hisob-kitob topilmadi', 'error');
        navigate('/history');
      }
    }
  }, [isEditing, id, user]);

  if (!user) return null;

  const addItem = () => {
    setItems([...items, { id: generateId(), productName: '', size: '', quantity: 1, price: 0, total: 0 }]);
  };

  const removeItem = (itemId: string) => {
    if (items.length <= 1) {
      addToast('Kamida 1 ta mahsulot bo\'lishi kerak', 'error');
      return;
    }
    setItems(items.filter(i => i.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof ReportItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id !== itemId) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'price') {
        updated.total = calculateRowTotal(updated.quantity, updated.price);
      }
      return updated;
    }));
  };

  const totalAmount = calculateGrandTotal(items);

  const handleSave = async () => {
    const error = validateReport(title, date, items);
    if (error) {
      setErrors([error]);
      addToast(error, 'error');
      return;
    }
    setErrors([]);
    setSaving(true);

    setTimeout(() => {
      try {
        if (isEditing) {
          updateReport(id!, user.id, { title, date, items });
          addToast('Hisob-kitob yangilandi!', 'success');
        } else {
          createReport(user.id, title, date, items);
          addToast('Hisob-kitob saqlandi!', 'success');
        }
        navigate('/history');
      } catch {
        addToast('Xatolik yuz berdi', 'error');
      }
      setSaving(false);
    }, 300);
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setExporting('png');
    try {
      await exportToPNG(previewRef.current, generateFilename(title, date, 'png'));
      addToast('PNG yuklandi!', 'success');
    } catch {
      addToast('PNG eksportida xatolik', 'error');
    }
    setExporting('');
  };

  const handleExportJPG = async () => {
    if (!previewRef.current) return;
    setExporting('jpg');
    try {
      await exportToJPG(previewRef.current, generateFilename(title, date, 'jpg'));
      addToast('JPG yuklandi!', 'success');
    } catch {
      addToast('JPG eksportida xatolik', 'error');
    }
    setExporting('');
  };

  const handleExportPDF = async () => {
    if (!previewRef.current) return;
    setExporting('pdf');
    try {
      await exportToPDF(previewRef.current, generateFilename(title, date, 'pdf'));
      addToast('PDF yuklandi!', 'success');
    } catch {
      addToast('PDF eksportida xatolik', 'error');
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
        <h1 className="text-2xl font-bold">{isEditing ? 'Tahrirlash' : 'Yangi hisob-kitob'}</h1>
        <div className="flex items-center gap-2">
          <select
            value={template}
            onChange={e => setTemplate(e.target.value as any)}
            className={`px-3 py-2 rounded-xl border text-sm ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200'}`}
          >
            <option value="classic-blue">Classic Blue</option>
            <option value="minimal-white">Minimal White</option>
            <option value="dark-professional">Dark Professional</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  Sarlavha *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                  placeholder="Masalan: Akmalhon sinifdosh"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
                  Sana *
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Mahsulotlar</h3>
              <button
                onClick={addItem}
                className="flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-3 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Qo'shish
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={item.id} className={`p-3 rounded-xl border ${theme === 'dark' ? 'border-slate-600 bg-slate-700/50' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>#{idx + 1}</span>
                    {items.length > 1 && (
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    <div className="col-span-2 sm:col-span-2">
                      <input
                        type="text"
                        value={item.productName}
                        onChange={e => updateItem(item.id, 'productName', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-200 placeholder-gray-400'
                        }`}
                        placeholder="Mahsulot nomi"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        value={item.size}
                        onChange={e => updateItem(item.id, 'size', e.target.value)}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-200 placeholder-gray-400'
                        }`}
                        placeholder="Hajmi"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.quantity || ''}
                        onChange={e => updateItem(item.id, 'quantity', Math.max(0, Number(e.target.value)))}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-200 placeholder-gray-400'
                        }`}
                        placeholder="Miqdor"
                        min="0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.price || ''}
                        onChange={e => updateItem(item.id, 'price', Math.max(0, Number(e.target.value)))}
                        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-500' : 'bg-white border-gray-200 placeholder-gray-400'
                        }`}
                        placeholder="Narx"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className={`mt-2 text-right text-sm font-semibold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    Jami: {item.total.toLocaleString()} {user.settings.currency}
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className={`mt-4 p-4 rounded-xl ${theme === 'dark' ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-100'} border`}>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Umumiy summa:</span>
                <span className="text-xl font-bold text-blue-600">{totalAmount.toLocaleString()} {user.settings.currency}</span>
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              {errors.map((err, i) => (
                <p key={i} className="text-red-700 text-sm">{err}</p>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Saqlanmoqda...' : isEditing ? 'Yangilash' : 'Saqlash'}
            </button>
            <button
              onClick={handleExportPNG}
              disabled={!!exporting}
              className={`flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
                theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Image size={18} />
              {exporting === 'png' ? 'Yuklanmoqda...' : 'PNG'}
            </button>
            <button
              onClick={handleExportJPG}
              disabled={!!exporting}
              className={`flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
                theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Image size={18} />
              {exporting === 'jpg' ? 'Yuklanmoqda...' : 'JPG'}
            </button>
            <button
              onClick={handleExportPDF}
              disabled={!!exporting}
              className={`flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl border transition-colors disabled:opacity-50 ${
                theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <FileText size={18} />
              {exporting === 'pdf' ? 'Yuklanmoqda...' : 'PDF'}
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

        {/* Preview */}
        <div className="space-y-3">
          <h3 className={`font-semibold text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
            LIVE PREVIEW
          </h3>
          <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm overflow-auto`}>
            <ReportPreview
              ref={previewRef}
              title={title || 'Sarlavha'}
              date={date}
              items={items}
              totalAmount={totalAmount}
              currency={user.settings.currency}
              template={template}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
