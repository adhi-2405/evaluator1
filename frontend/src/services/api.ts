import type {
  ExplainResponse,
  QuestionItem,
  AssessResponse,
  SimulationExecuteResponse,
  ProgressOverviewResponse,
  TeacherAnalyticsResponse,
  MistakeNotebookItem,
  TeachBackResponse,
  RepairSession,
  DailyRevisionItem,
  PrerequisiteInfo,
  LessonItem,
  LessonDetail
} from '../types';

const API_BASE = '/api';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem('eduverse_token'),
  setToken: (token: string) => localStorage.setItem('eduverse_token', token),
  clearToken: () => localStorage.removeItem('eduverse_token'),
  getUserRole: (): string => localStorage.getItem('eduverse_role') || 'student',
  setUserRole: (role: string) => localStorage.setItem('eduverse_role', role)
};

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = authStorage.getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // If unauthorized, token might be invalid/expired
    console.warn('[API] Session token rejected.');
  }

  return response;
}

export const api = {
  // --- Auth ---
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    authStorage.setToken(data.access_token);
    authStorage.setUserRole(data.user.role);
    return data;
  },

  async register(username: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    authStorage.setToken(data.access_token);
    authStorage.setUserRole(data.user.role);
    return data;
  },

  async demoLogin(role: 'student' | 'teacher' = 'student') {
    const res = await fetch(`${API_BASE}/auth/demo-login?role=${role}`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Demo login failed');
    const data = await res.json();
    authStorage.setToken(data.access_token);
    authStorage.setUserRole(data.user.role);
    return data;
  },

  async getMe() {
    const res = await fetchWithAuth(`${API_BASE}/auth/me`);
    if (!res.ok) return null;
    return res.json();
  },

  logout() {
    authStorage.clearToken();
  },

  // --- Lessons & Books ---
  async getLessons(): Promise<LessonItem[]> {
    const res = await fetchWithAuth(`${API_BASE}/lessons/`);
    if (!res.ok) throw new Error('Failed to fetch lessons');
    return res.json();
  },

  async getLessonDetails(lessonId: number): Promise<LessonDetail> {
    const res = await fetchWithAuth(`${API_BASE}/lessons/${lessonId}`);
    if (!res.ok) throw new Error('Failed to fetch document details');
    return res.json();
  },

  async uploadLesson(file: File, title?: string, gradeLevel?: string, language?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (gradeLevel) formData.append('grade_level', gradeLevel);
    if (language) formData.append('language', language);

    const res = await fetchWithAuth(`${API_BASE}/lessons/upload`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to upload document' }));
      throw new Error(err.detail || 'Failed to upload document');
    }
    return res.json();
  },

  async deleteLesson(lessonId: number) {
    const res = await fetchWithAuth(`${API_BASE}/lessons/${lessonId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete document');
    return res.json();
  },

  // --- LearnMorph ---
  async explain(params: {
    topic: string;
    content?: string;
    document_id?: number;
    selected_page?: number;
    education_level?: string;
    preferred_format?: string;
    language?: string;
    detail_level?: string;
  }): Promise<ExplainResponse> {
    const res = await fetchWithAuth(`${API_BASE}/learnmorph/explain`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to generate explanation');
    return res.json();
  },

  // --- LumiLearn ---
  async getQuestion(conceptId: string, isReassessment: boolean = false): Promise<QuestionItem> {
    const res = await fetchWithAuth(`${API_BASE}/lumilearn/question?concept_id=${conceptId}&reassess=${isReassessment}`);
    if (!res.ok) throw new Error('Failed to load assessment question');
    return res.json();
  },

  async assessAnswer(params: {
    concept_id: string;
    question_id: string;
    student_answer: string;
    reasoning?: string;
    confidence_rating: number;
    is_reassessment?: boolean;
  }): Promise<AssessResponse> {
    const res = await fetchWithAuth(`${API_BASE}/lumilearn/assess`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Assessment failed' }));
      throw new Error(err.detail || 'Assessment failed');
    }
    return res.json();
  },

  // --- ConceptVerse ---
  async runSimulation(params: {
    simulation_type: string;
    concept_id: string;
    variables: Record<string, any>;
    student_predictions?: Record<string, any>;
    student_observations?: string;
  }): Promise<SimulationExecuteResponse> {
    const res = await fetchWithAuth(`${API_BASE}/conceptverse/simulation`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Simulation failed to execute');
    return res.json();
  },

  async sendToLumiLearn(params: {
    simulation_type: string;
    concept_id: string;
    variables: Record<string, any>;
    student_predictions?: Record<string, any>;
    student_observations?: string;
  }) {
    const res = await fetchWithAuth(`${API_BASE}/conceptverse/send-to-lumilearn`, {
      method: 'POST',
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error('Failed to record simulation telemetry');
    return res.json();
  },

  // --- Learning & Progress ---
  async getProgress(): Promise<ProgressOverviewResponse> {
    const res = await fetchWithAuth(`${API_BASE}/learning/progress`);
    if (!res.ok) throw new Error('Failed to fetch progress');
    return res.json();
  },

  async getRecommendations() {
    const res = await fetchWithAuth(`${API_BASE}/learning/recommendations`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  // --- Teacher Dashboard ---
  async getTeacherAnalytics(demoMode: boolean = false): Promise<TeacherAnalyticsResponse> {
    const res = await fetchWithAuth(`${API_BASE}/teacher/analytics?demo_mode=${demoMode}`);
    if (!res.ok) throw new Error('Failed to fetch teacher analytics');
    return res.json();
  },

  async exportReport() {
    const res = await fetchWithAuth(`${API_BASE}/teacher/export-report`);
    if (!res.ok) throw new Error('Failed to export report');
    return res.json();
  },

  // --- Mistake Notebook ---
  async getMistakes(conceptId?: string, statusFilter?: string): Promise<MistakeNotebookItem[]> {
    let url = `${API_BASE}/features/mistakes`;
    const params = new URLSearchParams();
    if (conceptId) params.append('concept_id', conceptId);
    if (statusFilter) params.append('status_filter', statusFilter);
    if (params.toString()) url += `?${params.toString()}`;

    const res = await fetchWithAuth(url);
    if (!res.ok) throw new Error('Failed to fetch mistake notebook');
    return res.json();
  },

  async resolveMistake(mistakeId: number, correctedReasoning: string): Promise<MistakeNotebookItem> {
    const res = await fetchWithAuth(`${API_BASE}/features/mistakes/${mistakeId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ corrected_reasoning: correctedReasoning })
    });
    if (!res.ok) throw new Error('Failed to resolve mistake');
    return res.json();
  },

  async getMistakeRetry(mistakeId: number) {
    const res = await fetchWithAuth(`${API_BASE}/features/mistakes/${mistakeId}/retry`);
    if (!res.ok) throw new Error('Failed to fetch retry question');
    return res.json();
  },

  // --- Teach-Back Mode ---
  async evaluateTeachBack(conceptId: string, explanation: string): Promise<TeachBackResponse> {
    const res = await fetchWithAuth(`${API_BASE}/features/teach-back/evaluate`, {
      method: 'POST',
      body: JSON.stringify({ concept_id: conceptId, explanation })
    });
    if (!res.ok) throw new Error('Failed to evaluate teach-back');
    return res.json();
  },

  // --- Connected Learning Repair Session ---
  async startRepairSession(conceptId: string): Promise<RepairSession> {
    const res = await fetchWithAuth(`${API_BASE}/features/repair/start`, {
      method: 'POST',
      body: JSON.stringify({ concept_id: conceptId })
    });
    if (!res.ok) throw new Error('Failed to start repair session');
    return res.json();
  },

  async getActiveRepairSession(): Promise<RepairSession | null> {
    const res = await fetchWithAuth(`${API_BASE}/features/repair/active`);
    if (!res.ok) return null;
    return res.json();
  },

  async updateRepairStep(sessionId: number, stepNumber: number, stepPayload: Record<string, any>): Promise<RepairSession> {
    const res = await fetchWithAuth(`${API_BASE}/features/repair/${sessionId}/step`, {
      method: 'PUT',
      body: JSON.stringify({ step_number: stepNumber, step_payload: stepPayload })
    });
    if (!res.ok) throw new Error('Failed to update repair step');
    return res.json();
  },

  // --- Daily Revision & Prerequisites ---
  async getDailyRevisionQueue(): Promise<DailyRevisionItem[]> {
    const res = await fetchWithAuth(`${API_BASE}/features/revision/queue`);
    if (!res.ok) throw new Error('Failed to fetch revision queue');
    return res.json();
  },

  async getPrerequisites(conceptId: string): Promise<PrerequisiteInfo[]> {
    const res = await fetchWithAuth(`${API_BASE}/features/prerequisites/${conceptId}`);
    if (!res.ok) throw new Error('Failed to fetch prerequisites');
    return res.json();
  },

  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  }
};
