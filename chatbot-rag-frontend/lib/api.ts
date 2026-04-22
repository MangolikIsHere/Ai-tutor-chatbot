const API_BASE    = 'https://ai-tutor-chatbot-6eid.onrender.com';
const API_TIMEOUT = 30_000; // 30 seconds

export interface ChatRequest {
  message:    string;
  session_id: string | null;
}

export interface ChatResponse {
  response:   string;
  rag_used?:  boolean;
  session_id: string;   // ← server always echoes this back
}

export interface UploadResponse {
  message:    string;
  session_id: string;
  chunks:     number;
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

// ─── Chat ─────────────────────────────────────────────────────────────────────

export async function sendMessage(request: ChatRequest): Promise<ChatResponse> {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(request),
      signal:  controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        throw new APIError(
          errorData.detail || `Rate limited. Please wait${retryAfter ? ` ${retryAfter}s` : ''} and retry.`,
          429,
          errorData
        );
      }
      throw new APIError(
        errorData.detail || `API error: ${response.status}`,
        response.status,
        errorData
      );
    }

    return (await response.json()) as ChatResponse;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof APIError) throw error;
    if (error instanceof TypeError && error.message.includes('fetch'))
      throw new APIError('Failed to connect to the server. Make sure the backend is running.', undefined, error);
    if (error instanceof DOMException && error.name === 'AbortError')
      throw new APIError('Request timed out. The server took too long to respond.', undefined, error);
    throw new APIError('An unexpected error occurred. Please try again.', undefined, error);
  }
}

// ─── PDF Upload ───────────────────────────────────────────────────────────────

export async function uploadPDF(
  file: File,
  onProgress?: (pct: number) => void
): Promise<UploadResponse> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();

    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as UploadResponse);
        } catch {
          reject(new APIError('Invalid response from server after upload.'));
        }
      } else {
        let detail = `Upload failed (${xhr.status})`;
        try { detail = JSON.parse(xhr.responseText).detail || detail; } catch { /* ignore */ }
        reject(new APIError(detail, xhr.status));
      }
    });

    xhr.addEventListener('error',   () => reject(new APIError('Network error during upload. Please try again.')));
    xhr.addEventListener('timeout', () => reject(new APIError('Upload timed out. Please try a smaller file.')));

    xhr.timeout = 120_000; // 2 min — first upload triggers model download
    xhr.open('POST', `${API_BASE}/upload`);
    xhr.send(formData);
  });
}
