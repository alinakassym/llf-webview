// llf-webview/src/pages/season-edit.tsx

import { type FC, useState, useEffect, useMemo } from "react";
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
import EditTourModal, {
  type EditTourData,
} from "../components/EditTourModal";
import CreateMatchModal, {
  type CreateMatchData,
} from "../components/CreateMatchModal";
import EditMatchModal, {
  type EditMatchData,
} from "../components/EditMatchModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import ToursList from "../components/ToursList";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store";
import { fetchCities } from "../store/slices/citySlice";
import { updateSeason } from "../store/slices/seasonSlice";
import { fetchLeagues, selectLeaguesByCity } from "../store/slices/leagueSlice";
import { seasonService } from "../services/seasonService";
import { tourService } from "../services/tourService";
import { matchService } from "../services/matchService";
import { teamService } from "../services/teamService";
import type { Season } from "../types/season";
import type { Tour, Match } from "../types/tour";
import type { Team } from "../types/team";
import type { League } from "../types/league";

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_LEAGUES: League[] = [];

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
  const [isEditTourModalOpen, setIsEditTourModalOpen] = useState(false);
  const [isCreateMatchModalOpen, setIsCreateMatchModalOpen] = useState(false);
  const [isEditMatchModalOpen, setIsEditMatchModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [season, setSeason] = useState<Season | null>(null);
  const [modalCityId, setModalCityId] = useState<number>(0);
  const [tours, setTours] = useState<Tour[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [selectedTour, setSelectedTour] = useState<Tour | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteMatchDialogOpen, setDeleteMatchDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeToken = webViewToken || token;

  // Получаем данные из Redux

  const { cities } = useAppSelector((state) => state.cities);

  // Создаём мемоизированный селектор чтобы избежать создания новой функции на каждый рендер
  const selectLeagues = useMemo(() => {
    const cityId = modalCityId > 0 ? modalCityId : season?.cityId || 0;
    return (state: RootState) =>
      cityId > 0 ? selectLeaguesByCity(String(cityId))(state) : EMPTY_LEAGUES;
  }, [modalCityId, season?.cityId]);

  // Используем modalCityId если модал открыт, иначе cityId сезона
  const leagues = useAppSelector(selectLeagues);

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
            sportType: Number(sportType),
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
          sportType: Number(sportType),
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
      const newTour = await tourService.createTour(
        {
          seasonId: season.id,
          ...data,
        },
        activeToken,
      );

      // Добавляем новый тур к существующему списку
      setTours((prevTours) => [...prevTours, newTour]);

      handleCloseCreateTourModal();
    } catch (error) {
      console.error("Error creating tour:", error);
      throw error;
    }
  };

  // Вычисляем номер следующего тура
  const nextTourNumber =
    tours && tours.length > 0
      ? Math.max(...tours.map((tour) => tour.number || 0)) + 1
      : 1;

  const handleEditTour = (tourId: number) => {
    const tour = tours.find((t) => t.id === tourId);
    if (tour) {
      setSelectedTour(tour);
      setIsEditTourModalOpen(true);
    }
  };

  const handleCloseEditTourModal = () => {
    setIsEditTourModalOpen(false);
    setSelectedTour(null);
  };

  const handleUpdateTour = async (data: EditTourData) => {
    if (!activeToken || !selectedTour || !seasonId) return;

    try {
      await tourService.updateTour(selectedTour.id, data, activeToken);

      // Перезагружаем туры для обновления списка
      const loadedTours = await tourService.getTours(seasonId, activeToken);
      setTours(loadedTours);

      handleCloseEditTourModal();
    } catch (error) {
      console.error("Error updating tour:", error);
      throw error;
    }
  };

  const handleDeleteTour = (tourId: number, tourName: string) => {
    setTourToDelete({
      id: tourId,
      name: tourName,
    });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setTourToDelete(null);
    }
  };

  const handleConfirmDeleteTour = async () => {
    if (!tourToDelete || !activeToken || !seasonId) {
      return;
    }

    setIsDeleting(true);
    try {
      await tourService.deleteTour(tourToDelete.id, activeToken);

      // Перезагружаем туры для обновления списка
      const loadedTours = await tourService.getTours(seasonId, activeToken);
      setTours(loadedTours);

      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting tour:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Общая функция для загрузки команд
  const loadTeams = async () => {
    if (!activeToken || !season || !sportType) {
      return;
    }

    // Если команды уже загружены, не загружаем повторно
    if (teams.length > 0) {
      return;
    }

    try {
      setTeamsLoading(true);
      const loadedTeams = await teamService.getTeams(
        activeToken,
        season.cityId,
        season.leagueId,
        sportType,
      );
      setTeams(loadedTeams);
    } catch (error) {
      console.error("Error loading teams:", error);
    } finally {
      setTeamsLoading(false);
    }
  };

  const handleAddMatch = async (tourId: number) => {
    setSelectedTourId(tourId);
    await loadTeams();
    setIsCreateMatchModalOpen(true);
  };

  const handleCloseCreateMatchModal = () => {
    setIsCreateMatchModalOpen(false);
    setSelectedTourId(null);
    // Не очищаем teams - оставляем в кеше для повторного использования
  };

  const handleCreateMatch = async (data: CreateMatchData) => {
    if (!activeToken || !selectedTourId || !seasonId) return;

    try {
      await matchService.createMatch(selectedTourId, data, activeToken);

      // Перезагружаем туры для обновления списка матчей
      const loadedTours = await tourService.getTours(seasonId, activeToken);
      setTours(loadedTours);

      handleCloseCreateMatchModal();
    } catch (error) {
      console.error("Error creating match:", error);
      throw error;
    }
  };

  const handleEditMatch = async (matchId: number) => {
    // Находим матч по ID во всех турах
    let foundMatch: Match | null = null;
    for (const tour of tours) {
      const match = tour.matches?.find((m) => m.id === matchId);
      if (match) {
        foundMatch = match;
        break;
      }
    }

    if (foundMatch) {
      setSelectedMatch(foundMatch);
      await loadTeams();
      setIsEditMatchModalOpen(true);
    }
  };

  const handleUpdateMatch = async (matchId: number, data: EditMatchData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }

    try {
      await matchService.updateMatch(matchId, data, activeToken);

      // Перезагружаем туры для обновления списка матчей
      const loadedTours = await tourService.getTours(seasonId!, activeToken);
      setTours(loadedTours);

      handleCloseEditMatchModal();
    } catch (error) {
      console.error("Error updating match:", error);
      throw error;
    }
  };

  const handleCloseEditMatchModal = () => {
    setIsEditMatchModalOpen(false);
    setSelectedMatch(null);
  };

  const handleDeleteMatch = (matchId: number, matchTitle: string) => {
    setMatchToDelete({ id: matchId, title: matchTitle });
    setDeleteMatchDialogOpen(true);
  };

  const handleCloseDeleteMatchDialog = () => {
    if (!isDeleting) {
      setDeleteMatchDialogOpen(false);
      setMatchToDelete(null);
    }
  };

  const handleConfirmDeleteMatch = async () => {
    if (!matchToDelete || !activeToken || !seasonId) {
      return;
    }

    setIsDeleting(true);
    try {
      await matchService.deleteMatch(matchToDelete.id, activeToken);

      // Перезагружаем туры для обновления списка матчей
      const loadedTours = await tourService.getTours(seasonId, activeToken);
      setTours(loadedTours);

      handleCloseDeleteMatchDialog();
    } catch (error) {
      console.error("Error deleting match:", error);
    } finally {
      setIsDeleting(false);
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
            pb: 1,
          }}
        >
          {/* Название сезона и иконка редактирования */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: "#FFFFFF",
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {season.name}
            </Typography>
            <IconButton
              onClick={handleOpenEditModal}
              sx={{
                color: "#FFFFFF",
                padding: 1,
              }}
              size="small"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Дополнительная информация */}
          <Box>
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
            height: "calc(100vh - 86px)",
            overflowY: "auto",
          }}
        >
          <ToursList
            tours={tours}
            onEdit={handleEditTour}
            onDelete={handleDeleteTour}
            onAddMatch={handleAddMatch}
            onEditMatch={handleEditMatch}
            onDeleteMatch={handleDeleteMatch}
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

      {/* Модальное окно редактирования тура */}
      <EditTourModal
        open={isEditTourModalOpen}
        onClose={handleCloseEditTourModal}
        onSubmit={handleUpdateTour}
        tour={selectedTour}
      />

      {/* Диалог подтверждения удаления тура */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteTour}
        title="Удалить тур?"
        message={
          tourToDelete
            ? `Вы уверены, что хотите удалить тур "${tourToDelete.name}"? Это действие нельзя отменить.`
            : ""
        }
        loading={isDeleting}
      />

      {/* Диалог подтверждения удаления матча */}
      <DeleteConfirmDialog
        open={deleteMatchDialogOpen}
        onClose={handleCloseDeleteMatchDialog}
        onConfirm={handleConfirmDeleteMatch}
        title="Удалить матч?"
        message={
          matchToDelete
            ? `Вы уверены, что хотите удалить матч "${matchToDelete.title}"? Это действие нельзя отменить.`
            : ""
        }
        loading={isDeleting}
      />

      {/* Модальное окно создания матча */}
      {selectedTourId && (
        <CreateMatchModal
          open={isCreateMatchModalOpen}
          onClose={handleCloseCreateMatchModal}
          onSubmit={handleCreateMatch}
          tourId={selectedTourId}
          sportType={Number(sportType)}
          teams={teams}
          loading={teamsLoading}
        />
      )}

      {/* Модальное окно редактирования матча */}
      <EditMatchModal
        open={isEditMatchModalOpen}
        onClose={handleCloseEditMatchModal}
        onSubmit={handleUpdateMatch}
        match={selectedMatch}
        teams={teams}
        loading={teamsLoading}
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
