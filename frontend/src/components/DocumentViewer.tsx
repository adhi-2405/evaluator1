import React, { useState } from 'react';
import { BookOpen, FileText, ChevronLeft, ChevronRight, AlertTriangle, Trash2, CheckCircle2 } from 'lucide-react';
import type { LessonDetail } from '../types';

interface DocumentViewerProps {
  document: LessonDetail | null;
  activeCitationPage?: number | null;
  highlightPassage?: string | null;
  onSelectPage: (page: number) => void;
  onDeleteDocument?: (docId: number) => void;
  onClose?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  activeCitationPage,
  highlightPassage,
  onSelectPage,
  onDeleteDocument,
  onClose
}) => {
  const [currentPage, setCurrentPage] = useState<number>(activeCitationPage || 1);

  if (!document) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-900/60 rounded-xl border border-gray-800">
        <BookOpen className="w-12 h-12 text-gray-600 mb-3" />
        <h3 className="text-base font-bold text-gray-300">No Document Selected</h3>
        <p className="text-xs text-gray-500 max-w-xs mt-1">
          Upload a PDF or select a textbook chapter to read side-by-side with AI explanations.
        </p>
      </div>
    );
  }

  const isOcrRequired = document.is_scanned_pdf || document.extraction_status === 'ocr_required';

  // Get chunks for current page
  const pageChunks = document.chunks?.filter((c) => c.page_number === currentPage) || [];

  return (
    <div className="flex flex-col h-full bg-gray-900/90 rounded-xl border border-gray-800 overflow-hidden shadow-xl">
      {/* Document Header */}
      <div className="p-4 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="truncate">
            <h3 className="text-sm font-bold text-white truncate" title={document.title}>
              {document.title}
            </h3>
            <span className="text-[11px] text-gray-400">
              {document.page_count} Pages &bull; {document.language}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 shrink-0">
          {document.is_owner && onDeleteDocument && (
            <button
              onClick={() => {
                if (confirm(`Delete '${document.title}' and associated index?`)) {
                  onDeleteDocument(document.id);
                }
              }}
              className="p-1.5 rounded text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="px-2 py-1 text-xs text-gray-400 hover:text-white rounded bg-gray-800"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Scanned PDF Warning Banner */}
      {isOcrRequired && (
        <div className="p-3 bg-amber-950/40 border-b border-amber-500/30 text-xs text-amber-200 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold">OCR Required (Scanned PDF Detected)</strong>
            <span>
              This file does not have an embedded machine-readable text layer. High-accuracy OCR is required to extract paragraphs from graphic scans.
            </span>
          </div>
        </div>
      )}

      {/* Page Navigation Toolbar */}
      <div className="px-4 py-2 bg-gray-950/40 border-b border-gray-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              const p = Math.max(1, currentPage - 1);
              setCurrentPage(p);
              onSelectPage(p);
            }}
            disabled={currentPage <= 1}
            className="p-1 rounded hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-semibold px-2 text-gray-300">
            Page {currentPage} of {document.page_count}
          </span>
          <button
            onClick={() => {
              const p = Math.min(document.page_count, currentPage + 1);
              setCurrentPage(p);
              onSelectPage(p);
            }}
            disabled={currentPage >= document.page_count}
            className="p-1 rounded hover:bg-gray-800 disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <span className="text-gray-400 text-[11px]">
          {pageChunks.length} Segment(s) Extracted
        </span>
      </div>

      {/* Document Text Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4 font-serif text-sm leading-relaxed text-gray-300 select-text">
        {pageChunks.length > 0 ? (
          pageChunks.map((chunk) => {
            const isHighlighted = highlightPassage && chunk.content.includes(highlightPassage.slice(0, 30));
            return (
              <div
                key={chunk.id}
                className={`p-3.5 rounded-lg border transition-all ${
                  isHighlighted
                    ? 'bg-indigo-950/50 border-indigo-500 shadow-md ring-1 ring-indigo-400'
                    : 'bg-gray-950/40 border-gray-800/80 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-sans text-gray-400 mb-2 border-b border-gray-800/60 pb-1">
                  <span className="font-bold text-indigo-300">
                    {chunk.section_title || `Page ${chunk.page_number} Passage`}
                  </span>
                  <span className="text-[10px] text-gray-400">{chunk.token_count} words</span>
                </div>
                <p className="whitespace-pre-wrap">{chunk.content}</p>
              </div>
            );
          })
        ) : (
          <div className="text-center py-12 text-gray-500 font-sans text-xs">
            {document.content
              ? document.content.slice(0, 800) + '...'
              : 'No extracted text found on this page.'}
          </div>
        )}
      </div>

      {/* Grounding Footer Notice */}
      <div className="p-2.5 bg-gray-950 border-t border-gray-800 text-[11px] text-gray-400 flex items-center justify-between">
        <span className="flex items-center space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Active Grounding Source</span>
        </span>
        <span className="text-gray-400 text-[10px]">Indexed for Instant Local Retrieval</span>
      </div>
    </div>
  );
};
