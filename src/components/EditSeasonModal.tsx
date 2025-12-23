// llf-webview/src/components/EditSeasonModal.tsx

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
  MenuItem,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { City } from "../types/city";
import type { League } from "../types/league";

interface EditSeasonModalProps {
  open: boolean;
  onClose: () => void;
  cities: City[];
  leagues: League[];
  onSubmit: (data: EditSeasonData) => Promise<void>;
  onCityChange: (cityId: number) => void;
  season: {
    id: string;
    name: string;
    date: string;
    leagueId: number;
    cityId: number;
  } | null;
}

export interface EditSeasonData {
  name: string;
  date: string;
  leagueId: number;
}

const EditSeasonModal: FC<EditSeasonModalProps> = ({
  open,
  onClose,
  cities,
  leagues,
  onSubmit,
  onCityChange,
  season,
}) => {
  const [formData, setFormData] = useState<EditSeasonData>({
    name: "",
    date: "",
    leagueId: 0,
  });
  const [selectedCityId, setSelectedCityId] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditSeasonData | "cityId", string>>
  >({});

  // Заполняем форму данными сезона при открытии
  useEffect(() => {
    if (season && open) {
      // Конвертируем ISO дату в формат yyyy-MM-dd для input type="date"
      const dateObj = new Date(season.date);
      const localDate = dateObj.toISOString().split("T")[0];

      setFormData({
        name: season.name,
        date: localDate,
        leagueId: season.leagueId,
      });
      setSelectedCityId(season.cityId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [season?.id, open]);

  const handleChange =
    (field: keyof EditSeasonData | "cityId") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (field === "cityId") {
        const cityId = Number(e.target.value);
        setSelectedCityId(cityId);
        // Сбрасываем выбранную лигу при смене города
        setFormData((prev) => ({ ...prev, leagueId: 0 }));
        // Загружаем лиги для выбранного города
        if (cityId > 0) {
          onCityChange(cityId);
        }
      } else if (field === "name" || field === "date") {
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
    const newErrors: Partial<Record<keyof EditSeasonData | "cityId", string>> =
      {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }
    if (!formData.date) {
      newErrors.date = "Дата обязательна";
    }
    if (selectedCityId === 0) {
      newErrors.cityId = "Выберите город";
    }
    if (formData.leagueId === 0) {
      newErrors.leagueId = "Выберите лигу";
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
      // Преобразуем дату в ISO формат с временной зоной
      const dateObj = new Date(formData.date);
      const isoDate = dateObj.toISOString();

      await onSubmit({
        ...formData,
        date: isoDate,
      });
      handleClose();
    } catch (error) {
      console.error("Error updating season:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      date: "",
      leagueId: 0,
    });
    setSelectedCityId(0);
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
        Редактировать сезон
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
            label="Название сезона"
            value={formData.name}
            onChange={handleChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
            fullWidth
            required
          />

          <TextField
            label="Дата"
            type="date"
            value={formData.date}
            onChange={handleChange("date")}
            error={Boolean(errors.date)}
            helperText={errors.date}
            disabled={loading}
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
            label="Город"
            select
            value={selectedCityId}
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
            label="Лига"
            select
            value={formData.leagueId}
            onChange={handleChange("leagueId")}
            error={Boolean(errors.leagueId)}
            helperText={errors.leagueId}
            disabled={loading || selectedCityId === 0}
            fullWidth
            required
          >
            <MenuItem value={0} disabled>
              Выберите лигу
            </MenuItem>
            {leagues.map((league) => (
              <MenuItem key={league.id} value={league.id}>
                {league.name}
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
          {loading ? <CircularProgress size={24} /> : "Сохранить"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditSeasonModal;
