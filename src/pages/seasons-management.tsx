// llf-webview/src/pages/seasons-management.tsx

import { type FC, useState, useMemo, useEffect, useCallback } from "react";
import { Box, Fab, Container, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import AllCitiesSeasonsList from "../components/AllCitiesSeasonsList";
import CreateSeasonModal, {
  type CreateSeasonData,
} from "../components/CreateSeasonModal";
import EditSeasonModal, {
  type EditSeasonData,
} from "../components/EditSeasonModal";
import type { Season } from "../types/season";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchSeasonsByCityId,
  selectSeasonsByCity,
  selectAllSeasons,
  createSeason,
  updateSeason,
} from "../store/slices/seasonSlice";
import {
  fetchLeaguesByCityId,
  selectLeaguesByCity,
} from "../store/slices/leagueSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { ALL_CITIES } from "../constants/leagueManagement";

const SeasonsManagementPage: FC = () => {
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editSeason, setEditSeason] = useState<Season | null>(null);
  const [editModalCityId, setEditModalCityId] = useState<number>(0);

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
    if (!activeToken || authLoading || webViewLoading || cities.length === 0) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем сезоны для всех городов
      cities.forEach((city) => {
        dispatch(
          fetchSeasonsByCityId({
            cityId: String(city.id),
            token: activeToken,
          }),
        );
      });
    } else {
      // Загружаем сезоны для конкретного города
      if (selectedCityData) {
        dispatch(
          fetchSeasonsByCityId({
            cityId: String(selectedCityData.id),
            token: activeToken,
          }),
        );
      }
    }
  }, [
    selectedCity,
    selectedCityData,
    cities,
    activeToken,
    authLoading,
    webViewLoading,
    dispatch,
  ]);

  // Получаем сезоны в зависимости от выбранного города
  const seasons = useAppSelector((state) =>
    selectedCity === ALL_CITIES
      ? selectAllSeasons(state)
      : selectedCityData
      ? selectSeasonsByCity(String(selectedCityData.id))(state)
      : [],
  );

  // Получаем лиги для модала создания
  const modalLeagues = useAppSelector((state) =>
    modalCityId > 0 ? selectLeaguesByCity(String(modalCityId))(state) : [],
  );

  // Получаем лиги для модала редактирования
  const editModalLeagues = useAppSelector((state) =>
    editModalCityId > 0
      ? selectLeaguesByCity(String(editModalCityId))(state)
      : [],
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
      setEditSeason(season);
      setEditModalCityId(season.cityId);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (seasonId: string, seasonName: string) => {
    console.log("Delete season:", seasonId, seasonName);
    // TODO: Показать диалог подтверждения и удалить сезон
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
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditSeason(null);
    setEditModalCityId(0);
  };

  const handleUpdateSeason = async (data: EditSeasonData) => {
    console.log("Updating season with data:", data);
    if (!activeToken || !editSeason) {
      throw new Error("No auth token or season available");
    }

    const oldCityId = editSeason.cityId;

    // Обновляем сезон
    await dispatch(
      updateSeason({
        seasonId: String(editSeason.id),
        data,
        token: activeToken,
      }),
    ).unwrap();

    // Перезагружаем сезоны для старого города
    if (oldCityId) {
      await dispatch(
        fetchSeasonsByCityId({
          cityId: String(oldCityId),
          token: activeToken,
        }),
      );
    }

    // Перезагружаем сезоны для нового города (если лига в другом городе)
    const newLeague = editModalLeagues.find(
      (l) => l.id === String(data.leagueId),
    );
    if (newLeague && newLeague.cityId !== String(oldCityId)) {
      await dispatch(
        fetchSeasonsByCityId({
          cityId: String(newLeague.cityId),
          token: activeToken,
        }),
      );
    }
  };

  const handleCityChangeInModal = useCallback(
    (cityId: number) => {
      if (!activeToken) return;
      setModalCityId(cityId);
      dispatch(
        fetchLeaguesByCityId({ cityId: String(cityId), token: activeToken }),
      );
    },
    [activeToken, dispatch],
  );

  const handleCityChangeInEditModal = useCallback(
    (cityId: number) => {
      if (!activeToken) return;
      setEditModalCityId(cityId);
      dispatch(
        fetchLeaguesByCityId({ cityId: String(cityId), token: activeToken }),
      );
    },
    [activeToken, dispatch],
  );

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
      <Container maxWidth="md" sx={{ py: 2, pb: 10 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Отображение ошибок */}
          {citiesError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              Ошибка загрузки городов: {citiesError}
            </Alert>
          )}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск сезона..."
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <FilterChips
              options={cityOptions as readonly string[]}
              selected={selectedCity}
              onSelect={setSelectedCity}
            />
          </Box>

          <Box>
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

      <EditSeasonModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        cities={cities}
        leagues={editModalLeagues}
        onSubmit={handleUpdateSeason}
        onCityChange={handleCityChangeInEditModal}
        season={
          editSeason
            ? {
                id: String(editSeason.id),
                name: editSeason.name,
                date: editSeason.date,
                leagueId: editSeason.leagueId,
                cityId: editSeason.cityId,
              }
            : null
        }
      />
    </Box>
  );
};

export default SeasonsManagementPage;
