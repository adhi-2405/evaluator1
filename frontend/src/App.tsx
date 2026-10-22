import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { LearnMorphPage } from './pages/LearnMorphPage';
import { LumiLearnPage } from './pages/LumiLearnPage';
import { ConceptVersePage } from './pages/ConceptVersePage';
import { ProgressPage } from './pages/ProgressPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { MistakeNotebookModal } from './components/MistakeNotebookModal';
import { TeachBackModal } from './components/TeachBackModal';
import { RepairSessionModal } from './components/RepairSessionModal';
import { Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { api, authStorage } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');

  // Shared navigation state
  const [selectedConcept, setSelectedConcept] = useState<string>('c_loops_termination');
  const [selectedSim, setSelectedSim] = useState<string>('c_loop');
  const [isReassessment, setIsReassessment] = useState<boolean>(false);

  // Modals state
  const [isMistakesModalOpen, setIsMistakesModalOpen] = useState<boolean>(false);
  const [isTeachBackModalOpen, setIsTeachBackModalOpen] = useState<boolean>(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState<boolean>(false);
  const [targetTeachBackConcept, setTargetTeachBackConcept] = useState<string>('c_loops_termination');

  // Guided Hackathon Demo Journey State (Contained strictly in Demo Mode per Requirement 9)
  const [demoStep, setDemoStep] = useState<number | null>(null);
  const [isAutoPilot, setIsAutoPilot] = useState<boolean>(false);
  const autoPilotTimerRef = React.useRef<any>(null);

  // Initialize demo student session on mount if no token exists
  useEffect(() => {
    if (!authStorage.getToken()) {
      api.demoLogin('student').catch(() => {});
    }
  }, []);

  const startDemoJourney = () => {
    setIsAutoPilot(false);
    setDemoStep(1);
    setSelectedConcept('c_loops_termination');
    setIsReassessment(false);
    setActiveTab('learnmorph');
  };

  const startFastAutoPilot = () => {
    setIsAutoPilot(true);
    let step = 1;
    advanceDemoJourney(1);

    if (autoPilotTimerRef.current) clearInterval(autoPilotTimerRef.current);
    autoPilotTimerRef.current = setInterval(() => {
      step++;
      if (step > 5) {
        clearInterval(autoPilotTimerRef.current);
        setIsAutoPilot(false);
      } else {
        advanceDemoJourney(step);
      }
    }, 2400);
  };

  const advanceDemoJourney = (nextStep: number) => {
    setDemoStep(nextStep);
    if (nextStep === 1) {
      setActiveTab('learnmorph');
    } else if (nextStep === 2) {
      setIsReassessment(false);
      setActiveTab('lumilearn');
    } else if (nextStep === 3) {
      setSelectedSim('c_loop');
      setActiveTab('conceptverse');
    } else if (nextStep === 4) {
      setIsReassessment(true);
      setActiveTab('lumilearn');
    } else if (nextStep === 5) {
      setActiveTab('progress');
    }
  };

  const resetDemoJourney = () => {
    if (autoPilotTimerRef.current) clearInterval(autoPilotTimerRef.current);
    setIsAutoPilot(false);
    setDemoStep(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Hackathon Tour Banner (Contained strictly in Demo Mode per Requirement 9) */}
      {demoStep !== null && (
        <aside aria-label="Hackathon Demonstration Guide" className="bg-gradient-to-r from-violet-900 via-indigo-900 to-cyan-900 border-b border-indigo-500/40 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <strong className="text-white font-bold uppercase tracking-wider">
                Demo Tour (Step {demoStep} of 5):
              </strong>
              <span className="text-indigo-200">
                {demoStep === 1 && 'Learn: Side-by-side textbook reader with semantic chunking & citations'}
                {demoStep === 2 && 'Practise: Diagnostic assessment without leaking answers prior to submission'}
                {demoStep === 3 && 'Experiment: Predict -> Run -> Observe -> Explain scientific telemetry'}
                {demoStep === 4 && 'Practise: Independent reassessment verifying recovered mental model'}
                {demoStep === 5 && 'Progress: Conservative evidence-based mastery & spaced review schedule'}
              </span>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={startFastAutoPilot}
                className={`px-3 py-1 rounded-md text-xs font-bold flex items-center space-x-1 shadow transition-colors ${
                  isAutoPilot
                    ? 'bg-amber-400 text-gray-900 animate-pulse'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
                title="Automatically advance through all 5 stages"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAutoPilot ? '⚡ Tour Running...' : '⚡ Fast Tour'}</span>
              </button>

              {demoStep < 5 ? (
                <button
                  onClick={() => advanceDemoJourney(demoStep + 1)}
                  className="px-3 py-1 rounded-md bg-white text-indigo-950 font-bold text-xs flex items-center space-x-1 hover:bg-gray-100 shadow transition-colors"
                >
                  <span>Next Step</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={resetDemoJourney}
                  className="px-3 py-1 rounded-md bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Tour Completed</span>
                </button>
              )}

              <button
                onClick={resetDemoJourney}
                className="text-gray-300 hover:text-white px-2 py-1 text-xs"
              >
                Exit Tour
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Global Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenMistakes={() => setIsMistakesModalOpen(true)}
        onOpenTeachBack={() => {
          setTargetTeachBackConcept(selectedConcept);
          setIsTeachBackModalOpen(true);
        }}
        onOpenRepair={() => setIsRepairModalOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {activeTab === 'landing' && (
          <LandingPage
            onStartDemo={startDemoJourney}
            onStartAutoPilot={startFastAutoPilot}
            onExploreEngine={(engine) => setActiveTab(engine)}
          />
        )}

        {activeTab === 'dashboard' && (
          <StudentDashboard
            onNavigate={(tab, params) => {
              if (params?.concept) setSelectedConcept(params.concept);
              if (params?.sim) setSelectedSim(params.sim);
              setActiveTab(tab);
            }}
            onOpenMistakes={() => setIsMistakesModalOpen(true)}
            onOpenTeachBack={(concept) => {
              if (concept) setTargetTeachBackConcept(concept);
              setIsTeachBackModalOpen(true);
            }}
            onOpenRepair={(concept) => {
              if (concept) setSelectedConcept(concept);
              setIsRepairModalOpen(true);
            }}
          />
        )}

        {activeTab === 'learnmorph' && (
          <LearnMorphPage
            initialTopic={selectedConcept === 'electricity_ohms_law' ? "Ohm's Law & Circuit Dynamics" : selectedConcept === 'algo_binary_search' ? "Binary Search Algorithm" : "C Programming Loops"}
            onNavigateToLumiLearn={(conceptId) => {
              setSelectedConcept(conceptId);
              setIsReassessment(false);
              setActiveTab('lumilearn');
              if (demoStep === 1) setDemoStep(2);
            }}
            onStartRepairSession={(conceptId) => {
              setSelectedConcept(conceptId);
              setIsRepairModalOpen(true);
            }}
          />
        )}

        {activeTab === 'lumilearn' && (
          <LumiLearnPage
            initialConceptId={selectedConcept}
            initialReassess={isReassessment}
            onNavigateToSimulation={(simType, conceptId) => {
              setSelectedSim(simType);
              setSelectedConcept(conceptId);
              setActiveTab('conceptverse');
              if (demoStep === 2) setDemoStep(3);
            }}
            onOpenRepair={(conceptId) => {
              setSelectedConcept(conceptId);
              setIsRepairModalOpen(true);
            }}
            onOpenTeachBack={(conceptId) => {
              setTargetTeachBackConcept(conceptId);
              setIsTeachBackModalOpen(true);
            }}
          />
        )}

        {activeTab === 'conceptverse' && (
          <ConceptVersePage
            initialSimType={selectedSim}
            initialConceptId={selectedConcept}
            onNavigateToReassess={(conceptId) => {
              setSelectedConcept(conceptId);
              setIsReassessment(true);
              setActiveTab('lumilearn');
              if (demoStep === 3) setDemoStep(4);
            }}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressPage
            onNavigateToTab={(tab, params) => {
              if (params?.concept) setSelectedConcept(params.concept);
              setActiveTab(tab);
            }}
          />
        )}

        {activeTab === 'teacher' && <TeacherDashboardPage />}
      </main>

      {/* Global Interactive Modals */}
      <MistakeNotebookModal
        isOpen={isMistakesModalOpen}
        onClose={() => setIsMistakesModalOpen(false)}
        onNavigateToPractise={(conceptId) => {
          setSelectedConcept(conceptId);
          setIsReassessment(true);
          setActiveTab('lumilearn');
        }}
      />

      <TeachBackModal
        isOpen={isTeachBackModalOpen}
        conceptId={targetTeachBackConcept}
        conceptName={targetTeachBackConcept.replace(/_/g, ' ').toUpperCase()}
        onClose={() => setIsTeachBackModalOpen(false)}
      />

      <RepairSessionModal
        isOpen={isRepairModalOpen}
        conceptId={selectedConcept}
        onClose={() => setIsRepairModalOpen(false)}
        onComplete={() => {
          setActiveTab('dashboard');
        }}
      />

      {/* Footer */}
      <footer className="border-t border-gray-800/80 bg-[#0B1120] py-6 px-4 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>EduVerse AI — The Adaptive Learning Universe &bull; Version 2.0</span>
          <span>Connecting LumiLearn AI, LearnMorph AI, and ConceptVerse AI</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
