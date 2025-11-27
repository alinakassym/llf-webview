import { type FC, useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Fab,
  Container,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import ManagementItemCard from "../components/ManagementItemCard";
import type { League, LeagueGroup } from "../types/league";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchLeaguesByCityId,
  selectLeaguesByCity,
  selectAllLeagues,
} from "../store/slices/leagueSlice";
import {
  fetchLeagueGroups,
  selectLeagueGroups,
  selectLeagueGroupsLoading,
} from "../store/slices/leagueGroupSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";

const LeagueManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const { cities, loading: citiesLoading } = useAppSelector(
    (state) => state.cities,
  );
  const leagueGroups = useAppSelector(selectLeagueGroups);
  const leagueGroupsLoading = useAppSelector(selectLeagueGroupsLoading);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("Все города");
  const [selectedGroup, setSelectedGroup] = useState<LeagueGroup>("Все группы");

  // Общий флаг загрузки: true если хотя бы один из флагов true
  const isLoading = useMemo(() => {
    return (
      authLoading || webViewLoading || citiesLoading || leagueGroupsLoading
    );
  }, [authLoading, webViewLoading, citiesLoading, leagueGroupsLoading]);

  // Загружаем города и группы лиг при монтировании
  useEffect(() => {
    // Используем webViewToken если доступен, иначе fallback на Firebase token
    const activeToken = webViewToken || token;

    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
      dispatch(fetchLeagueGroups(activeToken));
    }
  }, [token, webViewToken, authLoading, webViewLoading, dispatch]);

  const cityOptions = useMemo(() => {
    const cityNames = cities.map((city) => city.name);
    return ["Все города", ...cityNames];
  }, [cities]);

  // Формируем опции групп лиг из API
  const groupOptions = useMemo(() => {
    const groupNames = leagueGroups.map((group) => group.name);
    return ["Все группы", ...groupNames] as readonly LeagueGroup[];
  }, [leagueGroups]);

  // Загружаем лиги при выборе города
  useEffect(() => {
    const activeToken = webViewToken || token;

    // Если выбран конкретный город (не "Все города")
    if (
      selectedCity !== "Все города" &&
      activeToken &&
      !authLoading &&
      !webViewLoading
    ) {
      // Находим cityId выбранного города
      const selectedCityData = cities.find(
        (city) => city.name === selectedCity,
      );
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
    cities,
    token,
    webViewToken,
    authLoading,
    webViewLoading,
    dispatch,
  ]);

  // Получаем лиги в зависимости от выбранного города
  const selectedCityData = cities.find((city) => city.name === selectedCity);
  const leagues = useAppSelector((state) =>
    selectedCity === "Все города"
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
        selectedGroup === "Все группы" ||
        league.leagueGroupName === selectedGroup;

      return matchesSearch && matchesGroup;
    });
  }, [leagues, searchQuery, selectedGroup]);

  // Группировка лиг по городам для "Все города"
  const leaguesByCity = useMemo(() => {
    if (selectedCity !== "Все города") {
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
    console.log("Add new league");
    // TODO: Открыть модальное окно создания новой лиги
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
            {selectedCity !== "Все города" && (
              <FilterChips
                options={groupOptions}
                selected={selectedGroup}
                onSelect={setSelectedGroup}
              />
            )}
          </Box>

          <Box>
            {/* Рендеринг для "Все города" - группировка по городам */}
            {selectedCity === "Все города" && leaguesByCity ? (
              Object.keys(leaguesByCity).length > 0 ? (
                Object.entries(leaguesByCity).map(([cityName, cityLeagues]) => (
                  <Box key={cityName} sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      gutterBottom
                      sx={{ mb: 1, mt: 0 }}
                    >
                      {cityName}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      {cityLeagues.map((league) => (
                        <ManagementItemCard
                          key={league.id}
                          title={league.name}
                          subtitle={`Группа: ${league.leagueGroupName}`}
                          onEdit={() => handleEdit(league.id)}
                          onDelete={() => handleDelete(league.id, league.name)}
                        />
                      ))}
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  Лиги не найдены
                </Typography>
              )
            ) : (
              /* Рендеринг для конкретного города */
              <>
                <Typography
                  variant="subtitle2"
                  fontWeight={600}
                  gutterBottom
                  sx={{ mb: 1, mt: 0 }}
                >
                  {selectedCity}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column" }}>
                  {filteredLeagues.length > 0 ? (
                    filteredLeagues.map((league) => (
                      <ManagementItemCard
                        key={league.id}
                        title={league.name}
                        subtitle={`Группа: ${league.leagueGroupName}`}
                        onEdit={() => handleEdit(league.id)}
                        onDelete={() => handleDelete(league.id, league.name)}
                      />
                    ))
                  ) : (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      textAlign="center"
                      sx={{ py: 4 }}
                    >
                      Лиги не найдены
                    </Typography>
                  )}
                </Box>
              </>
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

export default LeagueManagementPage;
