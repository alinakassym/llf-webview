// llf-webview/src/components/CreateLeagueModal.tsx

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
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { City } from "../types/city";
import type { LeagueGroup } from "../store/slices/leagueGroupSlice";

interface CreateLeagueModalProps {
  open: boolean;
  onClose: () => void;
  cities: City[];
  leagueGroups: LeagueGroup[];
  onSubmit: (data: CreateLeagueData) => Promise<void>;
}

export interface CreateLeagueData {
  name: string;
  order: number;
  cityId: number;
  leagueGroupId: number;
}

const CreateLeagueModal: FC<CreateLeagueModalProps> = ({
  open,
  onClose,
  cities,
  leagueGroups,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateLeagueData>({
    name: "",
    order: 1,
    cityId: 0,
    leagueGroupId: 0,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CreateLeagueData, string>>>({});

  const handleChange = (field: keyof CreateLeagueData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === "name" ? e.target.value : Number(e.target.value);
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CreateLeagueData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }
    if (formData.cityId === 0) {
      newErrors.cityId = "Выберите город";
    }
    if (formData.leagueGroupId === 0) {
      newErrors.leagueGroupId = "Выберите группу лиги";
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
      handleClose();
    } catch (error) {
      console.error("Error creating league:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      order: 1,
      cityId: 0,
      leagueGroupId: 0,
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
        Создать лигу
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
            label="Название лиги"
            value={formData.name}
            onChange={handleChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
            fullWidth
            required
          />

          <TextField
            label="Порядок"
            type="number"
            value={formData.order}
            onChange={handleChange("order")}
            disabled={loading}
            fullWidth
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

          <TextField
            label="Группа лиги"
            select
            value={formData.leagueGroupId}
            onChange={handleChange("leagueGroupId")}
            error={Boolean(errors.leagueGroupId)}
            helperText={errors.leagueGroupId}
            disabled={loading}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите группу лиги
            </MenuItem>
            {leagueGroups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
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

export default CreateLeagueModal;
