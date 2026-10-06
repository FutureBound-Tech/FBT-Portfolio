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
  CalendarDays,
  PlusCircle,
  Copy,
  Check,
  Eye,
  Award,
  FileText,
  AlertCircle,
  SlidersHorizontal,
  X,
  Send,
  Loader2
} from 'lucide-react';
import { COMPANY_NAME, STATIC_MEET_LINK } from '../constants';
import { JobPosting } from './JobApplicationModal';

interface CandidateJobApplication {
  _id: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  jobType: 'Job' | 'Internship';
  name: string;
  email: string;
  phone: string;
  location: string;
  resumeUrl?: string;
  highestQualification: string;
  collegeName: string;
  sector: string;
  placeOfEducation: string;
  score: string;
  yearOfCompletion: string;
  jobExperienceDetails: string;
  gender: string;
  dob: string;
  agreedTerms: boolean;
  status: 'Applied' | 'Shortlisted' | 'Interview Scheduled' | 'Hired' | 'Dropped';
  offerDetails?: {
    offerId: string;
    candidateName: string;
    candidateEmail: string;
    jobTitle: string;
    jobType: string;
    joiningDate?: string;
    compensation?: string;
    issuedAt?: string;
  };
  createdAt: string;
}

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

interface OfferRecord {
  _id?: string;
  offerId: string;
  candidateName: string;
  candidateEmail: string;
  jobTitle: string;
  jobType: string;
  jobId?: string;
  joiningDate?: string;
  compensation?: string;
  issuedAt: string;
  status: string;
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

  // Tabs
  const [activeTab, setActiveTab] = useState<'jobApplications' | 'postJobs' | 'verifiedOffers' | 'legacyCareers' | 'contacts' | 'appointments'>('jobApplications');
  const [loading, setLoading] = useState(true);
  
  // Data Store
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [jobApplications, setJobApplications] = useState<CandidateJobApplication[]>([]);
  const [verifiedOffers, setVerifiedOffers] = useState<OfferRecord[]>([]);
  const [legacyCareers, setLegacyCareers] = useState<CareerApp[]>([]);
  const [contacts, setContacts] = useState<ContactInquiry[]>([]);
  const [appointments, setAppointments] = useState<AppointmentBooking[]>([]);
  const [notification, setNotification] = useState('');

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobFilter, setSelectedJobFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Modal: Create / Post Opportunity
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);
  const [jobFormType, setJobFormType] = useState<'Job' | 'Internship'>('Job');
  const [jobFormTitle, setJobFormTitle] = useState('');
  const [jobFormKeyContext, setJobFormKeyContext] = useState('');
  const [jobFormDescription, setJobFormDescription] = useState('');
  const [jobFormDuration, setJobFormDuration] = useState('Full Time');
  const [jobFormWorkMode, setJobFormWorkMode] = useState<'Remote' | 'Onsite' | 'Hybrid'>('Remote');
  const [jobFormLocation, setJobFormLocation] = useState('');
  const [jobFormGeneratingAI, setJobFormGeneratingAI] = useState(false);
  const [jobFormSaving, setJobFormSaving] = useState(false);
  const [jobFormError, setJobFormError] = useState('');

  // Modal: View Candidate Application & Status Action
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<CandidateJobApplication | null>(null);
  const [statusUpdateMode, setStatusUpdateMode] = useState<'idle' | 'shortlist' | 'interview' | 'hire' | 'drop'>('idle');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('11:00 AM IST');
  const [interviewLink, setInterviewLink] = useState(STATIC_MEET_LINK);
  const [hireOfferId, setHireOfferId] = useState('');
  const [hireJoiningDate, setHireJoiningDate] = useState('Immediate');
  const [hireCompensation, setHireCompensation] = useState('Standard Stipend / Package');
  const [statusUpdating, setStatusUpdating] = useState(false);
  
  // Ready-to-copy email template state
  const [copiedTemplate, setCopiedTemplate] = useState<{ subject: string; body: string } | null>(null);
  const [hasCopiedText, setHasCopiedText] = useState(false);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
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
        showNotification('Login successful! Security alert dispatched to Hostinger mail.');
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

  // Fetch all consolidated data
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/all');
      const json = await res.json();
      if (json.success && json.data) {
        setJobs(json.data.jobs || []);
        setJobApplications(json.data.jobApplications || []);
        setVerifiedOffers(json.data.offers || []);
        setLegacyCareers(json.data.careers || []);
        setContacts(json.data.contacts || []);
        setAppointments(json.data.appointments || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
      showNotification('Error loading database records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  // AI Description Generator for New Job
  const handleGenerateAIDescription = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    let activeTitle = jobFormTitle.trim();
    if (!activeTitle) {
      activeTitle = jobFormType === 'Internship' ? 'Software Development Intern' : 'Full Stack Developer';
      setJobFormTitle(activeTitle);
    }

    setJobFormGeneratingAI(true);
    setJobFormError('');

    const generateClientFallbackDesc = () => {
      const isIntern = jobFormType === 'Internship';
      return `### About the Role
Future Bound Tech is inviting passionate ${isIntern ? 'interns and aspiring engineers' : 'professionals'} to apply for the **${activeTitle}** (${jobFormType}) position. In this role, you will work on enterprise-grade software products, build modern architectures, and collaborate with experienced mentors.

### Key Responsibilities
- Develop, test, and maintain robust frontend and backend features.
- Write clean, modular, and maintainable code adhering to industry standards.
- Collaborate with the team on API integrations, UI responsiveness, and system performance.
- ${jobFormKeyContext ? `Focus on domain requirements: ${jobFormKeyContext}` : 'Participate in agile sprints, code reviews, and architecture discussions.'}
- Deliver scalable solutions that create measurable business value.

### Qualifications & Requirements
- Degree/Background in Computer Science, IT, Engineering, or related technical disciplines.
- Hands-on familiarity with modern development tools and frameworks.
- Strong analytical and problem-solving mindset with eagerness to learn.
- Work Mode: ${jobFormWorkMode}${jobFormLocation ? ` (${jobFormLocation})` : ''} • Duration: ${jobFormDuration}.

### What We Offer
- Direct mentorship from seasoned software architects and tech leads.
- Experience on live production systems and enterprise client deliverables.
- Certificate of Completion, Letter of Recommendation, and fast-track hiring potential.`;
    };

    try {
      const res = await fetch('/api/jobs/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: activeTitle,
          type: jobFormType,
          keyContext: jobFormKeyContext,
          duration: jobFormDuration,
          workMode: jobFormWorkMode,
          location: jobFormLocation
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.description) {
        const descStr = String(data.description);
        setJobFormDescription(descStr);
        showNotification('✨ AI description generated successfully!');
      } else {
        const fallback = generateClientFallbackDesc();
        setJobFormDescription(fallback);
        showNotification('✨ Description generated!');
      }
    } catch (err) {
      const fallback = generateClientFallbackDesc();
      setJobFormDescription(fallback);
      showNotification('✨ Description generated!');
    } finally {
      setJobFormGeneratingAI(false);
    }
  };

  // Create Job / Internship Posting
  const handleSaveJobPosting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobFormTitle.trim() || !jobFormDescription.trim()) {
      setJobFormError('Please fill in both Title and Description.');
      return;
    }
    if ((jobFormWorkMode === 'Onsite' || jobFormWorkMode === 'Hybrid') && !jobFormLocation.trim()) {
      setJobFormError('Location is required for Onsite / Hybrid postings.');
      return;
    }

    setJobFormSaving(true);
    setJobFormError('');

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: jobFormType,
          title: jobFormTitle,
          keyContext: jobFormKeyContext,
          description: jobFormDescription,
          duration: jobFormDuration,
          workMode: jobFormWorkMode,
          location: jobFormLocation
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`🎉 ${jobFormType} "${jobFormTitle}" created and published!`);
        setIsCreateJobOpen(false);
        // Reset form
        setJobFormTitle('');
        setJobFormKeyContext('');
        setJobFormDescription('');
        setJobFormLocation('');
        fetchData();
      } else {
        setJobFormError(data.message || 'Failed to save job posting');
      }
    } catch (err) {
      setJobFormError('Error communicating with database server.');
    } finally {
      setJobFormSaving(false);
    }
  };

  // Toggle Job Status Active/Closed
  const toggleJobStatus = async (job: JobPosting) => {
    const newStatus = job.status === 'Active' ? 'Closed' : 'Active';
    try {
      const res = await fetch(`/api/jobs/${job._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setJobs(prev => prev.map(j => j._id === job._id ? { ...j, status: newStatus } : j));
        showNotification(`Job ${job.jobId} marked as ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update job status:', err);
    }
  };

  // Delete Job Posting
  const deleteJob = async (id: string) => {
    if (!window.confirm('Delete this job posting permanently?')) return;
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobs(prev => prev.filter(j => j._id !== id));
        showNotification('Job opportunity removed');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Open Application Detail Modal & prepare defaults
  const handleOpenAppDetail = (app: CandidateJobApplication) => {
    setSelectedAppForDetail(app);
    setStatusUpdateMode('idle');
    setInterviewDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setHireOfferId(`FBT-${app.jobType === 'Internship' ? '01I' : '01J'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setCopiedTemplate(null);
    setHasCopiedText(false);
  };

  // Update Application Status & Auto-Send Email
  const handleUpdateApplicationStatus = async (newStatus: CandidateJobApplication['status']) => {
    if (!selectedAppForDetail) return;
    setStatusUpdating(true);

    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'Interview Scheduled') {
        payload.interviewDate = interviewDate;
        payload.interviewTime = interviewTime;
        payload.interviewLink = interviewLink;
      } else if (newStatus === 'Hired') {
        payload.offerId = hireOfferId.trim();
        payload.joiningDate = hireJoiningDate;
        payload.compensation = hireCompensation;
      }

      const res = await fetch(`/api/job-applications/${selectedAppForDetail._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification(`✅ Status changed to "${newStatus}". Automated email sent to candidate!`);
        if (data.manualTemplate) {
          setCopiedTemplate(data.manualTemplate);
        }
        setSelectedAppForDetail(prev => prev ? { ...prev, status: newStatus, offerDetails: data.offerId ? { offerId: data.offerId, candidateName: prev.name, candidateEmail: prev.email, jobTitle: prev.jobTitle, jobType: prev.jobType, issuedAt: new Date().toISOString() } : prev.offerDetails } : null);
        fetchData();
      } else {
        showNotification(data.message || 'Error updating status');
      }
    } catch (err) {
      console.error('Status update error:', err);
      showNotification('Error updating application status');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Copy email text helper
  const handleCopyEmailText = () => {
    if (!copiedTemplate) return;
    const textToCopy = `Subject: ${copiedTemplate.subject}\nTo: ${copiedTemplate.to}\n\n${copiedTemplate.body}`;
    navigator.clipboard.writeText(textToCopy);
    setHasCopiedText(true);
    setTimeout(() => setHasCopiedText(false), 3000);
    showNotification('📋 Email template copied to clipboard!');
  };

  // Delete Job Application
  const deleteJobApp = async (id: string) => {
    if (!window.confirm('Delete candidate application record from database?')) return;
    try {
      const res = await fetch(`/api/job-applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setJobApplications(prev => prev.filter(a => a._id !== id));
        if (selectedAppForDetail?._id === id) setSelectedAppForDetail(null);
        showNotification('Candidate application deleted');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Date Filter helper
  const isWithinDate = (isoDate: string) => {
    if (dateFilter === 'all') return true;
    const itemDate = new Date(isoDate);
    const now = new Date();
    if (dateFilter === 'today') return itemDate.toDateString() === now.toDateString();
    if (dateFilter === '7days') return itemDate >= new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    if (dateFilter === '30days') return itemDate >= new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return true;
  };

  // Filtered Applications Pipeline
  const filteredJobApps = useMemo(() => {
    return jobApplications.filter(app => {
      const matchesJob = selectedJobFilter === 'All' || app.jobId === selectedJobFilter;
      const matchesStatus = selectedStatusFilter === 'All' || app.status === selectedStatusFilter;
      const matchesDate = isWithinDate(app.createdAt);
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        !searchQuery ||
        app.name.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q) ||
        app.phone.includes(q) ||
        app.collegeName.toLowerCase().includes(q) ||
        app.applicationId.toLowerCase().includes(q) ||
        app.jobTitle.toLowerCase().includes(q);
      return matchesJob && matchesStatus && matchesDate && matchesSearch;
    });
  }, [jobApplications, selectedJobFilter, selectedStatusFilter, dateFilter, searchQuery]);

  // Export Applications to CSV
  const exportAppsCSV = () => {
    if (jobApplications.length === 0) return;
    const headers = ['App ID', 'Job ID', 'Role', 'Type', 'Candidate Name', 'Email', 'Phone', 'Location', 'Qualification', 'College', 'Stream', 'Score', 'Passing Year', 'Experience', 'Gender', 'DOB', 'Status', 'Offer ID', 'Applied At'];
    const rows = filteredJobApps.map(a => [
      `"${a.applicationId}"`,
      `"${a.jobId}"`,
      `"${a.jobTitle}"`,
      `"${a.jobType}"`,
      `"${a.name}"`,
      `"${a.email}"`,
      `"${a.phone}"`,
      `"${a.location}"`,
      `"${a.highestQualification}"`,
      `"${a.collegeName}"`,
      `"${a.sector}"`,
      `"${a.score}"`,
      `"${a.yearOfCompletion}"`,
      `"${(a.jobExperienceDetails || '').replace(/"/g, '""')}"`,
      `"${a.gender}"`,
      `"${a.dob}"`,
      `"${a.status}"`,
      `"${a.offerDetails?.offerId || ''}"`,
      `"${new Date(a.createdAt).toLocaleString()}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `FBT_Job_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // RENDER: LOGIN GATEWAY
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
  // RENDER: MAIN ADMIN DASHBOARD
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
                  <img src="/logo.png" alt="Logo" className="w-full h-full object-contain scale-105" />
                </div>
                <h1 className="text-2xl font-black tracking-tight">{COMPANY_NAME} • Management Console</h1>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 flex flex-wrap items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Hostinger Mail: <strong className="text-emerald-400">info@futureboundtech.online</strong></span>
                <span>•</span>
                <span>AI Failover: <strong className="text-blue-400">OpenRouter & Groq</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsCreateJobOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25"
            >
              <PlusCircle size={15} /> Upload Opportunity (Job / Internship)
            </button>

            <button 
              onClick={fetchData} 
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-blue-400' : ''} /> Refresh
            </button>

            <button 
              onClick={exportAppsCSV}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 transition-all text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20"
            >
              <Download size={14} /> Export CSV
            </button>

            <button 
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 transition-all text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="p-3.5 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} /> {notification}
          </div>
        )}

        {/* Top Metric Cards / Primary Tab Switchers */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Card 1: Job Applications (Workday-style) */}
          <div 
            onClick={() => setActiveTab('jobApplications')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'jobApplications' 
                ? 'bg-blue-600/15 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.25)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Applications</span>
              <div className="p-1.5 rounded-xl bg-blue-500/20 text-blue-400"><Layers size={16} /></div>
            </div>
            <div className="text-2xl font-black mt-2 text-white">{jobApplications.length}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Workday 3-Stage</p>
            {activeTab === 'jobApplications' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
          </div>

          {/* Card 2: Posted Opportunities */}
          <div 
            onClick={() => setActiveTab('postJobs')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'postJobs' 
                ? 'bg-purple-600/15 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.25)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Openings</span>
              <div className="p-1.5 rounded-xl bg-purple-500/20 text-purple-400"><Briefcase size={16} /></div>
            </div>
            <div className="text-2xl font-black mt-2 text-white">{jobs.length}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Jobs & Internships</p>
            {activeTab === 'postJobs' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>}
          </div>

          {/* Card 3: Verified Offers */}
          <div 
            onClick={() => setActiveTab('verifiedOffers')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'verifiedOffers' 
                ? 'bg-emerald-600/15 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.25)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Offers</span>
              <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400"><Award size={16} /></div>
            </div>
            <div className="text-2xl font-black mt-2 text-white">{verifiedOffers.length}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Verified IDs</p>
            {activeTab === 'verifiedOffers' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>}
          </div>

          {/* Card 4: General Careers */}
          <div 
            onClick={() => setActiveTab('legacyCareers')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'legacyCareers' 
                ? 'bg-amber-600/15 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">General</span>
              <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400"><GraduationCap size={16} /></div>
            </div>
            <div className="text-2xl font-black mt-2 text-white">{legacyCareers.length}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Spontaneous</p>
            {activeTab === 'legacyCareers' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>}
          </div>

          {/* Card 5: Contacts */}
          <div 
            onClick={() => setActiveTab('contacts')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'contacts' 
                ? 'bg-cyan-600/15 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.25)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Contacts</span>
              <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400"><Mail size={16} /></div>
            </div>
            <div className="text-2xl font-black mt-2 text-white">{contacts.length}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Inquiries</p>
            {activeTab === 'contacts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500"></div>}
          </div>

          {/* Card 6: Appointments */}
          <div 
            onClick={() => setActiveTab('appointments')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'appointments' 
                ? 'bg-rose-600/15 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.25)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Bookings</span>
              <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400"><Calendar size={16} /></div>
            </div>
            <div className="text-2xl font-black mt-2 text-white">{appointments.length}</div>
            <p className="text-[10px] text-gray-500 mt-0.5">Consultations</p>
            {activeTab === 'appointments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>}
          </div>
        </div>

        {/* ==========================================
            TAB 1: JOB APPLICATIONS (3-STAGE WORKDAY)
        ========================================== */}
        {activeTab === 'jobApplications' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Filter Bar */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-wrap items-center justify-between gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text"
                  placeholder="Search candidate, email, college, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-blue-500"
                />
              </div>

              {/* Filter by Job */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-bold uppercase">Job / Intern:</span>
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="bg-[#111624] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="All">All Postings ({jobs.length})</option>
                  {jobs.map(j => (
                    <option key={j.jobId} value={j.jobId}>{j.jobId} - {j.title}</option>
                  ))}
                </select>
              </div>

              {/* Filter by Status */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-gray-500 font-bold uppercase">Status:</span>
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-[#111624] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Hired">Hired</option>
                  <option value="Dropped">Dropped</option>
                </select>
              </div>
            </div>

            {/* Applications Table */}
            <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-white/[0.04] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Candidate & App ID</th>
                      <th className="py-3 px-4">Role & Job ID</th>
                      <th className="py-3 px-4">Education & Score</th>
                      <th className="py-3 px-4">Location</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Resume</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredJobApps.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-10 text-center text-gray-500">
                          No candidate applications matching active filter.
                        </td>
                      </tr>
                    ) : (
                      filteredJobApps.map(app => (
                        <tr key={app._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-white text-sm">{app.name}</div>
                            <div className="text-gray-400 font-mono text-[11px]">{app.applicationId}</div>
                            <div className="text-gray-500 text-[10px]">{app.email} • {app.phone}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="font-bold text-white block">{app.jobTitle}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                                app.jobType === 'Internship' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                              }`}>
                                {app.jobType}
                              </span>
                              <span className="font-mono text-gray-400 text-[10px]">{app.jobId}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-gray-300 font-semibold">{app.highestQualification}</div>
                            <div className="text-gray-400 text-[11px] truncate max-w-[200px]">{app.collegeName}</div>
                            <div className="text-emerald-400 font-mono text-[10px]">Score: {app.score} ({app.yearOfCompletion})</div>
                          </td>

                          <td className="py-3.5 px-4 text-gray-300">
                            {app.location || 'N/A'}
                          </td>

                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border inline-block ${
                              app.status === 'Hired' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' :
                              app.status === 'Interview Scheduled' ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' :
                              app.status === 'Shortlisted' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' :
                              app.status === 'Dropped' ? 'bg-red-500/20 text-red-300 border-red-500/40' :
                              'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            }`}>
                              {app.status}
                            </span>
                            {app.offerDetails?.offerId && (
                              <div className="text-[10px] font-mono text-emerald-400 mt-1">
                                {app.offerDetails.offerId}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            {app.resumeUrl ? (
                              <a 
                                href={app.resumeUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold text-xs underline"
                              >
                                <FileText size={13} /> View CV
                              </a>
                            ) : (
                              <span className="text-gray-600">No file</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenAppDetail(app)}
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                <Eye size={12} /> Process
                              </button>
                              <button
                                onClick={() => deleteJobApp(app._id)}
                                className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: UPLOAD & MANAGE OPPORTUNITIES
        ========================================== */}
        {activeTab === 'postJobs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white">Active Postings on Careers Portal</h3>
                <p className="text-xs text-gray-400">Candidates apply directly to these unique Job IDs through the 3-stage Workday flow</p>
              </div>
              <button
                onClick={() => setIsCreateJobOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <PlusCircle size={15} /> Upload Opportunity
              </button>
            </div>

            {jobs.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white/[0.02] border border-white/10 space-y-4">
                <Briefcase size={40} className="mx-auto text-gray-500" />
                <h4 className="text-lg font-bold text-white">No Opportunities Uploaded Yet</h4>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">Create a Job or Internship opening with AI-generated descriptions and custom duration.</p>
                <button
                  onClick={() => setIsCreateJobOpen(true)}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs"
                >
                  Create First Opportunity
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map(job => (
                  <div key={job._id || job.jobId} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          job.type === 'Internship' ? 'bg-purple-500/20 text-purple-300 border-purple-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {job.type}
                        </span>
                        <span className="font-mono text-xs text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {job.jobId}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white">{job.title}</h4>

                      <div className="text-xs text-gray-400 space-y-1">
                        <div>📍 Mode: <strong className="text-white">{job.workMode}</strong> {job.location ? `(${job.location})` : ''}</div>
                        <div>⏰ Duration: <strong className="text-white">{job.duration}</strong></div>
                        <div>👥 Applicants: <strong className="text-emerald-400">{job.applicationsCount || 0}</strong></div>
                      </div>

                      <p className="text-xs text-gray-400 line-clamp-3 pt-1">
                        {(job.description || '').replace(/[#*`_]/g, '')}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                      <button
                        onClick={() => toggleJobStatus(job)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          job.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30'
                        }`}
                      >
                        {job.status === 'Active' ? '● Active (Live)' : '○ Closed'}
                      </button>

                      <button
                        onClick={() => job._id && deleteJob(job._id)}
                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        title="Delete Opportunity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 3: VERIFIED OFFERS DIRECTORY
        ========================================== */}
        {activeTab === 'verifiedOffers' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Verified Offer Letters & Certificate Directory</h3>
                <p className="text-xs text-gray-400">Every candidate marked as "Hired" receives an official Offer ID verifiable online</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Offer ID</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Role & Type</th>
                    <th className="py-3 px-4">Joining Date</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifiedOffers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-gray-500">
                        No official Offer Letters issued yet. When a candidate is marked as "Hired", an Offer ID is generated here.
                      </td>
                    </tr>
                  ) : (
                    verifiedOffers.map((off, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02]">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400 text-sm">
                          {off.offerId}
                        </td>
                        <td className="py-3.5 px-4 text-white font-semibold">
                          {off.candidateName}
                          <div className="text-[10px] text-gray-500">{off.candidateEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-300">
                          {off.jobTitle} ({off.jobType})
                        </td>
                        <td className="py-3.5 px-4 text-blue-300">
                          {off.joiningDate || 'Immediate'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-400">
                          {off.issuedAt ? new Date(off.issuedAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Verified & Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: LEGACY GENERAL CAREERS
        ========================================== */}
        {activeTab === 'legacyCareers' && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Education</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Resume</th>
                  <th className="py-3 px-4">Submitted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {legacyCareers.map(c => (
                  <tr key={c._id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 text-white font-bold">{c.name}<div className="text-gray-500 text-[10px]">{c.email} • {c.phone}</div></td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{c.domain}</td>
                    <td className="py-3.5 px-4 text-gray-300">{c.qualification}<div className="text-gray-500 text-[10px]">{c.institute_university}</div></td>
                    <td className="py-3.5 px-4 text-gray-400">{c.city ? `${c.city}, ${c.state}` : c.state || 'N/A'}</td>
                    <td className="py-3.5 px-4">{c.resumeUrl ? <a href={c.resumeUrl} target="_blank" className="text-blue-400 underline">View CV</a> : 'None'}</td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==========================================
            TAB 5: CONTACTS
        ========================================== */}
        {activeTab === 'contacts' && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Message</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contacts.map(c => (
                  <tr key={c._id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 text-white font-bold">{c.name}<div className="text-gray-500 text-[10px]">{c.email}</div></td>
                    <td className="py-3.5 px-4 text-purple-400 font-semibold">{c.subject}</td>
                    <td className="py-3.5 px-4 text-gray-300 max-w-md">{c.message}</td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==========================================
            TAB 6: APPOINTMENTS
        ========================================== */}
        {activeTab === 'appointments' && (
          <div className="rounded-2xl bg-white/[0.02] border border-white/10 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/[0.04] text-gray-400 font-bold uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Service</th>
                  <th className="py-3 px-4">Date & Slot</th>
                  <th className="py-3 px-4">Meet Room</th>
                  <th className="py-3 px-4">Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {appointments.map(a => (
                  <tr key={a._id} className="hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4 text-white font-bold">{a.client_name}<div className="text-gray-500 text-[10px]">{a.client_email}</div></td>
                    <td className="py-3.5 px-4 text-emerald-400 font-semibold">{a.service_type}</td>
                    <td className="py-3.5 px-4 text-blue-300 font-bold">{a.appointment_date} ({a.appointment_time})</td>
                    <td className="py-3.5 px-4"><a href={a.meet_link || STATIC_MEET_LINK} target="_blank" className="text-blue-400 underline">Join Meet</a></td>
                    <td className="py-3.5 px-4 text-gray-500">{new Date(a.bookedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ==========================================
            MODAL: CREATE / UPLOAD OPPORTUNITY
        ========================================== */}
        {isCreateJobOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-[#0b0f19] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl my-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-black text-white">Upload New Opportunity</h3>
                  <p className="text-xs text-gray-400">Post a Job or Internship position to the public Careers section</p>
                </div>
                <button onClick={() => setIsCreateJobOpen(false)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {jobFormError && (
                <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs">
                  {jobFormError}
                </div>
              )}

              <form onSubmit={handleSaveJobPosting} className="space-y-4">
                {/* 1. Opportunity Type Dropdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      1. Opportunity Type <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={jobFormType}
                      onChange={(e) => {
                        const val = e.target.value as 'Job' | 'Internship';
                        setJobFormType(val);
                        if (val === 'Internship' && jobFormDuration === 'Full Time') {
                          setJobFormDuration('3-6 Months');
                        }
                      }}
                      className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Job">1. Job (Full-Time / Contract)</option>
                      <option value="Internship">2. Internship</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      Duration <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text"
                      required
                      value={jobFormDuration}
                      onChange={(e) => setJobFormDuration(e.target.value)}
                      placeholder="e.g. 6 Months / Full Time"
                      className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* 2. Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Position Title <span className="text-red-400">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={jobFormTitle}
                    onChange={(e) => setJobFormTitle(e.target.value)}
                    placeholder="e.g. Full Stack Developer, AI/ML Intern, React Specialist"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                {/* 3. Work Mode & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                      Work Mode (Menu) <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={jobFormWorkMode}
                      onChange={(e) => setJobFormWorkMode(e.target.value as any)}
                      className="w-full bg-[#111624] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                    >
                      <option value="Remote">Remote</option>
                      <option value="Onsite">Onsite</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>

                  {(jobFormWorkMode === 'Onsite' || jobFormWorkMode === 'Hybrid') && (
                    <div className="space-y-1.5 animate-in fade-in duration-150">
                      <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                        Office Location <span className="text-red-400">*</span>
                      </label>
                      <input 
                        type="text"
                        required
                        value={jobFormLocation}
                        onChange={(e) => setJobFormLocation(e.target.value)}
                        placeholder="e.g. Nellore, Andhra Pradesh / Bangalore"
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* 4. Key Context & AI Generator */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-blue-300 flex items-center gap-1.5">
                      <Sparkles size={13} /> Key Context / Focus Keywords (Optional for AI Generation)
                    </label>
                    <button
                      type="button"
                      disabled={jobFormGeneratingAI}
                      onClick={handleGenerateAIDescription}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 disabled:opacity-50 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                    >
                      {jobFormGeneratingAI ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                      <span>Generate AI Description</span>
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={jobFormKeyContext}
                    onChange={(e) => setJobFormKeyContext(e.target.value)}
                    placeholder="e.g. React 19, TypeScript, Tailwind, Node.js API, REST, MongoDB, Nellore mentorship"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2 text-white text-xs outline-none focus:border-blue-500"
                  />
                </div>

                {/* 5. Description Section */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                    Description Section <span className="text-red-400">*</span>
                  </label>
                  <textarea 
                    rows={6}
                    required
                    value={jobFormDescription}
                    onChange={(e) => setJobFormDescription(e.target.value)}
                    placeholder="Enter or AI-generate job description, responsibilities, and requirements..."
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white text-xs outline-none focus:border-blue-500 resize-none font-sans"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsCreateJobOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={jobFormSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:opacity-90 disabled:opacity-50"
                  >
                    {jobFormSaving ? 'Publishing...' : 'Publish Opportunity'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================
            MODAL: CANDIDATE APPLICATION DETAIL & STATUS UPDATE
        ========================================== */}
        {selectedAppForDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-3xl bg-[#0b0f19] border border-white/10 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl my-auto">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {selectedAppForDetail.applicationId}
                    </span>
                    <span className="text-xs text-gray-400">
                      Applied for <strong className="text-white">{selectedAppForDetail.jobTitle} ({selectedAppForDetail.jobType})</strong>
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white">{selectedAppForDetail.name}</h3>
                </div>

                <button onClick={() => setSelectedAppForDetail(null)} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* 3-Stage Information Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                
                {/* Stage 1 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="font-bold text-blue-400 uppercase text-[10px] tracking-wider">Stage 1: Basic Details</div>
                  <div><strong className="text-gray-400">Email:</strong> <span className="text-white">{selectedAppForDetail.email}</span></div>
                  <div><strong className="text-gray-400">Phone:</strong> <span className="text-white">{selectedAppForDetail.phone}</span></div>
                  <div><strong className="text-gray-400">Location:</strong> <span className="text-white">{selectedAppForDetail.location}</span></div>
                  {selectedAppForDetail.resumeUrl && (
                    <div className="pt-1">
                      <a href={selectedAppForDetail.resumeUrl} target="_blank" rel="noreferrer" className="text-blue-400 underline font-bold flex items-center gap-1">
                        <FileText size={12} /> Download / View Resume
                      </a>
                    </div>
                  )}
                </div>

                {/* Stage 2 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="font-bold text-purple-400 uppercase text-[10px] tracking-wider">Stage 2: Education & Exp</div>
                  <div><strong className="text-gray-400">Degree:</strong> <span className="text-white">{selectedAppForDetail.highestQualification}</span></div>
                  <div><strong className="text-gray-400">College:</strong> <span className="text-white">{selectedAppForDetail.collegeName}</span></div>
                  <div><strong className="text-gray-400">Branch:</strong> <span className="text-white">{selectedAppForDetail.sector}</span></div>
                  <div><strong className="text-gray-400">Score:</strong> <span className="text-emerald-400 font-bold">{selectedAppForDetail.score}</span> ({selectedAppForDetail.yearOfCompletion})</div>
                  <div><strong className="text-gray-400">Experience:</strong> <span className="text-gray-300">{selectedAppForDetail.jobExperienceDetails || 'Fresher'}</span></div>
                </div>

                {/* Stage 3 */}
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider">Stage 3: Verification</div>
                  <div><strong className="text-gray-400">Gender:</strong> <span className="text-white">{selectedAppForDetail.gender}</span></div>
                  <div><strong className="text-gray-400">DOB:</strong> <span className="text-white">{selectedAppForDetail.dob || 'N/A'}</span></div>
                  <div><strong className="text-gray-400">Terms Agreed:</strong> <span className="text-emerald-400">Yes</span></div>
                  {selectedAppForDetail.offerDetails?.offerId && (
                    <div className="pt-1 font-mono text-emerald-300 font-bold">
                      Offer ID: {selectedAppForDetail.offerDetails.offerId}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Update Pipeline Actions */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/20 via-indigo-900/20 to-purple-900/20 border border-white/10 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Change Pipeline Status & Dispatch Automatic Email:
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                    selectedAppForDetail.status === 'Hired' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  }`}>
                    Current: {selectedAppForDetail.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleUpdateApplicationStatus('Shortlisted')}
                    disabled={statusUpdating}
                    className="px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-bold transition-all"
                  >
                    🎉 Shortlist Candidate
                  </button>

                  <button
                    onClick={() => setStatusUpdateMode(statusUpdateMode === 'interview' ? 'idle' : 'interview')}
                    className="px-3.5 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-bold transition-all"
                  >
                    📅 Schedule Interview
                  </button>

                  <button
                    onClick={() => setStatusUpdateMode(statusUpdateMode === 'hire' ? 'idle' : 'hire')}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition-all"
                  >
                    🏆 Hire & Issue Offer ID
                  </button>

                  <button
                    onClick={() => handleUpdateApplicationStatus('Dropped')}
                    disabled={statusUpdating}
                    className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 text-red-300 text-xs font-bold transition-all"
                  >
                    🚫 Drop / Reject
                  </button>
                </div>

                {/* Sub-form: Interview Scheduling */}
                {statusUpdateMode === 'interview' && (
                  <div className="p-4 rounded-xl bg-black/40 border border-blue-500/30 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-bold text-blue-300">Configure Interview Slot (Sends Automated Meet Email):</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input 
                        type="date" 
                        value={interviewDate}
                        onChange={(e) => setInterviewDate(e.target.value)}
                        className="bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <input 
                        type="text" 
                        value={interviewTime}
                        onChange={(e) => setInterviewTime(e.target.value)}
                        placeholder="Time slot (e.g. 11:00 AM IST)"
                        className="bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      />
                      <input 
                        type="text" 
                        value={interviewLink}
                        onChange={(e) => setInterviewLink(e.target.value)}
                        placeholder="Meet link"
                        className="bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateApplicationStatus('Interview Scheduled')}
                      disabled={statusUpdating}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      {statusUpdating ? 'Sending...' : 'Confirm & Dispatch Interview Invitation Email'}
                    </button>
                  </div>
                )}

                {/* Sub-form: Hire & Offer ID */}
                {statusUpdateMode === 'hire' && (
                  <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-3 animate-in fade-in">
                    <h4 className="text-xs font-bold text-emerald-300">Assign Unique Offer ID & Dispatch Official Selection Email:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Offer ID (Verifiable Online)</label>
                        <input 
                          type="text" 
                          value={hireOfferId}
                          onChange={(e) => setHireOfferId(e.target.value.toUpperCase())}
                          placeholder="e.g. FBT-01I-A101"
                          className="w-full bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-emerald-300 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Joining Date</label>
                        <input 
                          type="text" 
                          value={hireJoiningDate}
                          onChange={(e) => setHireJoiningDate(e.target.value)}
                          placeholder="Immediate / Date"
                          className="w-full bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Terms / Stipend</label>
                        <input 
                          type="text" 
                          value={hireCompensation}
                          onChange={(e) => setHireCompensation(e.target.value)}
                          placeholder="As discussed"
                          className="w-full bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateApplicationStatus('Hired')}
                      disabled={statusUpdating}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      {statusUpdating ? 'Sending...' : 'Confirm Hire & Dispatch Official Offer Letter Email'}
                    </button>
                  </div>
                )}
              </div>

              {/* Ready-To-Copy Email Preview Box (For manual sending if needed) */}
              {copiedTemplate && (
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Mail size={14} /> Ready-to-Copy Email Prepared (Manual Copy Available):
                    </span>
                    <button
                      onClick={handleCopyEmailText}
                      className="px-3 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1 hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/20"
                    >
                      {hasCopiedText ? <Check size={12} /> : <Copy size={12} />}
                      <span>{hasCopiedText ? 'Copied!' : 'Copy Email Text'}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-black/50 rounded-xl font-mono text-[11px] text-gray-300 space-y-1 max-h-36 overflow-y-auto whitespace-pre-wrap">
                    <div className="text-blue-400 font-bold">Subject: {copiedTemplate.subject}</div>
                    <div className="text-gray-400">To: {copiedTemplate.to}</div>
                    <div className="border-t border-white/10 pt-1 mt-1">{copiedTemplate.body}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
