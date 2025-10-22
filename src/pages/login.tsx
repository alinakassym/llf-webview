import { type FC, useState, useMemo, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../firebaseConfig";

const auth = getAuth(app);

const LoginPage: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const styles = useMemo(
    () => ({
      page: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: 16,
      },
      form: {
        width: "100%",
        maxWidth: 400,
        display: "flex",
        flexDirection: "column" as const,
        gap: 16,
      },
      title: {
        margin: "0 0 24px 0",
        fontSize: 24,
        textAlign: "center" as const,
      },
      input: {
        padding: 12,
        fontSize: 16,
        border: "1px solid #ddd",
        borderRadius: 4,
        outline: "none",
      },
      button: {
        padding: 12,
        fontSize: 16,
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
        opacity: 1,
      },
      buttonDisabled: {
        opacity: 0.6,
        cursor: "not-allowed",
      },
      error: {
        padding: 12,
        backgroundColor: "#fee",
        color: "#c33",
        borderRadius: 4,
        fontSize: 14,
      },
    }),
    [],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Произошла ошибка при входе");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h1 style={styles.title}>Вход</h1>

        {error && <div style={styles.error}>{error}</div>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          disabled={loading}
          required
        />

        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          disabled={loading}
          required
        />

        <button
          type="submit"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonDisabled : {}),
          }}
          disabled={loading}
        >
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
    </main>
  );
};

export default LoginPage;
