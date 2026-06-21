const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  public getUser(): any | null {
    if (typeof window !== 'undefined') {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    }
    return null;
  }

  public setUser(user: any): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {};
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (err: any) {
      throw new Error(`Connection failed. Please verify that the backend server is running. Details: ${err.message}`);
    }

    let data: any = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (jsonErr) {
        console.error('Error parsing JSON:', jsonErr);
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/?message=session_expired';
        }
      }
      let errMsg = 'Something went wrong.';
      if (data && data.error) {
        if (typeof data.error === 'string') {
          errMsg = data.error;
        } else if (typeof data.error === 'object') {
          errMsg = data.error.message || JSON.stringify(data.error);
        }
      } else if (response.status === 404) {
        errMsg = `API endpoint not found (404). Please check that NEXT_PUBLIC_API_URL is configured correctly.`;
      } else {
        errMsg = `Server error (${response.status}): ${response.statusText || 'Internal Server Error'}`;
      }
      // If error message is an empty object or stringified empty object, clean it to default fallback
      if (
        !errMsg ||
        errMsg.trim() === '' ||
        errMsg.trim() === '{}' ||
        errMsg.trim() === '[object Object]' ||
        errMsg.trim() === '{"message":"{}"}' ||
        errMsg.trim() === '{"message":{}}'
      ) {
        errMsg = 'Something went wrong.';
      }
      throw new Error(errMsg);
    }

    return data || {};
  }

  // GET Request helper
  public async get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST Request helper
  public async post(endpoint: string, body: any, isMultipart = false): Promise<any> {
    const headers: HeadersInit = {};
    let reqBody: any;

    if (isMultipart) {
      reqBody = body;
    } else {
      headers['Content-Type'] = 'application/json';
      reqBody = JSON.stringify(body);
    }

    return this.request(endpoint, {
      method: 'POST',
      headers,
      body: reqBody
    });
  }

  // PUT Request helper
  public async put(endpoint: string, body?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
  }

  // DELETE Request helper
  public async delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }

  // DELETE Request helper with body support (e.g. password confirm)
  public async deleteWithBody(endpoint: string, body?: any): Promise<any> {
    return this.request(endpoint, {
      method: 'DELETE',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined
    });
  }
}

export const api = new ApiClient();

// Auth Endpoints
export const authApi = {
  register: (body: any) => api.post('/auth/register', body),
  verifyOtp: (body: any) => api.post('/auth/verify-otp', body),
  login: (body: any) => api.post('/auth/login', body),
  oauth: (body: any) => api.post('/auth/oauth', body),
  me: () => api.get('/auth/me'),
  getDashboardStats: () => api.get('/auth/dashboard'),
  updateProfile: (body: any) => api.put('/auth/profile', body),
  uploadAvatar: (formData: FormData) => api.post('/auth/upload-avatar', formData, true),
  changePassword: (body: any) => api.put('/auth/change-password', body),
  forgotPassword: (body: any) => api.post('/auth/forgot-password', body),
  resetPassword: (body: any) => api.post('/auth/reset-password', body),
  deleteAccount: (body: any) => api.deleteWithBody('/auth/delete-account', body),
  clearAllHistory: () => api.delete('/auth/clear-all-history')
};

// ATS & Skill Gap Endpoints
export const atsApi = {
  analyzeResume: (formData: FormData) => api.post('/ats/analyze', formData, true),
  analyzeSkillGap: (body: any) => api.post('/ats/skill-gap', body),
  getHistory: () => api.get('/ats/history'),
  getSkillGapHistory: () => api.get('/ats/skill-gap/history'),
  deleteReport: (id: string) => api.delete(`/ats/reports/${id}`),
  bulkDeleteReports: (ids: string[]) => api.post('/ats/reports/bulk-delete', { ids }),
  deleteSkillGapReport: (id: string) => api.delete(`/ats/skill-gap/${id}`),
  bulkDeleteSkillGapReports: (ids: string[]) => api.post('/ats/skill-gap/bulk-delete', { ids }),
  optimizeResume: (reportId: string, body?: any) => api.post(`/ats/reports/${reportId}/optimize`, body || {}),
  downloadOptimizedResumeUrl: (reportId: string, format?: string) => `${API_BASE_URL}/ats/reports/${reportId}/download-optimized?format=${format || 'pdf'}`,
  getJobProfile: (id: string) => api.get(`/ats/job-profile/${id}`)
};

// Roadmap Endpoints
export const roadmapApi = {
  generate: (body: any) => api.post('/roadmap/generate', body),
  list: () => api.get('/roadmap'),
  getById: (id: string) => api.get(`/roadmap/${id}`),
  deleteRoadmap: (id: string) => api.delete(`/roadmap/${id}`),
  bulkDeleteRoadmaps: (ids: string[]) => api.post('/roadmap/bulk-delete', { ids }),
  toggleRoadmapStatus: (id: string) => api.put(`/roadmap/${id}/toggle-status`, {}),
  updateRoadmapProgress: (id: string, body: any) => api.put(`/roadmap/${id}/progress`, body),
  updateRoadmapStatus: (id: string, status: string) => api.put(`/roadmap/${id}/status`, { status }),
  downloadUrl: (id: string, format: string) => `${API_BASE_URL}/roadmap/${id}/download?format=${format}`,
  getTopicExplanation: (id: string, topicName: string) => api.get(`/roadmap/${id}/topics/${encodeURIComponent(topicName)}`),
  submitProject: (id: string, week: number, body: { githubUrl: string; deploymentUrl: string }) => api.post(`/roadmap/${id}/projects/${week}/submit`, body),
  addProjectToResume: (id: string, week: number) => api.post(`/roadmap/${id}/projects/${week}/add-to-resume`, {})
};

// Mock Interview Endpoints
export const interviewApi = {
  start: (body: any) => api.post('/interviews/start', body),
  submitAnswer: (sessionId: string, formData: FormData) => api.post(`/interviews/${sessionId}/answer`, formData, true),
  complete: (sessionId: string) => api.post(`/interviews/${sessionId}/complete`, {}),
  getHistory: () => api.get('/interviews/history'),
  getReport: (sessionId: string) => api.get(`/interviews/${sessionId}/report`),
  deleteSession: (id: string) => api.delete(`/interviews/sessions/${id}`),
  bulkDeleteSessions: (ids: string[]) => api.post('/interviews/sessions/bulk-delete', { ids }),
  downloadReportUrl: (sessionId: string, format: string) => `${API_BASE_URL}/interviews/${sessionId}/download?format=${format}`,
  getPublicReport: (sessionId: string) => api.get(`/interviews/public/report/${sessionId}`)
};

// Admin Endpoints
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  listUsers: () => api.get('/admin/users'),
  updateUserRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  updateUserStatus: (id: string, status: string) => api.put(`/admin/users/${id}/status`, { status }),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  resetUserPassword: (id: string, body: any) => api.put(`/admin/users/${id}/reset-password`, body),
  getUserReports: (id: string) => api.get(`/admin/users/${id}/reports`),
  getUserActivity: (id: string) => api.get(`/admin/users/${id}/activity`),
  
  getQuestions: (params?: any) => {
    let query = '';
    if (params) {
      const q = new URLSearchParams(params).toString();
      query = `?${q}`;
    }
    return api.get(`/admin/questions${query}`);
  },
  addQuestion: (body: any) => api.post('/admin/questions', body),
  editQuestion: (id: string, body: any) => api.put(`/admin/questions/${id}`, body),
  deleteQuestion: (id: string) => api.delete(`/admin/questions/${id}`),
  duplicateQuestion: (id: string) => api.post(`/admin/questions/duplicate/${id}`, {}),
  archiveQuestion: (id: string, body: any) => api.put(`/admin/questions/${id}/archive`, body),
  bulkUploadQuestions: (questions: any[]) => api.post('/admin/questions/bulk-upload', { questions }),
  aiGenerateQuestions: (body: any) => api.post('/admin/questions/generate', body),
  bulkSaveQuestions: (questions: any[]) => api.post('/admin/questions/bulk-save', { questions }),
  
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (body: any) => api.put('/admin/settings', body),
  getAuditLogs: (params?: any) => {
    let query = '';
    if (params) {
      const q = new URLSearchParams(params).toString();
      query = `?${q}`;
    }
    return api.get(`/admin/audit-logs${query}`);
  },
  getAiMonitoring: () => api.get('/admin/ai-monitoring'),
  addAdmin: (body: any) => api.post('/admin/admins', body),
  removeAdmin: (id: string) => api.delete(`/admin/admins/${id}`),
  
  getAnalytics: () => api.get('/admin/analytics')
};

// Notification Endpoints
export const notificationApi = {
  list: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all')
};
