import React from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  ArrowRight, 
  Building2, 
  FileText,
  Award,
  Layers,
  Code2,
  Check
} from 'lucide-react';
import { JobPosting } from './JobApplicationModal';

interface JobDetailModalProps {
  job: JobPosting | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (job: JobPosting) => void;
}

const JobDetailModal: React.FC<JobDetailModalProps> = ({ job, isOpen, onClose, onApply }) => {
  if (!isOpen || !job) return null;

  // Helper to parse markdown text into clean formatted sections & bullets
  const renderFormattedDescription = (text: string) => {
    if (!text) return null;

    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed) {
        elements.push(<div key={index} className="h-2" />);
        return;
      }

      // Headers (### or ## or #)
      if (trimmed.startsWith('#')) {
        const headerText = trimmed.replace(/^#+\s*/, '');
        elements.push(
          <div key={index} className="pt-4 pb-2 border-b border-slate-800 mb-2">
            <h4 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileText size={16} className="text-blue-400 shrink-0" />
              <span>{headerText}</span>
            </h4>
          </div>
        );
        return;
      }

      // Bullet points (- or *)
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const bulletText = trimmed.replace(/^[-*]\s*/, '');
        elements.push(
          <div key={index} className="flex items-start gap-3 my-2 pl-1 text-slate-300 text-sm leading-relaxed">
            <Check size={14} className="text-blue-400 mt-1 shrink-0" />
            <span>{renderInlineFormatting(bulletText)}</span>
          </div>
        );
        return;
      }

      // Regular paragraph text
      elements.push(
        <p key={index} className="text-sm text-slate-300 leading-relaxed my-1.5">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    });

    return elements;
  };

  // Helper for **bold** text inline
  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-hidden animate-in fade-in duration-200">
      
      {/* Clean 80% Viewport Modal Container */}
      <div className="relative w-[92vw] max-w-5xl h-[85vh] bg-[#0b0f19] border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#131b2e] border-b border-slate-800 p-6 sm:p-8 flex items-start justify-between shrink-0 relative">
          <div className="space-y-3 pr-6">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full border ${
                job.type === 'Internship' 
                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
              }`}>
                {job.type} Opening
              </span>

              <span className="font-mono text-xs bg-slate-800/80 text-slate-300 px-3 py-1 rounded-lg border border-slate-700 font-semibold">
                Job ID: {job.jobId}
              </span>

              <span className="text-xs text-blue-400 font-medium bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                <MapPin size={13} /> {job.workMode} {job.location ? `• ${job.location}` : ''}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight leading-tight">
              {job.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 size={14} className="text-blue-400" /> Future Bound Tech
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-400" /> Tenure: <strong className="text-white">{job.duration}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <CheckCircle2 size={14} /> Open Position
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-slate-800/60 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-all shrink-0"
            title="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 custom-scrollbar">
          
          {/* Quick Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Role Type</span>
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Briefcase size={14} className="text-purple-400" /> {job.type}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Workplace</span>
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-400" /> {job.workMode}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Duration</span>
              <span className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-400" /> {job.duration}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">Reference ID</span>
              <span className="text-xs sm:text-sm font-mono font-bold text-blue-400">
                {job.jobId}
              </span>
            </div>
          </div>

          {/* Key Context (if provided) */}
          {job.keyContext && (
            <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-900/50 text-xs sm:text-sm text-blue-200 flex items-start gap-3">
              <Layers size={18} className="text-blue-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-semibold mb-0.5">Core Technical Focus:</strong>
                <span className="text-slate-300">{job.keyContext}</span>
              </div>
            </div>
          )}

          {/* Role Specifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <FileText size={18} className="text-blue-400" />
              <h3 className="text-lg font-bold text-white">Job Description & Requirements</h3>
            </div>

            <div className="space-y-2 bg-slate-900/40 p-6 rounded-2xl border border-slate-800">
              {renderFormattedDescription(job.description)}
            </div>
          </div>

          {/* Benefits & Perks */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Award size={16} className="text-purple-400" /> Program Highlights
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Senior Software Mentorship</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Verified Offer & Completion Records</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                <span>Real Production Client Systems</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#090d16] border-t border-slate-800 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span className="block font-medium text-white">Ready to apply for {job.title}?</span>
            <span>Complete the 3-stage candidate profile form to submit.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-medium transition-all"
            >
              Close
            </button>

            <button
              onClick={() => {
                onClose();
                onApply(job);
              }}
              className="flex-1 sm:flex-none px-7 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95"
            >
              <span>Apply Now</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default JobDetailModal;
