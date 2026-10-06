import React, { useState } from 'react';
import { 
  X, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  Award, 
  Calendar, 
  User, 
  Briefcase, 
  Building2, 
  QrCode, 
  ExternalLink 
} from 'lucide-react';
import { COMPANY_NAME } from '../constants';

interface OfferVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOfferId?: string;
}

export const OfferVerificationModal: React.FC<OfferVerificationModalProps> = ({ 
  isOpen, 
  onClose,
  initialOfferId = '' 
}) => {
  const [offerIdInput, setOfferIdInput] = useState(initialOfferId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = offerIdInput.trim();
    if (!cleanId) {
      setError('Please enter a valid Offer ID (e.g. FBT-01I-A101)');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch(`/api/offers/verify/${encodeURIComponent(cleanId)}`);
      const data = await res.json();

      if (res.ok && data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.message || `No active record found for Offer ID: "${cleanId}". Please check the ID or contact HR.`);
      }
    } catch (err) {
      setError('Error connecting to verification server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0b0f19] border border-white/10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.9)] overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900/40 via-blue-900/30 to-indigo-900/40 border-b border-white/10 p-6 sm:p-8 flex items-start justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck size={14} /> Official Credentials Verification
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Verify Offer / Certificate</h2>
            <p className="text-xs text-gray-400">Validate official Internship or Job Offer IDs issued by Future Bound Tech</p>
          </div>

          <button 
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all ml-4"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 sm:p-8 space-y-6">
          <form onSubmit={handleVerify} className="space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
              Enter Unique Offer ID (e.g. FBT-01I-A101)
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input 
                  type="text" 
                  autoFocus
                  required
                  placeholder="e.g. FBT-01I-A101 or FBT-01J-XXXX"
                  value={offerIdInput}
                  onChange={(e) => setOfferIdInput(e.target.value.toUpperCase())}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-2xl pl-11 pr-4 py-3.5 outline-none focus:border-emerald-500/60 focus:bg-white/[0.07] text-white text-sm font-mono tracking-wider transition-all placeholder-gray-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !offerIdInput.trim()}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-emerald-500/20 hover:opacity-95 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                <span>Verify</span>
              </button>
            </div>
          </form>

          {/* Error View */}
          {error && (
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-3 animate-in fade-in">
              <AlertTriangle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-bold">Record Not Found</p>
                <p className="mt-0.5 text-gray-400 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {/* Verified Certificate Card Result */}
          {result && (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#0b0f19] border-2 border-emerald-500/40 relative overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.15)]">
                
                {/* Background Watermark */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-5 pointer-events-none">
                  <ShieldCheck size={280} />
                </div>

                {/* Top Badge */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
                      <Award size={22} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <CheckCircle2 size={14} /> Verified Authentic Credential
                      </div>
                      <h4 className="text-lg font-black text-white">{COMPANY_NAME}</h4>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-[10px] text-gray-500 uppercase tracking-widest">Offer ID</div>
                    <div className="text-sm font-black text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                      {result.offerId}
                    </div>
                  </div>
                </div>

                {/* Detail Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><User size={12} className="text-blue-400" /> Candidate Name</span>
                    <p className="text-sm font-bold text-white">{result.candidateName}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><Briefcase size={12} className="text-purple-400" /> Selected Position</span>
                    <p className="text-sm font-bold text-white">{result.jobTitle} ({result.jobType})</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><Building2 size={12} className="text-emerald-400" /> Issuing Organization</span>
                    <p className="text-xs font-bold text-white">{COMPANY_NAME} • Nellore, AP</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <span className="text-gray-400 flex items-center gap-1"><Calendar size={12} className="text-amber-400" /> Issue Timestamp</span>
                    <p className="text-xs font-bold text-white">
                      {result.issuedAt ? new Date(result.issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Official Record'}
                    </p>
                  </div>
                </div>

                {/* Official Seal Footer */}
                <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="text-[11px] text-gray-400">
                    <span className="text-emerald-400 font-semibold">Status:</span> {result.status || 'Verified & Active'} • Digitally logged in Future Bound Tech secure database.
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
                    <ShieldCheck size={12} className="text-emerald-400" /> FBT-SECURE-AUTHENTICATED
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-gray-400 text-xs text-center leading-relaxed">
            Need to verify an offer letter with HR? Write to <a href="mailto:info@futureboundtech.online" className="text-blue-400 underline font-semibold">info@futureboundtech.online</a> or call our support line.
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferVerificationModal;
