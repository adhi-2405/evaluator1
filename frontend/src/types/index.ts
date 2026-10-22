export interface CitationItem {
  document_id?: number;
  document_title: string;
  page_number?: number;
  section_title?: string;
  passage: string;
}

export interface ExplainResponse {
  topic: string;
  education_level: string;
  language: string;
  simple_explanation: string;
  step_by_step: string[];
  visual_diagram: string;
  worked_example: {
    problem: string;
    walkthrough: string[];
    solution: string;
  };
  practice_questions: Array<{ q: string; a: string }>;
  real_world_application: string;
  revision_notes: string[];
  regional_translation: string | null;
  sourced_facts: string[];
  citations?: CitationItem[];
  grounded_in_document?: boolean;
  is_live_llm: boolean;
  model_used: string;
}

export interface QuestionItem {
  question_id: string;
  concept_id: string;
  concept_name: string;
  question_text: string;
  code_snippet: string | null;
  options: string[];
  is_reassessment: boolean;
}

export interface AssessResponse {
  is_correct: boolean;
  evaluation_score: number;
  student_answer: string;
  expected_answer: string;
  misconception_detected: string | null;
  misconception_explanation: string | null;
  error_type: string | null;
  feedback: string;
  confidence_vs_accuracy_insight: string;
  follow_up_question: string | null;
  recommended_action: string;
  target_simulation_id: string | null;
  transparent_reasoning: string;
  reassessment_available: boolean;
  is_live_llm: boolean;
  new_mastery_score: number;
  status: string;
  evidence_count: number;
}

export interface SimulationStep {
  step_number: number;
  iteration: number;
  variable_state: Record<string, any>;
  condition_evaluated: string;
  condition_result: boolean;
  output_line: string | null;
  description: string;
}

export interface SimulationExecuteResponse {
  simulation_type: string;
  concept_id: string;
  steps: SimulationStep[];
  final_variables: Record<string, any>;
  total_iterations: number;
  outputs: string[];
  errors_detected: string[];
  prediction_accuracy: number | null;
  prediction_feedback: string | null;
  has_predictions: boolean;
  did_terminate: boolean;
  explanation: string;
}

export interface ConceptMastery {
  id?: number;
  concept_id: string;
  concept_name: string;
  mastery_score: number;
  demonstrated_mastery: number;
  calibration_score: number;
  attempts: number;
  correct_count: number;
  first_attempt_correct: number;
  reassessment_correct: number;
  unique_questions_tested: number;
  hints_used: number;
  confidence_avg: number;
  last_misconception: string | null;
  status: string;
  next_review_due: string | null;
  last_assessed_at: string | null;
}

export interface RecommendedActivity {
  activity_id: string;
  engine: string;
  title: string;
  description: string;
  concept_id: string;
  reason: string;
  action_url: string;
  priority: 'urgent' | 'recommended' | 'next_step';
}

export interface ProgressOverviewResponse {
  student_id: number;
  display_name: string;
  overall_mastery: number;
  demonstrated_mastery: number;
  calibration_score: number;
  concepts_mastered: number;
  total_concepts: number;
  total_assessments: number;
  average_confidence: number;
  accuracy_rate: number;
  masteries: ConceptMastery[];
  recent_assessments: Array<{
    id: number;
    concept_id: string;
    is_correct: boolean;
    confidence_rating: number;
    misconception_detected: string | null;
    error_type: string | null;
    is_reassessment: boolean;
    timestamp: string;
  }>;
  recommendations: RecommendedActivity[];
  is_demo: boolean;
}

export interface TeacherAnalyticsResponse {
  total_students: number;
  average_class_mastery: number;
  active_misconceptions: Array<{
    concept: string;
    misconception: string;
    students_affected: number;
    severity: string;
  }>;
  concept_breakdown: Array<{
    concept_id: string;
    concept_name: string;
    class_average: number;
    at_risk: number;
    mastered: number;
  }>;
  student_summaries: Array<{
    id: number;
    name: string;
    goal: string;
    overall_mastery: number;
    gap_concept: string;
    status: string;
  }>;
  suggested_revision_topics: Array<{
    topic: string;
    reason: string;
    recommended_action: string;
  }>;
  is_demo_dataset: boolean;
  evidence_notes?: string | null;
}

export interface MistakeNotebookItem {
  id: number;
  concept_id: string;
  concept_name: string;
  question_id: string;
  question_text: string;
  student_answer: string;
  expected_answer: string;
  error_type: string | null;
  misconception_name: string | null;
  ai_feedback: string;
  supporting_passage: string | null;
  corrected_reasoning: string | null;
  status: 'open' | 'resolved' | 'retry_pending';
  retry_count: number;
  created_at: string;
}

export interface TeachBackCheckpoint {
  checkpoint: string;
  status: 'demonstrated' | 'missing' | 'insufficient_detail';
}

export interface TeachBackResponse {
  concept_id: string;
  score: number;
  evaluation_reliability: 'reliable' | 'inconclusive';
  checkpoints_evaluated: TeachBackCheckpoint[];
  missing_points: string[];
  follow_up_question: string | null;
  ai_feedback: string;
}

export interface RepairSession {
  id: number;
  concept_id: string;
  topic_title: string;
  current_step: number;
  step_data: Record<string, any>;
  is_completed: boolean;
  scheduled_review_date: string | null;
  created_at: string;
}

export interface DailyRevisionItem {
  id: string;
  concept_id: string;
  concept_name: string;
  reason: string;
  urgency: 'due_today' | 'overdue' | 'review_mistake';
  recommended_mode: 'practise' | 'experiment' | 'learn';
}

export interface PrerequisiteInfo {
  concept_id: string;
  name: string;
  status: string;
  mastery_score: number;
  evidence: string;
}

export interface LessonItem {
  id: number;
  title: string;
  topic_key: string;
  grade_level: string;
  language: string;
  page_count: number;
  is_scanned_pdf: boolean;
  extraction_status: 'ready' | 'ocr_required' | 'error';
  created_at: string;
  is_owner: boolean;
}

export interface DocumentChunk {
  id: number;
  page_number: number;
  section_title: string;
  chunk_index: number;
  content: string;
  token_count: number;
}

export interface LessonDetail extends LessonItem {
  content: string;
  chunks: DocumentChunk[];
}
