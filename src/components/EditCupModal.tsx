// llf-webview/src/components/EditCupModal.tsx

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
import type { Cup } from "../types/cup";

interface EditCupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EditCupData) => Promise<void>;
  cup: Cup | null;
  cities: City[];
  sportType: number;
}

export interface EditCupData {
  name: string;
  cityId: number;
}

const EditCupModal: FC<EditCupModalProps> = ({
  open,
  onClose,
  onSubmit,
  cup,
  cities,
  sportType,
}) => {
  const [formData, setFormData] = useState<EditCupData>({
    name: "",
    cityId: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditCupData, string>>
  >({});

  // Инициализируем данные при открытии модалки или изменении cup
  useEffect(() => {
    if (open && cup) {
      setFormData({
        name: cup.name,
        cityId: cup.cityId,
      });
      setErrors({});
    }
  }, [open, cup]);

  const handleChange =
    (field: keyof EditCupData) =>
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
    const newErrors: Partial<Record<keyof EditCupData, string>> = {};

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
      console.error("Error updating cup:", error);
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
        Редактировать кубок
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
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCupModal;
