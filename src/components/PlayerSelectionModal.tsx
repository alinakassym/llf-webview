// llf-webview/src/components/PlayerSelectionModal.tsx

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
import type { PlayerProfile } from "../types/player";
import type { Season } from "../types/season";
import { playerService } from "../services/playerService";
import { SportType } from "../types/sportType";
import { VolleyballPosition } from "../types/volleyballPosition";

interface PlayerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  position: VolleyballPosition;
  playerProfiles: PlayerProfile[];
  seasons: Season[];
  loading?: boolean;
  seasonsLoading?: boolean;
  teamId: string;
  selectedSeasonId: number;
  token: string;
  onPlayerAdded?: () => void;
}

const PlayerSelectionModal: FC<PlayerSelectionModalProps> = ({
  open,
  onClose,
  position,
  playerProfiles,
  loading = false,
  teamId,
  selectedSeasonId,
  token,
  onPlayerAdded,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<number>(0);
  const [playerNumber, setPlayerNumber] = useState<string>("");
  const [errors, setErrors] = useState<{
    profileId?: string;
    number?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Сбрасываем состояние при открытии/закрытии модала
  useEffect(() => {
    if (!open) {
      setSelectedProfileId(0);
      setPlayerNumber("");
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const profileId = Number(e.target.value);
    setSelectedProfileId(profileId);

    // Очищаем ошибку при выборе профиля
    if (errors.profileId) {
      setErrors((prev) => ({ ...prev, profileId: undefined }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры
    if (value === "" || /^\d+$/.test(value)) {
      setPlayerNumber(value);

      // Очищаем ошибку при вводе
      if (errors.number) {
        setErrors((prev) => ({ ...prev, number: undefined }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: { profileId?: string; number?: string } = {};

    if (selectedProfileId === 0) {
      newErrors.profileId = "Выберите игрока";
    }

    if (playerNumber === "") {
      newErrors.number = "Введите номер игрока";
    } else if (Number(playerNumber) < 1 || Number(playerNumber) > 99) {
      newErrors.number = "Номер должен быть от 1 до 99";
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
      const result = await playerService.addPlayerToTeam(
        {
          playerProfileId: selectedProfileId,
          teamId: Number(teamId),
          seasonId: selectedSeasonId,
          number: Number(playerNumber),
          sportType: SportType.Volleyball,
          volleyballPosition: position,
        },
        token,
      );
      console.log("Add player result:", result);

      // Вызываем коллбек для обновления списка игроков
      if (onPlayerAdded) {
        onPlayerAdded();
      }

      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error adding player:", error?.response);
      console.log("Error data:", error?.response?.data);

      // Извлекаем сообщение об ошибке из ответа бэкенда
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Не удалось добавить игрока";

      console.log("Extracted error message:", errorMessage);
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
        Добавить игрока на позицию "{position}"
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
            label="Игрок"
            select
            value={selectedProfileId}
            onChange={handleProfileChange}
            error={Boolean(errors.profileId)}
            helperText={errors.profileId}
            disabled={loading || submitting}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите игрока
            </MenuItem>
            {playerProfiles.map((profile) => (
              <MenuItem key={profile.id} value={profile.id}>
                {profile.fullName}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Номер игрока"
            value={playerNumber}
            onChange={handleNumberChange}
            error={Boolean(errors.number)}
            helperText={errors.number}
            disabled={submitting}
            fullWidth
            required
            type="text"
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                pattern: "[0-9]*",
                maxLength: 2,
              },
            }}
            placeholder="1-99"
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

export default PlayerSelectionModal;
