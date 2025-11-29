// llf-webview/src/components/CreateTeamModal.tsx

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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { City } from "../types/city";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  cities: City[];
}

interface CreateTeamData {
  name: string;
  cityId: number;
}

const CreateTeamModal: FC<CreateTeamModalProps> = ({
  open,
  onClose,
  cities,
}) => {
  const [formData, setFormData] = useState<CreateTeamData>({
    name: "",
    cityId: 0,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CreateTeamData, string>>>({});

  const handleChange = (field: keyof CreateTeamData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === "name") {
      setFormData((prev) => ({ ...prev, name: e.target.value }));
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
    const newErrors: Partial<Record<keyof CreateTeamData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }
    if (formData.cityId === 0) {
      newErrors.cityId = "Выберите город";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setFormData({
      name: "",
      cityId: 0,
    });
    setErrors({});
    onClose();
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }
    // TODO: Implement submit functionality
    console.log("Submit team:", formData);
    handleClose();
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
        Создать команду
        <IconButton
          onClick={handleClose}
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
            label="Название команды"
            value={formData.name}
            onChange={handleChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            required
            autoFocus
          />

          <TextField
            label="Город"
            select
            value={formData.cityId}
            onChange={handleChange("cityId")}
            error={Boolean(errors.cityId)}
            helperText={errors.cityId}
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
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Создать
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateTeamModal;
