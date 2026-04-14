const API_BASE = 'http://localhost:8000';
const API_TIMEOUT = 30000; // 30 seconds

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  response: string;
}

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || `API error: ${response.status}`,
        response.status,
        errorData
      );
    }

    const data = (await response.json()) as ChatResponse;
    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        'Failed to connect to the server. Make sure the backend is running at http://127.0.0.1:8000',
        undefined,
        error
      );
    }

    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new APIError(
        'Request timed out. The server took too long to respond.',
        undefined,
        error
      );
    }

    throw new APIError(
      'An unexpected error occurred. Please try again.',
      undefined,
      error
    );
  }
}
