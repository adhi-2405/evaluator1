import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  X,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import { ConceptVisualizer } from './ConceptVisualizer';
import type { RepairSession, QuestionItem, AssessResponse } from '../types';

interface RepairSessionModalProps {
  isOpen: boolean;
  conceptId: string;
  onClose: () => void;
  onComplete?: () => void;
}

export const RepairSessionModal: React.FC<RepairSessionModalProps> = ({
  isOpen,
  conceptId,
  onClose,
  onComplete
}) => {
  const [session, setSession] = useState<RepairSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 2 & 6: Diagnostic & Reassessment question state
  const [question, setQuestion] = useState<QuestionItem | null>(null);
  const [studentAnswer, setStudentAnswer] = useState<string>('');
  const [confidence, setConfidence] = useState<number>(3);
  const [evalResult, setEvalResult] = useState<AssessResponse | null>(null);

  // Step 5: Simulation state
  const [simPrediction, setSimPrediction] = useState<string>('5');
  const [simCompleted, setSimCompleted] = useState<boolean>(false);

  // Step 6 fresh question
  const [freshQuestion, setFreshQuestion] = useState<QuestionItem | null>(null);
  const [freshAnswer, setFreshAnswer] = useState<string>('');
  const [_freshResult, setFreshResult] = useState<AssessResponse | null>(null);

  useEffect(() => {
    if (isOpen && conceptId) {
      initSession();
    }
  }, [isOpen, conceptId]);

  const initSession = async () => {
    setLoading(true);
    try {
      const sess = await api.startRepairSession(conceptId);
      setSession(sess);
      setCurrentStep(sess.current_step || 1);

      // Load initial question for step 2
      const q = await api.getQuestion(conceptId, false);
      setQuestion(q);

      // Load reassessment question for step 6
      const fq = await api.getQuestion(conceptId, true);
      setFreshQuestion(fq);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const advanceStep = async (stepNum: number, payload: Record<string, any>) => {
    if (!session) return;
    try {
      const updated = await api.updateRepairStep(session.id, stepNum, payload);
      setSession(updated);
      setCurrentStep(updated.current_step);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStep2Submit = async () => {
    if (!studentAnswer.trim()) return;
    try {
      const res = await api.assessAnswer({
        concept_id: conceptId,
        question_id: question?.question_id || 'q_01',
        student_answer: studentAnswer,
        confidence_rating: confidence,
        is_reassessment: false
      });
      setEvalResult(res);
      await advanceStep(2, {
        answer: studentAnswer,
        confidence,
        is_correct: res.is_correct,
        misconception: res.misconception_detected
      });
    } catch (err: any) {
      alert(err.message || 'Assessment submission failed');
    }
  };

  const handleStep6Submit = async () => {
    if (!freshAnswer.trim()) return;
    try {
      const res = await api.assessAnswer({
        concept_id: conceptId,
        question_id: freshQuestion?.question_id || 'q_02',
        student_answer: freshAnswer,
        confidence_rating: confidence,
        is_reassessment: true
      });
      setFreshResult(res);
      await advanceStep(6, {
        answer: freshAnswer,
        is_correct: res.is_correct,
        new_mastery: res.new_mastery_score
      });
    } catch (err: any) {
      alert(err.message || 'Reassessment failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-indigo-500/30 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Learning Repair Session</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Step {currentStep} of 7
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">
                {session?.topic_title || conceptId} &bull; Guided Pedagogical Reconstruction
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="px-4 py-2 bg-gray-950/50 border-b border-gray-800 flex items-center justify-between text-[11px]">
          {[
            'Topic',
            'Diagnostic',
            'Diagnosis',
            'Targeted Concept',
            'Experiment / Example',
            'Fresh Check',
            'Retention Schedule'
          ].map((title, idx) => {
            const stepNum = idx + 1;
            const isDone = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;
            return (
              <div key={idx} className="flex items-center space-x-1">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isDone
                      ? 'bg-emerald-500 text-gray-950'
                      : isCurrent
                      ? 'bg-indigo-600 text-white ring-2 ring-indigo-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {isDone ? '✓' : stepNum}
                </span>
                <span className={`hidden md:inline ${isCurrent ? 'text-white font-bold' : 'text-gray-400'}`}>
                  {title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Step Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Initializing Learning Repair Session...
            </div>
          ) : (
            <>
              {/* STEP 1: Topic Confirmation */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">
                    Step 1: Focus Concept Selection
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    You have entered a targeted Learning Repair Session for <strong>{session?.topic_title}</strong>.
                    This workflow guides you through diagnostic calibration, addresses specific misconception triggers,
                    allows you to run physical or code experiments, and concludes with an unassisted verification check.
                  </p>
                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800">
                    <span className="text-xs font-semibold text-indigo-400 block mb-1">Target Learning Objectives:</span>
                    <ul className="text-xs text-gray-300 list-disc list-inside space-y-1">
                      <li>Isolate the exact boundary rule or invariant state.</li>
                      <li>Observe concrete execution behavior through physical or algorithmic simulation.</li>
                      <li>Demonstrate unassisted recall to earn mastery status.</li>
                    </ul>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => advanceStep(1, { confirmed: true })}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <span>Begin Diagnostic Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Diagnostic Question & Confidence */}
              {currentStep === 2 && question && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">
                    Step 2: Diagnostic Assessment
                  </h4>
                  <p className="text-xs text-gray-400">
                    Answer carefully and log your confidence rating to test calibration.
                  </p>

                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                    <p className="text-sm font-semibold text-gray-100">{question.question_text}</p>
                    {question.code_snippet && (
                      <pre className="p-3 rounded-lg bg-black/60 text-indigo-200 font-mono text-xs overflow-x-auto border border-gray-800">
                        {question.code_snippet}
                      </pre>
                    )}

                    <div className="space-y-2 pt-2">
                      {question.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setStudentAnswer(String(idx))}
                          className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-all ${
                            studentAnswer === String(idx)
                              ? 'bg-indigo-600/30 border-indigo-500 text-white ring-1 ring-indigo-400'
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800/60'
                          }`}
                        >
                          <span className="font-bold text-indigo-400 mr-2">
                            {String.fromCharCode(65 + idx)})
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800">
                    <label className="text-xs font-semibold text-gray-300 block mb-2">
                      Report your confidence level (1 = tentative guess, 5 = absolute certainty):
                    </label>
                    <div className="flex items-center space-x-3">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          onClick={() => setConfidence(val)}
                          className={`w-10 h-10 rounded-lg font-bold text-xs border transition-all ${
                            confidence === val
                              ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                              : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                      <span className="text-xs text-gray-400 ml-2">
                        {confidence >= 4 ? 'High Confidence' : confidence <= 2 ? 'Low Confidence' : 'Moderate'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleStep2Submit}
                      disabled={!studentAnswer}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 disabled:opacity-50"
                    >
                      <span>Submit Diagnostic Answer</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Diagnostic Feedback & Misconception Hypothesis */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">
                    Step 3: Diagnostic Feedback & Hypothesis
                  </h4>

                  <div
                    className={`p-4 rounded-xl border ${
                      evalResult?.is_correct
                        ? 'bg-emerald-950/30 border-emerald-500/40'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {evalResult?.is_correct ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-400" />
                      )}
                      <strong className="text-sm font-bold text-white">
                        {evalResult?.is_correct ? 'Diagnostic Passed' : 'Misconception Hypothesis Identified'}
                      </strong>
                    </div>

                    <p className="text-xs text-gray-200 mb-3">{evalResult?.feedback}</p>

                    {evalResult?.misconception_detected && (
                      <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 text-xs">
                        <span className="text-amber-400 font-bold block mb-1">
                          Working Hypothesis: {evalResult.misconception_detected}
                        </span>
                        <p className="text-gray-300">{evalResult.misconception_explanation}</p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-indigo-300 font-mono">
                      {evalResult?.confidence_vs_accuracy_insight}
                    </div>
                  </div>

                  {evalResult?.follow_up_question && (
                    <div className="p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs">
                      <span className="text-indigo-400 font-bold block mb-1">
                        Diagnostic Check Question:
                      </span>
                      <p className="text-gray-200">{evalResult.follow_up_question}</p>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => advanceStep(3, { feedback_reviewed: true })}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <span>Review Targeted Explanation</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Targeted Explanation with Source References */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">
                    Step 4: Targeted Conceptual Reconstruction
                  </h4>
                  <ConceptVisualizer topic={conceptId} />
                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs space-y-2">
                    <span className="text-indigo-400 font-bold block">Verified Pedagogical Rule:</span>
                    <p className="text-gray-300 leading-relaxed">
                      Always evaluate the exact state that causes the loop or circuit invariant to fail.
                      In loop statements, the iterator variable reaches the condition boundary (e.g. i=5) before terminating.
                    </p>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => advanceStep(4, { explanation_reviewed: true })}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1"
                    >
                      <span>Advance to Interactive Experiment</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Experiment / Worked Exercise */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">
                    Step 5: Guided Experiment &amp; Observation
                  </h4>
                  <p className="text-xs text-gray-400">
                    Test your mental model against the deterministic engine before re-testing.
                  </p>

                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                    <span className="text-xs font-semibold text-indigo-300 block">
                      Enter your prediction before running the step sequence:
                    </span>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={simPrediction}
                        onChange={(e) => setSimPrediction(e.target.value)}
                        placeholder="Expected final variable"
                        className="p-2 rounded bg-gray-900 border border-gray-700 text-xs text-white"
                      />
                      <button
                        onClick={() => setSimCompleted(true)}
                        className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                      >
                        Execute Simulation Step
                      </button>
                    </div>

                    {simCompleted && (
                      <div className="p-3 bg-emerald-950/30 border border-emerald-500/40 rounded-lg text-xs space-y-1 mt-2">
                        <span className="text-emerald-400 font-bold block">Observation Logged:</span>
                        <p className="text-gray-300">
                          The loop verified: condition evaluated to False at boundary value 5. Counter retained 5.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => advanceStep(5, { experiment_completed: true, simPrediction })}
                      disabled={!simCompleted}
                      className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1 disabled:opacity-50"
                    >
                      <span>Proceed to Fresh Reassessment Question</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: Independent Reassessment Question */}
              {currentStep === 6 && freshQuestion && (
                <div className="space-y-4 animate-in fade-in">
                  <h4 className="text-base font-bold text-white">
                    Step 6: Independent Verification Check
                  </h4>
                  <p className="text-xs text-gray-400">
                    Demonstrate that your mental model has generalized by answering this unassisted variation.
                  </p>

                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-3">
                    <p className="text-sm font-semibold text-gray-100">{freshQuestion.question_text}</p>
                    {freshQuestion.code_snippet && (
                      <pre className="p-3 rounded-lg bg-black/60 text-indigo-200 font-mono text-xs overflow-x-auto border border-gray-800">
                        {freshQuestion.code_snippet}
                      </pre>
                    )}

                    <div className="space-y-2 pt-2">
                      {freshQuestion.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setFreshAnswer(String(idx))}
                          className={`w-full text-left p-3 rounded-lg text-xs font-medium border transition-all ${
                            freshAnswer === String(idx)
                              ? 'bg-emerald-600/30 border-emerald-500 text-white ring-1 ring-emerald-400'
                              : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800/60'
                          }`}
                        >
                          <span className="font-bold text-emerald-400 mr-2">
                            {String.fromCharCode(65 + idx)})
                          </span>
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={handleStep6Submit}
                      disabled={!freshAnswer}
                      className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center space-x-1 disabled:opacity-50"
                    >
                      <span>Submit Independent Check</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 7: Synthesis & Retention Scheduling */}
              {currentStep === 7 && (
                <div className="space-y-4 animate-in fade-in text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    Learning Repair Session Completed!
                  </h4>
                  <p className="text-xs text-gray-300 max-w-md mx-auto leading-relaxed">
                    You completed the 7-step guided repair workflow. Diagnostic evidence, experimental trace,
                    and independent reassessment data have been saved to your learning profile.
                  </p>

                  <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 text-xs max-w-md mx-auto text-left space-y-2">
                    <div className="flex items-center space-x-2 text-indigo-400 font-bold">
                      <Calendar className="w-4 h-4" />
                      <span>Suggested Review Scheduled:</span>
                    </div>
                    <p className="text-gray-300">
                      Spaced retention review scheduled in <strong>3 days</strong> to reinforce memory consolidation.
                    </p>
                    <span className="text-[10px] text-gray-500 block">
                      Note: Spacing is an empirical learning heuristic, not a scientifically guaranteed precision guarantee.
                    </span>
                  </div>

                  <div className="pt-4 flex justify-center space-x-3">
                    <button
                      onClick={() => {
                        if (onComplete) onComplete();
                        onClose();
                      }}
                      className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
                    >
                      Return to Learning Dashboard
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
