import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Upload,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ArrowRight,
  Loader2,
  AlertTriangle,
  Globe2,
  ExternalLink,
  SplitSquareVertical
} from 'lucide-react';
import { api } from '../services/api';
import { ConceptVisualizer } from '../components/ConceptVisualizer';
import { DocumentViewer } from '../components/DocumentViewer';
import type { ExplainResponse, LessonDetail, LessonItem, CitationItem } from '../types';

interface LearnMorphPageProps {
  initialTopic?: string;
  onNavigateToLumiLearn: (conceptId: string) => void;
  onStartRepairSession?: (conceptId: string) => void;
}

export const LearnMorphPage: React.FC<LearnMorphPageProps> = ({
  initialTopic = 'C Programming Loops',
  onNavigateToLumiLearn,
  onStartRepairSession
}) => {
  const [topic, setTopic] = useState<string>(initialTopic);
  const [educationLevel, _setEducationLevel] = useState<string>('College / Undergrad');
  const [language, setLanguage] = useState<string>('English');
  const [detailLevel, _setDetailLevel] = useState<string>('standard');
  const [activeFormatTab, setActiveFormatTab] = useState<string>('simple');

  const [loading, setLoading] = useState<boolean>(false);
  const [uploadingPdf, setUploadingPdf] = useState<boolean>(false);
  const [explainData, setExplainData] = useState<ExplainResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Document workflow state
  const [activeDocumentId, setActiveDocumentId] = useState<number | null>(null);
  const [activeDocumentDetail, setActiveDocumentDetail] = useState<LessonDetail | null>(null);
  const [activeCitationPage, setActiveCitationPage] = useState<number | null>(null);
  const [highlightedPassage, setHighlightedPassage] = useState<string | null>(null);
  const [showDocViewer, setShowDocViewer] = useState<boolean>(false);
  const [availableDocs, setAvailableDocs] = useState<LessonItem[]>([]);

  // Text-To-Speech state
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);

  useEffect(() => {
    loadAvailableDocs();
    fetchExplanation({ targetTopic: initialTopic });
  }, []);

  const loadAvailableDocs = async () => {
    try {
      const docs = await api.getLessons();
      setAvailableDocs(docs);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExplanation = async (params: {
    targetTopic?: string;
    targetDocId?: number | null;
    targetPage?: number;
    targetLang?: string;
  }) => {
    setLoading(true);
    setErrorMsg(null);

    const docId = params.targetDocId !== undefined ? params.targetDocId : activeDocumentId;
    const currentTopic = params.targetTopic || topic;
    const currentLang = params.targetLang || language;

    try {
      const data = await api.explain({
        topic: currentTopic,
        document_id: docId || undefined,
        selected_page: params.targetPage,
        education_level: educationLevel,
        preferred_format: activeFormatTab,
        language: currentLang,
        detail_level: detailLevel
      });
      setExplainData(data);

      // If document was queried, load document details for viewer
      if (docId) {
        try {
          const detail = await api.getLessonDetails(docId);
          setActiveDocumentDetail(detail);
          setShowDocViewer(true);
        } catch (e) {}
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate explanation');
    } finally {
      setLoading(false);
    }
  };

  // Fixed PDF Upload Handler: avoids React stale closure and 500-char preview limitation!
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setErrorMsg(null);
    try {
      const res = await api.uploadLesson(file, file.name);
      setActiveDocumentId(res.id);
      setTopic(res.title);
      setShowDocViewer(true);

      // Reload available documents
      await loadAvailableDocs();

      // Pass the new document ID immediately into the fetch function (No stale state!)
      await fetchExplanation({
        targetTopic: res.title,
        targetDocId: res.id
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error uploading and processing document');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSelectExistingDoc = async (docId: number) => {
    setActiveDocumentId(docId);
    setShowDocViewer(true);
    const selected = availableDocs.find((d) => d.id === docId);
    if (selected) {
      setTopic(selected.title);
      await fetchExplanation({
        targetTopic: selected.title,
        targetDocId: docId
      });
    }
  };

  const handleCitationClick = (citation: CitationItem) => {
    if (citation.page_number) {
      setActiveCitationPage(citation.page_number);
    }
    setHighlightedPassage(citation.passage);
    setShowDocViewer(true);
  };

  // Audio Speech Synthesis with honest fallback and regional voice detection
  const playAudio = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

    window.speechSynthesis.cancel();
    setVoiceNotice(null);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Detect language voice
    const voices = window.speechSynthesis.getVoices();
    if (language === 'Tamil') {
      const tamilVoice = voices.find((v) => v.lang.includes('ta') || v.name.toLowerCase().includes('tamil'));
      if (tamilVoice) {
        utterance.voice = tamilVoice;
      } else {
        setVoiceNotice('Notice: Local Tamil browser speech voice not detected. Operating with default system phonetic synthesizer.');
      }
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const pauseAudio = () => {
    if ('speechSynthesis' in window && isSpeaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const stopAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Module 1: Learn (LearnMorph)
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">&bull; Multimodal Explanations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Grounded Learning &amp; Concept Reader
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
            Synthesize textbook chapters and foundational STEM concepts into clear step-by-step explanations,
            interactive visual diagrams, and regional audio notes.
          </p>
        </div>

        {/* Side-by-Side Document Reader Toggle Button */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => setShowDocViewer(!showDocViewer)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-all ${
              showDocViewer
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            <SplitSquareVertical className="w-4 h-4" />
            <span>{showDocViewer ? 'Hide Document Reader' : 'Side-by-Side Reader'}</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Topics, Upload & Document Select */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 rounded-xl bg-gray-900/80 border border-gray-800">
        {/* Topic Input */}
        <div className="md:col-span-5">
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Topic or Query:
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchExplanation({ targetTopic: topic })}
            placeholder="e.g., C Programming Loops, Ohm's Law, Binary Search..."
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
        </div>

        {/* Book Selector */}
        <div className="md:col-span-4">
          <label className="text-xs font-semibold text-gray-300 block mb-1">
            Grounded In Book / Lesson:
          </label>
          <select
            value={activeDocumentId || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : null;
              if (val) handleSelectExistingDoc(val);
              else {
                setActiveDocumentId(null);
                setActiveDocumentDetail(null);
                fetchExplanation({ targetDocId: null });
              }
            }}
            className="w-full px-3 py-2 rounded-lg bg-gray-950 border border-gray-700 text-xs text-gray-200 focus:outline-none"
          >
            <option value="">Curated STEM Standard (General Principles)</option>
            {availableDocs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.page_count}p &bull; {d.extraction_status})
              </option>
            ))}
          </select>
        </div>

        {/* Upload Button */}
        <div className="md:col-span-3 flex items-end">
          <label className="w-full cursor-pointer px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-bold text-gray-200 flex items-center justify-center space-x-1.5 transition-colors">
            {uploadingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Upload className="w-4 h-4 text-cyan-400" />
            )}
            <span>{uploadingPdf ? 'Indexing Chunks...' : 'Upload Book / PDF'}</span>
            <input
              type="file"
              accept=".pdf,.txt,.md"
              className="hidden"
              onChange={handlePdfUpload}
              disabled={uploadingPdf}
            />
          </label>
        </div>
      </div>

      {/* Language, Level & Audio Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-gray-400 font-semibold">Language:</span>
          {['English', 'Tamil', 'Malayalam'].map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLanguage(lang);
                fetchExplanation({ targetLang: lang });
              }}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                language === lang
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-900 border border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Audio Narration Controls */}
        <div className="flex items-center space-x-2">
          {!isSpeaking ? (
            <button
              onClick={() => {
                const textToSpeak = explainData?.regional_translation || explainData?.simple_explanation || '';
                playAudio(textToSpeak);
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-cyan-300 font-semibold flex items-center space-x-1"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen Narration</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5">
              <button
                onClick={pauseAudio}
                className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold"
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              </button>
              <button
                onClick={stopAudio}
                className="px-2.5 py-1 rounded bg-rose-600 text-white font-bold"
              >
                <VolumeX className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {voiceNotice && (
        <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-[11px] text-amber-200">
          {voiceNotice}
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-500/30 text-xs text-rose-200 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Workspace Layout (Side-by-side when showDocViewer is active) */}
      <div className={`grid grid-cols-1 ${showDocViewer ? 'lg:grid-cols-12' : ''} gap-6`}>
        {/* Left / Side Document Viewer */}
        {showDocViewer && (
          <div className="lg:col-span-5 h-[650px]">
            <DocumentViewer
              document={activeDocumentDetail}
              activeCitationPage={activeCitationPage}
              highlightPassage={highlightedPassage}
              onSelectPage={(page) => fetchExplanation({ targetPage: page })}
              onDeleteDocument={async (docId) => {
                await api.deleteLesson(docId);
                setActiveDocumentId(null);
                setActiveDocumentDetail(null);
                await loadAvailableDocs();
                await fetchExplanation({ targetDocId: null });
              }}
              onClose={() => setShowDocViewer(false)}
            />
          </div>
        )}

        {/* Right / Main Explanation Pane */}
        <div className={`${showDocViewer ? 'lg:col-span-7' : 'w-full'} space-y-5`}>
          {loading ? (
            <div className="py-24 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
              <p className="text-sm">Synthesizing multimodal explanation and citations...</p>
            </div>
          ) : explainData ? (
            <>
              {/* Provenance Banner (Requirement 3: Clear disclosure of source grounding) */}
              <div className="p-3 rounded-xl bg-gray-900 border border-gray-800 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      explainData.grounded_in_document ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                  />
                  <strong className="text-gray-200">
                    {explainData.grounded_in_document
                      ? 'Grounded in Uploaded Document'
                      : 'Curated Verified Knowledge Base'}
                  </strong>
                  <span className="text-gray-500 hidden sm:inline">&bull; {explainData.model_used}</span>
                </div>

                {explainData.is_live_llm && (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    LIVE LLM
                  </span>
                )}
              </div>

              {/* Clickable Citations Bar (Requirement 3) */}
              {explainData.citations && explainData.citations.length > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-xs">
                  <span className="text-indigo-400 font-bold block mb-2">
                    Clickable Citations from Uploaded Source:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {explainData.citations.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => handleCitationClick(c)}
                        className="px-2.5 py-1 rounded bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 border border-indigo-500/40 font-medium flex items-center space-x-1 transition-all"
                        title={c.passage}
                      >
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>
                          {c.document_title}: Page {c.page_number || 1} ({c.section_title || 'Passage'})
                        </span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Regional Tamil Translation Block (Requirement 7) */}
              {explainData.regional_translation && (
                <div className="p-4 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between text-violet-300 font-bold">
                    <span className="flex items-center space-x-1.5">
                      <Globe2 className="w-4 h-4 text-violet-400" />
                      <span>தமிழ் விளக்கம் (Tamil Translation &amp; English Technical Terms):</span>
                    </span>
                  </div>
                  <p className="text-violet-100 text-sm leading-relaxed mt-2 font-serif">
                    {explainData.regional_translation}
                  </p>
                </div>
              )}

              {/* Format Tabs */}
              <div className="flex border-b border-gray-800 overflow-x-auto text-xs font-semibold">
                {[
                  { id: 'simple', label: 'Simple Overview' },
                  { id: 'step_by_step', label: 'Step-by-Step' },
                  { id: 'visual', label: 'Visual Diagram' },
                  { id: 'worked_example', label: 'Worked Example' },
                  { id: 'practice', label: 'Practice Q&A' },
                  { id: 'real_world', label: 'Real World' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFormatTab(tab.id)}
                    className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors ${
                      activeFormatTab === tab.id
                        ? 'border-cyan-400 text-cyan-300 bg-cyan-950/10'
                        : 'border-transparent text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Format Tab Content */}
              <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 text-sm leading-relaxed text-gray-200 min-h-[220px]">
                {activeFormatTab === 'simple' && (
                  <div>
                    <h3 className="text-base font-bold text-white mb-2">{explainData.topic}</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {explainData.simple_explanation}
                    </p>
                  </div>
                )}

                {activeFormatTab === 'step_by_step' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-bold text-white mb-2">Step-by-Step Conceptual Breakdown</h3>
                    {explainData.step_by_step.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-gray-950 border border-gray-800 text-xs">
                        <span className="text-cyan-400 font-bold block mb-1">Step {idx + 1}</span>
                        <p className="text-gray-300">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeFormatTab === 'visual' && (
                  <div className="space-y-3">
                    <ConceptVisualizer topic={explainData.topic} />
                  </div>
                )}

                {activeFormatTab === 'worked_example' && explainData.worked_example && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3.5 rounded-lg bg-gray-950 border border-gray-800">
                      <span className="text-indigo-400 font-bold block mb-1">Problem Statement:</span>
                      <p className="text-white font-medium">{explainData.worked_example.problem}</p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-gray-950 border border-gray-800 space-y-2">
                      <span className="text-gray-400 font-bold block">Execution Walkthrough:</span>
                      {explainData.worked_example.walkthrough?.map((w, idx) => (
                        <div key={idx} className="text-gray-300 flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold">&bull;</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-lg bg-emerald-950/30 border border-emerald-500/40 text-emerald-200">
                      <span className="font-bold block text-emerald-300 mb-1">Verified Resolution:</span>
                      <p>{explainData.worked_example.solution}</p>
                    </div>
                  </div>
                )}

                {activeFormatTab === 'practice' && (
                  <div className="space-y-3 text-xs">
                    {explainData.practice_questions.map((pq, idx) => (
                      <div key={idx} className="p-3.5 rounded-lg bg-gray-950 border border-gray-800 space-y-1.5">
                        <span className="text-amber-400 font-bold block">Question #{idx + 1}:</span>
                        <p className="text-white">{pq.q}</p>
                        <span className="text-emerald-400 font-bold block mt-2">Answer &amp; Rubric:</span>
                        <p className="text-gray-300">{pq.a}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeFormatTab === 'real_world' && (
                  <div className="space-y-3 text-xs">
                    <h3 className="text-base font-bold text-white mb-2">Real-World Industrial &amp; Hardware Applications</h3>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                      {explainData.real_world_application}
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Action: Proceed to LumiLearn Practise */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-indigo-950/40 to-cyan-950/40 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-white">Ready to test your comprehension?</h4>
                  <p className="text-xs text-gray-400">
                    Take the diagnostic assessment in LumiLearn to detect any underlying misconceptions.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  {onStartRepairSession && (
                    <button
                      onClick={() => onStartRepairSession('c_loops_termination')}
                      className="px-3.5 py-2 rounded-lg bg-indigo-900/60 hover:bg-indigo-800 text-indigo-200 text-xs font-bold border border-indigo-500/40"
                    >
                      Guided Repair Session
                    </button>
                  )}
                  <button
                    onClick={() => onNavigateToLumiLearn('c_loops_termination')}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-indigo-500/20"
                  >
                    <span>Practise in LumiLearn</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
