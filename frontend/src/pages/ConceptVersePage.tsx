import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCcw,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sliders,
  Send,
  Eye,
  Activity,
  Search,
  Cpu
} from 'lucide-react';
import { api } from '../services/api';
import { ConceptVisualizer } from '../components/ConceptVisualizer';
import type { SimulationExecuteResponse, SimulationStep } from '../types';

interface ConceptVersePageProps {
  initialSimType?: string;
  initialConceptId?: string;
  onNavigateToReassess: (conceptId: string) => void;
}

export const ConceptVersePage: React.FC<ConceptVersePageProps> = ({
  initialSimType = 'c_loop',
  initialConceptId = 'c_loops_termination',
  onNavigateToReassess,
}) => {
  const [simType, setSimType] = useState<string>(initialSimType);
  const [conceptId, setConceptId] = useState<string>(initialConceptId);

  // Workflow state: predict -> run -> observe -> explain
  const [activeWorkflowStage, setActiveWorkflowStage] = useState<'predict' | 'run' | 'observe' | 'explain'>('predict');

  // --- C Loop Variables & Predictions ---
  const [initialVal, setInitialVal] = useState<number>(0);
  const [conditionOp, setConditionOp] = useState<string>('<');
  const [conditionLimit, setConditionLimit] = useState<number>(5);
  const [stepVal, setStepVal] = useState<number>(1);
  const [accumulatorStep, setAccumulatorStep] = useState<number>(2);
  const [predFinalI, setPredFinalI] = useState<string>('');
  const [predIterations, setPredIterations] = useState<string>('');

  // --- Ohm's Law Variables & Predictions (NO auto-calculation!) ---
  const [voltage, setVoltage] = useState<number>(12);
  const [resistance, setResistance] = useState<number>(4);
  const [predCurrent, setPredCurrent] = useState<string>('');
  const [predPower, setPredPower] = useState<string>('');

  // --- Binary Search Variables & Predictions ---
  const [targetNum, setTargetNum] = useState<number>(23);
  const searchArray = [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91];
  const [predComparisons, setPredComparisons] = useState<string>('');
  const [predWillFind, setPredWillFind] = useState<string>('true');

  // --- Student Observations & Explanations ---
  const [observations, _setObservations] = useState<string>('');
  const [studentExplanation, setStudentExplanation] = useState<string>('');

  // --- Execution State ---
  const [simResult, setSimResult] = useState<SimulationExecuteResponse | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [_isRunning, setIsRunning] = useState<boolean>(false);
  const [sendSuccessMsg, setSendSuccessMsg] = useState<string | null>(null);
  const [sendingTelemetry, setSendingTelemetry] = useState<boolean>(false);

  useEffect(() => {
    // When simType changes, sync canonical conceptId
    if (simType === 'c_loop') setConceptId('c_loops_termination');
    else if (simType === 'ohms_law') setConceptId('electricity_ohms_law');
    else if (simType === 'binary_search') setConceptId('algo_binary_search');
    setSimResult(null);
    setCurrentStepIndex(0);
    setActiveWorkflowStage('predict');
  }, [simType]);

  const getActivePayload = () => {
    let variables: Record<string, any> = {};
    let predictions: Record<string, any> = {};

    if (simType === 'c_loop') {
      variables = {
        initial_val: initialVal,
        condition_limit: conditionLimit,
        condition_op: conditionOp,
        step: stepVal,
        accumulator_step: accumulatorStep,
      };
      if (predFinalI.trim() !== '') predictions.final_i = parseInt(predFinalI);
      if (predIterations.trim() !== '') predictions.total_iterations = parseInt(predIterations);
    } else if (simType === 'ohms_law') {
      variables = { voltage, resistance };
      // Student entered predictions (NO auto-calculation!)
      if (predCurrent.trim() !== '') predictions.current = parseFloat(predCurrent);
      if (predPower.trim() !== '') predictions.power = parseFloat(predPower);
    } else {
      variables = { array: searchArray, target: targetNum };
      if (predComparisons.trim() !== '') predictions.expected_comparisons = parseInt(predComparisons);
      if (predWillFind.trim() !== '') predictions.will_find = predWillFind === 'true';
    }

    return { variables, predictions };
  };

  const runSimulation = async () => {
    setSendSuccessMsg(null);
    const { variables, predictions } = getActivePayload();

    try {
      const res = await api.runSimulation({
        simulation_type: simType,
        concept_id: conceptId,
        variables,
        student_predictions: Object.keys(predictions).length > 0 ? predictions : undefined,
        student_observations: observations,
      });
      setSimResult(res);
      setCurrentStepIndex(0);
      setActiveWorkflowStage('run');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextStep = () => {
    if (simResult && currentStepIndex < simResult.steps.length - 1) {
      const next = currentStepIndex + 1;
      setCurrentStepIndex(next);
      if (next === simResult.steps.length - 1) {
        setActiveWorkflowStage('observe');
      }
    }
  };

  const handleRunToEnd = () => {
    if (simResult) {
      setCurrentStepIndex(simResult.steps.length - 1);
      setIsRunning(false);
      setActiveWorkflowStage('observe');
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsRunning(false);
    setActiveWorkflowStage('predict');
  };

  // Fixed Telemetry Handler: Sends actual simulation variables and predictions!
  const handleSendToLumiLearn = async () => {
    if (!simResult) return;
    setSendingTelemetry(true);
    const { variables, predictions } = getActivePayload();

    try {
      const res = await api.sendToLumiLearn({
        simulation_type: simType,
        concept_id: conceptId,
        variables,
        student_predictions: Object.keys(predictions).length > 0 ? predictions : undefined,
        student_observations: `${observations} | Student explanation: ${studentExplanation}`,
      });
      setSendSuccessMsg(res.message);
      setActiveWorkflowStage('explain');
    } catch (err: any) {
      alert(err.message || 'Failed to record simulation telemetry');
    } finally {
      setSendingTelemetry(false);
    }
  };

  const activeStep: SimulationStep | undefined = simResult?.steps[currentStepIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Module 3: Experiment (ConceptVerse)
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">&bull; Interactive Experiment Lab</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Deterministic Scientific Simulation Lab
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Follow the empirical sequence: <strong>Predict &rarr; Run &rarr; Observe &rarr; Explain</strong>.
            Predictions are evaluated against system execution; missing predictions remain unassessed.
          </p>
        </div>

        {/* Lab Switcher */}
        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-lg p-1 text-xs font-semibold">
          {[
            { id: 'c_loop', label: 'C Loop Bounds', icon: Cpu },
            { id: 'ohms_law', label: "Ohm's Law Circuit", icon: Zap },
            { id: 'binary_search', label: 'Binary Search', icon: Search }
          ].map((lab) => {
            const Icon = lab.icon;
            const isSel = simType === lab.id;
            return (
              <button
                key={lab.id}
                onClick={() => setSimType(lab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all ${
                  isSel
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{lab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-Stage Workflow Progression Header */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs font-semibold bg-gray-900/60 p-2.5 rounded-xl border border-gray-800">
        {[
          { id: 'predict', step: '1. Predict', desc: 'Enter expected values' },
          { id: 'run', step: '2. Run', desc: 'Step execution' },
          { id: 'observe', step: '3. Observe', desc: 'Inspect state change' },
          { id: 'explain', step: '4. Explain', desc: 'Synthesize & log' }
        ].map((st) => {
          const isCurrent = activeWorkflowStage === st.id;
          return (
            <div
              key={st.id}
              className={`p-2 rounded-lg transition-all ${
                isCurrent
                  ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 shadow'
                  : 'text-gray-400'
              }`}
            >
              <span className="block font-bold text-xs">{st.step}</span>
              <span className="text-[10px] hidden sm:block opacity-80">{st.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Main Lab Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Variable Controls & Student Predictions */}
        <div className="lg:col-span-4 space-y-5">
          {/* Simulation Input Parameters */}
          <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
            <div className="flex items-center space-x-2 border-b border-gray-800 pb-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Simulation Variables</h3>
            </div>

            {simType === 'c_loop' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Initial Value (int i):</label>
                  <input
                    type="number"
                    value={initialVal}
                    onChange={(e) => setInitialVal(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 block mb-1">Condition Op:</label>
                    <select
                      value={conditionOp}
                      onChange={(e) => setConditionOp(e.target.value)}
                      className="w-full px-2 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                    >
                      <option value="<">&lt;</option>
                      <option value="<=">&lt;=</option>
                      <option value=">">&gt;</option>
                      <option value=">=">&gt;=</option>
                      <option value="==">==</option>
                      <option value="!=">!=</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Limit Value:</label>
                    <input
                      type="number"
                      value={conditionLimit}
                      onChange={(e) => setConditionLimit(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-gray-400 block mb-1">Counter Step (i++):</label>
                    <input
                      type="number"
                      value={stepVal}
                      onChange={(e) => setStepVal(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Body (count += N):</label>
                    <input
                      type="number"
                      value={accumulatorStep}
                      onChange={(e) => setAccumulatorStep(parseInt(e.target.value) || 2)}
                      className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {simType === 'ohms_law' && (
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Power Voltage (V):</span>
                    <strong className="text-amber-400">{voltage} Volts</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="48"
                    step="1"
                    value={voltage}
                    onChange={(e) => setVoltage(Number(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-gray-400 mb-1">
                    <span>Load Resistance (R):</span>
                    <strong className="text-cyan-400">{resistance} &Omega;</strong>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="0.5"
                    value={resistance}
                    onChange={(e) => setResistance(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
              </div>
            )}

            {simType === 'binary_search' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-gray-400 block mb-1">Target Element to Locate:</label>
                  <input
                    type="number"
                    value={targetNum}
                    onChange={(e) => setTargetNum(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  />
                </div>
                <div className="text-[11px] text-gray-400 p-2 rounded bg-gray-950 border border-gray-800">
                  Sorted Array: [{searchArray.join(', ')}]
                </div>
              </div>
            )}
          </div>

          {/* Student Prediction Box (Requirement 4: Mandatory before outcome reveal) */}
          <div className="p-5 rounded-xl bg-gray-900 border border-indigo-500/30 space-y-3">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
              Stage 1: Student Predictions
            </span>

            {simType === 'c_loop' && (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-300 block mb-1">Predict final exit value of 'i':</label>
                  <input
                    type="text"
                    value={predFinalI}
                    onChange={(e) => setPredFinalI(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Predict total loop iterations:</label>
                  <input
                    type="text"
                    value={predIterations}
                    onChange={(e) => setPredIterations(e.target.value)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  />
                </div>
              </div>
            )}

            {simType === 'ohms_law' && (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-300 block mb-1">
                    Predict Current I (Amperes = V / R):
                  </label>
                  <input
                    type="text"
                    value={predCurrent}
                    onChange={(e) => setPredCurrent(e.target.value)}
                    placeholder="Calculate and enter your prediction"
                    className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">
                    Predict Power P (Watts = V &times; I):
                  </label>
                  <input
                    type="text"
                    value={predPower}
                    onChange={(e) => setPredPower(e.target.value)}
                    placeholder="Calculate power dissipation"
                    className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  />
                </div>
              </div>
            )}

            {simType === 'binary_search' && (
              <div className="space-y-2 text-xs">
                <div>
                  <label className="text-gray-300 block mb-1">
                    Predict Number of Comparisons:
                  </label>
                  <input
                    type="text"
                    value={predComparisons}
                    onChange={(e) => setPredComparisons(e.target.value)}
                    placeholder="e.g. 3"
                    className="w-full px-3 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-gray-300 block mb-1">Will target be found?</label>
                  <select
                    value={predWillFind}
                    onChange={(e) => setPredWillFind(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-gray-950 border border-gray-700 text-white"
                  >
                    <option value="true">Yes, target exists in array</option>
                    <option value="false">No, target is absent</option>
                  </select>
                </div>
              </div>
            )}

            <button
              onClick={runSimulation}
              className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Play className="w-4 h-4" />
              <span>Initialize &amp; Run Simulation</span>
            </button>
          </div>
        </div>

        {/* Right Column: Interactive Visualizer & Stepper */}
        <div className="lg:col-span-8 space-y-5">
          {/* Concept Visualizer Diagram */}
          <ConceptVisualizer
            topic={simType}
            customData={{
              voltage,
              resistance,
              array: searchArray,
              target: targetNum
            }}
          />

          {/* Stepper Controls & Current Step Telemetry */}
          {simResult && (
            <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-bold text-white">
                    Step {currentStepIndex + 1} of {simResult.steps.length}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReset}
                    className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-800"
                    title="Reset to Beginning"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextStep}
                    disabled={currentStepIndex >= simResult.steps.length - 1}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40"
                  >
                    Next Step &rarr;
                  </button>
                  <button
                    onClick={handleRunToEnd}
                    className="px-3 py-1.5 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium"
                  >
                    Run to End
                  </button>
                </div>
              </div>

              {/* Active Step Box */}
              {activeStep && (
                <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="font-mono text-indigo-400">
                      Condition Checked: {activeStep.condition_evaluated}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        activeStep.condition_result
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {activeStep.condition_result ? 'Evaluates TRUE' : 'Evaluates FALSE (Exit)'}
                    </span>
                  </div>

                  <p className="text-white text-sm leading-relaxed font-sans">
                    {activeStep.description}
                  </p>

                  <div className="pt-2 border-t border-gray-800/80 flex flex-wrap gap-3 font-mono text-[11px] text-gray-400">
                    {Object.entries(activeStep.variable_state).map(([k, v]) => (
                      <span key={k} className="p-1 rounded bg-gray-900 border border-gray-800">
                        {k} = <strong className="text-cyan-300">{String(v)}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Prediction Evaluation Feedback */}
              <div className="p-4 rounded-xl bg-gray-950/80 border border-gray-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <strong className="text-gray-200 flex items-center space-x-1.5">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Experimental Evidence vs Student Prediction:</span>
                  </strong>
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                      simResult.has_predictions
                        ? simResult.prediction_accuracy && simResult.prediction_accuracy >= 0.8
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {simResult.has_predictions
                      ? `Accuracy: ${Math.round((simResult.prediction_accuracy || 0) * 100)}%`
                      : 'Unassessed (Exploratory)'}
                  </span>
                </div>

                <p className="text-gray-300 leading-relaxed">
                  {simResult.prediction_feedback}
                </p>

                <p className="text-gray-400 text-[11px]">
                  {simResult.explanation}
                </p>
              </div>

              {/* Stage 4: Student Explanation & Send to LumiLearn */}
              <div className="p-4 rounded-xl bg-gray-950 border border-emerald-500/30 space-y-3">
                <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  Stage 4: Student Observation &amp; Reflection
                </span>
                <textarea
                  value={studentExplanation}
                  onChange={(e) => setStudentExplanation(e.target.value)}
                  placeholder="In your own words: What did you observe happening at the exact termination or stabilization step?..."
                  className="w-full h-20 p-2.5 rounded-lg bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none"
                />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                  {sendSuccessMsg ? (
                    <span className="text-xs text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{sendSuccessMsg}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">
                      Telemetry saves experimental evidence to your persistent profile.
                    </span>
                  )}

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSendToLumiLearn}
                      disabled={sendingTelemetry}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 shadow-md disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingTelemetry ? 'Logging Telemetry...' : 'Save Evidence & Bridge to LumiLearn'}</span>
                    </button>
                    <button
                      onClick={() => onNavigateToReassess(conceptId)}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <span>Take Reassessment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
