// Types
export interface User {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  createdAt: string;
  settings: UserSettings;
}

export interface UserSettings {
  defaultTitle: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark';
}

export interface ReportItem {
  id: string;
  productName: string;
  size: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Report {
  id: string;
  userId: string;
  title: string;
  date: string;
  items: ReportItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// Simple hash function (browser-compatible)
export function hashPassword(password: string): string {
  let hash = 0;
  const salt = 'hisobkitob_salt_2024';
  const str = salt + password + salt;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36) + '_' + btoa(str).slice(0, 20);
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// Storage helpers
const USERS_KEY = 'hisobkitob_users';
const REPORTS_KEY = 'hisobkitob_reports';
const SESSION_KEY = 'hisobkitob_session';

export function getUsers(): User[] {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getReports(): Report[] {
  const data = localStorage.getItem(REPORTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveReports(reports: Report[]): void {
  localStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}

export function getSession(): string | null {
  return localStorage.getItem(SESSION_KEY);
}

export function setSession(userId: string): void {
  localStorage.setItem(SESSION_KEY, userId);
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

// Auth functions
export function register(username: string, password: string, name: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    return { success: false, error: 'Bu username allaqachon mavjud' };
  }
  if (username.length < 3) {
    return { success: false, error: 'Username kamida 3 ta belgidan iborat bo\'lishi kerak' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak' };
  }
  if (!name.trim()) {
    return { success: false, error: 'Ismni kiriting' };
  }

  const user: User = {
    id: generateId(),
    username: username.trim(),
    passwordHash: hashPassword(password),
    name: name.trim(),
    createdAt: new Date().toISOString(),
    settings: {
      defaultTitle: '',
      currency: 'so\'m',
      dateFormat: 'DD.MM.YY',
      theme: 'light'
    }
  };

  users.push(user);
  saveUsers(users);
  setSession(user.id);
  return { success: true, user };
}

export function login(username: string, password: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    return { success: false, error: 'Username yoki parol noto\'g\'ri' };
  }
  if (!verifyPassword(password, user.passwordHash)) {
    return { success: false, error: 'Username yoki parol noto\'g\'ri' };
  }
  setSession(user.id);
  return { success: true, user };
}

export function getCurrentUser(): User | null {
  const sessionId = getSession();
  if (!sessionId) return null;
  const users = getUsers();
  return users.find(u => u.id === sessionId) || null;
}

export function updateUser(userId: string, updates: Partial<User>): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx] = { ...users[idx], ...updates };
    saveUsers(users);
  }
}

export function updateUserSettings(userId: string, settings: Partial<UserSettings>): void {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].settings = { ...users[idx].settings, ...settings };
    saveUsers(users);
  }
}

// Report functions
export function getUserReports(userId: string): Report[] {
  const reports = getReports();
  return reports.filter(r => r.userId === userId).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getReportById(reportId: string): Report | null {
  const reports = getReports();
  return reports.find(r => r.id === reportId) || null;
}

export function createReport(userId: string, title: string, date: string, items: ReportItem[]): Report {
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  const report: Report = {
    id: generateId(),
    userId,
    title,
    date,
    items,
    totalAmount,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const reports = getReports();
  reports.push(report);
  saveReports(reports);
  return report;
}

export function updateReport(reportId: string, userId: string, updates: Partial<Report>): Report | null {
  const reports = getReports();
  const idx = reports.findIndex(r => r.id === reportId && r.userId === userId);
  if (idx === -1) return null;
  
  const items = updates.items || reports[idx].items;
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);
  
  reports[idx] = {
    ...reports[idx],
    ...updates,
    totalAmount,
    updatedAt: new Date().toISOString()
  };
  saveReports(reports);
  return reports[idx];
}

export function deleteReport(reportId: string, userId: string): boolean {
  const reports = getReports();
  const filtered = reports.filter(r => !(r.id === reportId && r.userId === userId));
  if (filtered.length === reports.length) return false;
  saveReports(filtered);
  return true;
}

// Calculation helpers
export function calculateRowTotal(quantity: number, price: number): number {
  return Math.round(quantity * price * 100) / 100;
}

export function calculateGrandTotal(items: ReportItem[]): number {
  return Math.round(items.reduce((sum, item) => sum + item.total, 0) * 100) / 100;
}

export function formatCurrency(amount: number, currency: string = 'so\'m'): string {
  const formatted = amount.toLocaleString('uz-UZ');
  return `${formatted} ${currency}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

export function getTodayDate(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

// Validation
export function validateReport(title: string, date: string, items: ReportItem[]): string | null {
  if (!title.trim()) return 'Sarlavhani kiriting';
  if (!date) return 'Sanani tanlang';
  if (items.length === 0) return 'Kamida 1 ta mahsulot qo\'shing';
  
  for (let i = 0; i < items.length; i++) {
    if (!items[i].productName.trim()) return `${i + 1}-mahsulot nomini kiriting`;
    if (items[i].quantity <= 0) return `${i + 1}-mahsulot miqdori 0 dan katta bo'lishi kerak`;
    if (items[i].price <= 0) return `${i + 1}-mahsulot narxi 0 dan katta bo'lishi kerak`;
  }
  return null;
}

// Search and filter
export function searchReports(reports: Report[], query: string): Report[] {
  if (!query.trim()) return reports;
  const q = query.toLowerCase();
  return reports.filter(r => {
    if (r.title.toLowerCase().includes(q)) return true;
    if (r.date.includes(q)) return true;
    if (r.items.some(item => item.productName.toLowerCase().includes(q))) return true;
    return false;
  });
}

export function filterReportsByDate(reports: Report[], filter: string, customRange?: { from: string; to: string }): Report[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return reports.filter(r => {
        const d = new Date(r.date);
        return d >= today && d < new Date(today.getTime() + 86400000);
      });
    case 'yesterday': {
      const yesterday = new Date(today.getTime() - 86400000);
      return reports.filter(r => {
        const d = new Date(r.date);
        return d >= yesterday && d < today;
      });
    }
    case '7days': {
      const weekAgo = new Date(today.getTime() - 7 * 86400000);
      return reports.filter(r => new Date(r.date) >= weekAgo);
    }
    case '30days': {
      const monthAgo = new Date(today.getTime() - 30 * 86400000);
      return reports.filter(r => new Date(r.date) >= monthAgo);
    }
    case 'custom': {
      if (!customRange) return reports;
      const from = new Date(customRange.from);
      const to = new Date(customRange.to);
      to.setHours(23, 59, 59);
      return reports.filter(r => {
        const d = new Date(r.date);
        return d >= from && d <= to;
      });
    }
    default:
      return reports;
  }
}

export function sortReports(reports: Report[], sort: string): Report[] {
  const sorted = [...reports];
  switch (sort) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    case 'amount_desc':
      return sorted.sort((a, b) => b.totalAmount - a.totalAmount);
    case 'amount_asc':
      return sorted.sort((a, b) => a.totalAmount - b.totalAmount);
    default:
      return sorted;
  }
}
