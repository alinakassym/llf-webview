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
        // Получаем firebaseToken из query параметра (?firebase_token=...)
        // Safari не передаёт hash в iframe, поэтому используем query
        const searchParams = new URLSearchParams(window.location.search);
        const firebaseToken = searchParams.get("firebase_token");

        if (firebaseToken) {
          // Авторизуемся с токеном (не сохраняем в localStorage!)
          await signInWithCustomToken(auth, firebaseToken);

          // Очищаем query параметр из URL для безопасности
          window.history.replaceState(null, "", window.location.pathname);
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
