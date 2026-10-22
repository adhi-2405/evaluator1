import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Brain,
  FlaskConical,
  BarChart3,
  Users,
  BookmarkCheck,
  MessageSquare,
  Wrench
} from 'lucide-react';
import { api } from '../services/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userRole: 'student' | 'teacher';
  setUserRole: (role: 'student' | 'teacher') => void;
  onOpenMistakes?: () => void;
  onOpenTeachBack?: () => void;
  onOpenRepair?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userRole,
  setUserRole,
  onOpenMistakes,
  onOpenTeachBack,
  onOpenRepair
}) => {
  const [aiStatus, setAiStatus] = useState<{ configured: boolean; model: string }>({
    configured: false,
    model: 'open-mistral-7b',
  });

  useEffect(() => {
    api.getHealth()
      .then((data) => {
        setAiStatus({ configured: data.ai_configured, model: data.ai_model });
      })
      .catch(() => {});
  }, []);

  // Standardized Navigation Structure per Requirement 9
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: BookOpen },
    { id: 'learnmorph', label: 'Learn', secondary: 'LearnMorph', icon: BookOpen, color: 'text-cyan-400' },
    { id: 'lumilearn', label: 'Practise', secondary: 'LumiLearn', icon: Brain, color: 'text-violet-400' },
    { id: 'conceptverse', label: 'Experiment', secondary: 'ConceptVerse', icon: FlaskConical, color: 'text-emerald-400' },
    { id: 'progress', label: 'Progress', secondary: 'Telemetry', icon: BarChart3 },
    { id: 'teacher', label: 'Teacher', icon: Users, roleSpecific: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0B1120]/95 backdrop-blur-md border-b border-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-100 to-cyan-300 bg-clip-text text-transparent">
                  EduVerse AI
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Adaptive
                </span>
              </div>
              <p className="text-[11px] text-gray-400 hidden sm:block">
                Learn Differently. Understand Deeply. Master Anything.
              </p>
            </div>
          </div>

          {/* Navigation Links per Requirement 9 */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              if (item.roleSpecific && userRole !== 'teacher') return null;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm shadow-indigo-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                  {item.secondary && (
                    <span
                      className={`text-[9px] font-normal px-1 py-0.2 rounded hidden xl:inline ${
                        item.color ? `${item.color} bg-white/5` : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {item.secondary}
                    </span>
                  )}
                </button>
              );
            })}

            {/* Quick Action: Mistake Notebook Modal */}
            {onOpenMistakes && (
              <button
                onClick={onOpenMistakes}
                className="flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-rose-300 hover:text-white hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                title="Open Personal Mistake Notebook"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>Mistakes</span>
              </button>
            )}

            {/* Quick Action: Teach-Back Mode */}
            {onOpenTeachBack && (
              <button
                onClick={onOpenTeachBack}
                className="flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-violet-300 hover:text-white hover:bg-violet-500/10 border border-violet-500/20 transition-all"
                title="Explain concept in your own words (Teach-Back)"
              >
                <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                <span>Teach-Back</span>
              </button>
            )}

            {/* Quick Action: Guided Repair Session */}
            {onOpenRepair && (
              <button
                onClick={onOpenRepair}
                className="flex items-center space-x-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/10 border border-amber-500/20 transition-all"
                title="Launch Guided 7-Step Learning Repair Session"
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Repair</span>
              </button>
            )}
          </nav>

          {/* Right Action: AI status & Role toggle */}
          <div className="flex items-center space-x-2.5">
            {/* AI Status Badge */}
            <div
              className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border border-gray-700/60 bg-gray-900/80"
              title={
                aiStatus.configured
                  ? `Connected to Mistral Cloud API (${aiStatus.model})`
                  : 'Operating in High-Fidelity Curated & Local Retrieval Mode'
              }
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  aiStatus.configured ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'
                }`}
              />
              <span className="text-gray-300">
                {aiStatus.configured ? 'Mistral Live' : 'Deterministic Mode'}
              </span>
            </div>

            {/* Role Switcher */}
            <div className="flex items-center bg-gray-900 border border-gray-700/60 rounded-lg p-0.5 text-xs font-semibold">
              <button
                onClick={() => setUserRole('student')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  userRole === 'student'
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => {
                  setUserRole('teacher');
                  setActiveTab('teacher');
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  userRole === 'teacher'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Teacher
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
