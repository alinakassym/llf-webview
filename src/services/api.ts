const API_BASE_URL = "https://api.steppe.dev/scoreapp/api";

interface ApiRequestOptions extends RequestInit {
  token?: string;
}

// Глобальный callback для обработки 401 ошибок
let onUnauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
  onUnauthorizedCallback = callback;
};

export const apiRequest = async <T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> => {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    // Обработка 401 ошибки (Unauthorized)
    if (response.status === 401 && onUnauthorizedCallback) {
      onUnauthorizedCallback();
    }
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  // Если ответ пустой (например, DELETE запрос), не пытаемся парсить JSON
  const contentLength = response.headers.get("Content-Length");
  if (response.status === 204 || contentLength === "0") {
    return {} as T;
  }

  // Получаем текст ответа и проверяем, не пустой ли он
  const text = await response.text();
  if (!text || text.trim().length === 0) {
    return {} as T;
  }

  return JSON.parse(text);
};
