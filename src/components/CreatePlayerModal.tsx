// llf-webview/src/components/CreatePlayerModal.tsx

import { type FC, useState } from "react";
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
import { PlayerRole } from "../types/playerRole";

interface CreatePlayerModalProps {
  open: boolean;
  onClose: () => void;
  token: string;
  onSubmit: (data: CreatePlayerData) => Promise<void>;
}

export interface CreatePlayerData {
  userId?: number | null;
  firstName: string;
  lastName: string;
  middleName: string;
  dateOfBirth: string;
  position: number;
  volleyballPosition?: number;
  isProfessionalVolleyballPlayer?: boolean;
  yellowCards?: number;
  redCards?: number;
  totalGoals?: number;
  matchesPlayed?: number;
}

// Полные названия позиций для выбора
const positionLabels: Record<PlayerRole, string> = {
  [PlayerRole.Goalkeeper]: "Вратарь",
  [PlayerRole.Defender]: "Защитник",
  [PlayerRole.Halfback]: "Полузащитник",
  [PlayerRole.Forward]: "Нападающий",
};

const CreatePlayerModal: FC<CreatePlayerModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreatePlayerData>({
    firstName: "",
    lastName: "",
    middleName: "",
    dateOfBirth: "",
    position: PlayerRole.Forward,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreatePlayerData, string>>
  >({});
  const [loading, setLoading] = useState(false);

  const handleChange =
    (field: keyof CreatePlayerData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (field === "position") {
        setFormData((prev) => ({ ...prev, [field]: Number(value) }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePlayerData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Имя обязательно";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Фамилия обязательна";
    }
    if (!formData.middleName.trim()) {
      newErrors.middleName = "Отчество обязательно";
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
        firstName: "",
        lastName: "",
        middleName: "",
        dateOfBirth: "",
        position: PlayerRole.Forward,
      });
      setErrors({});
      setLoading(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Конвертируем дату из формата YYYY-MM-DD в RFC 3339
      const dateTime = `${formData.dateOfBirth}T16:06:36.427Z`;

      await onSubmit({
        ...formData,
        dateOfBirth: dateTime,
      });
      handleClose();
    } catch (error) {
      console.error("Error creating player:", error);
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
        Создать игрока
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
            required
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
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Позиция"
            select
            value={formData.position}
            onChange={handleChange("position")}
            disabled={loading}
            fullWidth
            required
          >
            {Object.entries(positionLabels).map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
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
          {loading ? <CircularProgress size={24} /> : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatePlayerModal;
