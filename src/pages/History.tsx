import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getUserReports, deleteReport, searchReports, filterReportsByDate, sortReports, formatDate } from '../utils/storage';
import { CombinedPreview } from '../components/ReportPreview';
import { exportToPNG, exportToJPG, generateFilename } from '../utils/export';
import { Modal } from '../components/Layout';
import { 
  Search, Filter, Trash2, Eye, Edit, Download, Plus, 
  Merge, Calendar
} from 'lucide-react';

export function HistoryPage() {
  const { user, addToast, theme } = useApp();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [showCombine, setShowCombine] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const combinedRef = useRef<HTMLDivElement>(null);

  if (!user) return null;

  const allReports = getUserReports(user.id);
  let filteredReports = searchReports(allReports, searchQuery);
  filteredReports = filterReportsByDate(filteredReports, dateFilter, { from: customFrom, to: customTo });
  filteredReports = sortReports(filteredReports, sortBy);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = (id: string) => {
    deleteReport(id, user.id);
    addToast('Hisob-kitob o\'chirildi', 'success');
    setDeleteModal(null);
    setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const selectedReports = allReports.filter(r => selectedIds.includes(r.id));
  const combinedTotal = selectedReports.reduce((sum, r) => sum + r.totalAmount, 0);

  const handleExportCombined = async (format: 'png' | 'jpg') => {
    if (!combinedRef.current) return;
    try {
      const filename = `birlashtirilgan-${selectedReports.length}ta-${Date.now()}.${format}`;
      if (format === 'png') {
        await exportToPNG(combinedRef.current, filename);
      } else {
        await exportToJPG(combinedRef.current, filename);
      }
      addToast(`${format.toUpperCase()} yuklandi!`, 'success');
    } catch {
      addToast('Eksportda xatolik', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Tarix</h1>
        <div className="flex items-center gap-2">
          {selectedIds.length >= 2 && (
            <button
              onClick={() => setShowCombine(true)}
              className="flex items-center gap-2 bg-purple-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors text-sm"
            >
              <Merge size={16} />
              Birlashtirish ({selectedIds.length})
            </button>
          )}
          <Link
            to="/create"
            className="flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            <Plus size={16} />
            Yangi
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-400'}`} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200 placeholder-gray-400'
              }`}
              placeholder="Qidirish: sarlavha, mahsulot, sana..."
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters
                ? 'bg-blue-600 text-white border-blue-600'
                : theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filter
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Sana filter</label>
              <select
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                <option value="all">Barchasi</option>
                <option value="today">Bugun</option>
                <option value="yesterday">Kecha</option>
                <option value="7days">Oxirgi 7 kun</option>
                <option value="30days">Oxirgi 30 kun</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            {dateFilter === 'custom' && (
              <>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Dan</label>
                  <input type="date" value={customFrom} onChange={e => setCustomFrom(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Gacha</label>
                  <input type="date" value={customTo} onChange={e => setCustomTo(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`} />
                </div>
              </>
            )}
            <div>
              <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Saralash</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm ${theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'}`}
              >
                <option value="newest">Yangi → Eski</option>
                <option value="oldest">Eski → Yangi</option>
                <option value="amount_desc">Summa ↓</option>
                <option value="amount_asc">Summa ↑</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className={`rounded-2xl p-10 text-center ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} shadow-sm`}>
          <Calendar size={40} className={`mx-auto mb-4 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-300'}`} />
          <p className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
            {searchQuery || dateFilter !== 'all' ? 'Natija topilmadi' : 'Hisob-kitoblar mavjud emas'}
          </p>
          {!searchQuery && dateFilter === 'all' && (
            <Link to="/create" className="mt-3 inline-flex items-center gap-2 text-blue-600 font-medium text-sm hover:underline">
              <Plus size={16} />
              Birinchi hisob-kitobni yarating
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map(report => (
            <div
              key={report.id}
              className={`rounded-2xl p-4 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-gray-100 hover:border-gray-200'} border shadow-sm transition-colors`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(report.id)}
                  onChange={() => toggleSelect(report.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold truncate">{report.title}</h3>
                      <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                        {formatDate(report.date)} • {report.items.length} mahsulot
                      </p>
                    </div>
                    <p className="font-bold text-lg whitespace-nowrap">{report.totalAmount.toLocaleString()} {user.settings.currency}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Link
                      to={`/view/${report.id}`}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Eye size={14} /> Ko'rish
                    </Link>
                    <Link
                      to={`/create/${report.id}`}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                        theme === 'dark' ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Edit size={14} /> Tahrirlash
                    </Link>
                    <button
                      onClick={() => setDeleteModal(report.id)}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} /> O'chirish
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Modal */}
      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="O'chirish">
        <p className={`mb-4 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
          Bu hisob-kitobni o'chirishni xohlaysizmi? Bu amalni qaytarib bo'lmaydi.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setDeleteModal(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium ${theme === 'dark' ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-700'}`}
          >
            Bekor qilish
          </button>
          <button
            onClick={() => deleteModal && handleDelete(deleteModal)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700"
          >
            O'chirish
          </button>
        </div>
      </Modal>

      {/* Combine Modal */}
      <Modal isOpen={showCombine} onClose={() => setShowCombine(false)} title="Birlashtirilgan hisob-kitob">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-blue-50'}`}>
            <p className="text-sm font-medium">Tanlangan: {selectedReports.length} ta hisob-kitob</p>
            <p className="text-lg font-bold text-blue-600 mt-1">JAMI: {combinedTotal.toLocaleString()} {user.settings.currency}</p>
          </div>

          <div ref={combinedRef}>
            <CombinedPreview
              reports={selectedReports}
              currency={user.settings.currency}
              template="classic-blue"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleExportCombined('png')}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 text-sm"
            >
              <Download size={16} /> PNG
            </button>
            <button
              onClick={() => handleExportCombined('jpg')}
              className={`flex-1 flex items-center justify-center gap-2 font-medium px-4 py-2.5 rounded-xl border text-sm ${
                theme === 'dark' ? 'border-slate-600 text-slate-300' : 'border-gray-200 text-gray-700'
              }`}
            >
              <Download size={16} /> JPG
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
