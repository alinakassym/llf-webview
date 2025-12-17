// llf-webview/src/components/EditLeagueGroupModal.tsx

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

interface EditLeagueGroupModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (id: number, data: EditLeagueGroupData) => Promise<void>;
  cities: City[];
  sportType: string;
  initialData: {
    id: number;
    name: string;
    order: number;
    cityId: number;
    sportType: string;
  } | null;
}

export interface EditLeagueGroupData {
  name: string;
  order: number;
  cityId: number;
  sportType: string;
}

const EditLeagueGroupModal: FC<EditLeagueGroupModalProps> = ({
  open,
  onClose,
  onSubmit,
  cities,
  sportType,
  initialData,
}) => {
  const [formData, setFormData] = useState<EditLeagueGroupData>({
    name: "",
    order: 1,
    cityId: 0,
    sportType,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditLeagueGroupData, string>>
  >({});

  // Обновляем форму при изменении initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        order: initialData.order,
        cityId: initialData.cityId,
        sportType: initialData.sportType,
      });
    }
  }, [initialData]);

  const handleChange =
    (field: keyof EditLeagueGroupData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "name" || field === "sportType") {
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
    const newErrors: Partial<Record<keyof EditLeagueGroupData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }
    if (formData.cityId === 0) {
      newErrors.cityId = "Выберите город";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !initialData) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(initialData.id, formData);
      handleClose();
    } catch (error) {
      console.error("Error updating league group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        order: 1,
        cityId: 0,
        sportType,
      });
      setErrors({});
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
            borderRadius: 2,
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
        Редактировать группу лиг
        <IconButton
          aria-label="close"
          onClick={handleClose}
          disabled={loading}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <p style={{ margin: 0 }}>
            {sportType === "2" ? "Волейбол" : "Футбол"}
          </p>
          <TextField
            label="Название группы"
            fullWidth
            value={formData.name}
            onChange={handleChange("name")}
            error={!!errors.name}
            helperText={errors.name}
            disabled={loading}
            required
            autoFocus
          />

          <TextField
            label="Порядок"
            type="number"
            fullWidth
            value={formData.order}
            onChange={handleChange("order")}
            error={!!errors.order}
            helperText={errors.order}
            disabled={loading}
            required
            slotProps={{ htmlInput: { min: 1 } }}
          />

          <TextField
            label="Город"
            select
            value={formData.cityId}
            onChange={handleChange("cityId")}
            error={Boolean(errors.cityId)}
            helperText={errors.cityId}
            disabled={loading}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите город
            </MenuItem>
            {cities.map((city) => (
              <MenuItem key={city.id} value={city.id}>
                {city.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} />}
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditLeagueGroupModal;
