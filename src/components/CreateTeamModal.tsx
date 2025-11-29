// llf-webview/src/components/CreateTeamModal.tsx

import { type FC, useState, useEffect } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import type { City } from "../types/city";
import type { League } from "../types/league";
import { leagueService } from "../services/leagueService";

interface CreateTeamModalProps {
  open: boolean;
  onClose: () => void;
  cities: City[];
  token: string;
  onSubmit: (data: CreateTeamData) => Promise<void>;
}

export interface CreateTeamData {
  name: string;
  cityId: number;
  leagueId: string;
}

const CreateTeamModal: FC<CreateTeamModalProps> = ({
  open,
  onClose,
  cities,
  token,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateTeamData>({
    name: "",
    cityId: 0,
    leagueId: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateTeamData, string>>
  >({});
  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Загружаем лиги при изменении города
  useEffect(() => {
    const loadLeagues = async () => {
      if (formData.cityId > 0 && token) {
        setLeaguesLoading(true);
        try {
          const loadedLeagues = await leagueService.getLeaguesByCityId(
            String(formData.cityId),
            token,
          );
          setLeagues(loadedLeagues);
        } catch (error) {
          console.error("Error loading leagues:", error);
          setLeagues([]);
        } finally {
          setLeaguesLoading(false);
        }
      } else {
        setLeagues([]);
      }
    };

    loadLeagues();
  }, [formData.cityId, token]);

  const handleChange =
    (field: keyof CreateTeamData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      // При изменении города сбрасываем выбранную лигу
      if (field === "cityId") {
        const cityId = Number(e.target.value);
        setFormData((prev) => ({ ...prev, cityId, leagueId: "" }));
      } else if (field === "name") {
        setFormData((prev) => ({ ...prev, name: e.target.value }));
      } else if (field === "leagueId") {
        setFormData((prev) => ({ ...prev, leagueId: e.target.value }));
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
    if (!formData.leagueId) {
      newErrors.leagueId = "Выберите лигу";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        cityId: 0,
        leagueId: "",
      });
      setErrors({});
      setLeagues([]);
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
    } catch (error) {
      console.error("Error creating team:", error);
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
        Создать команду
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
            disabled={formData.cityId === 0 || leaguesLoading || loading}
            fullWidth
            required
          >
            {leaguesLoading ? (
              <MenuItem disabled>Загрузка...</MenuItem>
            ) : leagues.length === 0 ? (
              <MenuItem value="" disabled>
                Список лиг пустой
              </MenuItem>
            ) : (
              <>
                <MenuItem value="" disabled>
                  Выберите лигу
                </MenuItem>
                {leagues.map((league) => (
                  <MenuItem key={league.id} value={league.id}>
                    {league.name}
                  </MenuItem>
                ))}
              </>
            )}
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

export default CreateTeamModal;
