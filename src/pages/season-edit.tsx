// llf-webview/src/pages/season-edit.tsx

import { type FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  IconButton,
  Fab,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import EditSeasonModal, {
  type EditSeasonData,
} from "../components/EditSeasonModal";
import CreateTourModal, {
  type CreateTourData,
} from "../components/CreateTourModal";
import ToursList from "../components/ToursList";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import { updateSeason } from "../store/slices/seasonSlice";
import { fetchLeagues, selectLeaguesByCity } from "../store/slices/leagueSlice";
import { seasonService } from "../services/seasonService";
import { tourService } from "../services/tourService";
import type { Season } from "../types/season";
import type { Tour } from "../types/tour";

const SeasonEditPage: FC = () => {
  const { seasonId, sportType } = useParams<{
    seasonId: string;
    sportType: string;
  }>();
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateTourModalOpen, setIsCreateTourModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [season, setSeason] = useState<Season | null>(null);
  const [modalCityId, setModalCityId] = useState<number>(0);
  const [tours, setTours] = useState<Tour[]>([]);

  const activeToken = webViewToken || token;

  // Получаем данные из Redux

  const { cities } = useAppSelector((state) => state.cities);

  // Используем modalCityId если модал открыт, иначе cityId сезона
  const leagues = useAppSelector((state) =>
    modalCityId > 0
      ? selectLeaguesByCity(String(modalCityId))(state)
      : season
      ? selectLeaguesByCity(String(season.cityId))(state)
      : [],
  );

  // Загружаем города при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  // Загружаем сезон по ID
  useEffect(() => {
    const loadSeason = async () => {
      if (activeToken && !authLoading && !webViewLoading && seasonId) {
        try {
          setLoading(true);
          const loadedSeason = await seasonService.getSeasonById(
            seasonId,
            activeToken,
          );
          setSeason(loadedSeason);

          // Загружаем туры для сезона
          const loadedTours = await tourService.getTours(seasonId, activeToken);
          setTours(loadedTours);
        } catch (error) {
          console.error("Error loading season:", error);
          setSeason(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadSeason();
  }, [activeToken, authLoading, webViewLoading, seasonId]);

  const handleOpenEditModal = () => {
    // Устанавливаем город сезона как текущий для модала
    if (season) {
      setModalCityId(season.cityId);
      // Загружаем лиги для города сезона при открытии модалки
      if (activeToken && sportType) {
        dispatch(
          fetchLeagues({
            cityId: season.cityId,
            token: activeToken,
            sportType,
          }),
        );
      }
    }
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setModalCityId(0);
  };

  const handleCityChange = (newCityId: number) => {
    setModalCityId(newCityId);
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
    if (!activeToken || !seasonId || !season) return;

    try {
      await dispatch(
        updateSeason({
          seasonId,
          data,
          token: activeToken,
        }),
      ).unwrap();

      // Reload season after update
      const updatedSeason = await seasonService.getSeasonById(
        seasonId,
        activeToken,
      );
      setSeason(updatedSeason);

      handleCloseEditModal();
    } catch (error) {
      console.error("Error updating season:", error);
      throw error;
    }
  };

  const handleAddTour = () => {
    setIsCreateTourModalOpen(true);
  };

  const handleCloseCreateTourModal = () => {
    setIsCreateTourModalOpen(false);
  };

  const handleCreateTour = async (data: CreateTourData) => {
    if (!activeToken || !seasonId || !season) return;

    try {
      const updatedTours = await tourService.createTour(
        {
          seasonId: season.id,
          ...data,
        },
        activeToken,
      );

      // Обновляем список туров
      if (updatedTours && Array.isArray(updatedTours)) {
        setTours(updatedTours);
      }
    } catch (error) {
      console.error("Error creating tour:", error);
      throw error;
    }
  };

  // Вычисляем номер следующего тура
  const nextTourNumber = tours && tours.length > 0
    ? Math.max(...tours.map((tour) => tour.number || 0)) + 1
    : 1;

  const handleEditTour = (tourId: number) => {
    console.log("Edit tour with ID:", tourId);
    alert("Функционал редактирования тура в разработке");
  };

  const handleDeleteTour = (tourId: number, tourName: string) => {
    console.log("Delete tour with ID:", tourId, tourName);
    alert("Функционал удаления тура в разработке");
  };

  const handleAddMatch = (tourId: number) => {
    console.log("Add match to tour with ID:", tourId);
    alert("Функционал добавления матча в разработке");
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
          backgroundColor: "surface",
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
        backgroundColor: "surface",
      }}
    >
      <Container disableGutters maxWidth={false} sx={{ px: 0, pt: 0, pb: 10 }}>
        {/* Шапка с градиентом */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
            pl: 2,
            pr: 1,
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
              pt: 1,
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
                padding: 2,
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
              {new Date(season.date).toLocaleDateString("ru-RU", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}{" "}
              <br />
              {season.leagueName} • {season.cityName}
            </Typography>
          </Box>
        </Box>

        {/* Контент страницы */}
        <Box
          sx={{
            px: 2,
            pt: 2,
            pb: 10,
            height: "calc(100vh - 126px)",
            overflowY: "auto",
          }}
        >
          <ToursList
            tours={tours}
            onEdit={handleEditTour}
            onDelete={handleDeleteTour}
            onAddMatch={handleAddMatch}
          />
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

      {/* Модальное окно создания тура */}
      <CreateTourModal
        open={isCreateTourModalOpen}
        onClose={handleCloseCreateTourModal}
        onSubmit={handleCreateTour}
        nextTourNumber={nextTourNumber}
      />

      {/* Кнопка добавления тура */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAddTour}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default SeasonEditPage;
