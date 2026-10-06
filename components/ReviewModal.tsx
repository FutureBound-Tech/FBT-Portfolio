import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  GraduationCap, 
  Building2, 
  RefreshCw,
  Star,
  Sparkles,
  Loader2
} from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ReviewCategory = 'student' | 'client';

const GOOGLE_REVIEW_URL = 'https://g.page/r/CWZ-nU-lrTVXEBM/review';

// Dynamic client-side combinatorial unique review fallback generator
const generateClientCombinatorial = (category: ReviewCategory): string => {
  if (category === 'student') {
    const openings = [
      "Best place in Nellore to learn practical software development!",
      "Super grateful for the coaching and hands-on guidance at Future Bound Tech.",
      "The practical coding sessions and mentorship here are unmatched in Nellore.",
      "Hands-on web and mobile development training with incredible mentors.",
      "Top-tier technical coaching in Nellore with real-world project exposure.",
      "Learning full-stack development at Future Bound Tech transformed my skills.",
      "The mentors explain every complex concept with crystal clarity.",
      "Awesome learning atmosphere with modern tech stacks and supportive trainers."
    ];
    const middles = [
      "The mentors guide you through real projects step-by-step.",
      "The focus on modern frameworks and clean code gave me tremendous confidence.",
      "Friendly instructors, real-time code reviews, and strong career support.",
      "Gained practical exposure to full-stack tech and industry best practices.",
      "The interactive sessions and personal attention make learning effortless."
    ];
    const closings = [
      "Highly recommend to every aspiring developer in AP!",
      "Truly the leading software training institute in Nellore.",
      "Grateful for the support and career guidance from the FBT team.",
      "A must-join for anyone looking to build a serious career in tech.",
      "Proud to have learned from the best in Nellore!"
    ];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(openings)} ${pick(middles)} ${pick(closings)}`;
  } else {
    const openings = [
      "Exceptional software development service from Future Bound Tech!",
      "Delivered our application on time with modern architecture and sleek UI.",
      "Future Bound Tech is the most reliable IT partner we've worked with in Nellore.",
      "Outstanding technical execution and seamless communication throughout our project.",
      "High-performance custom software delivered with exceptional attention to detail.",
      "Top-class digital transformation and software engineering team in Nellore."
    ];
    const middles = [
      "Their agile team was extremely responsive and solved our complex requirements.",
      "The application performance, UI responsiveness, and code quality exceeded expectations.",
      "Professional project management with clear milestones and proactive updates.",
      "They understood our business domain perfectly and engineered the right solution."
    ];
    const closings = [
      "Highly recommend them for any web or mobile development project!",
      "Best IT solutions company in Andhra Pradesh without a doubt.",
      "Looking forward to continuing our long-term collaboration with FBT.",
      "Great experience from start to finish. Highly satisfied!"
    ];
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    return `${pick(openings)} ${pick(middles)} ${pick(closings)}`;
  }
};

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState<ReviewCategory>('student');
  const [reviewText, setReviewText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Track seen reviews in current session so no repeats occur
  const seenReviewsRef = useRef<Set<string>>(new Set());

  const fetchAIReview = useCallback(async (cat: ReviewCategory) => {
    setLoading(true);
    setCopied(false);
    try {
      // Fetch fresh AI review from backend endpoint
      const response = await fetch(`/api/reviews/generate?type=${cat}&t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.review && !seenReviewsRef.current.has(data.review)) {
          seenReviewsRef.current.add(data.review);
          setReviewText(data.review);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('AI review fetch notice, using combinatorial generator:', err);
    }

    // Dynamic unique generation fallback
    let uniqueFallback = generateClientCombinatorial(cat);
    let attempts = 0;
    while (seenReviewsRef.current.has(uniqueFallback) && attempts < 10) {
      uniqueFallback = generateClientCombinatorial(cat);
      attempts++;
    }
    seenReviewsRef.current.add(uniqueFallback);
    setReviewText(uniqueFallback);
    setLoading(false);
  }, []);

  // Whenever modal is opened or category changes, generate a brand new unique review
  useEffect(() => {
    if (isOpen) {
      fetchAIReview(category);
    }
  }, [isOpen, category, fetchAIReview]);

  if (!isOpen) return null;

  const handleCopyAndRedirect = async () => {
    try {
      await navigator.clipboard.writeText(reviewText);
      setCopied(true);

      // Open Google Review in a new tab
      setTimeout(() => {
        window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer');
      }, 600);
    } catch (err) {
      console.warn('Clipboard write failed, opening link directly:', err);
      window.open(GOOGLE_REVIEW_URL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      {/* Dark Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-md bg-[#0a0d18] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85)] animate-in fade-in zoom-in-95 duration-200 flex flex-col space-y-4">
        
        {/* 1. Heading at Center */}
        <div className="relative text-center pb-1">
          <div className="flex items-center justify-center gap-1.5">
            <h3 className="text-xl font-black text-white tracking-tight">Review Us</h3>
            <div className="flex text-amber-400">
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
              <Star size={14} className="fill-amber-400" />
            </div>
          </div>
          <button 
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Select Sector (Student or Client) with small icons */}
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={loading}
            onClick={() => setCategory('student')}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              category === 'student'
                ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-500/25'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <GraduationCap size={15} />
            <span>Student</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => setCategory('client')}
            className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              category === 'client'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md shadow-purple-500/25'
                : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
            }`}
          >
            <Building2 size={15} />
            <span>Client</span>
          </button>
        </div>

        {/* 3. Auto-Generated Box with AI generation trigger */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-400 px-0.5">
            <span className="flex items-center gap-1">
              <Sparkles size={12} className="text-blue-400" />
              <span>AI-Generated Review:</span>
            </span>
            <button
              type="button"
              disabled={loading}
              onClick={() => fetchAIReview(category)}
              className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Generating...' : 'New Review'}</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={reviewText}
              disabled={loading}
              onChange={(e) => {
                setReviewText(e.target.value);
                setCopied(false);
              }}
              className="w-full bg-[#05070d] border border-white/10 rounded-xl p-3 text-xs sm:text-sm text-gray-200 focus:border-blue-500 outline-none leading-relaxed resize-none shadow-inner disabled:opacity-50"
              placeholder="Generating unique review..."
            />
            {loading && (
              <div className="absolute inset-0 bg-[#05070d]/80 backdrop-blur-sm rounded-xl flex items-center justify-center gap-2 text-xs text-blue-400 font-semibold">
                <Loader2 size={16} className="animate-spin" />
                <span>Generating unique AI review...</span>
              </div>
            )}
          </div>
        </div>

        {/* 4. Copy and Paste the Review (Action Button) */}
        <div className="pt-1">
          <button
            type="button"
            disabled={loading || !reviewText}
            onClick={handleCopyAndRedirect}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-300" />
                <span>Copied! Opening Google...</span>
              </>
            ) : (
              <>
                <Copy size={16} />
                <span>Copy &amp; Open Google</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReviewModal;
