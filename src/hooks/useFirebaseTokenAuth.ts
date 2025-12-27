// llf-webview/src/hooks/useFirebaseTokenAuth.ts

import { useState, useEffect } from "react";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app } from "../firebaseConfig";

const auth = getAuth(app);
const FIREBASE_TOKEN_KEY = "firebase_token";

export const useFirebaseTokenAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateWithFirebaseToken = async () => {
      try {
        // Получаем firebaseToken из hash (#firebase_token=...)
        const hash = window.location.hash;

        let firebaseToken: string | null = null;

        if (hash && hash.includes("firebase_token=")) {
          // Парсим hash
          const params = new URLSearchParams(hash.substring(1)); // убираем # в начале
          const tokenFromHash = params.get("firebase_token");

          if (tokenFromHash) {
            firebaseToken = tokenFromHash;

            // Сохраняем токен в localStorage
            localStorage.setItem(FIREBASE_TOKEN_KEY, tokenFromHash);

            // Очищаем hash из URL для безопасности
            window.history.replaceState(null, "", window.location.pathname);
          }
        } else {
          // Пытаемся получить из localStorage
          firebaseToken = localStorage.getItem(FIREBASE_TOKEN_KEY);
        }

        // Если токен найден - авторизуемся
        if (firebaseToken) {
          await signInWithCustomToken(auth, firebaseToken);
        }

        setLoading(false);
      } catch (err) {
        console.error("Firebase authentication error:", err);
        setError(
          err instanceof Error ? err.message : "Authentication failed",
        );
        setLoading(false);
      }
    };

    authenticateWithFirebaseToken();
  }, []);

  return { loading, error };
};
