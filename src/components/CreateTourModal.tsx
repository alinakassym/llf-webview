// llf-webview/src/components/CreateTourModal.tsx

import { type FC, useState } from "react";
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

interface CreateTourModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTourData) => Promise<void>;
  nextTourNumber: number;
}

export interface CreateTourData {
  number: number;
  name: string | null;
  startDate: string | null;
  endDate: string | null;
}

const CreateTourModal: FC<CreateTourModalProps> = ({
  open,
  onClose,
  onSubmit,
  nextTourNumber,
}) => {
  const [formData, setFormData] = useState<CreateTourData>({
    number: nextTourNumber,
    name: "",
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateTourData, string>>
  >({});

  const handleChange =
    (field: keyof CreateTourData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "number") {
        const numValue = Number(e.target.value);
        setFormData((prev) => ({ ...prev, [field]: numValue }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      }

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateTourData, string>> = {};

    if (formData.number <= 0) {
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
      // Преобразуем даты в ISO формат, если они заполнены
      const startDateIso = formData.startDate
        ? new Date(formData.startDate).toISOString()
        : null;
      const endDateIso = formData.endDate
        ? new Date(formData.endDate).toISOString()
        : null;

      await onSubmit({
        number: formData.number,
        name: formData.name?.trim() || null,
        startDate: startDateIso,
        endDate: endDateIso,
      });
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      number: nextTourNumber,
      name: "",
      startDate: "",
      endDate: "",
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
        Создать тур
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
          />

          <TextField
            label="Название тура"
            value={formData.name}
            onChange={handleChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
            fullWidth
          />

          <TextField
            label="Дата начала"
            type="date"
            value={formData.startDate}
            onChange={handleChange("startDate")}
            error={Boolean(errors.startDate)}
            helperText={errors.startDate}
            disabled={loading}
            fullWidth
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
            label="Дата окончания"
            type="date"
            value={formData.endDate}
            onChange={handleChange("endDate")}
            error={Boolean(errors.endDate)}
            helperText={errors.endDate}
            disabled={loading}
            fullWidth
            slotProps={{
              inputLabel: { shrink: true },
            }}
            sx={{
              "& .MuiInputBase-root": {
                height: "56px",
              },
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
          {loading ? <CircularProgress size={24} /> : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTourModal;
