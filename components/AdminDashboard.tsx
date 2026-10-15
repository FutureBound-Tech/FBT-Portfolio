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
  Paperclip,
  AlertCircle,
  SlidersHorizontal,
  X,
  Send,
  Loader2,
  Users,
  CheckSquare,
  Square,
  Home,
  Edit3
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
  location?: string;
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
    offerLetterUrl?: string;
    offerLetterFilename?: string;
    issuedAt?: string;
  };
  statusHistory?: Array<{
    status: string;
    timestamp: string;
    notes?: string;
    details?: {
      interviewDate?: string;
      interviewTime?: string;
      interviewLink?: string;
      offerId?: string;
      joiningDate?: string;
      compensation?: string;
      offerLetterUrl?: string;
      isRescheduled?: boolean;
      rescheduleReason?: string;
      rescheduleReasonKey?: string;
    };
  }>;
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
  offerLetterUrl?: string;
  offerLetterFilename?: string;
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
  const [activeTab, setActiveTab] = useState<'jobApplications' | 'postJobs' | 'verifiedOffers' | 'legacyCareers' | 'contacts' | 'appointments' | 'sendMessage' | 'enquiries'>('jobApplications');
  const [enquirySubTab, setEnquirySubTab] = useState<'all' | 'legacyCareers' | 'contacts' | 'appointments'>('all');
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
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);
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

  // Sanitize AI Generated Message to strictly remove any ** Content ** or section headings
  const sanitizeEnhancedMessage = (text: string) => {
    if (!text) return '';
    return text
      .replace(/\*{2,}\s*content\s*\*{2,}:?/gi, '')
      .replace(/^#+\s*content:?/gim, '')
      .replace(/\*{2,}\s*core message\s*\*{2,}:?/gi, '')
      .replace(/^#+\s*core message:?/gim, '')
      .replace(/\*{2,}\s*introduction\s*\*{2,}:?/gi, '')
      .replace(/^#+\s*introduction:?/gim, '')
      .replace(/\*{2,}\s*next steps\s*\*{2,}:?/gi, '')
      .replace(/^#+\s*next steps:?/gim, '')
      .replace(/\*{2,}\s*message body\s*\*{2,}:?/gi, '')
      .replace(/^#+\s*message body:?/gim, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  // Modal: View Candidate Application & Status Action
  const [selectedAppForDetail, setSelectedAppForDetail] = useState<CandidateJobApplication | null>(null);
  const [statusUpdateMode, setStatusUpdateMode] = useState<'idle' | 'shortlist' | 'interview' | 'reschedule' | 'hire' | 'drop'>('idle');
  const [rescheduleReasonKey, setRescheduleReasonKey] = useState<'candidate_unavailable' | 'candidate_tech_issue' | 'hr_panel_unavailable' | 'custom'>('candidate_unavailable');
  const [rescheduleCustomReason, setRescheduleCustomReason] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewTime, setInterviewTime] = useState('11:00 AM IST');
  const [interviewLink, setInterviewLink] = useState(STATIC_MEET_LINK);
  const [hireOfferId, setHireOfferId] = useState('');
  const [hireJoiningDate, setHireJoiningDate] = useState('Immediate');
  const [hireCompensation, setHireCompensation] = useState('Standard Stipend / Package');
  const [hireOfferFile, setHireOfferFile] = useState<File | null>(null);
  const [hireOfferBase64, setHireOfferBase64] = useState<string | null>(null);
  const [offerFileError, setOfferFileError] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  
  // Ready-to-copy email template state
  const [copiedTemplate, setCopiedTemplate] = useState<{ subject: string; body: string } | null>(null);
  const [hasCopiedText, setHasCopiedText] = useState(false);

  // Tab 7: Send Message & Job Opportunity Broadcast States
  const [selectedBroadcastCandidateIds, setSelectedBroadcastCandidateIds] = useState<Set<string>>(new Set());
  const [candidateSourcePool, setCandidateSourcePool] = useState<'all' | 'jobApplications' | 'legacyCareers'>('jobApplications');
  const [broadcastSearchQuery, setBroadcastSearchQuery] = useState('');
  const [broadcastRoleFilter, setBroadcastRoleFilter] = useState('All');
  const [broadcastStatusFilter, setBroadcastStatusFilter] = useState('All');

  // Message composer fields
  const [broadcastHeading, setBroadcastHeading] = useState('');
  const [broadcastRawContent, setBroadcastRawContent] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastContextNotes, setBroadcastContextNotes] = useState('');
  const [broadcastAttachments, setBroadcastAttachments] = useState<Array<{ name: string; size: number; base64: string; type: string }>>([]);
  const [attachmentError, setAttachmentError] = useState('');

  // AI & Sending states
  const [broadcastStructuredData, setBroadcastStructuredData] = useState<any>(null);
  const [isAiEnhancing, setIsAiEnhancing] = useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [broadcastSendReport, setBroadcastSendReport] = useState<{ sentCount: number; total: number; failedCount: number; message: string } | null>(null);

  // Final Output Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewCandidateIndex, setPreviewCandidateIndex] = useState(0);

  // Broadcast History State
  const [broadcastHistory, setBroadcastHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showBroadcastHistory, setShowBroadcastHistory] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);

  // File attach handler for Offer Letter PDF
  const handleOfferFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOfferFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setOfferFileError('Only PDF files are permitted for Offer Letters.');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setOfferFileError('PDF file size exceeds 15MB limit.');
      return;
    }

    setHireOfferFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setHireOfferBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewOfferPdf = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!hireOfferFile) return;
    const url = URL.createObjectURL(hireOfferFile);
    window.open(url, '_blank');
  };

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

  // Open Edit Job Modal
  const handleOpenEditJob = (job: JobPosting) => {
    setEditingJob(job);
    setJobFormType(job.type);
    setJobFormTitle(job.title);
    setJobFormDuration(job.duration || (job.type === 'Internship' ? '3-6 Months' : 'Full Time'));
    setJobFormWorkMode(job.workMode || 'Remote');
    setJobFormLocation(job.location || '');
    setJobFormKeyContext(job.keyContext || '');
    setJobFormDescription(job.description || '');
    setJobFormError('');
    setIsCreateJobOpen(true);
  };

  // Close Job Modal & Reset State
  const handleCloseJobModal = () => {
    setIsCreateJobOpen(false);
    setEditingJob(null);
    setJobFormTitle('');
    setJobFormKeyContext('');
    setJobFormDescription('');
    setJobFormLocation('');
    setJobFormDuration('Full Time');
    setJobFormError('');
  };

  // Create or Update Job / Internship Posting
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
      const endpoint = editingJob && editingJob._id ? `/api/jobs/${editingJob._id}` : '/api/jobs';
      const method = editingJob && editingJob._id ? 'PUT' : 'POST';

      const res = await fetch(endpoint, {
        method,
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
        showNotification(editingJob ? `🎉 Opportunity "${jobFormTitle}" updated successfully!` : `🎉 ${jobFormType} "${jobFormTitle}" created and published!`);
        handleCloseJobModal();
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
    setRescheduleReasonKey('candidate_unavailable');
    setRescheduleCustomReason('');
    setInterviewDate(new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setHireOfferId(app.offerDetails?.offerId || `FBT-${app.jobType === 'Internship' ? '01I' : '01J'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
    setHireJoiningDate(app.offerDetails?.joiningDate || 'Immediate');
    setHireCompensation(app.offerDetails?.compensation || 'Standard Stipend / Package');
    setHireOfferFile(null);
    setHireOfferBase64(null);
    setOfferFileError('');
    setCopiedTemplate(null);
    setHasCopiedText(false);
  };

  // Update Application Status & Auto-Send Email
  const handleUpdateApplicationStatus = async (newStatus: CandidateJobApplication['status']) => {
    if (!selectedAppForDetail) return;
    setStatusUpdating(true);

    const isRescheduled = statusUpdateMode === 'reschedule';
    const isRescheduling = isRescheduled;

    try {
      const payload: any = { status: newStatus };
      if (newStatus === 'Interview Scheduled') {
        payload.interviewDate = interviewDate;
        payload.interviewTime = interviewTime;
        payload.interviewLink = interviewLink;

        if (isRescheduled) {
          payload.isRescheduled = true;
          payload.rescheduleReasonKey = rescheduleReasonKey;
          let calculatedReason = '';
          if (rescheduleReasonKey === 'candidate_unavailable') {
            calculatedReason = 'Candidate was unavailable at previously scheduled slot';
          } else if (rescheduleReasonKey === 'candidate_tech_issue') {
            calculatedReason = 'Technical / Network Connectivity issues experienced during session';
          } else if (rescheduleReasonKey === 'hr_panel_unavailable') {
            calculatedReason = 'Unavailability of HR & Technical Interview Panel for original slot';
          } else {
            calculatedReason = rescheduleCustomReason.trim() || 'Schedule revision by mutual coordination';
          }
          payload.rescheduleReason = calculatedReason;
        }
      } else if (newStatus === 'Hired') {
        payload.offerId = hireOfferId.trim();
        payload.joiningDate = hireJoiningDate;
        payload.compensation = hireCompensation;
        if (hireOfferBase64 && hireOfferFile) {
          payload.offerPdfBase64 = hireOfferBase64;
          payload.offerPdfFilename = hireOfferFile.name;
        }
      }

      const res = await fetch(`/api/job-applications/${selectedAppForDetail._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const attachedNotice = hireOfferFile ? ' with attached Offer Letter PDF' : '';
        const successMsg = isRescheduled
          ? '🔁 Interview successfully rescheduled! Revised Meet email dispatched to candidate.'
          : `✅ Status changed to "${newStatus}". Automated email sent to candidate${attachedNotice}!`;
        showNotification(successMsg);
        if (data.manualTemplate) {
          setCopiedTemplate(data.manualTemplate);
        }
        setSelectedAppForDetail(prev => prev ? { 
          ...prev, 
          status: newStatus, 
          offerDetails: data.offerId ? { 
            offerId: data.offerId, 
            candidateName: prev.name, 
            candidateEmail: prev.email, 
            jobTitle: prev.jobTitle, 
            jobType: prev.jobType, 
            joiningDate: hireJoiningDate,
            compensation: hireCompensation,
            offerLetterUrl: data.offerLetterUrl || prev.offerDetails?.offerLetterUrl,
            offerLetterFilename: hireOfferFile?.name || prev.offerDetails?.offerLetterFilename,
            issuedAt: new Date().toISOString() 
          } : prev.offerDetails,
          statusHistory: [
            ...(prev.statusHistory || []),
            {
              status: newStatus,
              timestamp: new Date().toISOString(),
              notes: isRescheduled ? `Rescheduled: ${payload.rescheduleReason || 'Slot updated'}` : `Updated to ${newStatus}`,
              details: {
                interviewDate,
                interviewTime,
                interviewLink,
                isRescheduled,
                rescheduleReason: payload.rescheduleReason || '',
                rescheduleReasonKey: payload.rescheduleReasonKey || ''
              }
            }
          ]
        } : null);
        setHireOfferFile(null);
        setHireOfferBase64(null);
        setOfferFileError('');
        setStatusUpdateMode('idle');
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
  // SEND MESSAGE & BROADCAST LOGIC
  // ==========================================
  const allSelectableCandidates = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      title: string;
      status: string;
      source: 'jobApp' | 'legacyCareer';
    }> = [];

    if (candidateSourcePool === 'all' || candidateSourcePool === 'jobApplications') {
      jobApplications.forEach(app => {
        list.push({
          id: app._id,
          name: app.name || 'Candidate',
          email: app.email,
          phone: app.phone,
          title: app.jobTitle || app.jobId || 'Job Applicant',
          status: app.status || 'Applied',
          source: 'jobApp'
        });
      });
    }

    if (candidateSourcePool === 'all' || candidateSourcePool === 'legacyCareers') {
      legacyCareers.forEach(car => {
        list.push({
          id: car._id,
          name: car.name || 'Candidate',
          email: car.email,
          phone: car.phone,
          title: car.domain || 'General Career Applicant',
          status: 'General',
          source: 'legacyCareer'
        });
      });
    }

    return list;
  }, [candidateSourcePool, jobApplications, legacyCareers]);

  const filteredBroadcastCandidates = useMemo(() => {
    return allSelectableCandidates.filter(c => {
      const q = broadcastSearchQuery.toLowerCase();
      const matchSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q);
      const matchRole = broadcastRoleFilter === 'All' || c.title.toLowerCase().includes(broadcastRoleFilter.toLowerCase());
      const matchStatus = broadcastStatusFilter === 'All' || c.status.toLowerCase() === broadcastStatusFilter.toLowerCase();
      return matchSearch && matchRole && matchStatus;
    });
  }, [allSelectableCandidates, broadcastSearchQuery, broadcastRoleFilter, broadcastStatusFilter]);

  const selectedRecipientObjects = useMemo(() => {
    return allSelectableCandidates.filter(c => selectedBroadcastCandidateIds.has(c.id));
  }, [allSelectableCandidates, selectedBroadcastCandidateIds]);

  const toggleCandidateSelection = (id: string) => {
    const next = new Set(selectedBroadcastCandidateIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedBroadcastCandidateIds(next);
  };

  const selectAllFiltered = () => {
    const next = new Set(selectedBroadcastCandidateIds);
    filteredBroadcastCandidates.forEach(c => next.add(c.id));
    setSelectedBroadcastCandidateIds(next);
  };

  const deselectAll = () => {
    setSelectedBroadcastCandidateIds(new Set());
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAttachmentError('');
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (file.size > 10 * 1024 * 1024) {
        setAttachmentError(`File "${file.name}" exceeds 10MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64 = uploadEvent.target?.result as string;
        setBroadcastAttachments(prev => [
          ...prev,
          {
            name: file.name,
            size: file.size,
            base64,
            type: file.type || 'application/octet-stream'
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeAttachment = (index: number) => {
    setBroadcastAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleAiEnhance = async () => {
    if (!broadcastRawContent.trim()) {
      alert('Please paste or write your raw message content first before enhancing with AI.');
      return;
    }

    setIsAiEnhancing(true);
    try {
      const res = await fetch('/api/messages/enhance-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: broadcastRawContent,
          context: broadcastContextNotes || (selectedRecipientObjects.length > 0 ? `Target roles: ${selectedRecipientObjects.slice(0, 3).map(r => r.title).join(', ')}` : '')
        })
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastHeading(data.heading);
        setBroadcastMessage(sanitizeEnhancedMessage(data.enhancedMessage));
        if (data.structuredData) {
          setBroadcastStructuredData(data.structuredData);
        }
        showNotification('✨ Heading generated and message enhanced by AI! You can edit anytime.');
      } else {
        alert(data.message || 'Failed to enhance message with AI');
      }
    } catch (err: any) {
      alert('Network error while enhancing message: ' + err.message);
    } finally {
      setIsAiEnhancing(false);
    }
  };

  const handleOpenPreview = async () => {
    if (selectedRecipientObjects.length === 0) {
      alert('Please select at least one candidate to send the message to.');
      return;
    }
    const finalMsg = broadcastMessage.trim() || broadcastRawContent.trim();
    if (!finalMsg) {
      alert('Please provide message content or paste notes and enhance with AI.');
      return;
    }

    const headingToUse = broadcastHeading.trim() || 'Job Opportunity Update • Future Bound Tech';
    setPreviewLoading(true);
    setPreviewModalOpen(true);
    setPreviewCandidateIndex(0);

    try {
      const sampleCandidate = selectedRecipientObjects[0];
      const res = await fetch('/api/messages/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: headingToUse,
          message: finalMsg,
          candidateName: sampleCandidate?.name || 'Candidate',
          attachments: broadcastAttachments,
          structuredData: broadcastStructuredData
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewHtml(data.html);
      } else {
        setPreviewHtml(`<div style="padding:20px; color:#ef4444;">Failed to generate preview: ${data.message}</div>`);
      }
    } catch (err: any) {
      setPreviewHtml(`<div style="padding:20px; color:#ef4444;">Preview error: ${err.message}</div>`);
    } finally {
      setPreviewLoading(false);
    }
  };

  const updatePreviewSampleCandidate = async (index: number) => {
    if (index < 0 || index >= selectedRecipientObjects.length) return;
    setPreviewCandidateIndex(index);
    const sampleCandidate = selectedRecipientObjects[index];
    const finalMsg = broadcastMessage.trim() || broadcastRawContent.trim();
    const headingToUse = broadcastHeading.trim() || 'Job Opportunity Update • Future Bound Tech';

    try {
      const res = await fetch('/api/messages/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heading: headingToUse,
          message: finalMsg,
          candidateName: sampleCandidate?.name || 'Candidate',
          attachments: broadcastAttachments,
          structuredData: broadcastStructuredData
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewHtml(data.html);
      }
    } catch (e) {
      console.warn('Preview update error:', e);
    }
  };

  const handleConfirmSendBroadcast = async () => {
    if (selectedRecipientObjects.length === 0) {
      alert('No recipients selected');
      return;
    }
    const finalMsg = broadcastMessage.trim() || broadcastRawContent.trim();
    const finalHeading = broadcastHeading.trim() || 'Job Opportunity Update • Future Bound Tech';

    if (!finalMsg) {
      alert('Message content is empty');
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const res = await fetch('/api/messages/send-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipients: selectedRecipientObjects.map(r => ({
            name: r.name,
            email: r.email,
            jobTitle: r.title
          })),
          heading: finalHeading,
          message: finalMsg,
          attachments: broadcastAttachments.map(a => ({
            filename: a.name,
            content: a.base64,
            contentType: a.type
          })),
          structuredData: broadcastStructuredData
        })
      });
      const data = await res.json();
      if (data.success) {
        setPreviewModalOpen(false);
        setBroadcastSendReport({
          sentCount: data.details?.sentCount ?? selectedRecipientObjects.length,
          total: selectedRecipientObjects.length,
          failedCount: data.details?.failedCount ?? 0,
          message: data.message
        });
        showNotification(`🚀 Successfully sent emails to ${data.details?.sentCount || selectedRecipientObjects.length} candidate(s)!`);
        fetchBroadcastHistory();
      } else {
        alert(data.message || 'Failed to dispatch broadcast');
      }
    } catch (err: any) {
      alert('Network error while dispatching broadcast: ' + err.message);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  const fetchBroadcastHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/messages/broadcast-history');
      const data = await res.json();
      if (data.success) {
        setBroadcastHistory(data.data || []);
      }
    } catch (err) {
      console.warn('Failed to load broadcast history:', err);
    } finally {
      setLoadingHistory(false);
    }
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
        
        {/* Top Header / Navigation Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
          {/* Left: Home Icon + Logo + Company Name */}
          <div className="flex items-center gap-3">
            <button 
              onClick={onBack}
              title="Return to Main Website"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-gray-400 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
            >
              <Home size={18} />
            </button>

            <div className="h-6 w-px bg-white/10"></div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white border border-white/20 flex items-center justify-center p-0.5 shadow-md overflow-hidden">
                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain scale-105" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">{COMPANY_NAME}</span>
            </div>
          </div>

          {/* Center: Top Nav with Recruitment and Enquiry */}
          <div className="flex items-center gap-2 p-1 bg-white/[0.03] border border-white/10 rounded-2xl">
            {/* Nav: Recruitment */}
            <button
              onClick={() => {
                if (activeTab === 'enquiries' || activeTab === 'legacyCareers' || activeTab === 'contacts' || activeTab === 'appointments') {
                  setActiveTab('jobApplications');
                }
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab !== 'enquiries' && activeTab !== 'legacyCareers' && activeTab !== 'contacts' && activeTab !== 'appointments'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers size={14} />
              <span>Recruitment</span>
            </button>

            {/* Nav: Enquiry */}
            <button
              onClick={() => {
                setActiveTab('enquiries');
                setEnquirySubTab('all');
              }}
              className={`px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'enquiries' || activeTab === 'legacyCareers' || activeTab === 'contacts' || activeTab === 'appointments'
                  ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Mail size={14} className={activeTab === 'enquiries' || activeTab === 'legacyCareers' || activeTab === 'contacts' || activeTab === 'appointments' ? 'text-white' : 'text-cyan-400'} />
              <span>Enquiry</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 text-[10px] font-bold">
                {legacyCareers.length + contacts.length + appointments.length}
              </span>
            </button>
          </div>

          {/* Right: Quick Actions & Logout as logo at end */}
          <div className="flex items-center gap-2">
            <button 
              onClick={fetchData} 
              disabled={loading}
              title="Refresh Data"
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin text-blue-400' : ''} />
            </button>

            <button 
              onClick={exportAppsCSV}
              title="Export Applications CSV"
              className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 transition-all cursor-pointer"
            >
              <Download size={16} />
            </button>

            {/* Logout logo at the very end of top */}
            <button 
              onClick={handleLogout}
              title="Logout from Admin"
              className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ml-1"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="p-3.5 bg-blue-500/20 border border-blue-500/40 rounded-xl text-blue-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} /> {notification}
          </div>
        )}

        {/* Top Metric Cards / Primary Tab Switchers (Hiring & Opportunities Hub) */}
        {activeTab !== 'enquiries' && activeTab !== 'legacyCareers' && activeTab !== 'contacts' && activeTab !== 'appointments' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          
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

          {/* Card 4: Send Message & Job Opportunity Updates */}
          <div 
            onClick={() => setActiveTab('sendMessage')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
              activeTab === 'sendMessage' 
                ? 'bg-gradient-to-br from-indigo-600/25 to-purple-600/25 border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.35)]' 
                : 'bg-white/[0.02] border-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Updates</span>
              <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400"><Send size={16} /></div>
            </div>
            <div className="text-xl sm:text-2xl font-black mt-2 text-white">
              {selectedBroadcastCandidateIds.size > 0 ? (
                <span className="text-indigo-400">{selectedBroadcastCandidateIds.size} <span className="text-[11px] font-semibold text-gray-400">Selected</span></span>
              ) : (
                <span>{allSelectableCandidates.length}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
              <Sparkles size={10} className="text-purple-400" /> Send Message
            </p>
            {activeTab === 'sendMessage' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>}
          </div>
        </div>
        )}

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

              {/* Quick Message Broadcast Action */}
              <button
                type="button"
                onClick={() => {
                  const ids = filteredJobApps.map(a => a._id);
                  setSelectedBroadcastCandidateIds(new Set(ids));
                  setCandidateSourcePool('jobApplications');
                  setActiveTab('sendMessage');
                }}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-1.5 shrink-0"
                title="Send update message to filtered candidates"
              >
                <Send size={13} />
                <span>Message Candidates ({filteredJobApps.length})</span>
              </button>
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
                                onClick={() => {
                                  setSelectedBroadcastCandidateIds(new Set([app._id]));
                                  setCandidateSourcePool('jobApplications');
                                  setActiveTab('sendMessage');
                                }}
                                className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition-all"
                                title="Send Job Opportunity Update Message"
                              >
                                <Send size={13} />
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
                onClick={() => {
                  handleCloseJobModal();
                  setIsCreateJobOpen(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 hover:opacity-95 transition-all cursor-pointer"
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
                  onClick={() => {
                    handleCloseJobModal();
                    setIsCreateJobOpen(true);
                  }}
                  className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold text-xs cursor-pointer"
                >
                  Create First Opportunity
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {jobs.map(job => (
                  <div key={job._id || job.jobId} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-4 flex flex-col justify-between hover:border-white/20 transition-all">
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

                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleJobStatus(job)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          job.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20' 
                            : 'bg-gray-500/10 text-gray-400 border-gray-500/30 hover:bg-gray-500/20'
                        }`}
                      >
                        {job.status === 'Active' ? '● Active' : '○ Closed'}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditJob(job)}
                          className="px-2.5 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                          title="Edit Opportunity Data"
                        >
                          <Edit3 size={13} /> Edit
                        </button>

                        <button
                          onClick={() => job._id && deleteJob(job._id)}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer"
                          title="Delete Opportunity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
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
                    <th className="py-3 px-4">Offer Letter (PDF)</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {verifiedOffers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-gray-500">
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
                          {off.offerLetterUrl ? (
                            <a
                              href={off.offerLetterUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold transition-all shadow-sm"
                            >
                              <FileText size={12} />
                              <span>View PDF</span>
                            </a>
                          ) : (
                            <span className="text-gray-500 text-[11px] italic">Not attached</span>
                          )}
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
            ENQUIRY SECTION: ALL 3 SECTIONS
        ========================================== */}
        {(activeTab === 'enquiries' || activeTab === 'legacyCareers' || activeTab === 'contacts' || activeTab === 'appointments') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Enquiry Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 via-[#0d1222] to-blue-950/30 border border-cyan-500/20 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Enquiry Hub
                    </span>
                    <span className="text-gray-400 text-xs">• 3 Sections Overview</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    Enquiry Section
                  </h2>
                  <p className="text-xs text-gray-400 max-w-2xl mt-1 leading-relaxed">
                    Review candidate spontaneous career submissions, direct client contact inquiries, and consultation bookings.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('jobApplications')}
                    className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft size={14} /> Back to Job Applications
                  </button>
                </div>
              </div>
            </div>

            {/* The 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Box 1: General (Spontaneous Careers) */}
              <div 
                onClick={() => setEnquirySubTab('legacyCareers')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  enquirySubTab === 'legacyCareers' 
                    ? 'bg-amber-600/15 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">General</span>
                  <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400"><GraduationCap size={16} /></div>
                </div>
                <div className="text-3xl font-black mt-2 text-white">{legacyCareers.length}</div>
                <p className="text-[11px] text-gray-400 mt-0.5">Spontaneous</p>
                {enquirySubTab === 'legacyCareers' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>}
              </div>

              {/* Box 2: Contacts (Inquiries) */}
              <div 
                onClick={() => setEnquirySubTab('contacts')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  enquirySubTab === 'contacts' 
                    ? 'bg-cyan-600/15 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.25)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">Contacts</span>
                  <div className="p-1.5 rounded-xl bg-cyan-500/20 text-cyan-400"><Mail size={16} /></div>
                </div>
                <div className="text-3xl font-black mt-2 text-white">{contacts.length}</div>
                <p className="text-[11px] text-gray-400 mt-0.5">Inquiries</p>
                {enquirySubTab === 'contacts' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500"></div>}
              </div>

              {/* Box 3: Bookings (Consultations) */}
              <div 
                onClick={() => setEnquirySubTab('appointments')}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  enquirySubTab === 'appointments' 
                    ? 'bg-rose-600/15 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.25)]' 
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">Bookings</span>
                  <div className="p-1.5 rounded-xl bg-rose-500/20 text-rose-400"><Calendar size={16} /></div>
                </div>
                <div className="text-3xl font-black mt-2 text-white">{appointments.length}</div>
                <p className="text-[11px] text-gray-400 mt-0.5">Consultations</p>
                {enquirySubTab === 'appointments' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500"></div>}
              </div>
            </div>

            {/* Sub-navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/[0.02] border border-white/5 rounded-2xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setEnquirySubTab('all')}
                className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  enquirySubTab === 'all'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Show All 3 Sections
              </button>
              <button
                type="button"
                onClick={() => setEnquirySubTab('legacyCareers')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  enquirySubTab === 'legacyCareers'
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <GraduationCap size={14} /> General Careers ({legacyCareers.length})
              </button>
              <button
                type="button"
                onClick={() => setEnquirySubTab('contacts')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  enquirySubTab === 'contacts'
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Mail size={14} /> Contacts ({contacts.length})
              </button>
              <button
                type="button"
                onClick={() => setEnquirySubTab('appointments')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                  enquirySubTab === 'appointments'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Calendar size={14} /> Bookings ({appointments.length})
              </button>
            </div>

            {/* Section 1: General Careers Table */}
            {(enquirySubTab === 'all' || enquirySubTab === 'legacyCareers') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <GraduationCap size={14} /> Section 1: General Spontaneous Career Applications ({legacyCareers.length})
                  </h4>
                </div>
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
                      {legacyCareers.length === 0 ? (
                        <tr><td colSpan={6} className="py-8 text-center text-gray-500">No spontaneous applications recorded.</td></tr>
                      ) : (
                        legacyCareers.map(c => (
                          <tr key={c._id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-4 text-white font-bold">{c.name}<div className="text-gray-500 text-[10px]">{c.email} • {c.phone}</div></td>
                            <td className="py-3.5 px-4 text-emerald-400 font-semibold">{c.domain}</td>
                            <td className="py-3.5 px-4 text-gray-300">{c.qualification}<div className="text-gray-500 text-[10px]">{c.institute_university}</div></td>
                            <td className="py-3.5 px-4 text-gray-400">{c.city ? `${c.city}, ${c.state}` : c.state || 'N/A'}</td>
                            <td className="py-3.5 px-4">{c.resumeUrl ? <a href={c.resumeUrl} target="_blank" className="text-blue-400 underline">View CV</a> : 'None'}</td>
                            <td className="py-3.5 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 2: Contact Inquiries Table */}
            {(enquirySubTab === 'all' || enquirySubTab === 'contacts') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Mail size={14} /> Section 2: Contact Form Inquiries ({contacts.length})
                  </h4>
                </div>
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
                      {contacts.length === 0 ? (
                        <tr><td colSpan={4} className="py-8 text-center text-gray-500">No contact inquiries recorded.</td></tr>
                      ) : (
                        contacts.map(c => (
                          <tr key={c._id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-4 text-white font-bold">{c.name}<div className="text-gray-500 text-[10px]">{c.email}</div></td>
                            <td className="py-3.5 px-4 text-purple-400 font-semibold">{c.subject}</td>
                            <td className="py-3.5 px-4 text-gray-300 max-w-md">{c.message}</td>
                            <td className="py-3.5 px-4 text-gray-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Section 3: Consultation Bookings Table */}
            {(enquirySubTab === 'all' || enquirySubTab === 'appointments') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <Calendar size={14} /> Section 3: Client Consultation Bookings ({appointments.length})
                  </h4>
                </div>
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
                      {appointments.length === 0 ? (
                        <tr><td colSpan={5} className="py-8 text-center text-gray-500">No consultation bookings recorded.</td></tr>
                      ) : (
                        appointments.map(a => (
                          <tr key={a._id} className="hover:bg-white/[0.02]">
                            <td className="py-3.5 px-4 text-white font-bold">{a.client_name}<div className="text-gray-500 text-[10px]">{a.client_email}</div></td>
                            <td className="py-3.5 px-4 text-emerald-400 font-semibold">{a.service_type}</td>
                            <td className="py-3.5 px-4 text-blue-300 font-bold">{a.appointment_date} ({a.appointment_time})</td>
                            <td className="py-3.5 px-4"><a href={a.meet_link || STATIC_MEET_LINK} target="_blank" className="text-blue-400 underline">Join Meet</a></td>
                            <td className="py-3.5 px-4 text-gray-500">{new Date(a.bookedAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==========================================
            TAB 7: SEND MESSAGE & JOB OPPORTUNITY BROADCAST
        ========================================== */}
        {activeTab === 'sendMessage' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header: Send Message & Job Opportunity Updates */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                    <Sparkles size={11} className="text-indigo-400" /> AI Mailer
                  </span>
                  <span className="text-gray-400 text-xs">Job Opportunity Broadcast</span>
                </div>
                <h3 className="text-lg font-bold text-white">Send Message to Candidates</h3>
                <p className="text-xs text-gray-400">Select candidates, enter rough notes, AI generates heading & body, check final output before sending.</p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleOpenPreview}
                  disabled={selectedRecipientObjects.length === 0 || (!broadcastRawContent.trim() && !broadcastMessage.trim())}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
                >
                  <Eye size={15} /> Check Final Output ({selectedRecipientObjects.length})
                </button>

                {/* History button on the right end */}
                <button
                  onClick={() => {
                    fetchBroadcastHistory();
                    setIsHistoryDrawerOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  title="View Date-wise Sent Broadcast History"
                >
                  <Clock size={14} className="text-indigo-400" />
                  <span>History</span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                    {broadcastHistory.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Broadcast Send Success Report Banner */}
            {broadcastSendReport && (
              <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">{broadcastSendReport.message}</h4>
                    <p className="text-xs text-emerald-400/80">
                      Total {broadcastSendReport.sentCount} emails delivered successfully. {broadcastSendReport.failedCount > 0 ? `(${broadcastSendReport.failedCount} failures)` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setBroadcastSendReport(null)}
                  className="p-1.5 rounded-lg hover:bg-emerald-500/20 text-emerald-300"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Main Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Candidate Recipient Selection (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-3xl bg-[#0b0f1a] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-indigo-400" />
                      <h3 className="font-black text-white text-base">Select Candidates</h3>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedBroadcastCandidateIds.size} / {filteredBroadcastCandidates.length} Selected
                    </span>
                  </div>

                  {/* Candidate Source Pool Tabs */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-white/[0.03] border border-white/5 rounded-xl text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setCandidateSourcePool('jobApplications')}
                      className={`py-1.5 rounded-lg transition-all ${candidateSourcePool === 'jobApplications' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                      Job Apps ({jobApplications.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateSourcePool('legacyCareers')}
                      className={`py-1.5 rounded-lg transition-all ${candidateSourcePool === 'legacyCareers' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                      General ({legacyCareers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCandidateSourcePool('all')}
                      className={`py-1.5 rounded-lg transition-all ${candidateSourcePool === 'all' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                      All ({jobApplications.length + legacyCareers.length})
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Search candidate name, email, or role..."
                        value={broadcastSearchQuery}
                        onChange={(e) => setBroadcastSearchQuery(e.target.value)}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <select
                        value={broadcastStatusFilter}
                        onChange={(e) => setBroadcastStatusFilter(e.target.value)}
                        className="bg-[#111624] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                      >
                        <option value="All">All Statuses</option>
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview Scheduled">Interview Scheduled</option>
                        <option value="Hired">Hired</option>
                        <option value="Dropped">Dropped</option>
                        <option value="General">General</option>
                      </select>

                      <select
                        value={broadcastRoleFilter}
                        onChange={(e) => setBroadcastRoleFilter(e.target.value)}
                        className="bg-[#111624] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                      >
                        <option value="All">All Roles</option>
                        {jobs.map(j => (
                          <option key={j.jobId} value={j.title}>{j.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Select All / Deselect Controls */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                    <button
                      type="button"
                      onClick={selectAllFiltered}
                      className="text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <CheckSquare size={14} /> Select All Filtered ({filteredBroadcastCandidates.length})
                    </button>
                    {selectedBroadcastCandidateIds.size > 0 && (
                      <button
                        type="button"
                        onClick={deselectAll}
                        className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    )}
                  </div>

                  {/* Candidates Scrollable List */}
                  <div className="max-h-[380px] overflow-y-auto space-y-1.5 pr-1 divide-y divide-white/[0.03]">
                    {filteredBroadcastCandidates.length === 0 ? (
                      <div className="py-10 text-center text-gray-500 text-xs">
                        No candidates match the current filter.
                      </div>
                    ) : (
                      filteredBroadcastCandidates.map(c => {
                        const isSelected = selectedBroadcastCandidateIds.has(c.id);
                        return (
                          <div
                            key={c.id}
                            onClick={() => toggleCandidateSelection(c.id)}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-indigo-600/15 border-indigo-500/50 text-white'
                                : 'bg-white/[0.01] border-white/5 hover:border-white/15 text-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`p-1 rounded ${isSelected ? 'text-indigo-400' : 'text-gray-600'}`}>
                                {isSelected ? <CheckSquare size={16} className="text-indigo-400" /> : <Square size={16} />}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-xs truncate text-white">{c.name}</div>
                                <div className="text-[10px] text-gray-400 truncate">{c.email}</div>
                                <div className="text-[10px] text-indigo-300/80 truncate mt-0.5">{c.title}</div>
                              </div>
                            </div>

                            <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold shrink-0 ${
                              c.status === 'Shortlisted' ? 'bg-blue-500/20 text-blue-300' :
                              c.status === 'Hired' ? 'bg-emerald-500/20 text-emerald-300' :
                              c.status === 'Interview Scheduled' ? 'bg-purple-500/20 text-purple-300' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {c.status}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Selected Pills */}
                  {selectedRecipientObjects.length > 0 && (
                    <div className="pt-3 border-t border-white/5 space-y-1.5">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-gray-400">Selected Recipients:</div>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {selectedRecipientObjects.slice(0, 15).map(r => (
                          <span
                            key={r.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                          >
                            {r.name}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCandidateSelection(r.id);
                              }}
                              className="hover:text-red-400 ml-0.5"
                            >
                              <X size={10} />
                            </button>
                          </span>
                        ))}
                        {selectedRecipientObjects.length > 15 && (
                          <span className="text-[10px] text-gray-500 self-center">
                            +{selectedRecipientObjects.length - 15} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Message Composer with AI & Attachments (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-6 rounded-3xl bg-[#0b0f1a] border border-white/10 space-y-5">
                  
                  {/* Heading / Subject Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                        <Mail size={13} className="text-indigo-400" /> Email Heading / Subject Line
                      </label>
                      <span className="text-[10px] text-gray-400">
                        {broadcastHeading ? 'Generated by AI or typed • Editable' : 'Will be auto-generated by AI if left blank'}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={broadcastHeading}
                      onChange={(e) => setBroadcastHeading(e.target.value)}
                      placeholder="e.g. Exciting Career Opportunity: New Software Engineering Roles at Future Bound Tech"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all font-semibold"
                    />
                  </div>

                  {/* Raw Content Paste Box */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                        <FileText size={13} className="text-purple-400" /> Paste Raw Content / Job Opportunity Notes
                      </label>
                      <span className="text-[10px] text-indigo-400 font-semibold">
                        Just paste rough details — AI handles the rest!
                      </span>
                    </div>
                    <textarea
                      rows={5}
                      value={broadcastRawContent}
                      onChange={(e) => setBroadcastRawContent(e.target.value)}
                      placeholder="Paste your rough message or notes here...&#10;&#10;Example:&#10;We have opened 2 new positions for React / Full Stack Developers in Nellore. Candidates should know modern JavaScript, Node, and REST APIs. Flexible timings, attractive stipend. If interested, confirm by Friday with your updated portfolio."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all resize-y leading-relaxed"
                    />
                  </div>

                  {/* AI Enhance Action Banner */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-blue-950/50 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Sparkles size={14} className="text-purple-400" /> AI Message Enhancer & Heading Generator
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Generates a high-conversion heading and professional corporate candidate email copy.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAiEnhance}
                      disabled={isAiEnhancing || !broadcastRawContent.trim()}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all shrink-0 cursor-pointer"
                    >
                      {isAiEnhancing ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-white" />
                          <span>AI Enhancing...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} />
                          <span>AI Enhance Message & Heading</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Polished / Final Message Preview Editor */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                        <CheckCircle2 size={13} className="text-emerald-400" /> Enhanced / Final Message Body
                      </label>
                      <span className="text-[10px] text-gray-400">
                        Candidate name placeholder: <code className="text-indigo-400">[Candidate Name]</code>
                      </span>
                    </div>
                    <textarea
                      rows={6}
                      value={broadcastMessage || broadcastRawContent}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Enhanced message will appear here. You can also edit it directly before previewing."
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-gray-500 outline-none focus:border-indigo-500 focus:bg-white/[0.05] transition-all resize-y leading-relaxed"
                    />
                  </div>

                  {/* Attachments Section (Optional) */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                        <Paperclip size={13} className="text-amber-400" /> Attachments (Optional)
                      </label>
                      <span className="text-[10px] text-gray-400">PDF, DOC, DOCX, PNG, JPG (up to 10MB each)</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-bold text-gray-300 hover:text-white cursor-pointer transition-all flex items-center gap-1.5">
                        <Paperclip size={13} />
                        <span>Add Attachment</span>
                        <input
                          type="file"
                          multiple
                          onChange={handleAttachmentUpload}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        />
                      </label>
                      {broadcastAttachments.length > 0 && (
                        <span className="text-xs text-indigo-400 font-semibold">
                          {broadcastAttachments.length} file(s) attached
                        </span>
                      )}
                    </div>

                    {attachmentError && (
                      <p className="text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle size={12} /> {attachmentError}
                      </p>
                    )}

                    {/* Attached files chips */}
                    {broadcastAttachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {broadcastAttachments.map((att, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-gray-300"
                          >
                            <FileText size={13} className="text-amber-400" />
                            <span className="font-medium text-white max-w-[180px] truncate">{att.name}</span>
                            <span className="text-[10px] text-gray-500">({Math.round(att.size / 1024)} KB)</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(idx)}
                              className="text-gray-500 hover:text-red-400 transition-colors ml-1"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Primary Review & Send Action Bar */}
                  <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-gray-400">
                      Recipients: <strong className="text-white">{selectedRecipientObjects.length} candidate(s)</strong> selected.
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenPreview}
                      disabled={selectedRecipientObjects.length === 0 || (!broadcastRawContent.trim() && !broadcastMessage.trim())}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition-all cursor-pointer"
                    >
                      <Eye size={15} /> Check Final Output Before Sending
                    </button>
                  </div>

                </div>
              </div>

            </div>
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
                  <h3 className="text-xl font-black text-white">
                    {editingJob ? `Edit Opportunity • ${editingJob.jobId}` : 'Upload New Opportunity'}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {editingJob ? `Update role details, mode, duration, or description for ${editingJob.title}` : 'Post a Job or Internship position to the public Careers section'}
                  </p>
                </div>
                <button onClick={handleCloseJobModal} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white cursor-pointer">
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
                    onClick={handleCloseJobModal}
                    className="px-5 py-2.5 rounded-xl bg-white/5 text-gray-300 text-xs font-bold hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={jobFormSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:opacity-90 disabled:opacity-50 cursor-pointer"
                  >
                    {jobFormSaving ? 'Saving...' : editingJob ? 'Save Changes' : 'Publish Opportunity'}
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
                  {selectedAppForDetail.offerDetails?.offerLetterUrl && (
                    <div className="pt-2">
                      <a 
                        href={selectedAppForDetail.offerDetails.offerLetterUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all shadow-sm"
                      >
                        <FileText size={13} />
                        <span>View Offer Letter (PDF)</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Active Interview Stage Information Banner */}
              {selectedAppForDetail.status === 'Interview Scheduled' && (
                <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0 mt-0.5 sm:mt-0">
                      <CalendarDays size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Interview Round In Progress</span>
                        {selectedAppForDetail.statusHistory?.some(h => h.details?.isRescheduled) && (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold flex items-center gap-1">
                            <RefreshCw size={10} className="animate-spin-slow" /> Rescheduled
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {(() => {
                          const lastInterview = [...(selectedAppForDetail.statusHistory || [])].reverse().find(h => h.status === 'Interview Scheduled');
                          if (lastInterview?.details) {
                            return (
                              <span>
                                Active slot: <strong className="text-white">{lastInterview.details.interviewDate || 'Upcoming'}</strong> at <strong className="text-white">{lastInterview.details.interviewTime || 'Scheduled Slot'}</strong>
                                {lastInterview.details.isRescheduled && (
                                  <span className="block text-amber-300/90 mt-0.5 font-medium">
                                    Reschedule Reason: {lastInterview.details.rescheduleReason || 'Panel Adjustment'}
                                  </span>
                                )}
                              </span>
                            );
                          }
                          return 'Candidate has an active interview scheduled. Use "Reschedule Interview" below to revise the slot.';
                        })()}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStatusUpdateMode(statusUpdateMode === 'reschedule' ? 'idle' : 'reschedule')}
                    className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <RefreshCw size={12} />
                    <span>Reschedule Interview</span>
                  </button>
                </div>
              )}

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
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                      statusUpdateMode === 'interview'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                        : 'bg-blue-600/30 hover:bg-blue-600/50 border-blue-500/40 text-blue-200'
                    }`}
                  >
                    📅 Schedule Interview
                  </button>

                  <button
                    onClick={() => setStatusUpdateMode(statusUpdateMode === 'reschedule' ? 'idle' : 'reschedule')}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      statusUpdateMode === 'reschedule'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md shadow-amber-500/30'
                        : 'bg-amber-600/30 hover:bg-amber-600/50 border-amber-500/40 text-amber-200'
                    }`}
                  >
                    <RefreshCw size={13} className={statusUpdateMode === 'reschedule' ? 'rotate-180 transition-transform' : ''} />
                    <span>🔁 Reschedule Interview</span>
                  </button>

                  <button
                    onClick={() => setStatusUpdateMode(statusUpdateMode === 'hire' ? 'idle' : 'hire')}
                    className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
                      statusUpdateMode === 'hire'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                        : 'bg-emerald-600/30 hover:bg-emerald-600/50 border-emerald-500/40 text-emerald-200'
                    }`}
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
                        className="bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono"
                      />
                    </div>
                    <button
                      onClick={() => handleUpdateApplicationStatus('Interview Scheduled')}
                      disabled={statusUpdating}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2"
                    >
                      {statusUpdating ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <span>Confirm & Dispatch Interview Invitation Email</span>
                      )}
                    </button>
                  </div>
                )}

                {/* Sub-form: Interview Rescheduling */}
                {statusUpdateMode === 'reschedule' && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 space-y-3.5 animate-in fade-in">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-500/20 pb-2.5">
                      <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                        <RefreshCw size={14} className="text-amber-400" />
                        Reschedule Technical Interview & Dispatch Notification:
                      </h4>
                      <span className="text-[10px] text-amber-400/90 bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20 font-medium">
                        Automated polite rescheduling email with new calendar slot
                      </span>
                    </div>

                    {/* Reschedule Reason Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1">
                        Select Reason for Rescheduling <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={rescheduleReasonKey}
                        onChange={(e) => setRescheduleReasonKey(e.target.value as any)}
                        className="w-full bg-[#111624] border border-amber-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="candidate_unavailable">
                          1. Candidate Unavailable at Scheduled Slot (Requested Reschedule)
                        </option>
                        <option value="candidate_tech_issue">
                          2. Technical / Network Connectivity Issues during Interview Session
                        </option>
                        <option value="hr_panel_unavailable">
                          3. Unavailability of HR & Technical Interview Panel (Panel Reschedule)
                        </option>
                        <option value="custom">
                          4. Custom / Other Reason (Specify details below)
                        </option>
                      </select>
                    </div>

                    {/* Custom Reason Input */}
                    {rescheduleReasonKey === 'custom' && (
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase">Custom Explanation for Candidate</label>
                        <input
                          type="text"
                          value={rescheduleCustomReason}
                          onChange={(e) => setRescheduleCustomReason(e.target.value)}
                          placeholder="e.g. Rescheduled due to overlapping evaluation rounds / mutual agreement"
                          className="w-full bg-[#111624] border border-amber-500/30 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    )}

                    {/* Content Preview Box */}
                    <div className="p-3 rounded-lg bg-black/50 border border-amber-500/25 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        Candidate Email Copy Preview:
                      </div>
                      <p className="text-[11.5px] italic text-gray-300 leading-relaxed">
                        {rescheduleReasonKey === 'candidate_unavailable' && (
                          <>“As noted regarding your unavailability at the previously scheduled interview time, we understand that unexpected scheduling conflicts can occur. We are pleased to provide you with a revised interview slot so you can attend comfortably.”</>
                        )}
                        {rescheduleReasonKey === 'candidate_tech_issue' && (
                          <>“Due to the technical and connectivity challenges encountered during the previous discussion, our technical panel wants to ensure you receive a complete and fair opportunity to present your work. We have rescheduled your discussion to ensure a smooth, uninterrupted evaluation.”</>
                        )}
                        {rescheduleReasonKey === 'hr_panel_unavailable' && (
                          <>“Due to an unavoidable scheduling conflict and the urgent unavailability of our HR & Technical Interview Panel for the original slot, we have revised your interview timing. We sincerely apologize for any inconvenience caused to your personal schedule.”</>
                        )}
                        {rescheduleReasonKey === 'custom' && (
                          <>“{rescheduleCustomReason.trim() ? `This interview session has been rescheduled: ${rescheduleCustomReason.trim()}` : 'Please enter your custom explanation above.'}”</>
                        )}
                      </p>
                    </div>

                    {/* Revised Slot Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase block mb-1">Revised Date</label>
                        <input 
                          type="date" 
                          value={interviewDate}
                          onChange={(e) => setInterviewDate(e.target.value)}
                          className="w-full bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase block mb-1">Revised Time Slot</label>
                        <input 
                          type="text" 
                          value={interviewTime}
                          onChange={(e) => setInterviewTime(e.target.value)}
                          placeholder="e.g. 03:00 PM IST"
                          className="w-full bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase block mb-1">Google Meet Link</label>
                        <input 
                          type="text" 
                          value={interviewLink}
                          onChange={(e) => setInterviewLink(e.target.value)}
                          placeholder="Meet link"
                          className="w-full bg-[#111624] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleUpdateApplicationStatus('Interview Scheduled')}
                      disabled={statusUpdating}
                      className="px-4 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20 active:scale-98"
                    >
                      {statusUpdating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Dispatching Rescheduled Interview Email...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw size={13} />
                          <span>Confirm & Dispatch Rescheduled Interview Email</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Sub-form: Hire & Offer ID */}
                {statusUpdateMode === 'hire' && (
                  <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30 space-y-3.5 animate-in fade-in">
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

                    {/* File Attachment: Offer Letter PDF */}
                    <div className="p-3.5 rounded-xl bg-[#0e1424] border border-dashed border-emerald-500/40 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <Paperclip size={14} className="text-emerald-400" />
                          Attach Offer Letter (PDF Document Required)
                        </label>
                        {hireOfferFile ? (
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold flex items-center gap-1">
                            <CheckCircle2 size={11} /> PDF Attached & Ready to Send
                          </span>
                        ) : (
                          <span className="text-[10px] text-gray-400">PDF up to 15MB</span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-xs font-bold transition-all shadow-sm active:scale-95">
                          <FileText size={15} className="text-emerald-400" />
                          <span>{hireOfferFile ? 'Change Attached PDF' : 'Select Offer Letter (PDF)'}</span>
                          <input 
                            type="file" 
                            accept=".pdf,application/pdf"
                            className="hidden"
                            onChange={handleOfferFileChange}
                          />
                        </label>

                        {hireOfferFile ? (
                          <div className="flex-1 flex items-center justify-between gap-2 p-2.5 px-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-xs">
                            <div className="flex items-center gap-2.5 overflow-hidden">
                              <span className="text-lg">📄</span>
                              <div className="truncate">
                                <span className="font-bold text-white truncate block">{hireOfferFile.name}</span>
                                <span className="text-[10px] text-gray-400">{(hireOfferFile.size / 1024).toFixed(1)} KB • PDF Document</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={handlePreviewOfferPdf}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition-all flex items-center gap-1"
                                title="Preview PDF in new browser tab"
                              >
                                <Eye size={11} /> Preview
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setHireOfferFile(null);
                                  setHireOfferBase64(null);
                                  setOfferFileError('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[11px] font-bold transition-all flex items-center gap-1"
                                title="Remove attachment"
                              >
                                <X size={11} /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-[11px] text-gray-400 flex-1 py-1">
                            Attach the candidate's signed Offer Letter in PDF format. It will be sent directly as an email attachment and securely stored for authenticity verification.
                          </p>
                        )}
                      </div>

                      {offerFileError && (
                        <div className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2 flex items-center gap-1.5">
                          <AlertCircle size={13} />
                          <span>{offerFileError}</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleUpdateApplicationStatus('Hired')}
                      disabled={statusUpdating}
                      className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                    >
                      {statusUpdating ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Dispatching Offer Letter Email & Uploading PDF...</span>
                        </>
                      ) : hireOfferFile ? (
                        <>
                          <Send size={13} />
                          <span>Confirm Hire & Dispatch Email with Attached PDF</span>
                        </>
                      ) : (
                        <span>Confirm Hire & Dispatch Official Offer Letter Email</span>
                      )}
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

        {/* ==========================================
            MODAL: CHECK FINAL OUTPUT BEFORE SENDING
        ========================================== */}
        {previewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
            <div className="relative w-full max-w-4xl bg-[#0b0f19] border border-white/15 rounded-[2.5rem] p-6 sm:p-8 space-y-6 shadow-2xl my-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Step: Verification Required
                    </span>
                    <span className="text-xs text-gray-400">• Ready for Dispatch</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">Check Final Output Before Sending</h3>
                  <p className="text-xs text-gray-400">
                    Review the final rendered email output, subject line, and attachments. Nothing is sent until you confirm below.
                  </p>
                </div>
                <button
                  onClick={() => setPreviewModalOpen(false)}
                  disabled={isSendingBroadcast}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-40"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Summary Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Total Recipients</span>
                  <span className="text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                    <Users size={14} className="text-indigo-400" /> {selectedRecipientObjects.length} Candidate(s)
                  </span>
                  <span className="text-[10px] text-gray-500">Sent individually for candidate privacy</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Email Heading / Subject</span>
                  <span className="text-white font-bold text-xs truncate block mt-0.5" title={broadcastHeading}>
                    {broadcastHeading || 'Job Opportunity Update • Future Bound Tech'}
                  </span>
                  <span className="text-[10px] text-indigo-400">Generated by AI / Verified</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 block">Attached Files</span>
                  <span className="text-white font-bold text-sm flex items-center gap-1.5 mt-0.5">
                    <Paperclip size={14} className="text-amber-400" /> {broadcastAttachments.length} Enclosed
                  </span>
                  <span className="text-[10px] text-gray-500">Delivered via Hostinger Mail</span>
                </div>
              </div>

              {/* Sample Recipient Preview Switcher */}
              {selectedRecipientObjects.length > 1 && (
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                  <div className="flex items-center gap-2">
                    <User size={14} className="text-indigo-400" />
                    <span className="text-gray-300">
                      Previewing as: <strong className="text-white">{selectedRecipientObjects[previewCandidateIndex]?.name}</strong> ({selectedRecipientObjects[previewCandidateIndex]?.email})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => updatePreviewSampleCandidate((previewCandidateIndex - 1 + selectedRecipientObjects.length) % selectedRecipientObjects.length)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px]"
                    >
                      ← Prev
                    </button>
                    <span className="text-[10px] text-gray-500 px-1">
                      {previewCandidateIndex + 1} of {selectedRecipientObjects.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => updatePreviewSampleCandidate((previewCandidateIndex + 1) % selectedRecipientObjects.length)}
                      className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-[10px]"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Rendered HTML Email Client Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Email Client Live Preview</span>
                  <span>Future Bound Tech Official Template</span>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden bg-white max-h-[440px] overflow-y-auto shadow-inner">
                  {previewLoading ? (
                    <div className="py-20 text-center text-gray-600 flex flex-col items-center justify-center gap-2">
                      <Loader2 size={24} className="animate-spin text-indigo-600" />
                      <span className="text-xs font-semibold">Generating live HTML preview...</span>
                    </div>
                  ) : (
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setPreviewModalOpen(false)}
                  disabled={isSendingBroadcast}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all cursor-pointer"
                >
                  ← Back to Edit
                </button>

                <button
                  type="button"
                  onClick={handleConfirmSendBroadcast}
                  disabled={isSendingBroadcast || selectedRecipientObjects.length === 0}
                  className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  {isSendingBroadcast ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Sending to {selectedRecipientObjects.length} Candidate(s)...</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Confirm & Send to {selectedRecipientObjects.length} Candidate(s)</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            SLIDE-OVER DRAWER: SENT BROADCAST HISTORY (RIGHT END)
        ========================================== */}
        {isHistoryDrawerOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
              onClick={() => setIsHistoryDrawerOpen(false)}
            />

            <div className="fixed inset-y-0 right-0 max-w-full flex pl-8">
              <div className="w-screen max-w-xl bg-[#0b0f1a] border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                
                {/* Drawer Header */}
                <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-950/50 via-[#0d1222] to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Clock size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">Sent Broadcast History</h3>
                      <p className="text-xs text-gray-400">Date-wise log of dispatched messages and candidate recipients</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {broadcastHistory.length} Sent
                    </span>
                    <button
                      onClick={() => setIsHistoryDrawerOpen(false)}
                      className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

                {/* Drawer Body: Date-wise Broadcast List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {loadingHistory ? (
                    <div className="py-20 text-center text-gray-500 text-xs flex flex-col items-center justify-center gap-3">
                      <Loader2 size={24} className="animate-spin text-indigo-400" />
                      <span>Loading sent broadcast history...</span>
                    </div>
                  ) : broadcastHistory.length === 0 ? (
                    <div className="py-20 text-center text-gray-500 text-xs space-y-2">
                      <Mail size={32} className="mx-auto text-gray-600 mb-2" />
                      <p className="font-bold text-gray-400">No broadcast messages sent yet.</p>
                      <p className="text-[11px] text-gray-500">When you send job opportunity updates to candidates, they will appear here date-wise.</p>
                    </div>
                  ) : (
                    broadcastHistory.map((item, idx) => {
                      const recipientsList = (item.recipients && item.recipients.length > 0) 
                        ? item.recipients 
                        : (item.recipientsSample || []);

                      return (
                        <div 
                          key={item._id || idx} 
                          className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3.5 hover:border-indigo-500/40 transition-all shadow-sm"
                        >
                          {/* Date & Delivery status */}
                          <div className="flex items-center justify-between text-xs">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px] font-bold">
                              📅 {new Date(item.sentAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} • {new Date(item.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              ✓ {item.sentCount || item.recipientCount} Delivered
                            </span>
                          </div>

                          {/* Subject Heading */}
                          <div>
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Subject / Heading</div>
                            <h4 className="text-sm font-bold text-white mt-0.5">{item.heading}</h4>
                          </div>

                          {/* Main Message Content */}
                          <div className="space-y-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Main Message Content</div>
                            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-xs text-gray-300 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto">
                              {sanitizeEnhancedMessage(item.message)}
                            </div>
                          </div>

                          {/* Candidate Recipients Details */}
                          <div className="space-y-1.5 pt-2 border-t border-white/5">
                            <div className="flex items-center justify-between text-[11px] text-gray-400">
                              <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-300">
                                Candidate Recipients ({recipientsList.length})
                              </span>
                            </div>
                            
                            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                              {recipientsList.map((r: any, rIdx: number) => (
                                <div key={rIdx} className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 text-xs gap-1">
                                  <div className="font-semibold text-white flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                                    <span>{r.name}</span>
                                    {r.jobTitle && <span className="text-[10px] text-gray-500">({r.jobTitle})</span>}
                                  </div>
                                  <span className="text-gray-400 text-[11px] font-mono">{r.email}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Attachments & Meta info */}
                          {item.hasAttachments && (
                            <div className="text-[10px] text-amber-400 flex items-center gap-1 font-semibold pt-1">
                              <Paperclip size={11} /> Includes {item.attachmentsCount || 1} file attachment(s)
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Drawer Footer */}
                <div className="p-4 border-t border-white/10 bg-[#070b14] flex justify-end">
                  <button
                    onClick={() => setIsHistoryDrawerOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Close History
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
