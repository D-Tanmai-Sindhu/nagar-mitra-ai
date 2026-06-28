import React, { useState } from 'react';
import { 
  Users, 
  Filter, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  FileText,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { CivicReport, IssueCategory, IssueStatus } from '../types';
import { ReportCard } from './ReportCard';
import { HYDERABAD_ZONES } from '../mockData';

interface CommunityFeedViewProps {
  reports: CivicReport[];
  onVote: (id: string, voteType: 'present' | 'resolved') => void;
  onResolutionVerify: (id: string, vote: 'Yes, Fully Fixed' | 'No, Still Exists') => void;
  onCompareResolution?: (id: string, assessment: any, afterImageUrl: string) => void;
  onUpdateStatus: (id: string, newStatus: IssueStatus) => void;
  onNavigateReport: () => void;
}

export const CommunityFeedView: React.FC<CommunityFeedViewProps> = ({
  reports,
  onVote,
  onResolutionVerify,
  onCompareResolution,
  onUpdateStatus,
  onNavigateReport
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterZone, setFilterZone] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredReports = reports.filter(r => {
    const matchesStatus = filterStatus === 'All' 
      ? true 
      : filterStatus === 'Active' 
        ? (r.status !== 'Resolved') 
        : r.status === filterStatus;
        
    const matchesCategory = filterCategory === 'All' ? true : r.category === filterCategory;
    const matchesZone = filterZone === 'All' ? true : r.zone === filterZone;
    
    const matchesSearch = searchQuery.trim() === '' 
      ? true 
      : r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.location.toLowerCase().includes(searchQuery.toLowerCase()) || 
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesCategory && matchesZone && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Feed Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Users className="w-4 h-4" />
            <span>Hyderabad Crowdsourced Civic Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Community Tracking & Verification Feed
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Review civic problem reports submitted by Hyderabad residents. Vote on verification questions (<strong className="text-slate-200">"Is this issue still present?"</strong>) to build ground truth accountability.
          </p>
        </div>

        <button
          onClick={onNavigateReport}
          className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:opacity-95 transition-all flex items-center space-x-2 justify-center flex-shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Report New Issue</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
          <Filter className="w-3.5 h-3.5 mr-1.5 text-teal-400" />
          <span>Filter & Search Hyderabad Reports</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ID, colony, issue..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
          >
            <option value="All">All Statuses ({reports.length})</option>
            <option value="Active">Active / Unresolved</option>
            <option value="Reported">Reported</option>
            <option value="AI Analyzed">AI Analyzed</option>
            <option value="Assigned">Assigned</option>
            <option value="Work In Progress">Work In Progress</option>
            <option value="Work Done">Work Done</option>
            <option value="Community Verification">Community Verification</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Sewage Overflow">Sewage Overflow</option>
            <option value="Drainage Blockage">Drainage Blockage</option>
            <option value="Water Leakage">Water Leakage</option>
            <option value="Garbage">Garbage</option>
            <option value="Other">Other</option>
          </select>

          {/* Zone Filter */}
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 transition-colors cursor-pointer"
          >
            <option value="All">All Zones</option>
            {HYDERABAD_ZONES.map(z => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>

        </div>

        {/* Active Filters Summary Pill */}
        {(filterStatus !== 'All' || filterCategory !== 'All' || filterZone !== 'All' || searchQuery !== '') && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
            <span>Showing <strong className="text-teal-400 font-mono">{filteredReports.length}</strong> of {reports.length} reports</span>
            <button
              onClick={() => {
                setFilterStatus('All');
                setFilterCategory('All');
                setFilterZone('All');
                setSearchQuery('');
              }}
              className="text-amber-400 hover:text-amber-300 underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Reports Feed List */}
      {filteredReports.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center text-slate-400 shadow-xl">
          <Filter className="w-12 h-12 mx-auto mb-4 text-slate-600" />
          <h3 className="text-lg font-bold text-white mb-1">No civic reports match our filter</h3>
          <p className="text-xs mb-6">Try broadening the search or resetting category filters.</p>
          <button
            onClick={() => {
              setFilterStatus('All');
              setFilterCategory('All');
              setFilterZone('All');
              setSearchQuery('');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-5 py-2.5 rounded-xl border border-slate-600 transition-colors"
          >
            Show All Reports
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredReports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onVote={onVote}
              onResolutionVerify={onResolutionVerify}
              onCompareResolution={onCompareResolution}
              onUpdateStatus={onUpdateStatus}
            />
          ))}
        </div>
      )}

      {/* Resolution Verification Agent & Product Principle Info */}
      <div className="bg-gradient-to-r from-slate-950 via-teal-950/30 to-slate-950 border border-teal-800/40 rounded-3xl p-6 sm:p-8 shadow-xl text-center max-w-3xl mx-auto">
        <Sparkles className="w-8 h-8 text-teal-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">
          NagarMitra AI — Accountability Principles
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          When authorities mark an issue resolved, our <strong className="text-teal-300">Resolution Verification Agent</strong> compares before and after evidence. Never automatically approving without ground verification. Crowdsourced voting from nearby Hyderabad residents confirms lasting improvements.
        </p>
        <div className="text-[11px] text-slate-400 font-mono bg-slate-900 px-4 py-2 rounded-xl inline-block border border-slate-800">
          📍 Civic Assistant Layer • Hyderabad Metropolitan Region
        </div>
      </div>

    </div>
  );
};
