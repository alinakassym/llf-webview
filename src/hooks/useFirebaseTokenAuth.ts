// llf-webview/src/hooks/useFirebaseTokenAuth.ts

import { useState, useEffect } from "react";
import { getAuth, signInWithCustomToken } from "firebase/auth";
import { app } from "../firebaseConfig";

const auth = getAuth(app);

export const useFirebaseTokenAuth = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticateWithFirebaseToken = async () => {
      try {
        // Получаем firebaseToken из hash (#firebase_token=...)
        const hash = window.location.hash;

        if (hash && hash.includes("firebase_token=")) {
          // Парсим hash
          const params = new URLSearchParams(hash.substring(1)); // убираем # в начале
          const firebaseToken = params.get("firebase_token");

          if (firebaseToken) {
            // Авторизуемся с токеном (не сохраняем в localStorage!)
            await signInWithCustomToken(auth, firebaseToken);

            // Очищаем hash из URL для безопасности
            window.history.replaceState(null, "", window.location.pathname);
          }
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
