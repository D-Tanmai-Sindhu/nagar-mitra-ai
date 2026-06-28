import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { ReportIssueView } from './components/ReportIssueView';
import { CommunityFeedView } from './components/CommunityFeedView';
import { ResolvedIssuesView } from './components/ResolvedIssuesView';
import { INITIAL_REPORTS } from './mockData';
import { CivicReport, IssueStatus, Tab } from './types';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [reports, setReports] = useState<CivicReport[]>(() => {
    try {
      const saved = localStorage.getItem('nagarmitra_reports_live');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return INITIAL_REPORTS;
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('nagarmitra_reports_live', JSON.stringify(reports));
    } catch {}
  }, [reports]);

  const showToast = (msg: string, type: 'success' | 'info' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleAddNewReport = (inputReport: CivicReport) => {
    // Requirement 4: Newly added reports must include valid coordinates before being passed to map
    let validLat: any = inputReport.latitude;
    let validLng: any = inputReport.longitude;

    if (
      validLat === null ||
      validLat === undefined ||
      validLng === null ||
      validLng === undefined ||
      validLat === "" ||
      validLng === "" ||
      isNaN(Number(validLat)) ||
      isNaN(Number(validLng))
    ) {
      validLat = 17.3850;
      validLng = 78.4867;
    }

    const newReport: CivicReport = {
      ...inputReport,
      latitude: Number(validLat),
      longitude: Number(validLng),
    };

    // Requirement 2: Ensure state updates are immutable - return new array when adding reports, never mutate existing reports array
    setReports(prev => [...prev, newReport]);
    // Requirement 1 & 7: Immediately reflect new reports on the map UI without refresh or manual navigation
    setActiveTab('dashboard');
    showToast(`Civic issue ${newReport.id} logged! NagarMitra AI routed it to ${newReport.department}.`);
  };

  const handleVote = (id: string, voteType: 'present' | 'resolved') => {
    setReports(prev => prev.map(item => {
      if (item.id === id) {
        const prevVote = item.verifications.userVoted;
        if (prevVote === voteType) return item;

        let newStillPresent = item.verifications.stillPresent;
        let newResolved = item.verifications.resolved;

        if (prevVote === 'present') newStillPresent = Math.max(0, newStillPresent - 1);
        if (prevVote === 'resolved') newResolved = Math.max(0, newResolved - 1);

        if (voteType === 'present') newStillPresent += 1;
        if (voteType === 'resolved') newResolved += 1;
        
        let newStatus = item.status;
        if (newResolved >= 10 && newResolved > newStillPresent * 2 && item.status !== 'Resolved') {
          newStatus = 'Resolved';
        }

        return {
          ...item,
          status: newStatus,
          verifications: {
            stillPresent: newStillPresent,
            resolved: newResolved,
            userVoted: voteType
          }
        };
      }
      return item;
    }));

    showToast(voteType === 'present' ? 'Verification vote updated: Yes (Still Existing).' : 'Verification vote updated: No (Marked Resolved).');
  };

  const handleCompareResolution = (id: string, assessment: any, afterImageUrl: string) => {
    setReports(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          aiResolutionAssessment: {
            ...assessment,
            afterImageUrl,
            assessedAt: new Date().toISOString()
          }
        };
      }
      return item;
    }));
    showToast(`AI Before vs After comparison completed!`);
  };

  const handleResolutionVerify = (id: string, vote: 'Yes, Fully Fixed' | 'No, Still Exists') => {
    setReports(prev => prev.map(item => {
      if (item.id === id) {
        const newStatus: IssueStatus = vote === 'Yes, Fully Fixed' ? 'Resolved' : 'Community Verification';
        return {
          ...item,
          communityResolutionVote: vote,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    showToast(`Community Verification recorded: ${vote}`);
  };

  const handleUpdateStatus = (id: string, newStatus: IssueStatus) => {
    setReports(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
    showToast(`Status updated to ${newStatus}`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-950">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`flex items-center space-x-3 px-5 py-3.5 rounded-2xl shadow-2xl border ${
            toast.type === 'success' 
              ? 'bg-emerald-950 text-emerald-200 border-emerald-500/50 shadow-emerald-950/50' 
              : 'bg-slate-900 text-teal-300 border-teal-500/50'
          }`}>
            <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0" />
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reportsCount={reports.filter(r => r.status !== 'Resolved').length}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            reports={reports}
            onNavigateTab={setActiveTab}
            onSelectReport={(_id) => setActiveTab('feed')}
          />
        )}

        {activeTab === 'report' && (
          <ReportIssueView
            onSubmitReport={handleAddNewReport}
            onCancel={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'feed' && (
          <CommunityFeedView
            reports={reports}
            onVote={handleVote}
            onResolutionVerify={handleResolutionVerify}
            onCompareResolution={handleCompareResolution}
            onUpdateStatus={handleUpdateStatus}
            onNavigateReport={() => setActiveTab('report')}
          />
        )}

        {activeTab === 'resolved' && (
          <ResolvedIssuesView
            reports={reports}
            onUpdateStatus={handleUpdateStatus}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-500 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-slate-900/80 border border-slate-800 p-4 rounded-2xl text-slate-300 text-left mb-6 shadow-lg">
            <div className="flex items-center space-x-2 font-semibold text-teal-400 mb-1.5">
              <span>⚠️ Civic Transparency & Disclaimer</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              This system does not directly connect to government services. It helps citizens report, understand, and verify civic issues using AI and community participation.
            </p>
          </div>

          <p className="mb-2 text-slate-400 font-medium">
            NagarMitra AI • AI Civic Intelligence & Community Resolution Layer
          </p>
          <p className="max-w-xl mx-auto text-slate-600 leading-relaxed mb-4">
            Designed to bring transparency, multimodal verification, human validation, and crowdsourced community tracking to civic sewage and drainage complaint reporting.
          </p>
          <div className="flex items-center justify-center space-x-4 text-[11px] font-mono text-slate-500">
            <span>GHMC Helplines</span> • <span>HMWSSB Sewerage</span> • <span>Gemini 2.5 AI</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
