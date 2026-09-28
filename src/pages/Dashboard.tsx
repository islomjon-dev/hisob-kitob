import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { getUserReports, getTodayDate } from '../utils/storage';
import { PlusCircle, TrendingUp, FileText, Calendar } from 'lucide-react';

export function DashboardPage() {
  const { user, theme } = useApp();
  
  if (!user) return null;

  const reports = getUserReports(user.id);
  const today = getTodayDate();
  
  const todayReports = reports.filter(r => r.date === today);
  const todayTotal = todayReports.reduce((sum, r) => sum + r.totalAmount, 0);
  const recentReports = reports.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-gradient-to-r from-blue-900 to-blue-700' : 'bg-gradient-to-r from-blue-600 to-blue-500'} text-white`}>
        <h1 className="text-2xl font-bold">Salom, {user.name}!</h1>
        <p className="mt-1 opacity-80">Bugungi hisob-kitoblaringizni boshqaring</p>
        <Link
          to="/create"
          className="mt-4 inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
        >
          <PlusCircle size={20} />
          Yangi hisob-kitob
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText size={20} className="text-blue-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Jami hisob-kitoblar</p>
              <p className="text-xl font-bold">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Bugungi jami</p>
              <p className="text-xl font-bold">{todayTotal.toLocaleString()} {user.settings.currency}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Bugungi soni</p>
              <p className="text-xl font-bold">{todayReports.length}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-5 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-orange-600" />
            </div>
            <div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Umumiy summa</p>
              <p className="text-xl font-bold">{reports.reduce((s, r) => s + r.totalAmount, 0).toLocaleString()} {user.settings.currency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports */}
      <div className={`rounded-2xl ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-lg font-bold">Oxirgi hisob-kitoblar</h2>
          <Link to="/history" className="text-blue-600 text-sm font-medium hover:underline">
            Barchasi →
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <p className={`font-medium ${theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>Hisob-kitoblar mavjud emas</p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>Birinchi hisob-kitobingizni yarating</p>
            <Link
              to="/create"
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 text-white font-medium px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors text-sm"
            >
              <PlusCircle size={16} />
              Yaratish
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-slate-700">
            {recentReports.map(report => (
              <Link
                key={report.id}
                to={`/view/${report.id}`}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <FileText size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{report.title}</p>
                    <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                      {report.date} • {report.items.length} mahsulot
                    </p>
                  </div>
                </div>
                <p className="font-bold text-sm">{report.totalAmount.toLocaleString()} {user.settings.currency}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
