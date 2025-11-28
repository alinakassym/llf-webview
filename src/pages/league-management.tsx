// llf-webview/src/pages/league-management.tsx
import { type FC, useState, useMemo, useEffect } from "react";
import {
  Box,
  Fab,
  Container,
  CircularProgress,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import SingleCityLeaguesList from "../components/SingleCityLeaguesList";
import AllCitiesLeaguesList from "../components/AllCitiesLeaguesList";
import CreateLeagueModal, {
  type CreateLeagueData,
} from "../components/CreateLeagueModal";
import type { League, LeagueGroup } from "../types/league";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchLeaguesByCityId,
  selectLeaguesByCity,
  selectAllLeagues,
  createLeague,
} from "../store/slices/leagueSlice";
import {
  fetchLeagueGroups,
  selectLeagueGroups,
  selectLeagueGroupsLoading,
  selectLeagueGroupsError,
} from "../store/slices/leagueGroupSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { ALL_CITIES, ALL_GROUPS } from "../constants/leagueManagement";

const LeagueManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useAppSelector((state) => state.cities);
  const leagueGroups = useAppSelector(selectLeagueGroups);
  const leagueGroupsLoading = useAppSelector(selectLeagueGroupsLoading);
  const leagueGroupsError = useAppSelector(selectLeagueGroupsError);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [selectedGroup, setSelectedGroup] = useState<LeagueGroup>(ALL_GROUPS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Общий флаг загрузки: true если хотя бы один из флагов true
  const isLoading = useMemo(() => {
    return (
      authLoading || webViewLoading || citiesLoading || leagueGroupsLoading
    );
  }, [authLoading, webViewLoading, citiesLoading, leagueGroupsLoading]);

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

  // Формируем опции групп лиг из API
  const groupOptions = useMemo(() => {
    const groupNames = leagueGroups.map((group) => group.name);
    return [ALL_GROUPS, ...groupNames] as readonly LeagueGroup[];
  }, [leagueGroups]);

  // Находим данные выбранного города
  const selectedCityData = useMemo(
    () => cities.find((city) => city.name === selectedCity),
    [cities, selectedCity],
  );

  // Загружаем группы лиг в зависимости от выбранного города
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем все группы лиг без фильтрации
      dispatch(fetchLeagueGroups({ token: activeToken }));
    } else {
      // Загружаем группы лиг для конкретного города
      if (selectedCityData) {
        dispatch(
          fetchLeagueGroups({
            token: activeToken,
            cityId: String(selectedCityData.id),
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
    dispatch,
  ]);

  // Загружаем лиги при выборе города
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading || cities.length === 0) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем лиги для всех городов
      cities.forEach((city) => {
        dispatch(
          fetchLeaguesByCityId({
            cityId: String(city.id),
            token: activeToken,
          }),
        );
      });
    } else {
      // Загружаем лиги для конкретного города
      if (selectedCityData) {
        dispatch(
          fetchLeaguesByCityId({
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

  // Получаем лиги в зависимости от выбранного города
  const leagues = useAppSelector((state) =>
    selectedCity === ALL_CITIES
      ? selectAllLeagues(state)
      : selectedCityData
      ? selectLeaguesByCity(String(selectedCityData.id))(state)
      : [],
  );

  const filteredLeagues = useMemo(() => {
    return leagues.filter((league: League) => {
      const matchesSearch = league.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesGroup =
        selectedGroup === ALL_GROUPS ||
        league.leagueGroupName === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [leagues, searchQuery, selectedGroup]);

  // Группировка лиг по городам для "Все города"
  const leaguesByCity = useMemo(() => {
    if (selectedCity !== ALL_CITIES) {
      return null;
    }

    const grouped: Record<string, League[]> = {};
    filteredLeagues.forEach((league) => {
      const cityName = league.cityName;
      if (!grouped[cityName]) {
        grouped[cityName] = [];
      }
      grouped[cityName].push(league);
    });

    return grouped;
  }, [selectedCity, filteredLeagues]);

  const handleEdit = (leagueId: string) => {
    console.log("Edit league:", leagueId);
    // TODO: Открыть модальное окно редактирования или перейти на страницу редактирования
  };

  const handleDelete = (leagueId: string, leagueName: string) => {
    console.log("Delete league:", leagueId, leagueName);
    // TODO: Показать диалог подтверждения и удалить лигу
  };

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateLeague = async (data: CreateLeagueData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(createLeague({ data, token: activeToken })).unwrap();
  };

  const handleCityChangeInModal = (cityId: number) => {
    if (!activeToken) return;
    dispatch(fetchLeagueGroups({ token: activeToken, cityId: String(cityId) }));
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
          {leagueGroupsError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              Ошибка загрузки групп лиг: {leagueGroupsError}
            </Alert>
          )}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск лиги..."
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <FilterChips
              options={cityOptions as readonly string[]}
              selected={selectedCity}
              onSelect={setSelectedCity}
            />
            {/* Показываем фильтр по группам только если выбран конкретный город */}
            {selectedCity !== ALL_CITIES && (
              <FilterChips
                options={groupOptions}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
              />
            )}
          </Box>

          <Box>
            {selectedCity === ALL_CITIES && leaguesByCity ? (
              <AllCitiesLeaguesList
                leaguesByCity={leaguesByCity}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <SingleCityLeaguesList
                cityName={selectedCity}
                leagues={filteredLeagues}
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

      <CreateLeagueModal
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        cities={cities}
        leagueGroups={leagueGroups}
        onSubmit={handleCreateLeague}
        onCityChange={handleCityChangeInModal}
      />
    </Box>
  );
};

export default LeagueManagementPage;
