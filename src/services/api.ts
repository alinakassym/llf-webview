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

    // Пытаемся получить тело ответа с сообщением об ошибке
    let errorData: unknown = null;
    try {
      const errorText = await response.text();
      if (errorText && errorText.trim().length > 0) {
        errorData = JSON.parse(errorText);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // Если не удалось распарсить, игнорируем
    }

    // Создаём ошибку с дополнительной информацией
    const error: unknown = new Error(
      typeof errorData === "object" &&
      errorData !== null &&
      "error" in errorData
        ? (errorData as { error: string }).error
        : `API Error: ${response.status} ${response.statusText}`,
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (error as any).response = {
      status: response.status,
      statusText: response.statusText,
      data: errorData,
    };

    throw error;
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
