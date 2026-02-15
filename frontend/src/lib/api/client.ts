// API Base Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface ApiResponse<T> {
    data?: T;
    error?: string;
}

class ApiClient {
    private baseUrl: string;
    private token: string | null = null;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
        // Load token from localStorage on init
        if (typeof window !== 'undefined') {
            this.token = localStorage.getItem('token');
        }
    }

    setToken(token: string | null) {
        this.token = token;
        if (typeof window !== 'undefined') {
            if (token) {
                localStorage.setItem('token', token);
            } else {
                localStorage.removeItem('token');
            }
        }
    }

    getToken(): string | null {
        return this.token;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (this.token) {
            (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
        }

        try {
            let cleanBaseUrl = this.baseUrl.trim().replace(/\/$/, '');

            // Si l'URL ne commence pas par http, on rajoute http:// par défaut
            if (cleanBaseUrl && !cleanBaseUrl.startsWith('http')) {
                cleanBaseUrl = `http://${cleanBaseUrl}`;
            }

            const cleanEndpoint = endpoint.replace(/^\//, '');
            const url = `${cleanBaseUrl}/${cleanEndpoint}`;


            const response = await fetch(url, {
                ...options,
                headers,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error || errorData.message || `Error: ${response.status}`;
                console.error(`[ApiClient] Error on ${url}:`, errorMessage);
                return { error: errorMessage };
            }

            const text = await response.text();
            if (!text || text.trim().length === 0) {
                return { data: undefined as T };
            }

            try {
                const data = JSON.parse(text);
                return { data };
            } catch (e) {
                console.error(`[ApiClient] Failed to parse JSON on ${url}:`, text);
                return { error: 'Invalid JSON response from server' };
            }
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Network error'
            };
        }
    }

    async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET', headers });
    }

    async post<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
            headers
        });
    }

    async patch<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PATCH',
            body: body ? JSON.stringify(body) : undefined,
            headers
        });
    }

    async put<T>(endpoint: string, body?: unknown, headers?: Record<string, string>): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
            headers
        });
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);
export default api;
