// llf-webview/src/components/EditTourModal.tsx

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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { Tour } from "../types/tour";

interface EditTourModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditTourData) => Promise<void>;
  tour: Tour | null;
}

export interface EditTourData {
  seasonId: number;
  number: number;
  name?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const EditTourModal: FC<EditTourModalProps> = ({
  open,
  onClose,
  onSubmit,
  tour,
}) => {
  const [formData, setFormData] = useState<EditTourData>({
    seasonId: 0,
    number: 1,
    name: "",
    startDate: null,
    endDate: null,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditTourData, string>>
  >({});

  // Заполняем форму данными тура при открытии модала
  useEffect(() => {
    if (tour) {
      setFormData({
        seasonId: tour.seasonId,
        number: tour.number || 1,
        name: tour.name || "",
        startDate: tour.startDate || null,
        endDate: tour.endDate || null,
      });
    }
  }, [tour]);

  const handleChange =
    (field: keyof EditTourData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      if (field === "number" || field === "seasonId") {
        setFormData((prev) => ({
          ...prev,
          [field]: value === "" ? 0 : Number(value),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: value || null }));
      }

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditTourData, string>> = {};

    if (!formData.number || formData.number < 1) {
      newErrors.number = "Номер тура должен быть больше 0";
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
      // Преобразуем даты в ISO формат если они есть
      const submitData: EditTourData = {
        ...formData,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : null,
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : null,
      };

      await onSubmit(submitData);
      handleClose();
    } catch (error) {
      console.error("Error updating tour:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      seasonId: 0,
      number: 1,
      name: "",
      startDate: null,
      endDate: null,
    });
    setErrors({});
    setLoading(false);
    onClose();
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
        Редактировать тур
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
            label="Номер тура"
            type="number"
            value={formData.number}
            onChange={handleChange("number")}
            error={Boolean(errors.number)}
            helperText={errors.number}
            disabled={loading}
            fullWidth
            required
            slotProps={{
              htmlInput: { min: 1 },
            }}
          />

          <TextField
            label="Название тура"
            value={formData.name || ""}
            onChange={handleChange("name")}
            disabled={loading}
            fullWidth
            placeholder="Опционально"
          />

          <TextField
            label="Дата начала"
            type="date"
            value={
              formData.startDate
                ? formData.startDate.split("T")[0]
                : ""
            }
            onChange={handleChange("startDate")}
            disabled={loading}
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
                ? formData.endDate.split("T")[0]
                : ""
            }
            onChange={handleChange("endDate")}
            disabled={loading}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
          />
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

export default EditTourModal;
