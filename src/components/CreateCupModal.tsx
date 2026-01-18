// llf-webview/src/components/CreateCupModal.tsx

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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { City } from "../types/city";

interface CreateCupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCupData) => Promise<void>;
  cities: City[];
  sportType: number;
}

export interface CreateCupData {
  name: string;
  cityId: number;
}

const CreateCupModal: FC<CreateCupModalProps> = ({
  open,
  onClose,
  onSubmit,
  cities,
  sportType,
}) => {
  const [formData, setFormData] = useState<CreateCupData>({
    name: "",
    cityId: cities[0]?.id || 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateCupData, string>>
  >({});

  // Инициализируем данные при открытии модалки
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        cityId: cities[0]?.id || 0,
      });
      setErrors({});
    }
  }, [open, cities]);

  const handleChange =
    (field: keyof CreateCupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "name") {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      } else {
        const numValue = Number(e.target.value);
        setFormData((prev) => ({ ...prev, [field]: numValue }));
      }

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateCupData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }
    if (!formData.cityId || formData.cityId === 0) {
      newErrors.cityId = "Выберите город";
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
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error creating cup:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
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
        Создать кубок
        <IconButton
          onClick={handleClose}
          disabled={loading}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Название кубка"
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            fullWidth
            autoFocus
            disabled={loading}
          />

          <TextField
            select
            label="Город"
            value={formData.cityId}
            onChange={handleChange("cityId")}
            error={!!errors.cityId}
            helperText={errors.cityId}
            fullWidth
            disabled={loading}
          >
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Вид спорта"
            value={sportType === 2 ? "Волейбол" : "Футбол"}
            fullWidth
            disabled
            helperText="Вид спорта определяется автоматически"
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={loading} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? "Создание..." : "Создать"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateCupModal;
