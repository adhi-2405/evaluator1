import React, { useState } from 'react';
import {
  Sparkles,
  Brain,
  Cpu,
  FlaskConical,
  ArrowRight,
  CheckCircle,
  Play,
  RotateCcw,
  Zap
} from 'lucide-react';

interface LandingPageProps {
  onStartDemo: () => void;
  onStartAutoPilot?: () => void;
  onExploreEngine: (engine: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartDemo, onStartAutoPilot, onExploreEngine }) => {
  // Mini interactive preview for landing page
  const [miniLoopI, setMiniLoopI] = useState<number>(0);
  const [miniLoopOutput, setMiniLoopOutput] = useState<string[]>([]);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);

  const stepMiniLoop = () => {
    if (miniLoopI < 4) {
      const nextI = miniLoopI + 1;
      setMiniLoopI(nextI);
      setMiniLoopOutput((prev) => [...prev, `Iteration #${nextI}: count updated to ${nextI * 2}`]);
    } else if (miniLoopI === 4) {
      setMiniLoopI(5);
      setIsTerminated(true);
      setMiniLoopOutput((prev) => [
        ...prev,
        `Condition '5 < 5' is FALSE. Loop terminated! Final i is 5.`
      ]);
    }
  };

  const resetMiniLoop = () => {
    setMiniLoopI(0);
    setMiniLoopOutput([]);
    setIsTerminated(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-gray-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/30 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-indigo-900/40 border border-indigo-700/50 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>International Hackathon Project • Powered by Mistral 7B Cloud API</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            EduVerse AI
          </h1>
          <p className="text-2xl sm:text-3xl font-medium bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-300 bg-clip-text text-transparent mb-6">
            Learn Differently. Understand Deeply. Master Anything.
          </p>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-300 leading-relaxed mb-8">
            An intelligent learning ecosystem connecting three collaborative AI engines:
            <span className="text-violet-400 font-semibold"> LumiLearn</span> (Learning Debugger),
            <span className="text-cyan-400 font-semibold"> LearnMorph</span> (Multimodal Transformer), and
            <span className="text-emerald-400 font-semibold"> ConceptVerse</span> (Interactive Experiment Lab)
            through a shared, adaptive student learning profile.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartAutoPilot || onStartDemo}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-extrabold text-base hover:opacity-95 shadow-xl shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 animate-pulse"
              title="Watch all 5 connected AI engines complete in 10 seconds flat"
            >
              <Zap className="w-5 h-5 text-yellow-200" />
              <span>⚡ Fast Auto-Pilot Journey (10s)</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={onStartDemo}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold text-base hover:opacity-95 shadow-lg shadow-indigo-500/25 transition-all"
            >
              <Sparkles className="w-5 h-5 text-cyan-300" />
              <span>Guided Step-by-Step Tour</span>
            </button>

            <button
              onClick={() => onExploreEngine('dashboard')}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 font-semibold text-base border border-gray-700 transition-colors"
            >
              Open Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* The 3 Connected Engines */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Three Interconnected AI Engines
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            Not isolated tools, but a unified feedback loop powered by real student telemetry,
            concept dependency graphs, and transparent pedagogical reasoning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Engine 1: LumiLearn */}
          <div className="bg-gray-900/80 border border-violet-500/30 rounded-2xl p-6 hover:border-violet-500/60 transition-all shadow-lg hover:shadow-violet-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center text-violet-400 mb-4">
                <Brain className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-violet-400">Engine One</span>
                <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-300">Diagnostic</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">LumiLearn AI</h3>
              <p className="text-sm font-medium text-violet-300 mb-3">AI Learning Debugger</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Investigates <em>why</em> a student is struggling. Evaluates answers and reasoning
                alongside 1-5 confidence calibration to diagnose deep misconceptions, off-by-one slips,
                and knowledge gaps.
              </p>
              <ul className="text-xs text-gray-400 space-y-1.5 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  <span>Rule-based & AI-supported misconception diagnosis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  <span>Confidence rating (1-5) calibration analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-violet-400" />
                  <span>Automated post-intervention reassessment</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onExploreEngine('lumilearn')}
              className="w-full py-2.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-200 text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>Explore LumiLearn</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Engine 2: LearnMorph */}
          <div className="bg-gray-900/80 border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500/60 transition-all shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-cyan-400">Engine Two</span>
                <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300">Multimodal</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">LearnMorph AI</h3>
              <p className="text-sm font-medium text-cyan-300 mb-3">Multimodal Learning Transformer</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Transforms lessons and uploaded PDFs into 9 distinct formats: step-by-step logic,
                flowcharts, worked examples, audio text-to-speech, and regional translations (Tamil & Malayalam).
              </p>
              <ul className="text-xs text-gray-400 space-y-1.5 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>9 presentation formats from simple text to diagrams</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>PDF lesson upload with PyMuPDF/pypdf extraction</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Regional-language explanations (Tamil & Malayalam)</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onExploreEngine('learnmorph')}
              className="w-full py-2.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-200 text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>Explore LearnMorph</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Engine 3: ConceptVerse */}
          <div className="bg-gray-900/80 border border-emerald-500/30 rounded-2xl p-6 hover:border-emerald-500/60 transition-all shadow-lg hover:shadow-emerald-500/10 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
                <FlaskConical className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">Engine Three</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300">Interactive Lab</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">ConceptVerse AI</h3>
              <p className="text-sm font-medium text-emerald-300 mb-3">Interactive Experiment Lab</p>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">
                Students learn by experimenting rather than only reading. Step-by-step C loop execution,
                Ohm's Law circuit simulations with live electron glow, and prediction challenges.
              </p>
              <ul className="text-xs text-gray-400 space-y-1.5 mb-6">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Deterministic C Loop execution with breakpoint tracing</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Physics circuit simulator (V=I*R) with SVG glow</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Feeds simulation telemetry directly back to LumiLearn</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => onExploreEngine('conceptverse')}
              className="w-full py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-200 text-sm font-semibold transition-colors flex items-center justify-center space-x-2"
            >
              <span>Explore ConceptVerse</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Sample Preview Widget */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-gray-900 to-indigo-950/70 border border-indigo-500/30 rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-800 gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-lg font-bold text-white">Live Interactive Engine Preview</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-400">
                Experience deterministic loop boundary execution: for (int i = 0; i &lt; 5; i++)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={stepMiniLoop}
                disabled={isTerminated}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Next Step</span>
              </button>
              <button
                onClick={resetMiniLoop}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {/* Left: Code State */}
            <div className="bg-black/60 rounded-xl p-4 border border-gray-800 font-mono text-xs">
              <div className="text-gray-400 mb-2">// Active C Loop State</div>
              <div className="space-y-1">
                <div className="text-cyan-400">int count = {miniLoopI * 2};</div>
                <div className={miniLoopI < 5 ? 'text-yellow-300 bg-yellow-500/10 px-1 rounded' : 'text-gray-400'}>
                  for (int i = 0; <span className="font-bold underline">i &lt; 5</span>; i++) &#123;
                </div>
                <div className="pl-4 text-gray-300">count += 2;</div>
                <div className="text-gray-400">&#125;</div>
                <div className={isTerminated ? 'text-emerald-400 bg-emerald-500/10 px-1 rounded font-bold' : 'text-gray-500'}>
                  printf("%d", count); // prints: {miniLoopI * 2}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between">
                <span className="text-gray-400">Current Variable i:</span>
                <span className={`text-base font-bold ${isTerminated ? 'text-emerald-400' : 'text-indigo-300'}`}>
                  {miniLoopI}
                </span>
              </div>
            </div>

            {/* Right: Telemetry Output */}
            <div className="bg-black/40 rounded-xl p-4 border border-gray-800 text-xs flex flex-col justify-between">
              <div>
                <span className="text-gray-400 font-semibold block mb-2">Execution Console & Diagnostic:</span>
                <div className="space-y-1.5 h-32 overflow-y-auto font-mono text-gray-300">
                  {miniLoopOutput.length === 0 ? (
                    <span className="text-gray-500 italic">Click "Next Step" to trace execution step-by-step...</span>
                  ) : (
                    miniLoopOutput.map((out, idx) => (
                      <div key={idx} className={out.includes('terminated') ? 'text-yellow-400' : 'text-cyan-300'}>
                        &gt; {out}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {isTerminated && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]">
                  <strong>LumiLearn Insight:</strong> Notice how 'i' advanced to 5 before the loop stopped.
                  It did NOT stop at 4!
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
