import React, { useEffect, useState } from 'react';
import {
  Users,
  Download,
  Lightbulb,
  Loader2,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import type { TeacherAnalyticsResponse } from '../types';

export const TeacherDashboardPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<TeacherAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);

  const loadAnalytics = async (isDemo: boolean = demoMode) => {
    setLoading(true);
    try {
      const data = await api.getTeacherAnalytics(isDemo);
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(demoMode);
  }, [demoMode]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const report = await api.exportReport();
      const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduverse_live_class_report_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to export live class report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-800">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Educator &amp; Instructor Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Class Cohort Diagnostic Analytics
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Telemetry aggregated strictly from active student database records.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Demo Mode Toggle */}
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              demoMode
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/50'
                : 'bg-gray-800 text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{demoMode ? 'Demo Mode Active' : 'Switch to Demo Mode'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-lg shadow-amber-600/30 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Generating Report...' : 'Export Report (JSON)'}</span>
          </button>
        </div>
      </div>

      {/* Dataset Label Banner (Requirement 8) */}
      {analytics?.is_demo_dataset && (
        <div className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-xs text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <strong className="font-semibold uppercase tracking-wider">
              [DEMO DATASET]
            </strong>
            <span>Displaying synthetic cohort benchmarks for demonstration and evaluation.</span>
          </div>
          <span className="text-[11px] text-amber-300/80">Simulated 5-student cohort</span>
        </div>
      )}

      {loading ? (
        <div className="py-24 text-center text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-3" />
          <p className="text-sm">Aggregating live class telemetry from database...</p>
        </div>
      ) : analytics && analytics.total_students === 0 ? (
        /* Honest Empty State (Requirement 8) */
        <div className="py-20 text-center bg-gray-900/60 rounded-2xl border border-gray-800 p-8 space-y-3">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-gray-200">No Enrolled Students Recorded Yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
            There are currently no active student assessment records in the live database. When students register and complete LumiLearn assessments, aggregate performance metrics will automatically populate here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setDemoMode(true)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Preview with Sample Demo Cohort</span>
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Cohort Summary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <span className="text-xs text-gray-400">Total Cohort Roster</span>
              <div className="text-3xl font-extrabold text-white mt-1">
                {analytics?.total_students} Students
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Live registered accounts</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <span className="text-xs text-gray-400">Average Class Mastery</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">
                {Math.round((analytics?.average_class_mastery || 0) * 100)}%
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Conservative mastery estimate</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <span className="text-xs text-gray-400">Active Misconceptions</span>
              <div className="text-3xl font-extrabold text-rose-400 mt-1">
                {analytics?.active_misconceptions.length} Identified
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Empirical error patterns</span>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <span className="text-xs text-gray-400">Evidence Quality</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                Verified
              </div>
              <span className="text-[11px] text-gray-400 mt-1 block">Strict SQL aggregation</span>
            </div>
          </div>

          {/* Evidence-Supported Suggested Revision Topics */}
          {analytics?.suggested_revision_topics && analytics.suggested_revision_topics.length > 0 && (
            <div className="p-6 rounded-2xl bg-gray-900 border border-indigo-500/30 space-y-4">
              <div className="flex items-center space-x-2 border-b border-gray-800 pb-3">
                <Lightbulb className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">
                  Evidence-Supported Revision Recommendations
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.suggested_revision_topics.map((t, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-gray-950 border border-gray-800 space-y-2 text-xs">
                    <span className="text-indigo-300 font-bold text-sm block">{t.topic}</span>
                    <p className="text-gray-300 leading-relaxed">
                      <strong className="text-gray-400">Supporting Evidence: </strong>
                      {t.reason}
                    </p>
                    <p className="text-emerald-300 font-medium">
                      <strong className="text-gray-400">Action Plan: </strong>
                      {t.recommended_action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concept Breakdown Table */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white">Concept-Level Cohort Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-semibold">
                    <th className="pb-3">Concept</th>
                    <th className="pb-3">Class Average</th>
                    <th className="pb-3">At-Risk Count</th>
                    <th className="pb-3">Mastered (&ge;2 Demonstrations)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {analytics?.concept_breakdown.map((cb) => (
                    <tr key={cb.concept_id} className="hover:bg-gray-800/30">
                      <td className="py-3 font-medium text-white">{cb.concept_name}</td>
                      <td className="py-3 font-bold text-amber-400">{cb.class_average}%</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${cb.at_risk > 0 ? 'bg-rose-500/20 text-rose-300' : 'text-gray-400'}`}>
                          {cb.at_risk} student(s)
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-emerald-400">{cb.mastered} student(s)</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Student Summaries Table */}
          <div className="p-6 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-white">Enrolled Student Mastery Status</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 font-semibold">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Goal</th>
                    <th className="pb-3">Overall Mastery</th>
                    <th className="pb-3">Identified Gap</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/60">
                  {analytics?.student_summaries.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-800/30">
                      <td className="py-3 font-medium text-white">{s.name}</td>
                      <td className="py-3 text-gray-400">{s.goal}</td>
                      <td className="py-3 font-bold text-indigo-300">{Math.round(s.overall_mastery * 100)}%</td>
                      <td className="py-3 text-rose-300">{s.gap_concept}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-300 font-semibold text-[10px]">
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
