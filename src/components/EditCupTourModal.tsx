// llf-webview/src/components/EditCupTourModal.tsx

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
  Typography,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { CupGroupTeam, CupTour } from "../types/cup";

export interface EditCupTourData {
  number: number;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
  cupGroupId: number;
  dateTime: string | null;
  location: string | null;
  team1Id: number;
  team2Id: number;
  team1Score: number | null;
  team2Score: number | null;
  team1Set1Score: number | null;
  team2Set1Score: number | null;
  team1Set2Score: number | null;
  team2Set2Score: number | null;
  team1Set3Score: number | null;
  team2Set3Score: number | null;
}

interface EditCupTourModalProps {
  open: boolean;
  onClose: () => void;
  teams: CupGroupTeam[];
  onSubmit: (data: EditCupTourData) => Promise<void>;
  groupName: string;
  editingTour: CupTour | null;
}

const EditCupTourModal: FC<EditCupTourModalProps> = ({
  open,
  onClose,
  teams,
  onSubmit,
  groupName,
  editingTour,
}) => {
  const [formData, setFormData] = useState<EditCupTourData>({
    number: 1,
    name: null,
    startDate: null,
    endDate: null,
    cupGroupId: 0,
    dateTime: null,
    location: null,
    team1Id: 0,
    team2Id: 0,
    team1Score: null,
    team2Score: null,
    team1Set1Score: null,
    team2Set1Score: null,
    team1Set2Score: null,
    team2Set2Score: null,
    team1Set3Score: null,
    team2Set3Score: null,
  });
  const [errors, setErrors] = useState<{
    number?: string;
    team1Id?: string;
    team2Id?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Предзаполняем форму данными редактируемого тура
  useEffect(() => {
    if (open && editingTour) {
      setFormData({
        number: editingTour.number,
        name: editingTour.name,
        startDate: editingTour.startDate,
        endDate: editingTour.endDate,
        cupGroupId: editingTour.cupGroupId,
        dateTime: editingTour.dateTime,
        location: editingTour.location,
        team1Id: editingTour.team1Id,
        team2Id: editingTour.team2Id,
        team1Score: editingTour.team1Score,
        team2Score: editingTour.team2Score,
        team1Set1Score: editingTour.team1Set1Score,
        team2Set1Score: editingTour.team2Set1Score,
        team1Set2Score: editingTour.team1Set2Score,
        team2Set2Score: editingTour.team2Set2Score,
        team1Set3Score: editingTour.team1Set3Score,
        team2Set3Score: editingTour.team2Set3Score,
      });
    } else if (!open) {
      setErrors({});
      setSubmitting(false);
    }
  }, [open, editingTour]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    setFormData((prev) => ({ ...prev, number: value }));
    if (errors.number) {
      setErrors((prev) => ({ ...prev, number: undefined }));
    }
  };

  const handleTextChange =
    (field: "name" | "location") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim() || null;
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

  const handleDateChange =
    (field: "startDate" | "endDate" | "dateTime") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const isoValue = value ? new Date(value).toISOString() : null;
      setFormData((prev) => ({ ...prev, [field]: isoValue }));
    };

  const handleTeamChange =
    (field: "team1Id" | "team2Id") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const teamId = Number(e.target.value);
      setFormData((prev) => ({ ...prev, [field]: teamId }));

      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const handleScoreChange =
    (
      field:
        | "team1Score"
        | "team2Score"
        | "team1Set1Score"
        | "team2Set1Score"
        | "team1Set2Score"
        | "team2Set2Score"
        | "team1Set3Score"
        | "team2Set3Score",
    ) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      const numValue = value === "" ? null : Number(value);
      setFormData((prev) => ({ ...prev, [field]: numValue }));
    };

  const validate = (): boolean => {
    const newErrors: {
      number?: string;
      team1Id?: string;
      team2Id?: string;
    } = {};

    if (formData.number <= 0) {
      newErrors.number = "Номер тура должен быть больше 0";
    }

    if (formData.team1Id === 0) {
      newErrors.team1Id = "Выберите первую команду";
    }

    if (formData.team2Id === 0) {
      newErrors.team2Id = "Выберите вторую команду";
    }

    if (formData.team1Id === formData.team2Id && formData.team1Id !== 0) {
      newErrors.team1Id = "Команды должны быть разными";
      newErrors.team2Id = "Команды должны быть разными";
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
      await onSubmit(formData);
      handleClose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error ||
        error?.message ||
        "Не удалось обновить тур";

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
        Редактировать тур в группе "{groupName}"
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
          {/* Основная информация */}
          <TextField
            label="Номер тура"
            type="number"
            value={formData.number}
            onChange={handleNumberChange}
            error={Boolean(errors.number)}
            helperText={errors.number}
            disabled={submitting}
            fullWidth
            required
          />

          <TextField
            label="Название тура"
            value={formData.name || ""}
            onChange={handleTextChange("name")}
            disabled={submitting}
            fullWidth
          />

          {/* Даты */}
          <TextField
            label="Дата начала"
            type="date"
            value={
              formData.startDate
                ? new Date(formData.startDate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleDateChange("startDate")}
            disabled={submitting}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            label="Дата окончания"
            type="date"
            value={
              formData.endDate
                ? new Date(formData.endDate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleDateChange("endDate")}
            disabled={submitting}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            label="Дата и время матча"
            type="datetime-local"
            value={
              formData.dateTime
                ? new Date(formData.dateTime).toISOString().slice(0, 16)
                : ""
            }
            onChange={handleDateChange("dateTime")}
            disabled={submitting}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />

          <TextField
            label="Место проведения"
            value={formData.location || ""}
            onChange={handleTextChange("location")}
            disabled={submitting}
            fullWidth
          />

          <Divider sx={{ my: 1 }} />

          {/* Команды */}
          <Typography variant="subtitle2" fontWeight={600}>
            Команды
          </Typography>

          <TextField
            label="Команда 1"
            select
            value={formData.team1Id}
            onChange={handleTeamChange("team1Id")}
            error={Boolean(errors.team1Id)}
            helperText={errors.team1Id}
            disabled={submitting}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите команду
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.teamId} value={team.teamId}>
                {team.teamName} {team.cityName && `(${team.cityName})`}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Команда 2"
            select
            value={formData.team2Id}
            onChange={handleTeamChange("team2Id")}
            error={Boolean(errors.team2Id)}
            helperText={errors.team2Id}
            disabled={submitting}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите команду
            </MenuItem>
            {teams.map((team) => (
              <MenuItem key={team.teamId} value={team.teamId}>
                {team.teamName} {team.cityName && `(${team.cityName})`}
              </MenuItem>
            ))}
          </TextField>

          <Divider sx={{ my: 1 }} />

          {/* Счет */}
          <Typography variant="subtitle2" fontWeight={600}>
            Счет
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Счет команды 1"
              type="number"
              value={formData.team1Score ?? ""}
              onChange={handleScoreChange("team1Score")}
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Счет команды 2"
              type="number"
              value={formData.team2Score ?? ""}
              onChange={handleScoreChange("team2Score")}
              disabled={submitting}
              fullWidth
            />
          </Box>

          {/* Счет по сетам */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1 }}>
            Счет по сетам
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Команда 1 - Сет 1"
              type="number"
              value={formData.team1Set1Score ?? ""}
              onChange={handleScoreChange("team1Set1Score")}
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Команда 2 - Сет 1"
              type="number"
              value={formData.team2Set1Score ?? ""}
              onChange={handleScoreChange("team2Set1Score")}
              disabled={submitting}
              fullWidth
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Команда 1 - Сет 2"
              type="number"
              value={formData.team1Set2Score ?? ""}
              onChange={handleScoreChange("team1Set2Score")}
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Команда 2 - Сет 2"
              type="number"
              value={formData.team2Set2Score ?? ""}
              onChange={handleScoreChange("team2Set2Score")}
              disabled={submitting}
              fullWidth
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="Команда 1 - Сет 3"
              type="number"
              value={formData.team1Set3Score ?? ""}
              onChange={handleScoreChange("team1Set3Score")}
              disabled={submitting}
              fullWidth
            />
            <TextField
              label="Команда 2 - Сет 3"
              type="number"
              value={formData.team2Set3Score ?? ""}
              onChange={handleScoreChange("team2Set3Score")}
              disabled={submitting}
              fullWidth
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={submitting} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          variant="contained"
          color="primary"
        >
          {submitting ? <CircularProgress size={24} /> : "Сохранить"}
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

export default EditCupTourModal;
