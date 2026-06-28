import { ShieldAlert, PlusCircle, LayoutDashboard, Users, PhoneCall, CheckCircle2 } from 'lucide-react';
import { Tab } from '../types';

interface NavbarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  reportsCount: number;
}

export function Navbar({ activeTab, setActiveTab, reportsCount }: NavbarProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-gradient-to-tr from-teal-500 to-emerald-400 p-2 rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-200 via-emerald-100 to-white bg-clip-text text-transparent">
                  NagarMitra AI
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/30">
                  Hyderabad
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                AI Civic Intelligence & Community Resolution Layer
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative ${
                activeTab === 'feed'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Community Feed</span>
              <span className="bg-emerald-400 text-slate-950 text-[10px] font-bold px-1.5 py-0.2 rounded-full ml-1">
                {reportsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('resolved')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'resolved'
                  ? 'bg-teal-500 text-slate-950 shadow-md font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Resolved Issues</span>
            </button>

            <button
              id="report-issue-btn"
              onClick={() => setActiveTab('report')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'report'
                  ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-orange-500/20'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 hover:opacity-95 shadow-md shadow-teal-500/10'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Civic Issue</span>
            </button>
          </nav>

          {/* Emergency Helplines */}
          <div className="hidden lg:flex items-center space-x-3 text-xs bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/40">
            <PhoneCall className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-slate-400 font-medium">GHMC: <strong className="text-white">040-21111111</strong></span>
              <span className="text-slate-400 font-medium">HMWSSB: <strong className="text-white">155313</strong></span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
