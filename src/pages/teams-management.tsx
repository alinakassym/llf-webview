// llf-webview/src/pages/teams-management.tsx

import { type FC, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Tabs, Tab, CircularProgress, Typography, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import ManagementTeamCard from "../components/ManagementTeamCard";
import PlayersList from "../components/PlayersList";
import CreateTeamModal, {
  type CreateTeamData,
} from "../components/CreateTeamModal";
import CreatePlayerModal, {
  type CreatePlayerData,
} from "../components/CreatePlayerModal";
import type { Team } from "../types/team";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchTeamsByCityId,
  selectTeamsByCity,
  selectAllTeams,
  createTeam,
} from "../store/slices/teamSlice";
import {
  fetchPlayers,
  fetchPlayerProfiles,
  selectPlayerProfiles,
  createPlayer,
} from "../store/slices/playerSlice";
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
  const navigate = useNavigate();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const { cities, loading: citiesLoading } = useAppSelector(
    (state) => state.cities,
  );
  const playerProfiles = useAppSelector(selectPlayerProfiles);

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [playersSearchQuery, setPlayersSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePlayerModalOpen, setIsCreatePlayerModalOpen] = useState(false);

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Общий флаг загрузки
  const isLoading = useMemo(() => {
    return authLoading || webViewLoading || citiesLoading;
  }, [authLoading, webViewLoading, citiesLoading]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Загружаем города при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  // Загружаем профили игроков при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchPlayerProfiles({ token: activeToken }));
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

  // Фильтруем игроков по поисковому запросу
  const filteredPlayers = useMemo(() => {
    return (playerProfiles || []).filter((player) => {
      const matchesSearch = player.fullName
        .toLowerCase()
        .includes(playersSearchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [playerProfiles, playersSearchQuery]);

  // Создаем стабильный ключ из ID команд для предотвращения бесконечного цикла
  const teamIdsKey = useMemo(() => {
    return teams
      .map((team) => team.id)
      .sort()
      .join(",");
  }, [teams]);

  // Загружаем игроков для команд
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading || teams.length === 0) {
      return;
    }

    // Загружаем игроков для каждой команды
    teams.forEach((team) => {
      dispatch(
        fetchPlayers({
          teamId: String(team.id),
          token: activeToken,
        }),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teamIdsKey, activeToken]);

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
    navigate(`/team-edit/${teamId}`);
  };

  const handleDelete = (teamId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete team:", teamId);
    alert("Удаление в разработке");
  };

  const handlePlayerClick = (fullName: string) => {
    // TODO: Implement player profile navigation
    console.log("Player clicked:", fullName);
    alert(`Просмотр профиля игрока в разработке (fullName: ${fullName})`);
  };

  const handlePlayerEdit = (userId: number) => {
    // TODO: Implement player edit functionality
    console.log("Edit player:", userId);
    navigate(`/player-edit/${userId}`);
  };

  const handlePlayerDelete = (userId: number) => {
    // TODO: Implement player delete functionality
    console.log("Delete player:", userId);
    alert("Удаление игрока в разработке");
  };

  const handleAdd = () => {
    if (tabValue === 0) {
      // Вкладка "Команды" - открываем модальное окно создания команды
      setIsCreateModalOpen(true);
    } else if (tabValue === 1) {
      // Вкладка "Игроки" - открываем модальное окно создания игрока
      setIsCreatePlayerModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleClosePlayerModal = () => {
    setIsCreatePlayerModalOpen(false);
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
      }),
    ).unwrap();
  };

  const handleCreatePlayer = async (data: CreatePlayerData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(
      createPlayer({
        data: {
          userId: null,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          dateOfBirth: data.dateOfBirth,
          position: data.position || null,
        },
        token: activeToken,
      }),
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
        backgroundColor: "surface",
      }}
    >
      <Container disableGutters maxWidth={false} sx={{ px: 0, pt: 0, pb: 10 }}>
        <Box
          sx={{
            pt: 1,
            pr: 1,
            minHeight: 48,
            maxHeight: 48,
            borderBottom: 1,
            borderColor: "divider",
            background: (theme) =>
              `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
          }}
        >
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="teams management tabs"
            variant="fullWidth"
            sx={{
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTab-root": {
                ml: 1,
                textTransform: "uppercase",
                fontSize: "12px",
                fontWeight: 400,
                minHeight: 32,
                maxHeight: 32,
                color: "#FFFFFF",
                borderRadius: 1,
                backgroundColor: "rgba(0, 0, 0, 0.2)",
                "&.Mui-selected": {
                  backgroundColor: "dark",
                  color: "#FFFFFF",
                },
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
          <Box
            sx={{
              pb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div style={{ paddingLeft: 16, paddingRight: 16, width: "100%" }}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск команды..."
              />
            </div>
            <div style={{ width: "100%" }}>
              <FilterChips
                options={cityOptions}
                selected={selectedCity}
                onSelect={setSelectedCity}
              />
            </div>
          </Box>
          <Box
            sx={{
              mt: 0,
              px: 2,
              pb: 10,
              height: "calc(100vh - 174px)",
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
                    <ManagementTeamCard
                      key={team.id}
                      teamId={String(team.id)}
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
                <ManagementTeamCard
                  key={team.id}
                  teamId={String(team.id)}
                  title={team.name}
                  subtitle={team.leagueName}
                  onEdit={() => handleEdit(String(team.id))}
                  onDelete={() => handleDelete(String(team.id))}
                />
              ))
            )}
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              pb: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div style={{ paddingLeft: 16, paddingRight: 16, width: "100%" }}>
              <SearchBar
                value={playersSearchQuery}
                onChange={setPlayersSearchQuery}
                placeholder="Поиск игрока..."
              />
            </div>
          </Box>
          <Box
            sx={{
              mt: 0,
              px: 2,
              pb: 12,
              height: "calc(100vh - 125px)",
              overflowY: "auto",
            }}
          >
            <PlayersList
              players={filteredPlayers}
              onPlayerClick={handlePlayerClick}
              onEdit={handlePlayerEdit}
              onDelete={handlePlayerDelete}
            />
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

      <CreatePlayerModal
        open={isCreatePlayerModalOpen}
        onClose={handleClosePlayerModal}
        token={activeToken || ""}
        onSubmit={handleCreatePlayer}
      />
    </Box>
  );
};

export default TeamsManagementPage;
