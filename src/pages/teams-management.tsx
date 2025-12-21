// llf-webview/src/pages/teams-management.tsx

import { type FC, useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Container, Tabs, Tab, CircularProgress, Typography, Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import ManagementTeamCard from "../components/ManagementTeamCard";
import PlayersList from "../components/PlayersList";
import { SportSelectRow, type Sport } from "../components/SportSelectRow";
import { SportType, SportTypeName } from "../types/sportType";
import CreateTeamModal, {
  type CreateTeamData,
} from "../components/CreateTeamModal";
import CreatePlayerModal, {
  type CreatePlayerData,
} from "../components/CreatePlayerModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import type { Team } from "../types/team";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchTeams,
  selectTeamsByCity,
  selectAllTeams,
  createTeam,
  deleteTeam,
} from "../store/slices/teamSlice";
import {
  fetchPlayers,
  fetchPlayerProfiles,
  selectPlayerProfiles,
  createPlayerProfile,
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
    color: "#E86C3D",
  },
];

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
  const [selectedSportType, setSelectedSportType] = useState<string>("2");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatePlayerModalOpen, setIsCreatePlayerModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleSportChange = (sportId: string) => {
    setSelectedSportType(sportId);
  };

  // Загружаем города при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  // Загружаем профили игроков при монтировании и при изменении sportType
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(
        fetchPlayerProfiles({ token: activeToken, sportType: selectedSportType })
      );
    }
  }, [activeToken, authLoading, webViewLoading, selectedSportType, dispatch]);

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
    if (!activeToken || authLoading || webViewLoading) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем все команды одним запросом (не передаём cityId)
      dispatch(
        fetchTeams({
          token: activeToken,
          sportType: selectedSportType,
        }),
      );
    } else {
      // Загружаем команды для конкретного города
      if (selectedCityData) {
        dispatch(
          fetchTeams({
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

  // Получаем команды в зависимости от выбранного города
  const teamsSelector = useMemo(
    () => (state: RootState) =>
      selectedCity === ALL_CITIES
        ? selectAllTeams(state)
        : selectedCityData
        ? selectTeamsByCity(state, String(selectedCityData.id))
        : [],
    [selectedCity, selectedCityData],
  );

  const teams = useAppSelector(teamsSelector);

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

  // Загружаем игроков для всех команд одним запросом
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading) {
      return;
    }

    // Загружаем всех игроков одним запросом (не передаём teamId)
    dispatch(
      fetchPlayers({
        teamId: undefined,
        token: activeToken,
        sportType: selectedSportType,
      }),
    );
  }, [activeToken, authLoading, webViewLoading, selectedSportType, dispatch]);

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

  const handleEdit = (teamId: string, cityId?: number) => {
    // Определяем маршрут в зависимости от выбранного вида спорта
    // SportType.Volleyball = 2, SportType.Football = 1
    if (selectedSportType === "2") {
      navigate(`/volleyball-team-edit/${cityId}/${teamId}`);
    } else {
      navigate(`/team-edit/${teamId}`);
    }
  };

  const handleDelete = (teamId: string, teamName: string) => {
    setTeamToDelete({
      id: teamId,
      name: teamName,
    });
    setDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete || !activeToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await dispatch(
        deleteTeam({
          teamId: Number(teamToDelete.id),
          token: activeToken,
        })
      ).unwrap();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setIsDeleting(false);
    }
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
      createPlayerProfile({
        data: {
          userId: data.userId || null,
          firstName: data.firstName,
          lastName: data.lastName,
          middleName: data.middleName,
          dateOfBirth: data.dateOfBirth,
          sportType: Number(selectedSportType),
          position: data.position || 0,
          volleyballPosition: data.volleyballPosition,
          isProfessionalVolleyballPlayer: data.isProfessionalVolleyballPlayer,
          yellowCards: data.yellowCards || 0,
          redCards: data.redCards || 0,
          totalGoals: data.totalGoals || 0,
          matchesPlayed: data.matchesPlayed || 0,
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
            display: "flex",
            borderBottom: 1,
            borderColor: "divider",
            background: (theme) =>
              `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
          }}
        >
          <Box sx={{ pl: 1 }}>
            <SportSelectRow sports={SPORTS} onSportChange={handleSportChange} />
          </Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="teams management tabs"
            variant="fullWidth"
            sx={{
              width: "100%",
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
                      onEdit={() => handleEdit(String(team.id), team.cityId)}
                      onDelete={() => handleDelete(String(team.id), team.name)}
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
                  onEdit={() => handleEdit(String(team.id), team.cityId)}
                  onDelete={() => handleDelete(String(team.id), team.name)}
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

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Удалить команду?"
        message={
          teamToDelete
            ? `Вы уверены, что хотите удалить команду "${teamToDelete.name}"? Это действие нельзя отменить.`
            : ""
        }
        loading={isDeleting}
      />
    </Box>
  );
};

export default TeamsManagementPage;
