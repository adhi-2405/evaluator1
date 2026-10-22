import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle2, RotateCcw, Filter, ShieldCheck, X } from 'lucide-react';
import { api } from '../services/api';
import type { MistakeNotebookItem } from '../types';

interface MistakeNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPractise?: (conceptId: string) => void;
}

export const MistakeNotebookModal: React.FC<MistakeNotebookModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPractise
}) => {
  const [mistakes, setMistakes] = useState<MistakeNotebookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeRetry, setActiveRetry] = useState<any | null>(null);
  const [resolvingId, setResolvingId] = useState<number | null>(null);
  const [correctedReasoning, setCorrectedReasoning] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadMistakes = async () => {
    setLoading(true);
    try {
      const data = await api.getMistakes(undefined, statusFilter === 'all' ? undefined : statusFilter);
      setMistakes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMistakes();
    }
  }, [isOpen, statusFilter]);

  const handleResolve = async (id: number) => {
    if (!correctedReasoning.trim()) return;
    setSubmitting(true);
    try {
      await api.resolveMistake(id, correctedReasoning);
      setResolvingId(null);
      setCorrectedReasoning('');
      await loadMistakes();
    } catch (err) {
      alert('Failed to resolve mistake');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartRetry = async (id: number) => {
    try {
      const res = await api.getMistakeRetry(id);
      setActiveRetry(res);
    } catch (err) {
      alert('Failed to load retry question');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <span>Personal Mistake Notebook</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-normal">
                  {mistakes.length} Entry(s)
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                Track errors, inspect verified rubrics, write corrected reasoning, and retry.
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

        {/* Filters Toolbar */}
        <div className="px-5 py-3 bg-gray-950/50 border-b border-gray-800 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-gray-400 font-semibold flex items-center space-x-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>
            {['all', 'open', 'resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md capitalize font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-gray-400 text-[11px]">
            Preserving authentic original student reasoning
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-16 text-center text-gray-400 text-sm">
              Loading mistake notebook entries...
            </div>
          ) : mistakes.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-200">No Mistakes Recorded!</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                When you encounter a conceptual bottleneck in LumiLearn assessments, it will automatically be captured here for targeted revision.
              </p>
            </div>
          ) : (
            mistakes.map((m) => {
              const isResolved = m.status === 'resolved';
              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-gray-950/40 border-gray-800'
                      : 'bg-rose-950/15 border-rose-500/30 shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {m.concept_name}
                      </span>
                      {m.misconception_name && (
                        <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
                          Hypothesis: {m.misconception_name}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase ${
                        isResolved
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-gray-100 mb-3">
                    {m.question_text}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                    <div className="p-3 rounded-lg bg-gray-950/70 border border-gray-800">
                      <span className="text-gray-400 font-bold block mb-1">Your Original Answer:</span>
                      <p className="text-rose-300 font-mono">{m.student_answer}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-950/70 border border-gray-800">
                      <span className="text-emerald-400 font-bold flex items-center space-x-1 mb-1">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified Answer Key:</span>
                      </span>
                      <p className="text-emerald-200 font-mono">{m.expected_answer}</p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-gray-950/50 border border-gray-800/80 text-xs mb-3">
                    <span className="text-indigo-400 font-bold block mb-1">Diagnostic AI Feedback:</span>
                    <p className="text-gray-300">{m.ai_feedback}</p>
                  </div>

                  {m.corrected_reasoning && (
                    <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-xs mb-3">
                      <span className="text-emerald-400 font-bold block mb-1">Your Corrected Reasoning:</span>
                      <p className="text-emerald-200">{m.corrected_reasoning}</p>
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-800/60 text-xs">
                    <span className="text-gray-400">
                      Retried {m.retry_count} time(s) &bull; Logged on {new Date(m.created_at).toLocaleDateString()}
                    </span>

                    <div className="flex items-center space-x-2">
                      {!isResolved && (
                        <button
                          onClick={() => setResolvingId(resolvingId === m.id ? null : m.id)}
                          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                        >
                          {resolvingId === m.id ? 'Cancel' : 'Write Corrected Reasoning'}
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (onNavigateToPractise) {
                            onNavigateToPractise(m.concept_id);
                            onClose();
                          } else {
                            handleStartRetry(m.id);
                          }
                        }}
                        className="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium flex items-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retry Challenge</span>
                      </button>
                    </div>
                  </div>

                  {/* Resolution Input Box */}
                  {resolvingId === m.id && (
                    <div className="mt-3 p-3 rounded-lg bg-gray-950 border border-indigo-500/40 animate-in fade-in">
                      <label className="text-xs font-bold text-indigo-300 block mb-1">
                        Explain why the original reasoning diverged and state the verified principle:
                      </label>
                      <textarea
                        value={correctedReasoning}
                        onChange={(e) => setCorrectedReasoning(e.target.value)}
                        placeholder="In my original answer I overlooked that... The correct rule states that..."
                        className="w-full h-20 p-2.5 rounded bg-gray-900 border border-gray-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          onClick={() => handleResolve(m.id)}
                          disabled={submitting || !correctedReasoning.trim()}
                          className="px-3 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs disabled:opacity-50"
                        >
                          {submitting ? 'Saving...' : 'Mark Resolved & Save Reasoning'}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeRetry && activeRetry.mistake_id === m.id && (
                    <div className="mt-3 p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/40 animate-in fade-in space-y-2 text-xs">
                      <span className="font-bold text-indigo-300 block">Retry Challenge Question:</span>
                      <p className="text-white font-medium">{activeRetry.retry_question.question_text}</p>
                      <button
                        onClick={() => {
                          if (onNavigateToPractise) onNavigateToPractise(m.concept_id);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs"
                      >
                        Answer in Practise Mode &rarr;
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
