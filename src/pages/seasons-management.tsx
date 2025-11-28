// llf-webview/src/pages/seasons-management.tsx
import { type FC, useState, useMemo, useEffect } from "react";
import { Box, Fab, Container, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import SingleCitySeasonsList from "../components/SingleCitySeasonsList";
import AllCitiesSeasonsList from "../components/AllCitiesSeasonsList";
import type { Season } from "../types/season";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchSeasonsByCityId,
  selectSeasonsByCity,
  selectAllSeasons,
} from "../store/slices/seasonSlice";
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

  const filteredSeasons = useMemo(() => {
    return seasons.filter((season: Season) => {
      const matchesSearch = season.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [seasons, searchQuery]);

  // Группировка сезонов по городам для "Все города"
  const seasonsByCity = useMemo(() => {
    if (selectedCity !== ALL_CITIES) {
      return null;
    }

    const grouped: Record<string, Season[]> = {};
    filteredSeasons.forEach((season) => {
      const cityName = season.cityName;
      if (!grouped[cityName]) {
        grouped[cityName] = [];
      }
      grouped[cityName].push(season);
    });

    return grouped;
  }, [selectedCity, filteredSeasons]);

  const handleEdit = (seasonId: string) => {
    console.log("Edit season:", seasonId);
    // TODO: Открыть модальное окно редактирования
  };

  const handleDelete = (seasonId: string, seasonName: string) => {
    console.log("Delete season:", seasonId, seasonName);
    // TODO: Показать диалог подтверждения и удалить сезон
  };

  const handleAdd = () => {
    console.log("Add season");
    // TODO: Открыть модальное окно создания сезона
  };

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
            {selectedCity === ALL_CITIES && seasonsByCity ? (
              <AllCitiesSeasonsList
                seasonsByCity={seasonsByCity}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <SingleCitySeasonsList
                cityName={selectedCity}
                seasons={filteredSeasons}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
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
    </Box>
  );
};

export default SeasonsManagementPage;
