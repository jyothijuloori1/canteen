// Canteen Backend SDK Client (Base44 alternative)
// Auto-generated API client for entity operations

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

class EntityClient {
  constructor(private entityName: string) {}

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;
    
    let url = `${API_BASE_URL}/entities/${this.entityName}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      }
      if (searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
    }

    const token = localStorage.getItem('auth_token');
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // List all entities (with optional filtering, sorting, pagination)
  async list(sort?: string, limit?: number): Promise<any[]> {
    const params: Record<string, any> = {};
    if (sort) params.sort = sort;
    if (limit) params.limit = limit;
    
    return this.request<any[]>('', { params });
  }

  // Filter entities
  async filter(filters: Record<string, any>, sort?: string, limit?: number): Promise<any[]> {
    const params: Record<string, any> = { ...filters };
    if (sort) params.sort = sort;
    if (limit) params.limit = limit;
    
    return this.request<any[]>('', { params });
  }

  // Get single entity by ID
  async get(id: string): Promise<any> {
    return this.request<any>(`/${id}`);
  }

  // Create entity
  async create(data: any): Promise<any> {
    return this.request<any>('', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Bulk create
  async bulkCreate(items: any[]): Promise<any[]> {
    return this.request<any[]>(`/bulk`, {
      method: 'POST',
      body: JSON.stringify(items),
    });
  }

  // Update entity
  async update(id: string, data: any): Promise<any> {
    return this.request<any>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete entity
  async delete(id: string): Promise<void> {
    return this.request<void>(`/${id}`, {
      method: 'DELETE',
    });
  }

  // Get schema
  async schema(): Promise<any> {
    return this.request<any>('/schema');
  }
}

class AuthClient {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async register(email: string, password: string, full_name: string): Promise<{ token: string; user: any }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data;
  }

  async me(): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        throw new Error('Session expired');
      }
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Failed to get user');
    }

    return response.json();
  }

  async updateMe(data: any): Promise<any> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Update failed');
    }

    return response.json();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/is-authenticated`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    window.location.href = '/login';
  }

  redirectToLogin(returnPath?: string): void {
    if (returnPath) {
      localStorage.setItem('return_path', returnPath);
    }
    window.location.href = '/login';
  }
}

class IntegrationClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/integrations${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async sendEmail(options: { to: string; subject: string; body: string; html?: string }): Promise<{ success: boolean; messageId?: string }> {
    return this.request('/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(options),
    });
  }

  async uploadFile(file: File): Promise<{ success: boolean; file_url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/integrations/upload-file`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  }
}

// Main client object (similar to base44)
export const canteen = {
  entities: {
    User: new EntityClient('User'),
    MenuItem: new EntityClient('MenuItem'),
    Order: new EntityClient('Order'),
    WalletTransaction: new EntityClient('WalletTransaction'),
    TopUpRequest: new EntityClient('TopUpRequest'),
    PaymentSettings: new EntityClient('PaymentSettings'),
    Notification: new EntityClient('Notification'),
  },
  auth: new AuthClient(),
  integrations: {
    Core: new IntegrationClient(),
  },
};

export default canteen;
