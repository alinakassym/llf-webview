// llf-webview/src/components/AddTeamToCupGroupModal.tsx

import { type FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Team } from "../types/team";

interface AddTeamToCupGroupModalProps {
  open: boolean;
  onClose: () => void;
  teams: Team[];
  loading?: boolean;
  onSubmit: (data: {
    teamId: number;
    seed: number | null;
    order: number | null;
  }) => Promise<void>;
  groupName: string;
}

const AddTeamToCupGroupModal: FC<AddTeamToCupGroupModalProps> = ({
  open,
  onClose,
  teams,
  loading = false,
  onSubmit,
  groupName,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<number>(0);
  const [seed, setSeed] = useState<string>("");
  const [order, setOrder] = useState<string>("");
  const [errors, setErrors] = useState<{
    teamId?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Сбрасываем состояние при открытии/закрытии модала
  useEffect(() => {
    if (!open) {
      setSelectedTeamId(0);
      setSeed("");
      setOrder("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleTeamChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const teamId = Number(e.target.value);
    setSelectedTeamId(teamId);

    // Очищаем ошибку при выборе команды
    if (errors.teamId) {
      setErrors((prev) => ({ ...prev, teamId: undefined }));
    }
  };

  const handleOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем пустую строку или цифры
    if (value === "" || /^\d+$/.test(value)) {
      setOrder(value);
    }
  };

  const validate = (): boolean => {
    const newErrors: { teamId?: string } = {};

    if (selectedTeamId === 0) {
      newErrors.teamId = "Выберите команду";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        teamId: selectedTeamId,
        seed: seed === "" ? null : Number(seed),
        order: order === "" ? null : Number(order),
      });

      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // Извлекаем сообщение об ошибке из ответа бэкенда
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Не удалось добавить команду";

      setSnackbarMessage(errorMessage);
      setSnackbarOpen(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: "16px",
            backgroundColor: "background.paper",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        Добавить команду в группу "{groupName}"
        <IconButton
          onClick={handleClose}
          disabled={submitting}
          sx={{
            color: "text.secondary",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Команда"
            select
            value={selectedTeamId}
            onChange={handleTeamChange}
            error={Boolean(errors.teamId)}
            helperText={errors.teamId}
            disabled={loading || submitting}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите команду
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name} ({team.cityName})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Порядок"
            value={order}
            onChange={handleOrderChange}
            disabled={submitting}
            fullWidth
            type="text"
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                pattern: "[0-9]*",
              },
            }}
            placeholder="Необязательно"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || submitting}
          variant="contained"
          color="primary"
        >
          {submitting ? <CircularProgress size={24} /> : "Добавить"}
        </Button>
      </DialogActions>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddTeamToCupGroupModal;
