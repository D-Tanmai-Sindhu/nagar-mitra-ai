import React from 'react';
import { CivicReport, IssueStatus } from '../types';
import { CheckCircle2, MapPin, Tag, Clock, RotateCcw, ShieldCheck, Check } from 'lucide-react';

interface ResolvedIssuesViewProps {
  reports: CivicReport[];
  onUpdateStatus: (id: string, newStatus: IssueStatus) => void;
}

export const ResolvedIssuesView: React.FC<ResolvedIssuesViewProps> = ({
  reports,
  onUpdateStatus,
}) => {
  const resolvedReports = (reports || []).filter(r => r.status === 'Resolved');

  return (
    <div className="space-y-8 pb-16">
      {/* Page Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Closed & Verified Archive</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
            Resolved Civic Issues
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Archive of civic sewage and drainage complaints that have been fully serviced by municipal field workers and verified by AI scans or citizen votes.
          </p>
        </div>
      </div>

      {/* List / Grid of Resolved Issues */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Verified Resolutions</span>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-mono font-semibold">
              {resolvedReports.length}
            </span>
          </h2>
        </div>

        {resolvedReports.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto border border-emerald-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No resolved issues in archive</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              When ongoing complaints are fixed by municipal teams and verified by citizens, they will be archived here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resolvedReports.map((report) => {
              const formattedTime = (() => {
                try {
                  const d = new Date(report.updatedAt || report.createdAt);
                  return isNaN(d.getTime()) ? report.updatedAt : d.toLocaleString();
                } catch {
                  return report.updatedAt || 'Recent';
                }
              })();

              const verificationSummary =
                report.aiResolutionAssessment?.observations ||
                (report.communityResolutionVote
                  ? `Community consensus: ${report.communityResolutionVote}. Issue verified fixed.`
                  : `Verified resolved by ${report.verifications?.resolved || 1} community member(s) & AI field validation.`);

              return (
                <div
                  key={report.id}
                  id={`resolved-card-${report.id}`}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 transition-all shadow-xl flex flex-col justify-between space-y-6 relative overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 opacity-80" />

                  <div className="space-y-4">
                    {/* Header: ID + Category */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                        <Tag className="w-3 h-3" />
                        {report.category}
                      </span>
                      <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 font-semibold">
                        ID: #{report.id}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {report.title}
                    </h3>

                    {/* Location & Time */}
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>{report.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resolved on: {formattedTime}</span>
                      </div>
                    </div>

                    {/* Verification Summary */}
                    <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 bg-emerald-500/20 text-emerald-300 rounded-full p-0.5" />
                        <span>Verification Summary</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-5">
                        {verificationSummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Restore Issue */}
                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end">
                    <button
                      onClick={() => onUpdateStatus(report.id, 'Work In Progress')}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 text-xs font-semibold border border-slate-700 hover:border-amber-500/40 transition-all cursor-pointer"
                      title="Restore issue back to active Work In Progress"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Issue</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
