import { useState, useEffect } from "react";

const WEBVIEW_TOKEN_KEY = "webview_auth_token";

export const useWebViewToken = () => {
  const [webViewToken, setWebViewToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Сначала пытаемся получить токен из localStorage
    const storedToken = localStorage.getItem(WEBVIEW_TOKEN_KEY);

    // Получаем токен из hash (#auth_token=...)
    // Hash не отправляется на сервер и безопаснее query параметров
    const hash = window.location.hash;

    if (hash && hash.includes("auth_token=")) {
      // Парсим hash
      const params = new URLSearchParams(hash.substring(1)); // убираем # в начале
      const tokenFromHash = params.get("auth_token");

      if (tokenFromHash) {
        // alert(`useWebViewToken - Токен получен из hash: ${tokenFromHash.substring(0, 30)}...`);

        // Сохраняем токен в state и localStorage
        setWebViewToken(tokenFromHash);
        localStorage.setItem(WEBVIEW_TOKEN_KEY, tokenFromHash);

        // ВАЖНО: Сразу очищаем hash из URL для безопасности
        // Это предотвращает утечку токена через history/referrer
        window.history.replaceState(null, "", window.location.pathname);
        // alert("useWebViewToken - Hash очищен из URL");

        setLoading(false);
        return;
      }
    }

    // Если токен не в hash, но есть в localStorage - используем его
    if (storedToken) {
      setWebViewToken(storedToken);
      setLoading(false);
      return;
    }

    // alert("useWebViewToken - Токен не найден в hash");
    setLoading(false);
  }, []);

  return { webViewToken, loading };
};
