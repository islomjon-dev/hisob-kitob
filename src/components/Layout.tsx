import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { 
  LayoutDashboard, PlusCircle, History, Settings, User, LogOut, 
  Sun, Moon, X, CheckCircle, AlertCircle, Info
} from 'lucide-react';

export function Layout({ children }: { children: ReactNode }) {
  const { user, theme, toggleTheme, toasts, removeToast, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/create', icon: PlusCircle, label: 'Yaratish' },
    { path: '/history', icon: History, label: 'Tarix' },
    { path: '/profile', icon: User, label: 'Profil' },
    { path: '/settings', icon: Settings, label: 'Sozlamalar' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <header className={`no-print sticky top-0 z-40 ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border-b shadow-sm`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HK</span>
            </div>
            <span className="font-bold text-lg hidden sm:block">HisobKitob</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark' ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
              aria-label="Tema almashtirish"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              onClick={handleLogout}
              className={`hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                theme === 'dark' ? 'text-red-400 hover:bg-slate-700' : 'text-red-600 hover:bg-red-50'
              }`}
            >
              <LogOut size={18} />
              Chiqish
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg"
              aria-label="Menyu"
            >
              <div className="w-5 h-5 flex flex-col justify-center gap-1">
                <span className={`block h-0.5 w-5 ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'} transition-transform ${mobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block h-0.5 w-5 ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'} transition-opacity ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block h-0.5 w-5 ${theme === 'dark' ? 'bg-white' : 'bg-gray-800'} transition-transform ${mobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className={`md:hidden border-t ${theme === 'dark' ? 'border-slate-700 bg-slate-800' : 'border-gray-200 bg-white'} px-4 py-2`}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium w-full text-left ${
                theme === 'dark' ? 'text-red-400' : 'text-red-600'
              }`}
            >
              <LogOut size={18} />
              Chiqish
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>

      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 no-print">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg max-w-sm animate-slide-in ${
              toast.type === 'success' ? 'bg-green-500 text-white' :
              toast.type === 'error' ? 'bg-red-500 text-white' :
              'bg-blue-500 text-white'
            }`}
          >
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertCircle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <span className="text-sm font-medium flex-1">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="p-1 hover:opacity-70">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Modal Component
export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  title: string; 
  children: ReactNode;
}) {
  const { theme } = useApp();
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 no-print">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className={`relative w-full max-w-md rounded-2xl p-6 shadow-2xl ${
        theme === 'dark' ? 'bg-slate-800' : 'bg-white'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
