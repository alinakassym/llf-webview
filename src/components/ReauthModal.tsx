// llf-webview/src/components/ReauthModal.tsx

import { type FC, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";

interface ReauthModalProps {
  open: boolean;
  onSuccess: (token: string) => void;
  onCancel: () => void;
}

const ReauthModal: FC<ReauthModalProps> = ({ open, onSuccess, onCancel }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://api.steppe.dev/scoreapp/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        throw new Error("Неверный email или пароль");
      }

      const data = await response.json();
      const token = data.token;

      if (!token) {
        throw new Error("Токен не получен");
      }

      // Очищаем форму
      setEmail("");
      setPassword("");
      setError(null);

      // Уведомляем родителя об успешной авторизации
      onSuccess(token);
    } catch (err) {
      console.error("Reauth error:", err);
      setError(
        err instanceof Error ? err.message : "Ошибка повторной авторизации"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEmail("");
    setPassword("");
    setError(null);
    onCancel();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <LockResetIcon color="primary" />
          <Typography variant="h6">Сессия истекла</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Ваша сессия истекла. Пожалуйста, войдите снова для продолжения
            работы.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            autoComplete="email"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Пароль"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete="current-password"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCancel} disabled={loading} color="inherit">
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !email || !password}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? "Вход..." : "Войти"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReauthModal;
