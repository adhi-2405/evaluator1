import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  FlaskConical,
  ArrowRight,
  Target,
  Wrench,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import type { ProgressOverviewResponse, DailyRevisionItem, RepairSession } from '../types';

interface StudentDashboardProps {
  onNavigate: (tab: string, params?: Record<string, string>) => void;
  onOpenMistakes?: () => void;
  onOpenTeachBack?: (conceptId?: string) => void;
  onOpenRepair?: (conceptId?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onNavigate,
  onOpenRepair
}) => {
  const [progress, setProgress] = useState<ProgressOverviewResponse | null>(null);
  const [revisionQueue, setRevisionQueue] = useState<DailyRevisionItem[]>([]);
  const [activeRepair, setActiveRepair] = useState<RepairSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      api.getProgress(),
      api.getDailyRevisionQueue().catch(() => []),
      api.getActiveRepairSession().catch(() => null)
    ])
      .then(([progData, queueData, repairData]) => {
        setProgress(progData);
        setRevisionQueue(queueData);
        setActiveRepair(repairData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400">Loading student learning profile...</p>
        </div>
      </div>
    );
  }

  const recommendations = progress?.recommendations || [];
  const masteries = progress?.masteries || [];
  const topRec = recommendations[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-gray-100">
      {/* Welcome & Single Clear "Continue Learning" Hero Action (Requirement 9) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-cyan-900/40 border border-indigo-500/30 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3 border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>{progress?.is_demo ? 'Demonstration Session Active' : 'Adaptive Profile Active'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, {progress?.display_name || 'Learner'}
            </h1>
            <p className="text-sm text-gray-300 mt-1 flex items-center space-x-2">
              <Target className="w-4 h-4 text-violet-400 shrink-0" />
              <span>Current Goal: Master C Loops &amp; Circuit Fundamentals</span>
            </p>
          </div>

          {/* Primary "Continue Learning" Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {activeRepair ? (
              <button
                onClick={() => onOpenRepair && onOpenRepair(activeRepair.concept_id)}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <Wrench className="w-4 h-4" />
                <span>Resume Repair Session (Step {activeRepair.current_step})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : topRec ? (
              <button
                onClick={() => {
                  const targetTab = topRec.engine === 'LumiLearn' ? 'lumilearn' : topRec.engine === 'ConceptVerse' ? 'conceptverse' : 'learnmorph';
                  onNavigate(targetTab, { concept: topRec.concept_id });
                }}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>Continue Learning: {topRec.title}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => onNavigate('lumilearn', { concept: 'c_loops_termination' })}
                className="flex items-center justify-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5"
              >
                <span>Continue Learning</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => onNavigate('conceptverse', { sim: 'c_loop' })}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-200 font-semibold text-xs border border-gray-700 transition-colors"
            >
              <FlaskConical className="w-4 h-4 text-emerald-400" />
              <span>Experiment Lab</span>
            </button>
          </div>
        </div>

        {/* Honest Evidence & Telemetry Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-indigo-800/40 text-xs">
          <div>
            <span className="text-gray-400">Demonstrated Mastery</span>
            <div className="text-2xl font-bold text-white mt-0.5">
              {Math.round((progress?.demonstrated_mastery || progress?.overall_mastery || 0) * 100)}%
            </div>
            <span className="text-[10px] text-gray-400">Conservative Evidence Score</span>
          </div>

          <div>
            <span className="text-gray-400">Mastered Concepts</span>
            <div className="text-2xl font-bold text-emerald-400 mt-0.5">
              {progress?.concepts_mastered} / {progress?.total_concepts}
            </div>
            <span className="text-[10px] text-gray-400">&ge;2 Independent Demonstrations</span>
          </div>

          <div>
            <span className="text-gray-400">Assessment Accuracy</span>
            <div className="text-2xl font-bold text-cyan-400 mt-0.5">
              {Math.round((progress?.accuracy_rate || 0) * 100)}%
            </div>
            <span className="text-[10px] text-gray-400">{progress?.total_assessments} Total Attempts</span>
          </div>

          <div>
            <span className="text-gray-400">Confidence Calibration</span>
            <div className="text-2xl font-bold text-violet-400 mt-0.5">
              {Math.round((progress?.calibration_score || 0.7) * 100)}%
            </div>
            <span className="text-[10px] text-gray-400">Accuracy &amp; Confidence Match</span>
          </div>
        </div>
      </div>

      {/* Daily Revision Queue (Requirement 7) */}
      <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Daily Revision Queue</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
              {revisionQueue.length} Due
            </span>
          </div>
          <span className="text-xs text-gray-400 hidden sm:inline">
            Prioritized by spaced retention intervals and recorded mistakes
          </span>
        </div>

        {revisionQueue.length === 0 ? (
          <div className="p-4 rounded-xl bg-gray-950 text-xs text-gray-400 text-center">
            Your revision queue is currently clear! Excellent retention pace.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {revisionQueue.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-gray-950 border border-gray-800 hover:border-gray-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                      {item.concept_name}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        item.urgency === 'review_mistake'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {item.urgency.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-3">
                    {item.reason}
                  </p>
                </div>

                <button
                  onClick={() => {
                    const target = item.recommended_mode === 'experiment' ? 'conceptverse' : item.recommended_mode === 'learn' ? 'learnmorph' : 'lumilearn';
                    onNavigate(target, { concept: item.concept_id });
                  }}
                  className="w-full py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-white font-semibold flex items-center justify-center space-x-1"
                >
                  <span className="capitalize">Review in {item.recommended_mode}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Concept Mastery Grid with Honest Baseline Evidence (Requirement 5) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Core Concept Mastery Telemetry</span>
            <span className="text-xs text-gray-400 font-normal">
              (Documented conservative estimation model)
            </span>
          </h2>
          <span className="text-xs text-gray-400">
            Multiple independent demonstrations required for mastery
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {masteries.map((m) => {
            const isUnassessed = m.attempts === 0 || m.status === 'unassessed';
            return (
              <div
                key={m.concept_id}
                className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white">{m.concept_name}</h3>
                    <span className="text-[11px] text-gray-400 block mt-0.5">
                      {isUnassessed ? (
                        <span className="text-amber-400 font-medium">Not enough evidence</span>
                      ) : (
                        `Demonstrated: ${m.correct_count} of ${m.attempts} attempt(s)`
                      )}
                    </span>
                  </div>
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

                {/* Mastery Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Mastery Score</span>
                    <strong className="text-white">
                      {isUnassessed ? '0% (Unassessed)' : `${Math.round(m.mastery_score * 100)}%`}
                    </strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-950 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        m.status === 'mastered'
                          ? 'bg-emerald-500'
                          : m.status === 'practising'
                          ? 'bg-indigo-500'
                          : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.round(m.mastery_score * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-800/80 text-xs">
                  <button
                    onClick={() => onNavigate('learnmorph', { concept: m.concept_id })}
                    className="flex-1 py-1.5 rounded bg-gray-950 hover:bg-gray-800 text-gray-300 text-center font-medium"
                  >
                    Learn
                  </button>
                  <button
                    onClick={() => onNavigate('lumilearn', { concept: m.concept_id })}
                    className="flex-1 py-1.5 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-center font-bold"
                  >
                    Practise
                  </button>
                  <button
                    onClick={() => {
                      const sim = m.concept_id === 'electricity_ohms_law' ? 'ohms_law' : m.concept_id === 'algo_binary_search' ? 'binary_search' : 'c_loop';
                      onNavigate('conceptverse', { sim, concept: m.concept_id });
                    }}
                    className="p-1.5 rounded bg-gray-950 hover:bg-gray-800 text-emerald-400"
                    title="Launch Simulation"
                  >
                    <FlaskConical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
