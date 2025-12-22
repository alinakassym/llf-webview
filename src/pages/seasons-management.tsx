// llf-webview/src/pages/seasons-management.tsx

import { type FC, useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Fab, Container, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import AllCitiesSeasonsList from "../components/AllCitiesSeasonsList";
import CreateSeasonModal, {
  type CreateSeasonData,
} from "../components/CreateSeasonModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import type { Season } from "../types/season";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchSeasons,
  selectSeasonsByCity,
  createSeason,
  deleteSeason,
} from "../store/slices/seasonSlice";
import {
  fetchLeagues,
  selectLeaguesByCity,
} from "../store/slices/leagueSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { ALL_CITIES } from "../constants/leagueManagement";
import { SportSelectRow, type Sport } from "../components/SportSelectRow";
import { SportType, SportTypeName } from "../types/sportType";

const SPORTS: Sport[] = [
  {
    id: SportType.Volleyball,
    name: SportTypeName[SportType.Volleyball],
    icon: "volleyball",
    color: "#5060D8",
  },
  {
    id: SportType.Football,
    name: SportTypeName[SportType.Football],
    icon: "football",
    color: "#8450D8",
  },
];

const SeasonsManagementPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useAppSelector((state) => state.cities);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalCityId, setModalCityId] = useState<number>(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seasonToDelete, setSeasonToDelete] = useState<{
    id: string;
    name: string;
    cityId: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSportType, setSelectedSportType] = useState<string>("2");

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Общий флаг загрузки: true если хотя бы один из флагов true
  const isLoading = useMemo(() => {
    return authLoading || webViewLoading || citiesLoading;
  }, [authLoading, webViewLoading, citiesLoading]);

  // Загружаем города при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  const cityOptions = useMemo(() => {
    const cityNames = cities.map((city) => city.name);
    return [ALL_CITIES, ...cityNames];
  }, [cities]);

  // Находим данные выбранного города
  const selectedCityData = useMemo(
    () => cities.find((city) => city.name === selectedCity),
    [cities, selectedCity],
  );

  // Загружаем сезоны при выборе города
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем все сезоны одним запросом без cityId
      dispatch(
        fetchSeasons({
          token: activeToken,
          sportType: selectedSportType,
        }),
      );
    } else {
      // Загружаем сезоны для конкретного города
      if (selectedCityData) {
        dispatch(
          fetchSeasons({
            cityId: selectedCityData.id,
            token: activeToken,
            sportType: selectedSportType,
          }),
        );
      }
    }
  }, [
    selectedCity,
    selectedCityData,
    activeToken,
    authLoading,
    webViewLoading,
    selectedSportType,
    dispatch,
  ]);

  // Получаем сезоны в зависимости от выбранного города
  const seasons = useAppSelector((state) =>
    selectedCity === ALL_CITIES
      ? selectSeasonsByCity("__ALL__")(state)
      : selectedCityData
      ? selectSeasonsByCity(String(selectedCityData.id))(state)
      : [],
  );

  // Получаем лиги для модала создания
  const modalLeagues = useAppSelector((state) =>
    modalCityId > 0 ? selectLeaguesByCity(String(modalCityId))(state) : [],
  );

  const filteredSeasons = useMemo(() => {
    return seasons.filter((season: Season) => {
      const matchesSearch = (season.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [seasons, searchQuery]);

  // Группировка сезонов по городу и лиге
  const seasonsByGroup = useMemo(() => {
    const grouped: Record<string, Season[]> = {};
    filteredSeasons.forEach((season) => {
      // Защита от undefined значений
      if (!season || !season.leagueName) {
        return;
      }

      const groupKey =
        selectedCity === ALL_CITIES
          ? `${season.cityName || "Неизвестный город"} - ${season.leagueName}`
          : season.leagueName;
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(season);
    });

    return grouped;
  }, [selectedCity, filteredSeasons]);

  const handleEdit = (seasonId: string) => {
    // Находим сезон по ID
    const season = seasons.find((s) => String(s.id) === seasonId);
    if (season) {
      // Переходим на страницу редактирования сезона
      navigate(`/season-edit/${season.cityId}/${seasonId}/${selectedSportType}`);
    }
  };

  const handleDelete = (seasonId: string, seasonName: string) => {
    // Находим сезон чтобы получить его cityId
    const season = seasons.find((s) => String(s.id) === String(seasonId));
    if (season) {
      setSeasonToDelete({
        id: seasonId,
        name: seasonName,
        cityId: String(season.cityId),
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setModalCityId(0);
  };

  const handleCreateSeason = async (data: CreateSeasonData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(createSeason({ data, token: activeToken })).unwrap();

    // Перезагружаем сезоны после создания
    if (selectedCity === ALL_CITIES) {
      dispatch(fetchSeasons({ token: activeToken, sportType: selectedSportType }));
    } else if (selectedCityData) {
      dispatch(fetchSeasons({ cityId: selectedCityData.id, token: activeToken, sportType: selectedSportType }));
    }
  };

  const handleCityChangeInModal = useCallback(
    (cityId: number) => {
      if (!activeToken) return;
      setModalCityId(cityId);
      dispatch(
        fetchLeagues({
          cityId: cityId,
          token: activeToken,
          sportType: selectedSportType,
        })
      );
    },
    [activeToken, selectedSportType, dispatch],
  );

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setSeasonToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!seasonToDelete || !activeToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await dispatch(
        deleteSeason({
          seasonId: seasonToDelete.id,
          cityId: seasonToDelete.cityId,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting season:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSportChange = useCallback((sportId: string) => {
    setSelectedSportType(sportId);
  }, []);

  // Если идет загрузка - показываем loader на весь экран
  if (isLoading) {
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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <Box
        sx={{
          padding: "0 8px",
          width: "100%",
          minHeight: 48,
          maxHeight: 48,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: 1,
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
        }}
      >
        <div style={{ marginTop: 8 }}>
          <SportSelectRow sports={SPORTS} onSportChange={handleSportChange} />
        </div>
        <SearchBar
          variant="standard"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск сезона..."
          iconColor="#FFFFFF"
          textColor="#FFFFFF"
          borderBottomColor="tertiary.main"
        />
      </Box>
      <Container disableGutters maxWidth={false} sx={{ pt: 2, px: 0, pb: 10 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Отображение ошибок */}
          {citiesError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              Ошибка загрузки городов: {citiesError}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <FilterChips
              options={cityOptions as readonly string[]}
              selected={selectedCity}
              onSelect={setSelectedCity}
            />
          </Box>

          <Box sx={{ px: 2 }}>
            <AllCitiesSeasonsList
              seasonsByCity={seasonsByGroup}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Box>
        </Box>
      </Container>

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleAdd}
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
        }}
      >
        <AddIcon />
      </Fab>

      <CreateSeasonModal
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        cities={cities}
        leagues={modalLeagues}
        onSubmit={handleCreateSeason}
        onCityChange={handleCityChangeInModal}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Удалить сезон?"
        message={
          seasonToDelete
            ? `Вы уверены, что хотите удалить сезон "${seasonToDelete.name}"? Это действие нельзя отменить.`
            : ""
        }
        loading={isDeleting}
      />
    </Box>
  );
};

export default SeasonsManagementPage;
