import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { updateUser, hashPassword, getUserReports, verifyPassword } from '../utils/storage';
import { User, Shield, Calendar } from 'lucide-react';

export function ProfilePage() {
  const { user, setUser, addToast, theme } = useApp();
  
  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  if (!user) return null;

  const reports = getUserReports(user.id);

  const handleUpdateProfile = () => {
    if (!name.trim()) {
      addToast('Ismni kiriting', 'error');
      return;
    }
    updateUser(user.id, { name: name.trim(), username: username.trim() });
    setUser({ ...user, name: name.trim(), username: username.trim() });
    addToast('Profil yangilandi!', 'success');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Barcha maydonlarni to\'ldiring', 'error');
      return;
    }
    if (newPassword.length < 6) {
      addToast('Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Parollar mos kelmadi', 'error');
      return;
    }
    // Verify current password
    if (!verifyPassword(currentPassword, user.passwordHash)) {
      addToast('Joriy parol noto\'g\'ri', 'error');
      return;
    }
    updateUser(user.id, { passwordHash: hashPassword(newPassword) });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordForm(false);
    addToast('Parol o\'zgartirildi!', 'success');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>

      {/* User Info Card */}
      <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm`}>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center">
            <span className="text-white text-2xl font-bold">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>@{user.username}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Calendar size={14} className="text-blue-600" />
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Qo'shilgan</span>
            </div>
            <p className="text-sm font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-green-600" />
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Hisob-kitoblar</span>
            </div>
            <p className="text-sm font-medium">{reports.length}</p>
          </div>
          <div className={`p-3 rounded-xl ${theme === 'dark' ? 'bg-slate-700' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-2 mb-1">
              <Shield size={14} className="text-purple-600" />
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>Umumiy summa</span>
            </div>
            <p className="text-sm font-medium">{reports.reduce((s, r) => s + r.totalAmount, 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Edit Profile */}
      <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm space-y-4`}>
        <h3 className="font-semibold text-lg">Ma'lumotlarni tahrirlash</h3>
        
        <div>
          <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Ism</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
            }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Username</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
            }`}
          />
        </div>

        <button
          onClick={handleUpdateProfile}
          className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Saqlash
        </button>
      </div>

      {/* Change Password */}
      <div className={`rounded-2xl p-6 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} border shadow-sm space-y-4`}>
        <h3 className="font-semibold text-lg">Parolni o'zgartirish</h3>
        
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className={`w-full py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              theme === 'dark' ? 'border-slate-600 text-slate-300 hover:bg-slate-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Parolni o'zgartirish
          </button>
        ) : (
          <>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Joriy parol</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Yangi parol</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
                }`}
                placeholder="Kamida 6 ta belgi"
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${theme === 'dark' ? 'text-slate-300' : 'text-gray-700'}`}>Yangi parolni tasdiqlang</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-50 border-gray-200'
                }`}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowPasswordForm(false); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }}
                className={`flex-1 py-2.5 rounded-xl border text-sm font-medium ${theme === 'dark' ? 'border-slate-600 text-slate-300' : 'border-gray-200 text-gray-700'}`}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleChangePassword}
                className="flex-1 bg-blue-600 text-white font-medium py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
              >
                O'zgartirish
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
