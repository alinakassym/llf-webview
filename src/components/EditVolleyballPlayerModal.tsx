// llf-webview/src/components/EditVolleyballPlayerModal.tsx

import { type FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Button,
  TextField,
  Box,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { VolleyballPosition, VolleyballPositionName } from "../types/volleyballPosition";
import { SportType } from "../types/sportType";
import type { PlayerProfile } from "../types/player";

interface EditVolleyballPlayerModalProps {
  open: boolean;
  onClose: () => void;
  player: PlayerProfile | null;
  onSubmit: (playerId: number, data: EditVolleyballPlayerData) => Promise<void>;
}

export interface EditVolleyballPlayerData {
  userId?: number | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  sportType: number;
  position: number;
  volleyballPosition?: number;
  isProfessionalVolleyballPlayer?: boolean;
  yellowCards?: number;
  redCards?: number;
  totalGoals?: number;
  matchesPlayed?: number;
}

interface FormData {
  userId: number | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  sportType: number;
  position: number | string;
  volleyballPosition?: number | string;
  isProfessionalVolleyballPlayer?: boolean;
  yellowCards?: number;
  redCards?: number;
  totalGoals?: number;
  matchesPlayed?: number;
}

const EditVolleyballPlayerModal: FC<EditVolleyballPlayerModalProps> = ({
  open,
  onClose,
  player,
  onSubmit,
}) => {
  // Начальная позиция для волейбола
  const getInitialPosition = () => {
    return VolleyballPosition.Unknown;
  };

  const [formData, setFormData] = useState<FormData>({
    userId: null,
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    sportType: SportType.Volleyball,
    position: getInitialPosition(),
    volleyballPosition: undefined,
    isProfessionalVolleyballPlayer: false,
    yellowCards: 0,
    redCards: 0,
    totalGoals: 0,
    matchesPlayed: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );
  const [loading, setLoading] = useState(false);

  // Заполняем форму данными игрока при открытии модала
  useEffect(() => {
    console.log("Editing player:", player);
    if (player) {
      setFormData({
        userId: player.userId || null,
        firstName: player.firstName,
        lastName: player.lastName,
        middleName: player.middleName || "",
        dateOfBirth: player.dateOfBirth ? player.dateOfBirth.split("T")[0] : "",
        sportType: Number(player.sportType),
        position: player.position, // Оставляем как есть (string), конвертируем при submit
        volleyballPosition: player.volleyballPosition, // Оставляем как есть (string), конвертируем при submit
        isProfessionalVolleyballPlayer: player.isProfessionalVolleyballPlayer,
        yellowCards: player.yellowCards || 0,
        redCards: player.redCards || 0,
        totalGoals: player.totalGoals || 0,
        matchesPlayed: player.matchesPlayed || 0,
      });
    }
  }, [player]);

  // Получаем список волейбольных позиций
  const getPositionOptions = (): Array<{ value: number; label: string }> => {
    return Object.entries(VolleyballPositionName)
      .map(([value, label]) => ({
        value: Number(value),
        label,
      }))
      .filter((option) => !isNaN(option.value));
  };

  const handleChange =
    (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Position и volleyballPosition сохраняем как есть (string или number)
      // Конвертация в number произойдет при submit
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Имя обязательно";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Фамилия обязательна";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Дата рождения обязательна";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        userId: null,
        firstName: "",
        lastName: "",
        middleName: "",
        dateOfBirth: "",
        sportType: SportType.Volleyball,
        position: getInitialPosition(),
        volleyballPosition: undefined,
        isProfessionalVolleyballPlayer: false,
        yellowCards: 0,
        redCards: 0,
        totalGoals: 0,
        matchesPlayed: 0,
      });
      setErrors({});
      setLoading(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!validate() || !player || !player.id) {
      return;
    }

    setLoading(true);
    try {
      // Конвертируем дату из формата YYYY-MM-DD в RFC 3339
      const dateTime = `${formData.dateOfBirth}T16:06:36.427Z`;

      // Конвертируем position и volleyballPosition в number
      const submitData: EditVolleyballPlayerData = {
        ...formData,
        dateOfBirth: dateTime,
        position: Number(formData.position),
        volleyballPosition: formData.volleyballPosition
          ? Number(formData.volleyballPosition)
          : undefined,
      };

      await onSubmit(player.id, submitData);
      handleClose();
    } catch (error) {
      console.error("Error updating player:", error);
    } finally {
      setLoading(false);
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
        Редактировать игрока
        <IconButton
          onClick={handleClose}
          disabled={loading}
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
            label="Фамилия"
            value={formData.lastName}
            onChange={handleChange("lastName")}
            error={Boolean(errors.lastName)}
            helperText={errors.lastName}
            disabled={loading}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Имя"
            value={formData.firstName}
            onChange={handleChange("firstName")}
            error={Boolean(errors.firstName)}
            helperText={errors.firstName}
            disabled={loading}
            fullWidth
            required
          />

          <TextField
            label="Отчество"
            value={formData.middleName}
            onChange={handleChange("middleName")}
            error={Boolean(errors.middleName)}
            helperText={errors.middleName}
            disabled={loading}
            fullWidth
          />

          <TextField
            label="Дата рождения"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange("dateOfBirth")}
            error={Boolean(errors.dateOfBirth)}
            helperText={errors.dateOfBirth}
            disabled={loading}
            fullWidth
            required
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            label="Позиция"
            select
            value={formData.volleyballPosition ?? "0"}
            onChange={handleChange("volleyballPosition")}
            disabled={loading}
            fullWidth
            required
          >
            {getPositionOptions().map(({ value, label }) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color="primary"
        >
          {loading ? <CircularProgress size={24} /> : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditVolleyballPlayerModal;
