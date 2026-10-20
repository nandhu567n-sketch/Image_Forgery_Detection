import type { ForensicResponse } from '../types/forensic';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export class ForensicApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'ForensicApiError';
    this.statusCode = statusCode;
  }
}

export async function detectForgery(file: File): Promise<ForensicResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let errorDetail = `Server error (${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          errorDetail = errorData.detail;
        }
      } catch {
        // Response body was not JSON
      }
      throw new ForensicApiError(errorDetail, response.status);
    }

    const data: ForensicResponse = await response.json();
    return data;
  } catch (err: any) {
    if (err instanceof ForensicApiError) {
      throw err;
    }
    throw new ForensicApiError(
      err.message || 'Network connection failed. Verify FastAPI server is active on port 8000.'
    );
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });
    return response.ok;
  } catch {
    return false;
  }
}
