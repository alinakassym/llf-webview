// llf-webview/src/pages/season-edit.tsx

import { type FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import EditSeasonModal, {
  type EditSeasonData,
} from "../components/EditSeasonModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchSeasons,
  selectSeasonsByCity,
  updateSeason,
} from "../store/slices/seasonSlice";
import { fetchLeagues, selectLeaguesByCity } from "../store/slices/leagueSlice";

const SeasonEditPage: FC = () => {
  const { seasonId, cityId, sportType } = useParams<{
    seasonId: string;
    cityId: string;
    sportType: string;
  }>();
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const activeToken = webViewToken || token;

  // Получаем данные из Redux
  const { cities, loading: citiesLoading } = useAppSelector(
    (state) => state.cities,
  );

  const seasons = useAppSelector((state) =>
    cityId ? selectSeasonsByCity(cityId)(state) : [],
  );

  const leagues = useAppSelector((state) =>
    cityId ? selectLeaguesByCity(cityId)(state) : [],
  );

  // Находим текущий сезон
  const season = seasons.find((s) => String(s.id) === seasonId) || null;

  // Загружаем города при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  // Загружаем сезоны для города
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading && cityId && sportType) {
      dispatch(
        fetchSeasons({
          cityId: Number(cityId),
          token: activeToken,
          sportType,
        }),
      );
    }
  }, [activeToken, authLoading, webViewLoading, cityId, sportType, dispatch]);

  // Загружаем лиги для города
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading && cityId && sportType) {
      dispatch(
        fetchLeagues({
          cityId: Number(cityId),
          token: activeToken,
          sportType,
        }),
      );
    }
  }, [activeToken, authLoading, webViewLoading, cityId, sportType, dispatch]);

  // Устанавливаем loading false когда данные загружены
  useEffect(() => {
    if (!citiesLoading && season) {
      setLoading(false);
    }
  }, [citiesLoading, season]);

  const handleOpenEditModal = () => {
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleCityChange = (newCityId: number) => {
    if (activeToken && sportType) {
      dispatch(
        fetchLeagues({
          cityId: newCityId,
          token: activeToken,
          sportType,
        }),
      );
    }
  };

  const handleUpdateSeason = async (data: EditSeasonData) => {
    if (!activeToken || !seasonId || !cityId) return;

    try {
      await dispatch(
        updateSeason({
          seasonId,
          cityId,
          data,
          token: activeToken,
        }),
      ).unwrap();

      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating season:", error);
      throw error;
    }
  };

  // Показываем loader
  if (loading || authLoading || webViewLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  // Если сезон не найден
  if (!season) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "background.default",
        }}
      >
        <Typography color="error">Сезон не найден</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        position: "fixed",
        left: 0,
        top: 0,
        right: 0,
        minHeight: "100vh",
        backgroundColor: "background.default",
      }}
    >
      <Container disableGutters maxWidth={false} sx={{ px: 0, pt: 0, pb: 10 }}>
        {/* Шапка с градиентом */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
            px: 2,
            pb: 2,
          }}
        >
          {/* Название сезона и иконка редактирования */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              pt: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
              }}
            >
              {season.name}
            </Typography>
            <IconButton
              onClick={handleOpenEditModal}
              sx={{
                color: "#FFFFFF",
                padding: 0.5,
              }}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Дополнительная информация */}
          <Box sx={{ mt: 1 }}>
            <Typography
              sx={{
                fontSize: "14px",
                color: "rgba(255, 255, 255, 0.8)",
              }}
            >
              {season.leagueName} • {season.cityName}
            </Typography>
          </Box>
        </Box>

        {/* Контент страницы */}
        <Box sx={{ px: 2, pt: 2 }}>
          <Typography variant="body1">
            Здесь будет контент страницы редактирования сезона
          </Typography>
        </Box>
      </Container>

      {/* Модальное окно редактирования названия */}
      <EditSeasonModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        cities={cities}
        leagues={leagues}
        onSubmit={handleUpdateSeason}
        onCityChange={handleCityChange}
        season={
          season
            ? {
                id: String(season.id),
                name: season.name,
                date: season.date,
                leagueId: season.leagueId,
                cityId: season.cityId,
              }
            : null
        }
      />
    </Box>
  );
};

export default SeasonEditPage;
