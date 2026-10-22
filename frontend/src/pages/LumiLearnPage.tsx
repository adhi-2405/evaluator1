import React, { useState, useEffect } from 'react';
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  FlaskConical,
  ShieldAlert,
  Loader2,
  MessageSquare,
  Wrench
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import type { QuestionItem, AssessResponse } from '../types';

interface LumiLearnPageProps {
  initialConceptId?: string;
  initialReassess?: boolean;
  onNavigateToSimulation: (simType: string, conceptId: string) => void;
  onOpenRepair?: (conceptId: string) => void;
  onOpenTeachBack?: (conceptId: string) => void;
}

export const LumiLearnPage: React.FC<LumiLearnPageProps> = ({
  initialConceptId = 'c_loops_termination',
  initialReassess = false,
  onNavigateToSimulation,
  onOpenRepair,
  onOpenTeachBack
}) => {
  const [conceptId, setConceptId] = useState<string>(initialConceptId);
  const [isReassessment, setIsReassessment] = useState<boolean>(initialReassess);
  const [question, setQuestion] = useState<QuestionItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [reasoning, setReasoning] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(4);

  const [loadingQuestion, setLoadingQuestion] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [assessmentResult, setAssessmentResult] = useState<AssessResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadQuestion = async (cId: string = conceptId, reassess: boolean = isReassessment) => {
    setLoadingQuestion(true);
    setAssessmentResult(null);
    setSelectedOption(null);
    setReasoning('');
    setErrorMsg(null);
    try {
      const q = await api.getQuestion(cId, reassess);
      setQuestion(q);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load assessment question');
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    loadQuestion(initialConceptId, initialReassess);
  }, [initialConceptId, initialReassess]);

  const executeAssessment = async (optIdx: number, reasonText: string, confLvl: number) => {
    if (!question) return;
    setSelectedOption(optIdx);
    setReasoning(reasonText);
    setConfidence(confLvl);
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.assessAnswer({
        concept_id: question.concept_id,
        question_id: question.question_id,
        student_answer: String(optIdx),
        reasoning: reasonText,
        confidence_rating: confLvl,
        is_reassessment: isReassessment,
      });
      setAssessmentResult(res);

      if (res.is_correct && isReassessment) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Assessment submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    if (selectedOption === null || !question) return;
    executeAssessment(selectedOption, reasoning, confidence);
  };

  const confidenceLabels: Record<number, { label: string; desc: string; color: string }> = {
    1: { label: '1 - Pure Guess', desc: 'No idea, taking a tentative guess', color: 'text-gray-400' },
    2: { label: '2 - Unsure', desc: 'Vague hunch, low certainty', color: 'text-amber-400' },
    3: { label: '3 - Moderate', desc: 'Reasonably sure, but could be wrong', color: 'text-blue-400' },
    4: { label: '4 - Confident', desc: 'Clear reasoning, expecting to be correct', color: 'text-indigo-400' },
    5: { label: '5 - Absolute Certainty', desc: '100% positive, zero doubts', color: 'text-emerald-400' },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-gray-100">
      {/* Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2 text-violet-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Brain className="w-4 h-4" />
            <span>Module 2: Practise (LumiLearn AI)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Diagnostic Learning Debugger &amp; Assessment
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Diagnose exact conceptual bugs rather than simple right/wrong scores. Correct answers are hidden until submission,
            and confidence ratings isolate cognitive blind spots.
          </p>
        </div>

        {/* Concept Switcher */}
        <div className="flex items-center space-x-2 bg-gray-900 border border-gray-800 rounded-lg p-1 text-xs">
          {[
            { id: 'c_loops_termination', label: 'C Loops' },
            { id: 'electricity_ohms_law', label: "Ohm's Law" },
            { id: 'algo_binary_search', label: 'Binary Search' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setConceptId(c.id);
                loadQuestion(c.id, isReassessment);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                conceptId === c.id
                  ? 'bg-violet-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Question Card */}
      {loadingQuestion ? (
        <div className="py-24 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-violet-400 mx-auto mb-3" />
          <p className="text-sm">Loading secure diagnostic assessment...</p>
        </div>
      ) : question ? (
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-800 bg-gray-900/90 p-6 sm:p-8 space-y-6 shadow-xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  {isReassessment ? 'Verification Reassessment' : 'Diagnostic Challenge'}
                </span>
                <span className="text-xs text-gray-400 font-mono">ID: {question.question_id}</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const nextMode = !isReassessment;
                    setIsReassessment(nextMode);
                    loadQuestion(conceptId, nextMode);
                  }}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 rounded bg-gray-800 border border-gray-700"
                >
                  Switch to {isReassessment ? 'Initial Diagnostic' : 'Reassessment'}
                </button>
              </div>
            </div>

            {/* Question Text */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {question.question_text}
              </h2>

              {question.code_snippet && (
                <div className="rounded-xl overflow-hidden border border-gray-800 bg-black/60 shadow-inner">
                  <div className="px-4 py-1.5 bg-gray-950 border-b border-gray-800 text-[11px] font-mono text-gray-400 flex items-center justify-between">
                    <span>Source Code Excerpt</span>
                    <span>C Standard (ISO/IEC 9899)</span>
                  </div>
                  <pre className="p-4 text-xs sm:text-sm font-mono text-indigo-200 overflow-x-auto leading-relaxed">
                    {question.code_snippet}
                  </pre>
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">
                Select your answer:
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {question.options.map((optionText, idx) => {
                  const isSelected = selectedOption === idx;
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      disabled={submitting}
                      className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-start space-x-3 ${
                        isSelected
                          ? 'bg-violet-600/20 border-violet-500 text-white ring-2 ring-violet-500/50 shadow-lg'
                          : 'bg-gray-950/60 border-gray-800/80 text-gray-300 hover:bg-gray-800/50 hover:border-gray-700'
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isSelected
                            ? 'bg-violet-600 text-white'
                            : 'bg-gray-800 text-gray-400'
                        }`}
                      >
                        {letter}
                      </span>
                      <span className="flex-1 leading-snug">{optionText}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Free-text reasoning input */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-gray-300 block">
                Explain your reasoning (Rubric evaluation tests mental models &amp; catches misconceptions):
              </label>
              <textarea
                value={reasoning}
                onChange={(e) => setReasoning(e.target.value)}
                placeholder="Walk through each step: What is the initial value? How many iterations run? What condition causes it to exit?..."
                className="w-full h-24 p-3 rounded-xl bg-gray-950 border border-gray-700 text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500"
              />
            </div>

            {/* Confidence Calibration Bar */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-300">Confidence Rating (1 to 5):</span>
                <span className={`font-bold ${confidenceLabels[confidence]?.color}`}>
                  {confidenceLabels[confidence]?.label}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setConfidence(val)}
                    className={`py-2 rounded-lg font-bold text-xs border transition-all ${
                      confidence === val
                        ? 'bg-violet-600 text-white border-violet-400 shadow-md ring-2 ring-violet-400/40'
                        : 'bg-gray-950 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 italic">
                {confidenceLabels[confidence]?.desc}
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button
                onClick={handleSubmit}
                disabled={submitting || selectedOption === null}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-violet-500/20 disabled:opacity-40"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Grading with Rubric...</span>
                  </>
                ) : (
                  <>
                    <span>Submit &amp; Debug Mental Model</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Assessment Result Card */}
          {assessmentResult && (
            <div
              className={`rounded-2xl border p-6 sm:p-8 space-y-6 shadow-2xl transition-all ${
                assessmentResult.is_correct
                  ? 'bg-emerald-950/20 border-emerald-500/40'
                  : 'bg-amber-950/20 border-amber-500/40'
              }`}
            >
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-800 gap-2">
                <div className="flex items-center space-x-3">
                  {assessmentResult.is_correct ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {assessmentResult.is_correct
                        ? isReassessment
                          ? 'Reassessment Succeeded! Understanding Verified'
                          : 'Correct Answer Verified'
                        : 'Misconception Hypothesis Flagged'}
                    </h3>
                    <p className="text-xs text-gray-300">
                      Estimated Mastery: <strong>{Math.round(assessmentResult.new_mastery_score * 100)}%</strong>
                      <span className="text-gray-400 ml-2">
                        (Status: <strong className="text-indigo-300 capitalize">{assessmentResult.status}</strong> based on {assessmentResult.evidence_count} attempt(s))
                      </span>
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    assessmentResult.is_correct
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  Type: {assessmentResult.error_type}
                </span>
              </div>

              {/* Confidence Telemetry */}
              <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-1">
                <span className="text-xs uppercase font-bold text-gray-400">
                  Confidence vs Accuracy Calibration:
                </span>
                <p className="text-xs sm:text-sm text-cyan-300 font-medium">
                  {assessmentResult.confidence_vs_accuracy_insight}
                </p>
              </div>

              {/* Misconception Card */}
              {assessmentResult.misconception_detected && (
                <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Hypothesis: {assessmentResult.misconception_detected}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-200 leading-relaxed">
                    {assessmentResult.misconception_explanation}
                  </p>
                </div>
              )}

              {/* Diagnostic Feedback */}
              <div className="space-y-2">
                <span className="text-xs uppercase font-bold text-gray-400">Diagnostic Feedback:</span>
                <p className="text-sm text-gray-200 leading-relaxed bg-gray-900/60 p-4 rounded-xl border border-gray-800">
                  {assessmentResult.feedback}
                </p>
              </div>

              {/* Follow-up Question if diagnosis uncertain */}
              {assessmentResult.follow_up_question && (
                <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-1.5 text-xs">
                  <span className="text-indigo-400 font-bold flex items-center space-x-1.5">
                    <HelpCircle className="w-4 h-4" />
                    <span>Targeted Diagnostic Follow-up Question:</span>
                  </span>
                  <p className="text-gray-100 text-sm">
                    {assessmentResult.follow_up_question}
                  </p>
                </div>
              )}

              {/* Verified Answer Key (Released ONLY post-submission) */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-300 space-y-1">
                <span className="text-gray-400 font-bold block">Verified Expected Answer:</span>
                <p className="text-emerald-300 font-mono text-sm">{assessmentResult.expected_answer}</p>
                <p className="text-gray-400 text-[11px] mt-1">{assessmentResult.transparent_reasoning}</p>
              </div>

              {/* Recommended Next Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-400 font-medium">
                  {assessmentResult.recommended_action}
                </span>

                <div className="flex items-center space-x-2">
                  {onOpenRepair && (
                    <button
                      onClick={() => onOpenRepair(conceptId)}
                      className="px-3.5 py-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-bold border border-indigo-500/40 flex items-center space-x-1.5"
                    >
                      <Wrench className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Start Guided Repair</span>
                    </button>
                  )}

                  {onOpenTeachBack && (
                    <button
                      onClick={() => onOpenTeachBack(conceptId)}
                      className="px-3.5 py-2 rounded-lg bg-violet-900/60 hover:bg-violet-800 text-violet-200 text-xs font-bold border border-violet-500/40 flex items-center space-x-1.5"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-violet-400" />
                      <span>Teach-Back Mode</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      const sim = assessmentResult.target_simulation_id || 'c_loop';
                      onNavigateToSimulation(sim, conceptId);
                    }}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>Launch ConceptVerse Lab</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
