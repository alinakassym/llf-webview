// llf-webview/src/components/CreateMatchModal.tsx

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

interface CreateMatchModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMatchData) => Promise<void>;
  tourId: number;
  sportType: number;
  teams: Team[];
  loading?: boolean;
}

export interface CreateMatchData {
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
  team1SetsWon: number;
  team2SetsWon: number;
}

const CreateMatchModal: FC<CreateMatchModalProps> = ({
  open,
  onClose,
  onSubmit,
  tourId,
  sportType,
  teams,
  loading: externalLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateMatchData>({
    tourId,
    dateTime: "",
    location: "",
    team1Id: 0,
    team2Id: 0,
    team1Score: 0,
    team2Score: 0,
    sportType,
    team1Set1Score: null,
    team2Set1Score: null,
    team1Set2Score: null,
    team2Set2Score: null,
    team1Set3Score: null,
    team2Set3Score: null,
    team1SetsWon: 0,
    team2SetsWon: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateMatchData, string>>
  >({});

  // Обновляем tourId и sportType при изменении props
  useEffect(() => {
    setFormData((prev) => ({ ...prev, tourId, sportType }));
  }, [tourId, sportType]);

  const handleChange =
    (field: keyof CreateMatchData) =>
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
        field === "team2Set3Score" ||
        field === "team1SetsWon" ||
        field === "team2SetsWon"
      ) {
        setFormData((prev) => ({
          ...prev,
          [field]: value === "" ? 0 : Number(value),
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
    const newErrors: Partial<Record<keyof CreateMatchData, string>> = {};

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
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      // Преобразуем dateTime в ISO формат
      const dateTimeIso = new Date(formData.dateTime).toISOString();

      await onSubmit({
        ...formData,
        dateTime: dateTimeIso,
        location: formData.location.trim(),
      });
      handleClose();
    } catch (error) {
      console.error("Error creating match:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      tourId,
      dateTime: "",
      location: "",
      team1Id: 0,
      team2Id: 0,
      team1Score: 0,
      team2Score: 0,
      sportType,
      team1Set1Score: null,
      team2Set1Score: null,
      team1Set2Score: null,
      team2Set2Score: null,
      team1Set3Score: null,
      team2Set3Score: null,
      team1SetsWon: 0,
      team2SetsWon: 0,
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
        Создать матч
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
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Счёт команды 2"
              type="number"
              value={formData.team2Score}
              onChange={handleChange("team2Score")}
              disabled={isLoading}
              fullWidth
              inputProps={{ min: 0 }}
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
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Команда 2 - Сет 1"
              type="number"
              value={formData.team2Set1Score ?? ""}
              onChange={handleChange("team2Set1Score")}
              disabled={isLoading}
              fullWidth
              inputProps={{ min: 0 }}
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
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Команда 2 - Сет 2"
              type="number"
              value={formData.team2Set2Score ?? ""}
              onChange={handleChange("team2Set2Score")}
              disabled={isLoading}
              fullWidth
              inputProps={{ min: 0 }}
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
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Команда 2 - Сет 3"
              type="number"
              value={formData.team2Set3Score ?? ""}
              onChange={handleChange("team2Set3Score")}
              disabled={isLoading}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Команда 1 - Выигранные сеты"
              type="number"
              value={formData.team1SetsWon}
              onChange={handleChange("team1SetsWon")}
              disabled={isLoading}
              fullWidth
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Команда 2 - Выигранные сеты"
              type="number"
              value={formData.team2SetsWon}
              onChange={handleChange("team2SetsWon")}
              disabled={isLoading}
              fullWidth
              inputProps={{ min: 0 }}
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
          {isLoading ? <CircularProgress size={24} /> : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateMatchModal;
