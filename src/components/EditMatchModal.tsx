// llf-webview/src/components/EditMatchModal.tsx

import { type FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Box,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Team } from "../types/team";
import type { Match } from "../types/tour";

interface EditMatchModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (matchId: number, data: EditMatchData) => Promise<void>;
  match: Match | null;
  teams: Team[];
  loading?: boolean;
}

export interface EditMatchData {
  tourId: number;
  dateTime: string;
  location: string;
  team1Id: number;
  team2Id: number;
  team1Score: number;
  team2Score: number;
  sportType: number;
  team1Set1Score: number | null;
  team2Set1Score: number | null;
  team1Set2Score: number | null;
  team2Set2Score: number | null;
  team1Set3Score: number | null;
  team2Set3Score: number | null;
}

const EditMatchModal: FC<EditMatchModalProps> = ({
  open,
  onClose,
  onSubmit,
  match,
  teams,
  loading: externalLoading = false,
}) => {
  console.log("EditMatchModal render", teams);
  const [formData, setFormData] = useState<EditMatchData>({
    tourId: 0,
    dateTime: "",
    location: "",
    team1Id: 0,
    team2Id: 0,
    team1Score: 0,
    team2Score: 0,
    sportType: 0,
    team1Set1Score: null,
    team2Set1Score: null,
    team1Set2Score: null,
    team2Set2Score: null,
    team1Set3Score: null,
    team2Set3Score: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditMatchData, string>>
  >({});

  // Инициализируем форму данными из match при открытии модала
  useEffect(() => {
    if (match && open) {
      // Преобразуем ISO строку в формат datetime-local (yyyy-MM-ddThh:mm)
      const dateTimeLocal = match.dateTime
        ? new Date(match.dateTime).toISOString().slice(0, 16)
        : "";

      setFormData({
        tourId: match.tourId,
        dateTime: dateTimeLocal,
        location: match.location || "",
        team1Id: match.team1Id,
        team2Id: match.team2Id,
        team1Score: match.team1Score || 0,
        team2Score: match.team2Score || 0,
        sportType: match.sportType,
        team1Set1Score: match.team1Set1Score ?? null,
        team2Set1Score: match.team2Set1Score ?? null,
        team1Set2Score: match.team1Set2Score ?? null,
        team2Set2Score: match.team2Set2Score ?? null,
        team1Set3Score: match.team1Set3Score ?? null,
        team2Set3Score: match.team2Set3Score ?? null,
      });
    }
  }, [match, open]);

  const handleChange =
    (field: keyof EditMatchData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (
        field === "team1Id" ||
        field === "team2Id" ||
        field === "team1Score" ||
        field === "team2Score" ||
        field === "team1Set1Score" ||
        field === "team2Set1Score" ||
        field === "team1Set2Score" ||
        field === "team2Set2Score" ||
        field === "team1Set3Score" ||
        field === "team2Set3Score"
      ) {
        setFormData((prev) => ({
          ...prev,
          [field]:
            value === "" ? (field.includes("Set") ? null : 0) : Number(value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditMatchData, string>> = {};

    if (!formData.dateTime) {
      newErrors.dateTime = "Укажите дату и время матча";
    }

    if (!formData.location?.trim()) {
      newErrors.location = "Укажите место проведения";
    }

    if (!formData.team1Id || formData.team1Id === 0) {
      newErrors.team1Id = "Выберите первую команду";
    }

    if (!formData.team2Id || formData.team2Id === 0) {
      newErrors.team2Id = "Выберите вторую команду";
    }

    if (formData.team1Id === formData.team2Id && formData.team1Id !== 0) {
      newErrors.team2Id = "Команды должны быть разными";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !match) {
      return;
    }

    setLoading(true);
    try {
      // Преобразуем dateTime в ISO формат
      const dateTimeIso = new Date(formData.dateTime).toISOString();

      await onSubmit(match.id, {
        ...formData,
        dateTime: dateTimeIso,
        location: formData.location.trim(),
      });
      handleClose();
    } catch (error) {
      console.error("Error updating match:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      tourId: 0,
      dateTime: "",
      location: "",
      team1Id: 0,
      team2Id: 0,
      team1Score: 0,
      team2Score: 0,
      sportType: 0,
      team1Set1Score: null,
      team2Set1Score: null,
      team1Set2Score: null,
      team2Set2Score: null,
      team1Set3Score: null,
      team2Set3Score: null,
    });
    setErrors({});
    setLoading(false);
    onClose();
  };

  const isLoading = loading || externalLoading;

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
        Редактировать матч
        <IconButton
          onClick={handleClose}
          disabled={isLoading}
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
            label="Дата и время"
            type="datetime-local"
            value={formData.dateTime}
            onChange={handleChange("dateTime")}
            error={Boolean(errors.dateTime)}
            helperText={errors.dateTime}
            disabled={isLoading}
            fullWidth
            required
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              "& .MuiInputBase-root": {
                height: "56px",
              },
            }}
          />

          <TextField
            label="Место проведения"
            value={formData.location}
            onChange={handleChange("location")}
            error={Boolean(errors.location)}
            helperText={errors.location}
            disabled={isLoading}
            fullWidth
            required
          />

          <TextField
            label="Команда 1"
            select
            value={formData.team1Id}
            onChange={handleChange("team1Id")}
            error={Boolean(errors.team1Id)}
            helperText={errors.team1Id}
            disabled={isLoading}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите команду
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Команда 2"
            select
            value={formData.team2Id}
            onChange={handleChange("team2Id")}
            error={Boolean(errors.team2Id)}
            helperText={errors.team2Id}
            disabled={isLoading}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите команду
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </TextField>

          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
            Счёт матча
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Счёт команды 1"
              type="number"
              value={formData.team1Score}
              onChange={handleChange("team1Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
            <TextField
              label="Счёт команды 2"
              type="number"
              value={formData.team2Score}
              onChange={handleChange("team2Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Box>

          <Typography variant="subtitle2" sx={{ mt: 1, fontWeight: 600 }}>
            Счёт по сетам
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Команда 1 - Сет 1"
              type="number"
              value={formData.team1Set1Score ?? ""}
              onChange={handleChange("team1Set1Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
            <TextField
              label="Команда 2 - Сет 1"
              type="number"
              value={formData.team2Set1Score ?? ""}
              onChange={handleChange("team2Set1Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Команда 1 - Сет 2"
              type="number"
              value={formData.team1Set2Score ?? ""}
              onChange={handleChange("team1Set2Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
            <TextField
              label="Команда 2 - Сет 2"
              type="number"
              value={formData.team2Set2Score ?? ""}
              onChange={handleChange("team2Set2Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Команда 1 - Сет 3"
              type="number"
              value={formData.team1Set3Score ?? ""}
              onChange={handleChange("team1Set3Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
            <TextField
              label="Команда 2 - Сет 3"
              type="number"
              value={formData.team2Set3Score ?? ""}
              onChange={handleChange("team2Set3Score")}
              disabled={isLoading}
              fullWidth
              slotProps={{
                htmlInput: { min: 0 },
              }}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isLoading} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading}
          variant="contained"
          color="primary"
        >
          {isLoading ? <CircularProgress size={24} /> : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditMatchModal;
