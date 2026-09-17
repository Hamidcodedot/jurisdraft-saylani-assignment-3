const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

function getAuthHeader(): HeadersInit {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('prelegal_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface TemplateField {
  key: string;
  label: string;
  type: string;
  default?: any;
  placeholder?: string;
  description?: string;
}

export interface TemplateSummary {
  id: string;
  name: string;
  category: string;
  badge?: string;
  estimated_time?: string;
  file_name: string;
  description: string;
}

export interface TemplateDetail extends TemplateSummary {
  fields: TemplateField[];
  raw_content?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  extracted_fields?: Record<string, any>;
  timestamp?: string;
}

export interface ChatResponse {
  reply: string;
  extracted_fields: Record<string, any>;
  all_fields: Record<string, any>;
  completion_percentage: number;
  rendered_content: string;
  is_complete: boolean;
  suggested_replies: string[];
}

export interface DocumentItem {
  id: string;
  template_id: string;
  title: string;
  status: string;
  completion_percentage: number;
  created_at: string;
  updated_at?: string;
}

export interface DocumentDetail extends DocumentItem {
  user_id?: number;
  field_data: Record<string, any>;
  rendered_content: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  company_name?: string;
  is_active: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const api = {
  // Templates
  async getTemplates(): Promise<TemplateSummary[]> {
    const res = await fetch(`${API_BASE}/templates`);
    if (!res.ok) throw new Error('Failed to fetch templates catalog');
    return res.json();
  },

  async getTemplate(id: string): Promise<TemplateDetail> {
    const res = await fetch(`${API_BASE}/templates/${id}`);
    if (!res.ok) throw new Error(`Failed to load template ${id}`);
    return res.json();
  },

  async renderTemplate(id: string, fieldData: Record<string, any>) {
    const res = await fetch(`${API_BASE}/templates/${id}/render`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field_data: fieldData }),
    });
    if (!res.ok) throw new Error('Failed to render template');
    return res.json();
  },

  // AI Conversational Drafter
  async sendChatMessage(payload: {
    template_id: string;
    message: string;
    current_fields: Record<string, any>;
    history: ChatMessage[];
    document_id?: string;
  }): Promise<ChatResponse> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('AI drafting service failed to respond');
    return res.json();
  },

  // Documents (Vault & Persistence)
  async getMyDocuments(): Promise<DocumentItem[]> {
    const res = await fetch(`${API_BASE}/documents`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to load user documents');
    return res.json();
  },

  async getDocument(id: string): Promise<DocumentDetail> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Document not found or access denied');
    return res.json();
  },

  async createDocument(data: {
    template_id: string;
    title: string;
    field_data: Record<string, any>;
    rendered_content?: string;
  }): Promise<DocumentDetail> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save document');
    return res.json();
  },

  async updateDocument(id: string, data: {
    title?: string;
    field_data?: Record<string, any>;
    rendered_content?: string;
    status?: string;
  }): Promise<DocumentDetail> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update document');
    return res.json();
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to delete document');
  },

  async downloadDocumentPdf(id: string, filename: string): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}/pdf`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Failed to download PDF');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  async exportDirectPdf(
    markdownContent: string,
    title: string,
    signatures?: { partyA?: string | null; partyB?: string | null }
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/export-pdf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markdown_content: markdownContent,
        title,
        party_a_signature: signatures?.partyA || undefined,
        party_b_signature: signatures?.partyB || undefined,
      }),
    });
    if (!res.ok) throw new Error('Failed to export PDF');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Authentication
  async signup(data: { email: string; password: string; full_name: string; company_name?: string }): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = typeof err.detail === 'string' ? err.detail : (Array.isArray(err.detail) ? err.detail.map((d: any) => d.msg || d).join(', ') : 'Sign up failed');
      throw new Error(msg);
    }
    return res.json();
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msg = typeof err.detail === 'string' ? err.detail : (Array.isArray(err.detail) ? err.detail.map((d: any) => d.msg || d).join(', ') : 'Incorrect email or password');
      throw new Error(msg);
    }
    return res.json();
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    if (!res.ok) throw new Error('Unauthenticated');
    return res.json();
  },
};
