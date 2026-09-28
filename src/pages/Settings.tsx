import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { updateUserSettings } from '../utils/storage';

export function SettingsPage() {
  const { user, setUser, addToast, theme } = useApp();
  
  if (!user) return null;

  const [defaultTitle, setDefaultTitle] = useState(user.settings.defaultTitle || '');
  const [currency, setCurrency] = useState(user.settings.currency || "so'm");
  const [dateFormat, setDateFormat] = useState(user.settings.dateFormat || 'DD.MM.YY');

  const handleSave = () => {
    updateUserSettings(user.id, { defaultTitle, currency, dateFormat });
    setUser({ ...user, settings: { ...user.settings, defaultTitle, currency, dateFormat } });
    addToast('Sozlamalar saqlandi!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Sozlamalar</h1>

      <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm space-y-5`}>
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            Default sarlavha
          </label>
          <input
            type="text"
            value={defaultTitle}
            onChange={e => setDefaultTitle(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' : 'bg-gray-50 border-gray-200'
            }`}
            placeholder="Masalan: Akmalhon sinifdosh"
          />
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-500' : 'text-gray-400'}`}>
            Yangi hisob-kitob yaratganda avtomatik to'ldiriladi
          </p>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            Valyuta
          </label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <option value="so'm">so'm (UZS)</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="RUB">RUB</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            Sana formati
          </label>
          <select
            value={dateFormat}
            onChange={e => setDateFormat(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <option value="DD.MM.YY">DD.MM.YY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>
            Mavzu
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => {
                updateUserSettings(user.id, { theme: 'light' });
                setUser({ ...user, settings: { ...user.settings, theme: 'light' } });
                document.documentElement.classList.remove('dark');
                addToast('Light mavzu tanlandi', 'info');
              }}
              className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${
                theme === 'light' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              ☀️ Light
            </button>
            <button
              onClick={() => {
                updateUserSettings(user.id, { theme: 'dark' });
                setUser({ ...user, settings: { ...user.settings, theme: 'dark' } });
                document.documentElement.classList.add('dark');
                addToast('Dark mavzu tanlandi', 'info');
              }}
              className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-colors ${
                theme === 'dark' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              🌙 Dark
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Saqlash
        </button>
      </div>
    </div>
  );
}
