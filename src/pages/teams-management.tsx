// llf-webview/src/pages/teams-management.tsx

import { type FC, useState, useMemo, useEffect } from "react";
import { Box, Container, Tabs, Tab, CircularProgress, Typography, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import ManagementItemCard from "../components/ManagementItemCard";
import CreateTeamModal, {
  type CreateTeamData,
} from "../components/CreateTeamModal";
import type { Team } from "../types/team";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchTeamsByCityId,
  selectTeamsByCity,
  selectAllTeams,
  createTeam,
} from "../store/slices/teamSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { ALL_CITIES } from "../constants/leagueManagement";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`teams-tabpanel-${index}`}
      aria-labelledby={`teams-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const TeamsManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useAppSelector((state) => state.cities);

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Общий флаг загрузки
  const isLoading = useMemo(() => {
    return authLoading || webViewLoading || citiesLoading;
  }, [authLoading, webViewLoading, citiesLoading]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

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

  // Загружаем команды при выборе города
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading || cities.length === 0) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем команды для всех городов
      cities.forEach((city) => {
        dispatch(
          fetchTeamsByCityId({
            cityId: String(city.id),
            token: activeToken,
          }),
        );
      });
    } else {
      // Загружаем команды для одного города
      if (selectedCityData) {
        dispatch(
          fetchTeamsByCityId({
            cityId: String(selectedCityData.id),
            token: activeToken,
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
    cities,
    dispatch,
  ]);

  // Получаем команды в зависимости от выбранного города
  const teams = useAppSelector((state) => {
    if (selectedCity === ALL_CITIES) {
      return selectAllTeams(state);
    }
    if (selectedCityData) {
      return selectTeamsByCity(state, String(selectedCityData.id));
    }
    return [];
  });

  // Фильтруем команды по поисковому запросу
  const filteredTeams = useMemo(() => {
    return (teams || []).filter((team: Team) => {
      const matchesSearch = team.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [teams, searchQuery]);

  // Группируем команды по городам для отображения
  const teamsByCity = useMemo(() => {
    const grouped: Record<string, Team[]> = {};
    filteredTeams.forEach((team) => {
      const cityName = team.cityName;
      if (!grouped[cityName]) {
        grouped[cityName] = [];
      }
      grouped[cityName].push(team);
    });
    return grouped;
  }, [filteredTeams]);

  const handleEdit = (teamId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit team:", teamId);
  };

  const handleDelete = (teamId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete team:", teamId);
  };

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateTeam = async (data: CreateTeamData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(
      createTeam({
        data: {
          name: data.name,
          cityId: data.cityId,
          leagueId: Number(data.leagueId),
        },
        token: activeToken,
      })
    ).unwrap();
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
      <Container maxWidth="md" sx={{ py: 2, pb: 10 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="teams management tabs"
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "14px",
                fontWeight: 600,
                minHeight: 48,
              },
            }}
          >
            <Tab
              label="Команды"
              id="teams-tab-0"
              aria-controls="teams-tabpanel-0"
            />
            <Tab
              label="Игроки"
              id="teams-tab-1"
              aria-controls="teams-tabpanel-1"
            />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Поиск команды..."
            />
            <FilterChips
              options={cityOptions}
              selected={selectedCity}
              onSelect={setSelectedCity}
            />

            <Box
              sx={{
                mt: 0,
                pb: 8,
                height: "calc(100vh - 190px)",
                overflowY: "auto",
              }}
            >
              {filteredTeams.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 8,
                    color: "text.secondary",
                  }}
                >
                  Команды не найдены
                </Box>
              ) : selectedCity === ALL_CITIES ? (
                // Отображаем команды сгруппированные по городам
                Object.entries(teamsByCity).map(([cityName, cityTeams]) => (
                  <Box key={cityName} sx={{ mb: 3 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.secondary",
                        mb: 1,
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {cityName}
                    </Typography>
                    {cityTeams.map((team) => (
                      <ManagementItemCard
                        key={team.id}
                        title={team.name}
                        subtitle={team.leagueName}
                        onEdit={() => handleEdit(String(team.id))}
                        onDelete={() => handleDelete(String(team.id))}
                      />
                    ))}
                  </Box>
                ))
              ) : (
                // Отображаем команды одного города без группировки
                filteredTeams.map((team) => (
                  <ManagementItemCard
                    key={team.id}
                    title={team.name}
                    subtitle={team.leagueName}
                    onEdit={() => handleEdit(String(team.id))}
                    onDelete={() => handleDelete(String(team.id))}
                  />
                ))
              )}
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              textAlign: "center",
              py: 8,
              color: "text.secondary",
            }}
          >
            Управление игроками
          </Box>
        </TabPanel>
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

      <CreateTeamModal
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        cities={cities}
        token={activeToken || ""}
        onSubmit={handleCreateTeam}
      />
    </Box>
  );
};

export default TeamsManagementPage;
