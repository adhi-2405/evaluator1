import React from 'react';
import { Cpu, Zap, Search, ArrowRight } from 'lucide-react';

interface ConceptVisualizerProps {
  topic: string;
  activeStep?: number;
  highlightVar?: string;
  customData?: Record<string, any>;
}

export const ConceptVisualizer: React.FC<ConceptVisualizerProps> = ({
  topic,
  customData = {}
}) => {
  const isLoop = topic.toLowerCase().includes('loop') || topic.toLowerCase().includes('c_loop');
  const isOhms = topic.toLowerCase().includes('ohm') || topic.toLowerCase().includes('circuit') || topic.toLowerCase().includes('electric');
  const isSearch = topic.toLowerCase().includes('search') || topic.toLowerCase().includes('binary');

  if (isLoop) {
    return (
      <div className="bg-gray-950/80 rounded-xl border border-indigo-500/30 p-5 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <span className="text-sm font-bold text-white tracking-wide">C Loop State & Boundary Visualizer</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
            for (int i = 0; i &lt; 5; i++)
          </span>
        </div>

        {/* Interactive SVG Flowchart */}
        <div className="relative overflow-x-auto py-2">
          <svg className="w-full min-w-[500px] h-48" viewBox="0 0 600 180">
            <defs>
              <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#312E81" />
                <stop offset="100%" stopColor="#1E1B4B" />
              </linearGradient>
              <linearGradient id="condGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4338CA" />
                <stop offset="100%" stopColor="#3730A3" />
              </linearGradient>
              <linearGradient id="termGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#991B1B" />
                <stop offset="100%" stopColor="#7F1D1D" />
              </linearGradient>
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#818CF8" />
              </marker>
            </defs>

            {/* Initialization */}
            <rect x="20" y="65" width="100" height="50" rx="8" fill="url(#boxGrad)" stroke="#6366F1" strokeWidth="2" />
            <text x="70" y="88" fill="#E0E7FF" fontSize="12" fontWeight="bold" textAnchor="middle">Init</text>
            <text x="70" y="104" fill="#A5B4FC" fontSize="11" textAnchor="middle">i = 0</text>

            <line x1="120" y1="90" x2="175" y2="90" stroke="#818CF8" strokeWidth="2" markerEnd="url(#arrow)" />

            {/* Condition Check Diamond */}
            <polygon points="230,50 285,90 230,130 175,90" fill="url(#condGrad)" stroke="#818CF8" strokeWidth="2" />
            <text x="230" y="87" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle">Check</text>
            <text x="230" y="101" fill="#C7D2FE" fontSize="11" textAnchor="middle">i &lt; 5 ?</text>

            {/* True branch to Body */}
            <line x1="230" y1="130" x2="230" y2="155" stroke="#34D399" strokeWidth="2" />
            <line x1="230" y1="155" x2="350" y2="155" stroke="#34D399" strokeWidth="2" />
            <line x1="350" y1="155" x2="350" y2="120" stroke="#34D399" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="260" y="148" fill="#34D399" fontSize="11" fontWeight="bold">True (i &lt; 5)</text>

            {/* Loop Body */}
            <rect x="300" y="65" width="105" height="50" rx="8" fill="url(#boxGrad)" stroke="#6366F1" strokeWidth="2" />
            <text x="352" y="88" fill="#E0E7FF" fontSize="12" fontWeight="bold" textAnchor="middle">Body</text>
            <text x="352" y="104" fill="#A5B4FC" fontSize="11" textAnchor="middle">count += 2</text>

            {/* Update step */}
            <line x1="405" y1="90" x2="445" y2="90" stroke="#818CF8" strokeWidth="2" markerEnd="url(#arrow)" />

            <rect x="445" y="65" width="90" height="50" rx="8" fill="url(#boxGrad)" stroke="#A78BFA" strokeWidth="2" />
            <text x="490" y="88" fill="#E0E7FF" fontSize="12" fontWeight="bold" textAnchor="middle">Update</text>
            <text x="490" y="104" fill="#DDD6FE" fontSize="11" textAnchor="middle">i++</text>

            {/* Loopback line */}
            <path d="M 490 65 L 490 25 L 230 25 L 230 45" fill="none" stroke="#A78BFA" strokeWidth="2" strokeDasharray="4 4" markerEnd="url(#arrow)" />
            <text x="360" y="20" fill="#A78BFA" fontSize="10">Loops back to Check</text>

            {/* False exit to Termination */}
            <line x1="285" y1="90" x2="350" y2="90" stroke="none" />
            {/* Exit Arrow diagonally up */}
            <path d="M 260 70 L 260 40 L 150 40" fill="none" stroke="none" />
          </svg>
        </div>

        {/* State Table */}
        <div className="grid grid-cols-6 gap-2 text-center text-xs mt-3 bg-gray-900/90 p-2.5 rounded-lg border border-gray-800">
          <div className="text-gray-400 font-semibold">Iteration</div>
          <div className="text-gray-400 font-semibold">Start 'i'</div>
          <div className="text-gray-400 font-semibold">i &lt; 5</div>
          <div className="text-gray-400 font-semibold">Body (count)</div>
          <div className="text-gray-400 font-semibold">Next 'i'</div>
          <div className="text-gray-400 font-semibold">Result</div>

          <div className="text-indigo-300">#1</div>
          <div className="text-white">0</div>
          <div className="text-emerald-400 font-bold">TRUE</div>
          <div className="text-cyan-300">2</div>
          <div className="text-indigo-200">1</div>
          <div className="text-emerald-400">Continues</div>

          <div className="text-indigo-300">#2</div>
          <div className="text-white">1</div>
          <div className="text-emerald-400 font-bold">TRUE</div>
          <div className="text-cyan-300">4</div>
          <div className="text-indigo-200">2</div>
          <div className="text-emerald-400">Continues</div>

          <div className="text-indigo-300">#3</div>
          <div className="text-white">2</div>
          <div className="text-emerald-400 font-bold">TRUE</div>
          <div className="text-cyan-300">6</div>
          <div className="text-indigo-200">3</div>
          <div className="text-emerald-400">Continues</div>

          <div className="text-indigo-300">#4</div>
          <div className="text-white">3</div>
          <div className="text-emerald-400 font-bold">TRUE</div>
          <div className="text-cyan-300">8</div>
          <div className="text-indigo-200">4</div>
          <div className="text-emerald-400">Continues</div>

          <div className="text-indigo-300 font-bold bg-indigo-950/60 rounded">#5</div>
          <div className="text-white font-bold bg-indigo-950/60 rounded">4</div>
          <div className="text-emerald-400 font-bold bg-indigo-950/60 rounded">TRUE</div>
          <div className="text-cyan-300 font-bold bg-indigo-950/60 rounded">10</div>
          <div className="text-amber-400 font-bold bg-indigo-950/60 rounded">5</div>
          <div className="text-amber-400 font-bold bg-indigo-950/60 rounded">Reaches 5</div>

          <div className="text-rose-400 font-bold bg-rose-950/40 rounded col-span-6 py-1 mt-1 border border-rose-500/30">
            Exit Check: i = 5 &rarr; Condition '5 &lt; 5' is FALSE (0) &rarr; Loop Terminates with Final i = 5, count = 10
          </div>
        </div>
      </div>
    );
  }

  if (isOhms) {
    const voltage = customData.voltage || 12;
    const resistance = customData.resistance || 4;
    const current = Math.round((voltage / resistance) * 100) / 100;
    const power = Math.round(voltage * current * 100) / 100;
    const brightness = Math.min(100, Math.round((power / 100) * 100));

    return (
      <div className="bg-gray-950/80 rounded-xl border border-amber-500/30 p-5 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span className="text-sm font-bold text-white tracking-wide">Ohm's Law Closed Circuit Visualizer</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
            V = I &times; R &bull; P = V &times; I
          </span>
        </div>

        {/* SVG Circuit Canvas */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-900/90 rounded-lg border border-gray-800">
          <svg className="w-full sm:w-2/3 h-44" viewBox="0 0 360 160">
            {/* Closed Loop Wire */}
            <rect x="30" y="20" width="300" height="120" rx="12" fill="none" stroke="#475569" strokeWidth="4" />

            {/* DC Battery Symbol on Left */}
            <g transform="translate(30, 80)">
              <line x1="0" y1="-25" x2="0" y2="25" stroke="#F59E0B" strokeWidth="6" />
              <line x1="-12" y1="-12" x2="-12" y2="12" stroke="#64748B" strokeWidth="3" />
              <text x="-25" y="-15" fill="#F59E0B" fontSize="12" fontWeight="bold">+</text>
              <text x="-25" y="20" fill="#94A3B8" fontSize="12" fontWeight="bold">-</text>
              <text x="-2" y="38" fill="#F59E0B" fontSize="11" fontWeight="bold" textAnchor="middle">{voltage}V</text>
            </g>

            {/* Resistor on Bottom */}
            <g transform="translate(180, 140)">
              <rect x="-35" y="-10" width="70" height="20" rx="4" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
              <text x="0" y="4" fill="#38BDF8" fontSize="11" fontWeight="bold" textAnchor="middle">{resistance} &Omega; Load</text>
            </g>

            {/* Lightbulb on Top */}
            <g transform="translate(180, 20)">
              <circle cx="0" cy="0" r="16" fill={brightness > 20 ? `rgba(250, 204, 21, ${brightness / 100})` : "#334155"} stroke="#EAB308" strokeWidth="2" />
              <path d="M -6 -4 L 6 4 M -6 4 L 6 -4" stroke="#CA8A04" strokeWidth="2" />
              <text x="0" y="-22" fill="#FACC15" fontSize="11" fontWeight="bold" textAnchor="middle">
                Bulb ({power}W)
              </text>
            </g>

            {/* Current Flow Indicators */}
            <path d="M 60 20 L 75 16 L 75 24 Z" fill="#38BDF8" />
            <text x="95" y="16" fill="#38BDF8" fontSize="10" fontWeight="bold">I = {current}A</text>
            <path d="M 300 140 L 285 136 L 285 144 Z" fill="#38BDF8" />
          </svg>

          {/* Physics Telemetry Readout */}
          <div className="w-full sm:w-1/3 flex flex-col space-y-2 text-xs">
            <div className="p-2 rounded bg-gray-950 border border-gray-800">
              <span className="text-gray-400 block">Current Flow (I):</span>
              <span className="text-lg font-extrabold text-cyan-400">{current} Amperes</span>
              <span className="text-[10px] text-gray-400 block">I = {voltage}V / {resistance}&Omega;</span>
            </div>
            <div className="p-2 rounded bg-gray-950 border border-gray-800">
              <span className="text-gray-400 block">Power Output (P):</span>
              <span className="text-lg font-extrabold text-amber-400">{power} Watts</span>
              <span className="text-[10px] text-gray-400 block">P = {voltage}V &times; {current}A</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSearch) {
    const array = customData.array || [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
    const target = customData.target ?? 23;

    return (
      <div className="bg-gray-950/80 rounded-xl border border-emerald-500/30 p-5 shadow-inner">
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-white tracking-wide">Binary Search Subarray Partitioning</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
            Target = {target} &bull; O(log N)
          </span>
        </div>

        {/* Array Cells */}
        <div className="overflow-x-auto py-2">
          <div className="flex items-center gap-1.5 min-w-[500px] justify-center">
            {array.map((val: number, idx: number) => {
              const isTarget = val === target;
              return (
                <div key={idx} className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-400 font-mono mb-1">[{idx}]</span>
                  <div
                    className={`w-10 h-11 rounded-lg flex items-center justify-center font-bold text-sm transition-all ${
                      isTarget
                        ? 'bg-emerald-500 text-gray-950 shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-300 scale-105'
                        : 'bg-gray-900 text-gray-200 border border-gray-700'
                    }`}
                  >
                    {val}
                  </div>
                  {isTarget && (
                    <span className="text-[9px] text-emerald-400 font-bold mt-1 tracking-tight">TARGET</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-gray-400 mt-4 p-2.5 rounded bg-gray-900 border border-gray-800 flex items-center justify-between">
          <span>Array Size: <strong className="text-white">{array.length}</strong> items</span>
          <span>Max Worst-Case Comparisons: <strong className="text-emerald-400">ceil(log2({array.length} + 1)) = {Math.ceil(Math.log2(array.length + 1))} steps</strong></span>
        </div>
      </div>
    );
  }

  // Generic Clean Process Diagram
  return (
    <div className="bg-gray-950/80 rounded-xl border border-gray-800 p-5 shadow-inner">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
        <span className="text-sm font-bold text-white tracking-wide">{topic} Architectural Flow</span>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-300">Deterministic Pipeline</span>
      </div>
      <div className="flex items-center justify-center space-x-3 py-6">
        <div className="px-4 py-3 rounded-lg bg-indigo-950/60 border border-indigo-500/40 text-center">
          <span className="text-xs text-indigo-300 block font-semibold">Inputs & State</span>
          <span className="text-sm font-bold text-white">Initial Condition</span>
        </div>
        <ArrowRight className="w-5 h-5 text-indigo-400 shrink-0" />
        <div className="px-4 py-3 rounded-lg bg-violet-950/60 border border-violet-500/40 text-center">
          <span className="text-xs text-violet-300 block font-semibold">Transform</span>
          <span className="text-sm font-bold text-white">{topic}</span>
        </div>
        <ArrowRight className="w-5 h-5 text-cyan-400 shrink-0" />
        <div className="px-4 py-3 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-center">
          <span className="text-xs text-emerald-300 block font-semibold">Verified Output</span>
          <span className="text-sm font-bold text-white">Exit Invariant</span>
        </div>
      </div>
    </div>
  );
};
