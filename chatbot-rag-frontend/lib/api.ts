const API_BASE = 'https://ai-tutor-chatbot-6eid.onrender.com';
const API_TIMEOUT = 30000; // 30 seconds

export interface ChatRequest {
  message: string;
  session_id: string;
}

export interface ChatResponse {
  response: string;
  rag_used?: boolean;
}

export interface UploadResponse {
  message: string;
  filename?: string;
  chunks?: number;
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

// ─── Chat ────────────────────────────────────────────────────────────────────

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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

    return (await response.json()) as ChatResponse;
  } catch (error) {
    if (error instanceof APIError) throw error;

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(
        'Failed to connect to the server. Make sure the backend is running.',
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

    throw new APIError('An unexpected error occurred. Please try again.', undefined, error);
  }
}

// ─── Document Upload ─────────────────────────────────────────────────────────

export async function uploadDocument(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    // Progress tracking
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadResponse);
        } catch {
          resolve({ message: 'Document uploaded successfully.' });
        }
      } else {
        let detail = `Upload failed (${xhr.status})`;
        try {
          const body = JSON.parse(xhr.responseText);
          detail = body.detail || detail;
        } catch {
          /* ignore */
        }
        reject(new APIError(detail, xhr.status));
      }
    });

    xhr.addEventListener('error', () =>
      reject(new APIError('Network error during upload. Please try again.'))
    );

    xhr.addEventListener('timeout', () =>
      reject(new APIError('Upload timed out. Please try a smaller file.'))
    );

    xhr.timeout = 60000; // 60 s for uploads
    xhr.open('POST', `${API_BASE}/upload`);
    xhr.send(formData);
  });
}
