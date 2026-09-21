import React, { useState, useEffect, useMemo } from 'react';
import { 
  Briefcase, 
  Mail, 
  Calendar, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Search, 
  Download, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  GraduationCap, 
  MapPin, 
  Phone, 
  User, 
  Filter,
  Layers,
  Sparkles,
  Video,
  Lock,
  KeyRound,
  LogOut,
  LayoutGrid,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CalendarDays
} from 'lucide-react';
import { COMPANY_NAME } from '../constants';

interface CareerApp {
  _id: string;
  name: string;
  email: string;
  phone: string;
  state?: string;
  city?: string;
  institute_university?: string;
  qualification?: string;
  domain: string;
  message?: string;
  resumeUrl?: string;
  createdAt: string;
}

interface ContactInquiry {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

interface AppointmentBooking {
  _id: string;
  client_name: string;
  client_email: string;
  appointment_date: string;
  appointment_time: string;
  service_type: string;
  meet_link?: string;
  bookedAt: string;
}

interface AdminDashboardProps {
  onBack: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('fbt_admin_auth') === 'true';
  });
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab & View Modes
  const [activeTab, setActiveTab] = useState<'careers' | 'contacts' | 'appointments'>('careers');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [loading, setLoading] = useState(true);
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days' | 'custom'>('all');
  const [customDate, setCustomDate] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data Store
  const [careers, setCareers] = useState<CareerApp[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [notification, setNotification] = useState('');

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 3500);
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: adminKeyInput })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('fbt_admin_auth', 'true');
        setIsAuthenticated(true);
        showNotification('Login successful! Security alert email dispatched.');
        fetchData();
      } else {
        setLoginError(data.message || 'Incorrect Admin Key');
      }
    } catch (err) {
      setLoginError('Error connecting to authentication server.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('fbt_admin_auth');
    setIsAuthenticated(false);
    setAdminKeyInput('');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/all');
      const json = await res.json();
      if (json.success && json.data) {
        setCareers(json.data.careers || []);
        setContacts(json.data.contacts || []);
        setAppointments(json.data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showNotification('Error connecting to MongoDB backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // Reset pagination on tab/filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, selectedDomain, dateFilter, customDate, pageSize]);

  const deleteRecord = async (type: 'careers' | 'contacts' | 'appointments', id: string) => {
    if (!window.confirm('Are you sure you want to delete this record from MongoDB?')) return;
    try {
      const res = await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        if (type === 'careers') setCareers(prev => prev.filter(c => c._id !== id));
        if (type === 'contacts') setContacts(prev => prev.filter(c => c._id !== id));
        if (type === 'appointments') setAppointments(prev => prev.filter(a => a._id !== id));
        showNotification('Record deleted successfully');
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (activeTab === 'careers') {
      if (careers.length === 0) return;
      const headers = ['Name', 'Email', 'Phone', 'State', 'City', 'Institute/University', 'Qualification', 'Domain', 'Message', 'Submitted Date'];
      const rows = careers.map(c => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.state || ''}"`,
        `"${c.city || ''}"`,
        `"${c.institute_university || ''}"`,
        `"${c.qualification || ''}"`,
        `"${c.domain || ''}"`,
        `"${(c.message || '').replace(/"/g, '""')}"`,
        `"${new Date(c.createdAt).toLocaleString()}"`
      ]);
      downloadCSV('FBT_Career_Applications', [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
    } else if (activeTab === 'contacts') {
      if (contacts.length === 0) return;
      const headers = ['Name', 'Email', 'Subject', 'Message', 'Date'];
      const rows = contacts.map(c => [
        `"${c.name}"`,
        `"${c.email}"`,
        `"${c.subject}"`,
        `"${(c.message || '').replace(/"/g, '""')}"`,
        `"${new Date(c.createdAt).toLocaleString()}"`
      ]);
      downloadCSV('FBT_Contact_Inquiries', [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
    } else if (activeTab === 'appointments') {
      if (appointments.length === 0) return;
      const headers = ['Client Name', 'Client Email', 'Date', 'Time Slot', 'Service', 'Meet Link', 'Booked At'];
      const rows = appointments.map(a => [
        `"${a.client_name}"`,
        `"${a.client_email}"`,
        `"${a.appointment_date}"`,
        `"${a.appointment_time}"`,
        `"${a.service_type}"`,
        `"${a.meet_link || ''}"`,
        `"${new Date(a.bookedAt).toLocaleString()}"`
      ]);
      downloadCSV('FBT_Consultation_Bookings', [headers.join(','), ...rows.map(e => e.join(','))].join('\n'));
    }
  };

  const downloadCSV = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Date filtering helper
  const isWithinDateFilter = (isoDateString: string) => {
    if (dateFilter === 'all') return true;
    const itemDate = new Date(isoDateString);
    const now = new Date();
    
    if (dateFilter === 'today') {
      return itemDate.toDateString() === now.toDateString();
    }
    if (dateFilter === '7days') {
      const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return itemDate >= past7;
    }
    if (dateFilter === '30days') {
      const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return itemDate >= past30;
    }
    if (dateFilter === 'custom' && customDate) {
      const custom = new Date(customDate);
      return itemDate.toDateString() === custom.toDateString();
    }
    return true;
  };

  // Filtered lists
  const filteredCareers = useMemo(() => {
    return careers.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.institute_university && c.institute_university.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.city && c.city.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesDomain = selectedDomain === 'All' || c.domain === selectedDomain;
      const matchesDate = isWithinDateFilter(c.createdAt);
      return matchesSearch && matchesDomain && matchesDate;
    });
  }, [careers, searchQuery, selectedDomain, dateFilter, customDate]);

  const filteredContacts = useMemo(() => {
    return contacts.filter(c => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = isWithinDateFilter(c.createdAt);
      return matchesSearch && matchesDate;
    });
  }, [contacts, searchQuery, dateFilter, customDate]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter(a => {
      const matchesSearch = 
        a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.client_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.appointment_date.includes(searchQuery) ||
        a.service_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = isWithinDateFilter(a.bookedAt || a.appointment_date);
      return matchesSearch && matchesDate;
    });
  }, [appointments, searchQuery, dateFilter, customDate]);

  // Current active data & pagination slices
  const currentList = activeTab === 'careers' ? filteredCareers : activeTab === 'contacts' ? filteredContacts : filteredAppointments;
  const totalItems = currentList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return currentList.slice(start, start + pageSize);
  }, [currentList, currentPage, pageSize]);

  // ==========================================
  // RENDER: LOGIN SCREEN IF NOT AUTHENTICATED
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#05070e] flex items-center justify-center p-6 relative overflow-hidden font-sans">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="relative w-full max-w-md bg-[#0b0f1a] border border-white/10 rounded-[3rem] p-8 sm:p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/30 text-white font-black text-2xl">
            <ShieldCheck size={32} />
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Admin Gateway</h2>
            <p className="text-gray-400 text-xs mt-1">Enter master key to access Future Bound Tech console</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                <KeyRound size={12} className="text-blue-500" /> Master Key
              </label>
              <input 
                type="password"
                required
                autoFocus
                value={adminKeyInput}
                onChange={(e) => setAdminKeyInput(e.target.value)}
                placeholder="Enter admin key..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3.5 outline-none focus:border-blue-500/60 focus:bg-white/[0.07] text-white text-sm transition-all"
              />
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold text-center">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || !adminKeyInput}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Lock size={14} /> Verify & Access Portal
                </>
              )}
            </button>
          </form>

          <button 
            onClick={onBack}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors flex items-center justify-center gap-1.5 mx-auto"
          >
            <ArrowLeft size={14} /> Return to Main Website
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: MAIN ADMIN DASHBOARD (AUTHENTICATED)
  // ==========================================
  return (
    <div className="min-h-screen bg-[#06080e] text-white p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-gray-300 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              <ArrowLeft size={16} /> Main Site
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-white/20 flex items-center justify-center p-0.5 shadow-md overflow-hidden">
                  <img src="/logo.png" alt="Future Bound Tech Logo" className="w-full h-full object-contain scale-105" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">{COMPANY_NAME} • Management Console</h1>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                MongoDB Live Database: <code className="text-blue-400 font-mono text-[11px]">fbt_portfolio</code>
                <span>•</span>
                <span>AI Failover: <strong className="text-emerald-400">OpenRouter & Groq</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchData} 
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-400' : ''} /> Refresh
            </button>
            <button 
              onClick={exportToCSV}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <Download size={14} /> Export CSV
            </button>
            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all text-xs font-bold flex items-center gap-1.5"
              title="Logout from Admin"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="p-3 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} /> {notification}
          </div>
        )}

        {/* Top 3 Interactive Feature Summary Cards (Serve as primary Tab Switchers) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div 
            onClick={() => setActiveTab('careers')}
            className={`p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'careers' 
                ? 'bg-blue-600/15 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.25)] scale-[1.01]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Career Applications</span>
              <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400"><Briefcase size={22} /></div>
            </div>
            <div className="text-3xl font-black mt-4 text-white">{careers.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Candidates in MongoDB & AI auto-replies</p>
            {activeTab === 'careers' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
          </div>

          <div 
            onClick={() => setActiveTab('contacts')}
            className={`p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'contacts' 
                ? 'bg-purple-600/15 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.25)] scale-[1.01]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Contact Inquiries</span>
              <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400"><Mail size={22} /></div>
            </div>
            <div className="text-3xl font-black mt-4 text-white">{contacts.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Client leads & AI dispatched emails</p>
            {activeTab === 'contacts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>}
          </div>

          <div 
            onClick={() => setActiveTab('appointments')}
            className={`p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'appointments' 
                ? 'bg-emerald-600/15 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)] scale-[1.01]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Consultation Bookings</span>
              <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400"><Calendar size={22} /></div>
            </div>
            <div className="text-3xl font-black mt-4 text-white">{appointments.length}</div>
            <p className="text-[11px] text-gray-500 mt-1">Corporate slots with Meet Room link</p>
            {activeTab === 'appointments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>}
          </div>
        </div>

        {/* Filter & View Control Bar */}
        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap gap-3 items-center justify-between">
          {/* View Mode Toggle & Active Tab Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 hidden sm:inline">
              Viewing: <strong className="text-white capitalize">{activeTab}</strong> ({totalItems})
            </span>

            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'cards' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
                title="Block / Card View"
              >
                <LayoutGrid size={14} /> Block View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  viewMode === 'table' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'
                }`}
                title="Tabular View (for 10,000+ records)"
              >
                <TableIcon size={14} /> Tabular View
              </button>
            </div>
          </div>

          {/* Search, Domain, and Date Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <CalendarDays size={14} className="text-gray-400" />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-[#111624] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="custom">Custom Date</option>
              </select>

              {dateFilter === 'custom' && (
                <input 
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="bg-[#111624] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                />
              )}
            </div>

            {/* Domain Filter (Careers Only) */}
            {activeTab === 'careers' && (
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="bg-[#111624] border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-gray-300 outline-none focus:border-blue-500"
              >
                <option value="All">All Domains</option>
                <option value="Full Stack Development">Full Stack</option>
                <option value="Backend Development">Backend</option>
                <option value="Artificial Intelligence (AI)">AI</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="SAP">SAP</option>
                <option value="Other IT Domains">Other IT</option>
              </select>
            )}

            {/* Search Input */}
            <div className="relative w-48 sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs outline-none focus:border-blue-500 text-white placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="space-y-4">
          {totalItems === 0 ? (
            <div className="text-center py-24 bg-white/[0.01] rounded-3xl border border-white/5 text-gray-500">
              <Filter size={36} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold text-sm">No matching records found</p>
              <p className="text-xs mt-1">Try adjusting your search query, domain, or date filter.</p>
            </div>
          ) : (
            <>
              {/* ========================================================= */}
              {/* 1. TABULAR VIEW (High Scalability / Density)             */}
              {/* ========================================================= */}
              {viewMode === 'table' ? (
                <div className="rounded-3xl border border-white/10 bg-white/[0.01] overflow-hidden shadow-2xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-gray-300 border-collapse">
                      <thead className="bg-[#0e1424] text-gray-400 font-bold uppercase tracking-wider text-xs border-b border-white/10">
                        {activeTab === 'careers' && (
                          <tr>
                            <th className="py-3.5 px-4">Candidate</th>
                            <th className="py-3.5 px-4">Contact</th>
                            <th className="py-3.5 px-4">Domain</th>
                            <th className="py-3.5 px-4">Qualification & University</th>
                            <th className="py-3.5 px-4">Location</th>
                            <th className="py-3.5 px-4">Resume</th>
                            <th className="py-3.5 px-4">Date</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'contacts' && (
                          <tr>
                            <th className="py-3.5 px-4">Sender</th>
                            <th className="py-3.5 px-4">Email</th>
                            <th className="py-3.5 px-4">Subject</th>
                            <th className="py-3.5 px-4">Message Snippet</th>
                            <th className="py-3.5 px-4">Date</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        )}
                        {activeTab === 'appointments' && (
                          <tr>
                            <th className="py-3.5 px-4">Client</th>
                            <th className="py-3.5 px-4">Email</th>
                            <th className="py-3.5 px-4">Service Domain</th>
                            <th className="py-3.5 px-4">Date & Slot</th>
                            <th className="py-3.5 px-4">Meet Room</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                          </tr>
                        )}
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {activeTab === 'careers' && (paginatedList as CareerApp[]).map((c) => (
                          <tr key={c._id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{c.name}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-mono text-xs text-blue-400">{c.email}</div>
                              <div className="text-xs text-gray-500">{c.phone}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                                {c.domain}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-white font-semibold text-xs">{c.qualification || 'N/A'}</div>
                              <div className="text-xs text-gray-500 truncate max-w-[180px]">{c.institute_university || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-xs">{c.city ? `${c.city}, ${c.state}` : c.state || 'India'}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {c.resumeUrl ? (
                                <a 
                                  href={c.resumeUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                                  title="View Uploaded Resume"
                                >
                                  <Download size={12} /> Resume
                                </a>
                              ) : (
                                <span className="text-xs text-gray-500">None</span>
                              )}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap text-xs text-gray-500">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <a 
                                  href={`mailto:${c.email}?subject=Future%20Bound%20Tech%20Career%20Interaction`}
                                  className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                                  title="Email Candidate"
                                >
                                  <Mail size={14} />
                                </a>
                                <button
                                  onClick={() => deleteRecord('careers', c._id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  title="Delete Record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'contacts' && (paginatedList as ContactInquiry[]).map((con) => (
                          <tr key={con._id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{con.name}</td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-purple-400">{con.email}</td>
                            <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-200">{con.subject}</td>
                            <td className="py-3 px-4 text-gray-400 max-w-[250px] truncate">{con.message}</td>
                            <td className="py-3 px-4 whitespace-nowrap text-[11px] text-gray-500">
                              {new Date(con.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-2">
                                <a 
                                  href={`mailto:${con.email}?subject=Re:%20${encodeURIComponent(con.subject)}`}
                                  className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                                  title="Reply"
                                >
                                  <Mail size={14} />
                                </a>
                                <button
                                  onClick={() => deleteRecord('contacts', con._id)}
                                  className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                  title="Delete Record"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}

                        {activeTab === 'appointments' && (paginatedList as AppointmentBooking[]).map((a) => (
                          <tr key={a._id} className="hover:bg-white/[0.03] transition-colors">
                            <td className="py-3 px-4 font-bold text-white whitespace-nowrap">{a.client_name}</td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-emerald-400">{a.client_email}</td>
                            <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-200">{a.service_type}</td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              <div className="font-bold text-white">{a.appointment_date}</div>
                              <div className="text-[10px] text-emerald-400 font-mono">{a.appointment_time}</div>
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px]">
                              <a href={a.meet_link || 'https://meet.google.com/koi-medw-gni'} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1">
                                <Video size={12} /> Open Room
                              </a>
                            </td>
                            <td className="py-3 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={() => deleteRecord('appointments', a._id)}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title="Cancel / Delete Booking"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                /* ========================================================= */
                /* 2. BLOCK / CARD VIEW                                      */
                /* ========================================================= */
                <div className="grid grid-cols-1 gap-4">
                  {/* Careers Cards */}
                  {activeTab === 'careers' && (paginatedList as CareerApp[]).map((item) => (
                    <div 
                      key={item._id}
                      className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-blue-500/30 transition-all space-y-4 shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                            {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h3 className="font-bold text-base text-white">{item.name}</h3>
                            <p className="text-xs text-gray-400 flex items-center gap-3 mt-0.5">
                              <span>✉️ {item.email}</span>
                              <span>📞 {item.phone}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                            {item.domain}
                          </span>
                          <button
                            onClick={() => deleteRecord('careers', item._id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete Application"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-gray-400 text-xs uppercase font-bold tracking-wider block mb-0.5">🎓 Qualification</span>
                          <span className="text-gray-200 font-semibold">{item.qualification || 'Not specified'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-gray-400 text-xs uppercase font-bold tracking-wider block mb-0.5">🏛️ University</span>
                          <span className="text-gray-200 font-semibold truncate block">{item.institute_university || 'Not specified'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-gray-400 text-xs uppercase font-bold tracking-wider block mb-0.5">📍 Location</span>
                          <span className="text-gray-200 font-semibold">{item.city ? `${item.city}, ${item.state}` : item.state || 'India'}</span>
                        </div>
                      </div>

                      {item.resumeUrl && (
                        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold">
                            <CheckCircle2 size={16} className="text-emerald-400" />
                            <span>Candidate Resume Attached</span>
                          </div>
                          <a 
                            href={item.resumeUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                          >
                            <Download size={13} /> View / Download PDF
                          </a>
                        </div>
                      )}

                      {item.message && (
                        <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300">
                          <span className="text-gray-500 font-bold uppercase text-[10px] block mb-1">Notes / Portfolio:</span>
                          <p className="whitespace-pre-wrap">{item.message}</p>
                        </div>
                      )}

                      <div className="text-[11px] text-gray-500 flex justify-between items-center pt-1">
                        <span>Submitted: {new Date(item.createdAt).toLocaleString()}</span>
                        <a 
                          href={`mailto:${item.email}?subject=Future%20Bound%20Tech%20Career%20Application%20Response`} 
                          className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                        >
                          Send Email Response <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Contacts Cards */}
                  {activeTab === 'contacts' && (paginatedList as ContactInquiry[]).map((item) => (
                    <div 
                      key={item._id}
                      className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-purple-500/30 transition-all space-y-3 shadow-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/5">
                        <div>
                          <h3 className="font-bold text-base text-white">{item.name}</h3>
                          <p className="text-xs text-purple-400 mt-0.5">✉️ {item.email} • Subject: <strong className="text-white">{item.subject}</strong></p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</span>
                          <button
                            onClick={() => deleteRecord('contacts', item._id)}
                            className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title="Delete Inquiry"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {item.message}
                      </div>

                      <div className="text-right">
                        <a 
                          href={`mailto:${item.email}?subject=Re:%20${encodeURIComponent(item.subject)}`} 
                          className="text-xs text-purple-400 hover:underline font-bold inline-flex items-center gap-1"
                        >
                          Reply to Message <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  ))}

                  {/* Appointments Cards */}
                  {activeTab === 'appointments' && (paginatedList as AppointmentBooking[]).map((item) => (
                    <div 
                      key={item._id}
                      className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-emerald-500/30 transition-all space-y-4 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                            {item.service_type}
                          </span>
                          <h3 className="font-bold text-lg text-white mt-2">{item.client_name}</h3>
                          <p className="text-xs text-gray-400">✉️ {item.client_email}</p>
                        </div>

                        <button
                          onClick={() => deleteRecord('appointments', item._id)}
                          className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                          title="Cancel/Delete Booking (Frees Slot)"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-gray-500 text-[10px] uppercase font-bold block">📅 Consultation Date</span>
                          <span className="text-white font-bold">{item.appointment_date}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                          <span className="text-gray-500 text-[10px] uppercase font-bold block">⏰ Time Slot</span>
                          <span className="text-emerald-400 font-bold">{item.appointment_time}</span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-between gap-2 text-xs">
                        <div className="truncate text-blue-300 font-mono text-[11px] flex items-center gap-2">
                          <Video size={14} className="text-blue-400 flex-shrink-0" />
                          <span className="truncate">{item.meet_link || 'https://meet.google.com/koi-medw-gni'}</span>
                        </div>
                        <a 
                          href={item.meet_link || 'https://meet.google.com/koi-medw-gni'} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-400 hover:text-white font-bold text-xs flex-shrink-0"
                        >
                          Open Meet
                        </a>
                      </div>

                      <div className="text-[10px] text-gray-500 text-right">
                        Booked: {new Date(item.bookedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination Controls (Optimized for 10,000+ Records) */}
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3 text-gray-400">
                  <span>
                    Showing <strong className="text-white">{(currentPage - 1) * pageSize + 1}</strong> to <strong className="text-white">{Math.min(currentPage * pageSize, totalItems)}</strong> of <strong className="text-white">{totalItems}</strong> entries
                  </span>
                  
                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-[11px]">Per Page:</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="bg-[#111624] border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <ChevronLeft size={14} /> Prev
                  </button>

                  <span className="px-3 py-1 rounded-xl bg-blue-600/20 text-blue-400 font-bold border border-blue-500/30">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
