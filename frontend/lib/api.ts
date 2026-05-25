import { supabase } from './supabaseClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function getHeaders() {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Check mock bypass first for offline local development
  const isMockBypassActive = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
                             process.env.NEXT_PUBLIC_SUPABASE_URL.includes("your-supabase-project-id");
  const mockUser = typeof window !== 'undefined' ? localStorage.getItem('mock_user') : null;

  if (isMockBypassActive && mockUser) {
    headers['Authorization'] = 'Bearer mock-access-token';
    return headers;
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }
  } catch (err) {
    console.warn("Failed to retrieve Supabase session:", err);
  }
  
  return headers;
}

export const api = {
  async get(endpoint: string) {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    return handleResponse(response);
  },

  async post(endpoint: string, body?: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
  },

  async put(endpoint: string, body?: any) {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return handleResponse(response);
  },

  async delete(endpoint: string) {
    const headers = await getHeaders();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    return handleResponse(response);
  },
};

async function handleResponse(response: Response) {
  const contentType = response.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = { success: false, error: await response.text() };
  }

  if (!response.ok) {
    return {
      success: false,
      data: null,
      error: data.error || response.statusText,
      status: response.status
    };
  }

  return data;
}
