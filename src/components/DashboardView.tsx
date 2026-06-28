import React from 'react';
import { 
  AlertTriangle, 
  TrendingUp, 
  MapPin, 
  Sparkles, 
  Building2, 
  Database, 
  Cloud, 
  Cpu, 
  ArrowRight,
  PlusCircle,
  Users
} from 'lucide-react';
import { CivicReport, Tab } from '../types';
import { CivicIssuesMap } from './CivicIssuesMap';

interface DashboardViewProps {
  reports: CivicReport[];
  onNavigateTab: (tab: Tab) => void;
  onSelectReport: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ reports, onNavigateTab, onSelectReport }) => {
  const safeReports = reports || [];
  const activeIssues = safeReports.filter(r => r.status !== 'Resolved').length;

  // High priority locations (Critical & High severity)
  const highPriorityReports = safeReports.filter(r => r.severity === 'Critical' || r.severity === 'High');

  return (
    <div className="space-y-8 pb-12">
      
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-teal-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Hyderabad Civic Intelligence Layer</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            NagarMitra AI<br />
            <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">AI Civic Tracking</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mb-6 leading-relaxed">
            NagarMitra AI helps citizens report, verify, and track local civic issues such as sewage overflow, drainage problems, garbage, and water leakage using Gemini AI, human validation, and community verification.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('report')}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/25 hover:opacity-95 transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report Civic Problem</span>
            </button>

            <button
              onClick={() => onNavigateTab('feed')}
              className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-800 text-white font-semibold px-6 py-3 rounded-xl border border-slate-700 transition-all"
            >
              <Users className="w-5 h-5 text-teal-400" />
              <span>Explore Community Feed ({activeIssues} Active)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Requirement 3: Google Maps View */}
      <div className="mb-8">
        <CivicIssuesMap reports={reports} onSelectReport={onSelectReport} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: High Priority Locations Table */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">High Priority Locations</h2>
                  <p className="text-xs text-slate-400">Hotspots identified by AI Severity Assessment Agent</p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('feed')}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400 bg-slate-950/50">
                    <th className="p-3.5 rounded-l-xl">Report ID & Issue</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 rounded-r-xl text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {highPriorityReports.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="p-3.5 font-medium text-white">
                        <div className="flex flex-col">
                          <span className="font-mono text-xs text-teal-400 font-bold">{item.id}</span>
                          <span className="truncate max-w-[180px] sm:max-w-xs">{item.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-300 text-xs">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 text-slate-500 mr-1 flex-shrink-0" />
                          <span className="truncate max-w-[140px]">{item.location}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          item.severity === 'Critical' 
                            ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                        }`}>
                          {item.severity}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            onSelectReport(item.id);
                            onNavigateTab('feed');
                          }}
                          className="text-xs bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-slate-950 font-semibold px-3 py-1 rounded-lg border border-teal-500/30 transition-all"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Predictive Insight Agent Banner (Requirement 7) */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-start space-x-4">
              <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Predictive Insight Agent</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-200 px-2 py-0.2 rounded-full font-mono border border-indigo-500/30">
                    AI Monsoon Forecast
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white mb-2">
                  Pre-Monsoon Drainage Vulnerability Alert
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  "Analysis of historical complaints indicates repeated drainage chokes in <strong className="text-indigo-200">reported urban zones</strong>. Preventive desilting and clearing plastic waste before the upcoming monsoon showers is strongly recommended to avoid critical overflows."
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
                  <span>Routing Suggestion:</span>
                  <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-indigo-300">Monsoon Emergency Wing</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Google Cloud & Architecture Blueprint */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center">
                <Cpu className="w-4 h-4 text-teal-400 mr-2" />
                Citizen Transparency Architecture
              </h3>
              <span className="text-[10px] bg-teal-500/10 text-teal-300 px-2.5 py-1 rounded-full border border-teal-500/30 font-semibold">
                Open Accountability
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-4 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
              💡 <strong className="text-teal-400">Why this is visible to citizens:</strong> Traditional portals act as a black box. Showing our AI + Human workflow guarantees every complaint is objectively analyzed, verified, and impossible to silently dismiss.
            </p>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                  <span className="flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400 mr-1.5" />
                    Multimodal AI Agent
                  </span>
                  <span className="text-[10px] font-mono text-teal-400">gemini-2.5-flash</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Analyzes uploaded images for sewage overflow, confidence, and severity reasoning in structured JSON.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                    Human Validation Layer
                  </span>
                  <span className="text-[10px] font-mono text-amber-400">Citizen-in-Loop</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  AI suggestions are never final. Citizens confirm or override categories before submitting.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                  <span className="flex items-center">
                    <Database className="w-3.5 h-3.5 text-cyan-400 mr-1.5" />
                    Firebase Ready Storage
                  </span>
                  <span className="text-[10px] font-mono text-cyan-400">Durable JSON</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Structured schema supporting complaint lifecycle tracking, geolocation tags, and crowdsourced votes.
                </p>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                  <span className="flex items-center">
                    <Cloud className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                    Cloud Run Container
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">Port 3000</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-normal">
                  Full-stack Express + Vite architecture proxying secure API keys away from browser clients.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400">
              <strong className="text-slate-300">Important Civic Principle:</strong> We are not replacing government systems. We are an intelligence layer making complaint systems faster, transparent, verified, and predictive.
            </div>
          </div>

          {/* Department Directory Quick Reference */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-3 flex items-center">
              <Building2 className="w-4 h-4 text-amber-400 mr-2" />
              Hyderabad Routing Authorities
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start justify-between bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                <div>
                  <div className="font-semibold text-white">HMWSSB</div>
                  <div className="text-[11px] text-slate-400">Water Supply & Sewerage Board</div>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-amber-300 font-mono">155313</span>
              </li>
              <li className="flex items-start justify-between bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
                <div>
                  <div className="font-semibold text-white">GHMC Sanitation</div>
                  <div className="text-[11px] text-slate-400">Greater Hyderabad Municipal Corp</div>
                </div>
                <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-teal-300 font-mono">040-21111111</span>
              </li>
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
};
