import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Calendar
} from 'lucide-react';
import { api } from '../services/api';
import type { ProgressOverviewResponse } from '../types';

interface ProgressPageProps {
  onNavigateToTab: (tab: string, params?: Record<string, string>) => void;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ onNavigateToTab }) => {
  const [progress, setProgress] = useState<ProgressOverviewResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getProgress()
      .then((data) => {
        setProgress(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const masteries = progress?.masteries || [];
  const recentAssessments = progress?.recent_assessments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-gray-100">
      {/* Header */}
      <div className="pb-6 border-b border-gray-800">
        <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
          <BarChart3 className="w-4 h-4" />
          <span>Evidence-Based Progress Telemetry</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Learning Progress &amp; Mastery Calibration
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Documented conservative mastery estimation. Confidence calibration is measured independently from demonstrated skill.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs text-gray-400">Demonstrated Mastery</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            {Math.round((progress?.demonstrated_mastery || progress?.overall_mastery || 0) * 100)}%
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Conservative Evidence Score</span>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs text-gray-400">Total Assessments</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1">
            {progress?.total_assessments}
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Independent challenges</span>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs text-gray-400">First-Attempt Accuracy</span>
          <div className="text-3xl font-extrabold text-violet-400 mt-1">
            {Math.round((progress?.accuracy_rate || 0) * 100)}%
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Unassisted first tries</span>
        </div>

        <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
          <span className="text-xs text-gray-400">Confidence Calibration</span>
          <div className="text-3xl font-extrabold text-yellow-400 mt-1">
            {progress?.average_confidence ? `${progress.average_confidence} / 5` : 'N/A'}
          </div>
          <span className="text-[11px] text-gray-400 mt-1 block">Separated from demonstrated skill</span>
        </div>
      </div>

      {/* Concept Breakdown Table with Evidence Counts */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              Concept Demonstrations &amp; Spaced Reviews
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Concepts require multiple independent demonstrations before granting mastered status.
            </p>
          </div>
          <span className="text-xs text-gray-400">
            Conservative Scoring Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {masteries.map((m) => {
            const isUnassessed = m.attempts === 0 || m.status === 'unassessed';
            return (
              <div
                key={m.concept_id}
                className="p-5 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <h4 className="text-sm font-bold text-white">{m.concept_name}</h4>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      m.status === 'mastered'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : m.status === 'practising'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : m.status === 'emerging'
                        ? 'bg-cyan-500/20 text-cyan-300'
                        : 'bg-gray-800 text-gray-400'
                    }`}
                  >
                    {m.status}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Mastery Estimate:</span>
                    <strong className="text-white">
                      {isUnassessed ? 'Not enough evidence' : `${Math.round(m.mastery_score * 100)}%`}
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-900 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                      style={{ width: `${Math.round(m.mastery_score * 100)}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400 space-y-1 pt-1 border-t border-gray-800/60">
                  <div className="flex justify-between">
                    <span>Evidence Count:</span>
                    <strong className="text-gray-200">{m.attempts} attempt(s) ({m.correct_count} correct)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>First-Attempt Correct:</span>
                    <strong className="text-gray-200">{m.first_attempt_correct}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Reassessments Correct:</span>
                    <strong className="text-gray-200">{m.reassessment_correct}</strong>
                  </div>
                  {m.next_review_due && (
                    <div className="flex justify-between text-amber-300">
                      <span>Next Review Due:</span>
                      <strong>{new Date(m.next_review_due).toLocaleDateString()}</strong>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigateToTab('lumilearn', { concept: m.concept_id })}
                  className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white flex items-center justify-center space-x-1"
                >
                  <span>Challenge Concept</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Spaced Review Disclaimer (Requirement 5) */}
        <div className="p-3.5 rounded-xl bg-gray-950/80 border border-gray-800 text-xs text-gray-400 flex items-start space-x-2">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-gray-300 block font-semibold mb-0.5">Spaced Review Heuristic:</strong>
            <span>
              Review intervals (1, 3, and 7 days) are suggested empirical practice schedules based on standard spacing heuristics.
              They are designed for structured habit building, not a scientifically certified guarantee of retention.
            </span>
          </div>
        </div>
      </div>

      {/* Recent Assessment Telemetry Log */}
      <div className="bg-gray-900/90 border border-gray-800 rounded-2xl p-6 sm:p-8 space-y-4">
        <h3 className="text-base font-bold text-white">Recent Assessment Telemetry Log</h3>
        {recentAssessments.length === 0 ? (
          <p className="text-xs text-gray-400 py-6 text-center">
            No assessment logs recorded yet. Take a diagnostic assessment in Practise (LumiLearn).
          </p>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentAssessments.map((a) => (
              <div key={a.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  {a.is_correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400" />
                  )}
                  <div>
                    <span className="font-bold text-white">{a.concept_id}</span>
                    <span className="text-gray-500 ml-2">({a.timestamp})</span>
                    {a.misconception_detected && (
                      <span className="text-amber-300 block text-[11px]">
                        Hypothesis: {a.misconception_detected}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Confidence: {a.confidence_rating}/5</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      a.is_correct ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {a.is_reassessment ? 'Reassessment' : 'Diagnostic'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
