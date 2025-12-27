// llf-webview/src/components/EditTeamModal.tsx

import { type FC, useState, useEffect, useMemo } from "react";
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
  CircularProgress,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { City } from "../types/city";
import type { League } from "../types/league";
import type { Team } from "../types/team";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store";
import { fetchLeagues, selectLeaguesByCity } from "../store/slices/leagueSlice";
import { ShirtIcon } from "./icons/ShirtIcon";

interface EditTeamModalProps {
  open: boolean;
  onClose: () => void;
  team: Team | null;
  cities: City[];
  token: string;
  sportType: number;
  onSubmit: (data: EditTeamData) => Promise<void>;
}

export interface EditTeamData {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  cityId: number;
  leagueId: number;
}

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_LEAGUES: League[] = [];

const EditTeamModal: FC<EditTeamModalProps> = ({
  open,
  onClose,
  team,
  cities,
  token,
  sportType,
  onSubmit,
}) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState<EditTeamData>({
    name: "",
    primaryColor: "#FFFFFF",
    secondaryColor: "#000000",
    cityId: 0,
    leagueId: 0,
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditTeamData, string>>
  >({});
  const [loading, setLoading] = useState(false);

  // Инициализируем formData данными команды при открытии модального окна
  useEffect(() => {
    if (open && team) {
      setFormData({
        name: team.name,
        primaryColor: team.primaryColor,
        secondaryColor: team.secondaryColor,
        cityId: team.cityId,
        leagueId: team.leagueId,
      });
    }
  }, [open, team]);

  // Создаём мемоизированный селектор чтобы избежать создания новой функции на каждый рендер
  const selectLeagues = useMemo(
    () => (state: RootState) =>
      formData.cityId > 0
        ? selectLeaguesByCity(String(formData.cityId))(state)
        : EMPTY_LEAGUES,
    [formData.cityId],
  );

  // Получаем лиги из Redux store
  const leagues = useAppSelector(selectLeagues);

  // Загружаем лиги при изменении города или вида спорта
  useEffect(() => {
    if (formData.cityId > 0 && token && sportType) {
      dispatch(
        fetchLeagues({
          cityId: formData.cityId,
          token,
          sportType,
        }),
      );
    }
  }, [formData.cityId, token, sportType, dispatch]);

  const handleChange =
    (field: keyof EditTeamData) => (e: React.ChangeEvent<HTMLInputElement>) => {
      // При изменении города сбрасываем выбранную лигу
      if (field === "cityId") {
        const cityId = Number(e.target.value);
        setFormData((prev) => ({ ...prev, cityId, leagueId: 0 }));
      } else if (field === "name") {
        setFormData((prev) => ({ ...prev, name: e.target.value }));
      } else if (field === "leagueId") {
        setFormData((prev) => ({ ...prev, leagueId: Number(e.target.value) }));
      } else if (field === "primaryColor") {
        setFormData((prev) => ({ ...prev, primaryColor: e.target.value }));
      } else if (field === "secondaryColor") {
        setFormData((prev) => ({ ...prev, secondaryColor: e.target.value }));
      }

      // Очищаем ошибку при изменении поля
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof EditTeamData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Название обязательно";
    }
    if (formData.cityId === 0) {
      newErrors.cityId = "Выберите город";
    }
    if (formData.leagueId === 0) {
      newErrors.leagueId = "Выберите лигу";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        primaryColor: "#FFFFFF",
        secondaryColor: "#000000",
        cityId: 0,
        leagueId: 0,
      });
      setErrors({});
      setLoading(false);
      onClose();
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } finally {
      setLoading(false);
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
        Редактировать команду
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
            label="Название команды"
            value={formData.name}
            onChange={handleChange("name")}
            error={Boolean(errors.name)}
            helperText={errors.name}
            disabled={loading}
            fullWidth
            required
            autoFocus
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              minWidth: 80,
            }}
          >
            {formData.primaryColor && formData.secondaryColor ? (
              <ShirtIcon
                size={64}
                color1={formData.primaryColor}
                color2={formData.secondaryColor}
              />
            ) : (
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "action.disabled",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography sx={{ fontSize: "32px" }}>👕</Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
            }}
          >
            <TextField
              label="Основной цвет"
              type="color"
              value={formData.primaryColor}
              onChange={handleChange("primaryColor")}
              disabled={loading}
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{
                "& input[type='color']": {
                  width: "100%",
                  height: "30px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  "&::-webkit-color-swatch-wrapper": {
                    padding: 0,
                  },
                  "&::-webkit-color-swatch": {
                    border: "none",
                    borderRadius: "4px",
                  },
                  "&::-moz-color-swatch": {
                    border: "none",
                    borderRadius: "4px",
                  },
                },
              }}
            />

            <TextField
              label="Дополнительный цвет"
              type="color"
              value={formData.secondaryColor}
              onChange={handleChange("secondaryColor")}
              disabled={loading}
              fullWidth
              slotProps={{
                inputLabel: { shrink: true },
              }}
              sx={{
                "& input[type='color']": {
                  width: "100%",
                  height: "30px",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  "&::-webkit-color-swatch-wrapper": {
                    padding: 0,
                  },
                  "&::-webkit-color-swatch": {
                    border: "none",
                    borderRadius: "4px",
                  },
                  "&::-moz-color-swatch": {
                    border: "none",
                    borderRadius: "4px",
                  },
                },
              }}
            />
          </Box>

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
            label="Лига"
            select
            value={formData.leagueId}
            onChange={handleChange("leagueId")}
            error={Boolean(errors.leagueId)}
            helperText={errors.leagueId}
            disabled={formData.cityId === 0 || loading}
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

export default EditTeamModal;
