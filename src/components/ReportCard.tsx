import React, { useState } from 'react';
import { 
  AlertTriangle, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  ThumbsUp, 
  ShieldCheck, 
  Building2, 
  Sparkles, 
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Users
} from 'lucide-react';
import { CivicReport, IssueStatus } from '../types';

interface ReportCardProps {
  report: CivicReport;
  onVote: (id: string, voteType: 'present' | 'resolved') => void;
  onResolutionVerify: (id: string, vote: 'Yes, Fully Fixed' | 'No, Still Exists') => void;
  onCompareResolution?: (id: string, assessment: any, afterImageUrl: string) => void;
  onUpdateStatus: (id: string, newStatus: IssueStatus) => void;
}

const STATUS_STEPS: IssueStatus[] = [
  'Reported',
  'AI Analyzed',
  'Assigned',
  'Work In Progress',
  'Work Done',
  'Community Verification',
  'Resolved'
];

const getShortStepName = (s: IssueStatus) => {
  switch (s) {
    case 'AI Analyzed': return 'AI';
    case 'Work In Progress': return 'WIP';
    case 'Work Done': return 'Done';
    case 'Community Verification': return 'Verify';
    default: return s;
  }
};

export const ReportCard: React.FC<ReportCardProps> = ({ report, onVote, onResolutionVerify, onCompareResolution, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [afterImagePreview, setAfterImagePreview] = useState<string | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  const handleAfterImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAfterImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRunComparison = async () => {
    if (!afterImagePreview || !onCompareResolution) return;
    setIsComparing(true);
    try {
      const res = await fetch('/api/compare-resolution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          beforeImage: report.imageUrl,
          afterImage: afterImagePreview,
          title: report.title,
          category: report.category
        })
      });
      const assessment = await res.json();
      onCompareResolution(report.id, assessment, afterImagePreview);
      setAfterImagePreview(null);
    } catch (err) {
      // Fallback handled quietly
    } finally {
      setIsComparing(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse font-bold';
      case 'High':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold';
      case 'Medium':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40 font-medium';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40 font-medium';
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Sewage Overflow':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'Drainage Blockage':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
      case 'Water Leakage':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'Garbage':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-500/10 text-slate-300 border-slate-500/30';
    }
  };

  const currentStepIndex = STATUS_STEPS.indexOf(report.status);

  const handleVoteClick = (type: 'present' | 'resolved') => {
    if (hasVoted) return;
    onVote(report.id, type);
    setHasVoted(true);
  };

  return (
    <div id={`report-${report.id}`} className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl hover:border-slate-700 transition-all duration-300">
      
      {/* Top Bar with ID & Timestamps */}
      <div className="bg-slate-950/60 px-5 py-3 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="font-mono font-bold text-teal-400 bg-teal-950/50 px-2.5 py-0.5 rounded border border-teal-800/50">
            {report.id}
          </span>
          <span className="flex items-center text-slate-400">
            <Clock className="w-3.5 h-3.5 mr-1 text-slate-500" />
            {new Date(report.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border ${getSeverityBadge(report.severity)}`}>
            {report.severity} Severity
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] border ${getCategoryColor(report.category)}`}>
            {report.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Image Thumbnail */}
          <div className="md:col-span-4 relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 max-h-60 group">
            <img 
              src={report.imageUrl} 
              alt={report.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80';
              }}
            />
            <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[10px] text-teal-300 font-mono font-bold flex items-center border border-teal-500/30 shadow">
              <Sparkles className="w-3 h-3 mr-1 text-teal-400" />
              Before Image
            </div>
          </div>

          {/* Details & AI Intelligence */}
          <div className="md:col-span-8 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-white mb-2 leading-snug">
                {report.title}
              </h3>

              <div className="flex items-start text-sm text-slate-300 mb-3 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                <MapPin className="w-4 h-4 text-teal-400 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold text-white">{report.location}</span>
                  {report.zone && <span className="text-xs text-slate-400 ml-2">({report.zone})</span>}
                </div>
              </div>

              <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                {report.description}
              </p>

              {/* Gemini AI Reasoning Callout */}
              <div className="bg-gradient-to-r from-teal-950/40 to-slate-900 p-3 rounded-xl border border-teal-800/40 mb-4 text-xs">
                <div className="flex items-center text-teal-300 font-semibold mb-1">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                  Gemini Severity Assessment Agent ({report.severity})
                </div>
                <p className="text-slate-300 leading-relaxed font-sans">
                  "{report.reason}"
                </p>
              </div>
            </div>

            {/* Department Routing */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
              <div className="flex items-center text-slate-400">
                <Building2 className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                <span>Routed to: <strong className="text-slate-200">{report.department}</strong></span>
              </div>
              
              <button 
                onClick={() => setExpanded(!expanded)}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center transition-colors"
              >
                {expanded ? 'Hide Tracking & Verification' : 'Track & Verify Community Vote'}
                {expanded ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
            </div>

          </div>

        </div>

        {/* EXPANDED SECTION: Status Flow & Community Verification */}
        {expanded && (
          <div className="mt-6 pt-6 border-t border-slate-800 space-y-6 animate-fadeIn">
            
            {/* 1. Complaint Status Flow Visualizer */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center">
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
                  Civic Resolution Status Flow
                </span>
                <span className="text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/30">
                  Current: {report.status}
                </span>
              </div>

              {/* Status Stepper */}
              <div className="grid grid-cols-4 gap-2 relative">
                {STATUS_STEPS.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                          isCurrent 
                            ? 'bg-teal-500 text-slate-950 ring-4 ring-teal-500/20 shadow-lg shadow-teal-500/30' 
                            : isCompleted 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                              : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : index + 1}
                      </div>
                      <span className={`text-[11px] font-medium leading-tight ${isCurrent ? 'text-teal-300 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-600'}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Admin Simulation Controls (Beginner friendly demo) */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/50 p-2.5 rounded-lg text-xs">
                <span className="text-slate-400">Update Status:</span>
                <div className="flex space-x-1.5">
                  {STATUS_STEPS.map((s) => (
                    <button
                      key={s}
                      onClick={() => onUpdateStatus(report.id, s)}
                      className={`px-2 py-1 rounded text-[10px] font-semibold transition-all ${
                        report.status === s
                          ? 'bg-teal-500 text-slate-950'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {getShortStepName(s)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mandatory Community Verification Step (Triggered after Work Done) */}
            {STATUS_STEPS.indexOf(report.status) >= STATUS_STEPS.indexOf('Work Done') && (
              <div className="bg-gradient-to-br from-teal-950/90 to-slate-900 p-5 rounded-2xl border-2 border-teal-400 shadow-2xl mb-4 animate-fade-in">
                <div className="flex items-center justify-between mb-3 border-b border-teal-500/30 pb-2.5">
                  <div className="flex items-center space-x-2 text-teal-300 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-teal-400" />
                    <span className="uppercase tracking-wider">Mandatory Step: Community Verification</span>
                  </div>
                  <span className="text-[10px] bg-red-500/20 text-red-300 px-2.5 py-1 rounded-full border border-red-500/30 font-bold uppercase tracking-wider">
                    Cannot be skipped
                  </span>
                </div>

                <p className="text-base sm:text-lg text-white font-extrabold mb-4 text-center py-2 bg-slate-950/50 rounded-xl border border-slate-800">
                  "Is this issue actually resolved?"
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={() => onResolutionVerify(report.id, 'Yes, Fully Fixed')}
                    className={`flex items-center justify-center px-4 py-3.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      report.communityResolutionVote === 'Yes, Fully Fixed'
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-xl shadow-emerald-500/20 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-emerald-500/50 hover:bg-emerald-500/10'
                    }`}
                  >
                    <CheckCircle2 className={`w-5 h-5 mr-2 ${report.communityResolutionVote === 'Yes, Fully Fixed' ? 'text-slate-950' : 'text-emerald-400'}`} />
                    Yes, Fully Fixed
                  </button>

                  <button
                    onClick={() => onResolutionVerify(report.id, 'No, Still Exists')}
                    className={`flex items-center justify-center px-4 py-3.5 rounded-xl border-2 text-sm font-bold transition-all ${
                      report.communityResolutionVote === 'No, Still Exists'
                        ? 'bg-red-500 text-white border-red-400 shadow-xl shadow-red-500/20 scale-[1.02]'
                        : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-red-500/50 hover:bg-red-500/10'
                    }`}
                  >
                    <AlertTriangle className={`w-5 h-5 mr-2 ${report.communityResolutionVote === 'No, Still Exists' ? 'text-white' : 'text-red-400'}`} />
                    No, Still Exists
                  </button>
                </div>

                {report.communityResolutionVote && (
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950/80 p-3 rounded-xl border border-slate-800 mt-3">
                    <span className="text-slate-300">
                      Current response: <strong className={report.communityResolutionVote === 'Yes, Fully Fixed' ? 'text-emerald-400' : 'text-red-400'}>{report.communityResolutionVote}</strong>
                    </span>
                    <span className="text-[11px] text-teal-400 font-medium">
                      ✎ Click either option above anytime to edit/toggle
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Before vs After Resolution Verification Timeline Feature */}
            {STATUS_STEPS.indexOf(report.status) >= STATUS_STEPS.indexOf('Work Done') && (
              <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-5 rounded-2xl border border-cyan-500/30 shadow-xl animate-fade-in">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2.5">
                  <div className="flex items-center space-x-2 text-cyan-300 font-bold text-sm">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Before vs After Resolution Verification</span>
                  </div>
                  {report.aiResolutionAssessment && (
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/30 font-bold">
                      Vision Analyzed
                    </span>
                  )}
                </div>

                {report.aiResolutionAssessment ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950 max-h-48 relative">
                        <img src={report.imageUrl} alt="Before Image" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-slate-950/90 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono border border-slate-700">Before Image</span>
                      </div>
                      <div className="rounded-lg overflow-hidden border border-emerald-500/40 bg-slate-950 max-h-48 relative">
                        <img src={report.aiResolutionAssessment.afterImageUrl} alt="After Image" className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-emerald-700/50">After Image</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2.5">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                        <span className="text-slate-400">AI Recommendation:</span>
                        <span className={`px-2.5 py-0.5 rounded font-bold text-xs ${
                          report.aiResolutionAssessment.resolution_status === 'Resolved' || report.aiResolutionAssessment.likelyResolved === 'Yes'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {report.aiResolutionAssessment.resolution_status || (report.aiResolutionAssessment.likelyResolved === 'Yes' ? 'Resolved' : 'Not Resolved')}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">AI Vision Confidence:</span>
                        <strong className="text-cyan-400 font-mono text-sm">{report.aiResolutionAssessment.confidence}%</strong>
                      </div>
                      <div className="pt-1">
                        <span className="text-slate-400 block mb-1">Observations:</span>
                        <p className="text-slate-200 bg-slate-900/80 p-2.5 rounded border border-slate-800 italic text-[13px] leading-relaxed">
                          "{report.aiResolutionAssessment.observations || (report.aiResolutionAssessment.remainingVisibleIssues?.join(', ') || 'Condition visually improved')}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-[11px] text-amber-200 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="block text-amber-300 font-bold mb-0.5">Important Notice</strong>
                        <span>AI should only recommend resolution status. Final resolution requires community verification.</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-5 bg-slate-950/40 rounded-xl border border-slate-800/80 space-y-3">
                    <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                      Department work is marked done. Allow citizens or field staff to upload an after-resolution image for Gemini Vision verification.
                    </p>
                    {afterImagePreview ? (
                      <div className="space-y-3 pt-1">
                        <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden border-2 border-cyan-500/60 relative shadow-lg">
                          <img src={afterImagePreview} alt="After Image Preview" className="w-full h-full object-cover" />
                          <button onClick={() => setAfterImagePreview(null)} className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">&times;</button>
                        </div>
                        <button
                          onClick={handleRunComparison}
                          disabled={isComparing}
                          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg disabled:opacity-50 transition-all flex items-center justify-center mx-auto"
                        >
                          {isComparing ? (
                            <><Sparkles className="w-4 h-4 mr-2 animate-spin" /> Analyzing Before vs After Image...</>
                          ) : (
                            <><Sparkles className="w-4 h-4 mr-2" /> Verify Resolution with Gemini Vision</>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <label className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all transform hover:scale-[1.02]">
                          <Sparkles className="w-4 h-4 mr-2" />
                          <span>Upload After Image</span>
                          <input type="file" accept="image/*" onChange={handleAfterImageSelect} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 2. Community Verification Agent */}
            <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-xl border border-teal-500/20 shadow-inner">
              <div className="flex items-center space-x-2 text-teal-300 font-bold text-sm mb-2">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Community Verification Agent</span>
              </div>
              
              <p className="text-sm text-white font-medium mb-3">
                "{report.verificationQuestion}"
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={() => handleVoteClick('present')}
                  disabled={hasVoted}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    hasVoted && report.verifications.userVoted === 'present'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-amber-500/10 hover:border-amber-500/40'
                  }`}
                >
                  <span className="flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
                    Yes - Still Existing
                  </span>
                  <span className="bg-slate-900 px-2.5 py-0.5 rounded-full text-xs font-mono text-amber-400 font-bold">
                    {report.verifications.stillPresent}
                  </span>
                </button>

                <button
                  onClick={() => handleVoteClick('resolved')}
                  disabled={hasVoted}
                  className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                    hasVoted && report.verifications.userVoted === 'resolved'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-md'
                      : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-emerald-500/10 hover:border-emerald-500/40'
                  }`}
                >
                  <span className="flex items-center">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" />
                    No - Resolved
                  </span>
                  <span className="bg-slate-900 px-2.5 py-0.5 rounded-full text-xs font-mono text-emerald-400 font-bold">
                    {report.verifications.resolved}
                  </span>
                </button>
              </div>

              {hasVoted && (
                <p className="text-xs text-teal-400 mt-2.5 flex items-center font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  Thank you! Your civic verification vote increases community confidence score.
                </p>
              )}

              {/* Product Principle Notice */}
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 italic">
                * Note: NagarMitra AI acts as an intelligence layer assisting citizens with reporting, prioritization, and community verification. We do not claim official registration or direct government dispatch.
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
