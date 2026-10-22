import React, { useState } from 'react';
import { MessageSquare, AlertCircle, HelpCircle, ArrowRight, X } from 'lucide-react';
import { api } from '../services/api';
import type { TeachBackResponse } from '../types';

interface TeachBackModalProps {
  isOpen: boolean;
  conceptId: string;
  conceptName: string;
  onClose: () => void;
}

export const TeachBackModal: React.FC<TeachBackModalProps> = ({
  isOpen,
  conceptId,
  conceptName,
  onClose
}) => {
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TeachBackResponse | null>(null);

  const handleEvaluate = async () => {
    if (explanation.trim().length < 15) {
      alert('Please provide a complete explanation of at least 15 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.evaluateTeachBack(conceptId, explanation);
      setResult(res);
    } catch (err: any) {
      alert(err.message || 'Teach-back evaluation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setExplanation('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <span>Teach-Back Mode</span>
                <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">
                  Feynman Technique
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Explain <strong>{conceptName}</strong> in your own words as if teaching a peer.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {!result ? (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">
                  Explain the principles, execution sequence, and boundary conditions:
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Explain step-by-step: What happens first? How do the variables change? Under what condition does it terminate or stabilize?..."
                  className="w-full h-44 p-3.5 rounded-xl bg-gray-950 border border-gray-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
                <span className="text-[11px] text-gray-400 block mt-1">
                  Evaluated against verified concept checkpoints and invariant rules.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-300 hover:bg-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEvaluate}
                  disabled={loading || explanation.trim().length < 15}
                  className="px-5 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow-lg shadow-violet-500/20 disabled:opacity-50"
                >
                  <span>{loading ? 'Evaluating Checkpoints...' : 'Evaluate Teach-Back'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              {/* Reliability banner if inconclusive */}
              {result.evaluation_reliability === 'inconclusive' && (
                <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-lg text-xs text-amber-200 flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Evaluation Inconclusive: Explanation was too brief or general to score with certainty.
                  </span>
                </div>
              )}

              {/* Score card */}
              <div className="p-4 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block">Teach-Back Mastery Score</span>
                  <span className="text-2xl font-extrabold text-violet-400">
                    {Math.round(result.score * 100)}%
                  </span>
                </div>
                <div className="text-right text-xs text-gray-400">
                  <span>Reliability: </span>
                  <strong className="text-gray-200 capitalize">{result.evaluation_reliability}</strong>
                </div>
              </div>

              {/* Checkpoints */}
              <div>
                <h4 className="text-xs font-bold text-gray-300 mb-2 uppercase tracking-wide">
                  Concept Checkpoints
                </h4>
                <div className="space-y-2">
                  {result.checkpoints_evaluated.map((cp, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-gray-950/70 border border-gray-800 flex items-center justify-between text-xs"
                    >
                      <span className="text-gray-200 font-medium">{cp.checkpoint}</span>
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                          cp.status === 'demonstrated'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {cp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Missing points */}
              {result.missing_points.length > 0 && (
                <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-xs">
                  <strong className="text-rose-400 block font-semibold mb-1">Missing Elements to Clarify:</strong>
                  <ul className="list-disc list-inside text-gray-300 space-y-1">
                    {result.missing_points.map((mp, i) => (
                      <li key={i}>{mp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Follow-up Question */}
              {result.follow_up_question && (
                <div className="p-3.5 rounded-lg bg-indigo-950/30 border border-indigo-500/30 text-xs">
                  <strong className="text-indigo-400 flex items-center space-x-1.5 font-semibold mb-1">
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Targeted Diagnostic Follow-Up:</span>
                  </strong>
                  <p className="text-gray-200">{result.follow_up_question}</p>
                </div>
              )}

              {/* AI Feedback */}
              <div className="p-3.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-gray-300">
                <strong className="text-gray-400 block mb-1">Pedagogical Feedback:</strong>
                <p>{result.ai_feedback}</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold"
                >
                  Try Another Explanation
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
