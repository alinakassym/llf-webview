// llf-webview/src/pages/league-management.tsx

import { type FC, useState, useMemo, useEffect, useCallback } from "react";
import {
  Box,
  Fab,
  Container,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import SingleCityLeaguesList from "../components/SingleCityLeaguesList";
import AllCitiesLeaguesList from "../components/AllCitiesLeaguesList";
import LeagueGroupsList from "../components/LeagueGroupsList";
import { SportSelectRow, type Sport } from "../components/SportSelectRow";
import { SportType, SportTypeName } from "../types/sportType";
import CreateLeagueModal, {
  type CreateLeagueData,
} from "../components/CreateLeagueModal";
import CreateLeagueGroupModal, {
  type CreateLeagueGroupData,
} from "../components/CreateLeagueGroupModal";
import EditLeagueModal, {
  type EditLeagueData,
} from "../components/EditLeagueModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import type { League } from "../types/league";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchLeaguesByCityId,
  selectLeaguesByCity,
  selectAllLeagues,
  createLeague,
  updateLeague,
  deleteLeague,
} from "../store/slices/leagueSlice";
import {
  fetchLeagueGroups,
  createLeagueGroup,
  selectLeagueGroups,
  selectLeagueGroupsLoading,
  selectLeagueGroupsError,
} from "../store/slices/leagueGroupSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { ALL_CITIES, ALL_GROUPS } from "../constants/leagueManagement";

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
      id={`leagues-tabpanel-${index}`}
      aria-labelledby={`leagues-tab-${index}`}
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
    color: "#8450D8",
  },
];

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

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [selectedGroup, setSelectedGroup] = useState<string>(ALL_GROUPS);
  const [selectedSportType, setSelectedSportType] = useState<string>("2");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [leagueToEdit, setLeagueToEdit] = useState<{
    id: string;
    name: string;
    order: number;
    cityId: number;
    leagueGroupId: number;
    sportType: string;
  } | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leagueToDelete, setLeagueToDelete] = useState<{
    id: string;
    name: string;
    cityId: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  // Формируем опции групп лиг из API
  const groupOptions = useMemo(() => {
    const groupNames = leagueGroups.map((group) => group.name);
    return [ALL_GROUPS, ...groupNames];
  }, [leagueGroups]);

  // Находим данные выбранного города
  const selectedCityData = useMemo(
    () => cities.find((city) => city.name === selectedCity),
    [cities, selectedCity],
  );

  // Загружаем группы лиг в зависимости от выбранного города и спорта
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем все группы лиг с фильтрацией по спорту
      dispatch(
        fetchLeagueGroups({ token: activeToken, sportType: selectedSportType }),
      );
    } else {
      // Загружаем группы лиг для конкретного города и спорта
      if (selectedCityData) {
        dispatch(
          fetchLeagueGroups({
            token: activeToken,
            cityId: String(selectedCityData.id),
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

  // Загружаем лиги при выборе города или изменении спорта
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
            sportType: selectedSportType,
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
            sportType: selectedSportType,
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
    selectedSportType,
    dispatch,
  ]);

  // Получаем лиги в зависимости от выбранного города
  const leaguesSelector = useMemo(
    () => (state: RootState) =>
      selectedCity === ALL_CITIES
        ? selectAllLeagues(state)
        : selectedCityData
        ? selectLeaguesByCity(String(selectedCityData.id))(state)
        : [],
    [selectedCity, selectedCityData],
  );

  const leagues = useAppSelector(leaguesSelector);

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSportType(sportId);
  };

  const handleEdit = (leagueId: string) => {
    // Находим лигу по ID
    const league = leagues.find((l) => String(l.id) === String(leagueId));
    if (league) {
      setLeagueToEdit({
        id: String(league.id),
        name: league.name,
        order: league.order,
        cityId: Number(league.cityId),
        leagueGroupId: league.leagueGroupId,
        sportType: league.sportType,
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (leagueId: string, leagueName: string) => {
    // Находим лигу чтобы получить её cityId
    const league = leagues.find((l) => String(l.id) === String(leagueId));
    if (league) {
      setLeagueToDelete({
        id: leagueId,
        name: leagueName,
        cityId: String(league.cityId),
      });
      setDeleteDialogOpen(true);
    }
  };

  const handleAdd = () => {
    if (tabValue === 0) {
      // Вкладка "Лиги" - открываем модальное окно создания лиги
      setIsCreateModalOpen(true);
    } else if (tabValue === 1) {
      // Вкладка "Группы лиг" - открываем модальное окно создания группы лиг
      setIsCreateGroupModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCloseGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setLeagueToEdit(null);
  };

  const handleUpdateLeague = async (data: EditLeagueData) => {
    if (!leagueToEdit || !activeToken) {
      throw new Error("No league or token available");
    }

    await dispatch(
      updateLeague({
        leagueId: leagueToEdit.id,
        cityId: String(leagueToEdit.cityId),
        data: {
          name: data.name,
          order: data.order,
          cityId: leagueToEdit.cityId,
          leagueGroupId: leagueToEdit.leagueGroupId,
          sportType: leagueToEdit.sportType,
        },
        token: activeToken,
      }),
    ).unwrap();
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setLeagueToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!leagueToDelete || !activeToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await dispatch(
        deleteLeague({
          leagueId: leagueToDelete.id,
          cityId: leagueToDelete.cityId,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting league:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateLeague = async (data: CreateLeagueData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(createLeague({ data, token: activeToken })).unwrap();
  };

  const handleCreateLeagueGroup = async (data: CreateLeagueGroupData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(createLeagueGroup({ data, token: activeToken })).unwrap();
  };

  const handleCityChangeInModal = useCallback(
    (cityId: number) => {
      if (!activeToken) return;
      dispatch(
        fetchLeagueGroups({
          token: activeToken,
          cityId: String(cityId),
          sportType: selectedSportType,
        }),
      );
    },
    [activeToken, selectedSportType, dispatch],
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
            width: "100%",
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
            aria-label="league management tabs"
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
              label="Лиги"
              id="leagues-tab-0"
              aria-controls="leagues-tabpanel-0"
            />
            <Tab
              label="Группы лиг"
              id="leagues-tab-1"
              aria-controls="leagues-tabpanel-1"
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
            <div style={{ paddingLeft: 16, paddingRight: 16, width: "100%" }}>
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Поиск лиги..."
              />
            </div>
            <div style={{ width: "100%" }}>
              <FilterChips
                options={cityOptions as readonly string[]}
                selected={selectedCity}
                onSelect={setSelectedCity}
              />
            </div>
            {/* Показываем фильтр по группам только если выбран конкретный город */}
            {leagueGroupsLoading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <CircularProgress size={24} />
              </Box>
            )}
            {!leagueGroupsLoading && selectedCity !== ALL_CITIES && (
              <div style={{ width: "100%" }}>
                <FilterChips
                  options={groupOptions}
                  selected={selectedGroup}
                  onSelect={setSelectedGroup}
                />
              </div>
            )}
          </Box>
          <Box
            sx={{
              mt: 0,
              px: 2,
              pb: 8,
              height: "calc(100vh - 221px)",
              overflowY: "auto",
            }}
          >
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
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box
            sx={{
              mt: 0,
              px: 2,
              pb: 8,
              height: "calc(100vh - 125px)",
              overflowY: "auto",
            }}
          >
            <LeagueGroupsList leagueGroups={leagueGroups} />
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

      <CreateLeagueModal
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        cities={cities}
        leagueGroups={leagueGroups}
        onSubmit={handleCreateLeague}
        onCityChange={handleCityChangeInModal}
      />

      <CreateLeagueGroupModal
        open={isCreateGroupModalOpen}
        onClose={handleCloseGroupModal}
        onSubmit={handleCreateLeagueGroup}
        cities={cities}
        sportType={selectedSportType}
      />

      <EditLeagueModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateLeague}
        league={leagueToEdit}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Удалить лигу?"
        message={
          leagueToDelete
            ? `Вы уверены, что хотите удалить лигу "${leagueToDelete.name}"? Это действие нельзя отменить.`
            : ""
        }
        loading={isDeleting}
      />
    </Box>
  );
};

export default LeagueManagementPage;
