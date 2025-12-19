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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { PlayerProfile } from "../types/player";

interface PlayerSelectionModalProps {
  open: boolean;
  onClose: () => void;
  position: string;
  playerProfiles: PlayerProfile[];
  loading?: boolean;
}

const PlayerSelectionModal: FC<PlayerSelectionModalProps> = ({
  open,
  onClose,
  position,
  playerProfiles,
  loading = false,
}) => {
  const [selectedProfileId, setSelectedProfileId] = useState<number>(0);
  const [errors, setErrors] = useState<{ profileId?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Сбрасываем состояние при открытии/закрытии модала
  useEffect(() => {
    if (!open) {
      setSelectedProfileId(0);
      setErrors({});
      setSubmitting(false);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const profileId = Number(e.target.value);
    setSelectedProfileId(profileId);

    // Очищаем ошибку при выборе профиля
    if (errors.profileId) {
      setErrors({});
    }
  };

  const validate = (): boolean => {
    const newErrors: { profileId?: string } = {};

    if (selectedProfileId === 0) {
      newErrors.profileId = "Выберите игрока";
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
      // TODO: Implement submit logic
      console.log("Selected profile ID:", selectedProfileId);
      handleClose();
    } catch (error) {
      console.error("Error adding player:", error);
    } finally {
      setSubmitting(false);
    }
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
            onChange={handleChange}
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
    </Dialog>
  );
};

export default PlayerSelectionModal;
