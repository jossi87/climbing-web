export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly url: string,
    public readonly details?: string,
  ) {
    super(details?.trim() || `HTTP ${status} ${statusText} for ${url}`);
    this.name = 'HttpError';
  }
}

export function isHttpError(error: unknown, status?: number): error is HttpError {
  if (!(error instanceof HttpError)) return false;
  if (status == null) return true;
  return error.status === status;
}

function parseErrorPayload(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;
  const candidate = data as { message?: unknown; error?: unknown };
  if (typeof candidate.message === 'string' && candidate.message.trim()) return candidate.message;
  if (typeof candidate.error === 'string' && candidate.error.trim()) return candidate.error;
  return undefined;
}

export async function createHttpErrorFromResponse(response: Response, url: string): Promise<HttpError> {
  let details: string | undefined;
  const contentType = response.headers.get('content-type') ?? '';
  try {
    if (contentType.includes('application/json')) {
      const json = (await response.json()) as unknown;
      details = parseErrorPayload(json);
    } else {
      const text = (await response.text()).trim();
      if (text) details = text;
    }
  } catch {
    // Ignore parse failures and keep status-based fallback.
  }

  return new HttpError(response.status, response.statusText, url, details);
}

export function getUserFriendlyHttpErrorMessage(error: HttpError): string {
  switch (error.status) {
    case 400:
      return error.details || 'The request was invalid. Please check your input and try again.';
    case 401:
      return 'You need to sign in to access this page.';
    case 403:
      return 'You do not have permission to access this page.';
    case 404:
      return 'The requested page was not found.';
    default:
      if (error.status >= 500) return 'The server encountered an error. Please try again shortly.';
      return error.details || 'Something went wrong while loading this page.';
  }
}
