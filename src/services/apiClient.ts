import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api/v1';

type RequestOptions = Omit<AxiosRequestConfig, 'url' | 'baseURL' | 'data'> & {
  formData?: FormData;
  body?: BodyInit | string | null;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: 'application/json',
  },
});

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { formData, body, headers, ...init } = options;

  try {
    const response = await httpClient.request<T>({
      url: path,
      data: formData ?? body,
      headers: formData
        ? headers
        : {
            'Content-Type': 'application/json',
            ...headers,
          },
      ...init,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      const status = error.response?.status ?? 0;
      const data = error.response?.data;
      const apiMessage = data?.error?.message ?? data?.message;
      const message = Array.isArray(apiMessage)
        ? apiMessage.join(', ')
        : typeof data === 'string'
          ? data
          : typeof apiMessage === 'string'
            ? apiMessage
            : error.message;
      throw new ApiError(message, status);
    }
    throw error;
  }
}
