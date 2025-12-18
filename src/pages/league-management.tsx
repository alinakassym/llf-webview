// llf-webview/src/pages/league-management.tsx

import { type FC, useState, useMemo, useEffect, useCallback } from "react";
import { Box, Fab, CircularProgress, Alert, Tabs, Tab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import LeaguesTab from "../components/LeaguesTab";
import LeagueGroupsList from "../components/LeagueGroupsList";
import { SportSelectRow, type Sport } from "../components/SportSelectRow";
import { SportType, SportTypeName } from "../types/sportType";
import CreateLeagueGroupModal, {
  type CreateLeagueGroupData,
} from "../components/CreateLeagueGroupModal";
import EditLeagueGroupModal, {
  type EditLeagueGroupData,
} from "../components/EditLeagueGroupModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchLeagueGroups,
  createLeagueGroup,
  updateLeagueGroup,
  deleteLeagueGroup,
  selectLeagueGroups,
  selectLeagueGroupsLoading,
  selectLeagueGroupsError,
} from "../store/slices/leagueGroupSlice";
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
  const [searchGroupQuery, setSearchGroupQuery] = useState("");
  const [selectedCityForGroups, setSelectedCityForGroups] = useState<string>(ALL_CITIES);
  const [selectedSportType, setSelectedSportType] = useState<string>("2");
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [leagueGroupToEdit, setLeagueGroupToEdit] = useState<{
    id: number;
    name: string;
    order: number;
    cityId: number;
    sportType: string;
  } | null>(null);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [leagueGroupToDelete, setLeagueGroupToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);

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

  // Находим данные выбранного города для групп лиг
  const selectedCityDataForGroups = useMemo(
    () => cities.find((city) => city.name === selectedCityForGroups),
    [cities, selectedCityForGroups],
  );

  // Загружаем группы лиг в зависимости от выбранного города и спорта
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading) {
      return;
    }

    if (selectedCityForGroups === ALL_CITIES) {
      // Загружаем все группы лиг с фильтрацией по спорту
      dispatch(
        fetchLeagueGroups({ token: activeToken, sportType: selectedSportType }),
      );
    } else {
      // Загружаем группы лиг для конкретного города и спорта
      if (selectedCityDataForGroups) {
        dispatch(
          fetchLeagueGroups({
            token: activeToken,
            cityId: String(selectedCityDataForGroups.id),
            sportType: selectedSportType,
          }),
        );
      }
    }
  }, [
    selectedCityForGroups,
    selectedCityDataForGroups,
    activeToken,
    authLoading,
    webViewLoading,
    selectedSportType,
    dispatch,
  ]);

  // Фильтрация групп лиг по поисковому запросу
  const filteredLeagueGroups = useMemo(() => {
    return leagueGroups.filter((group) => {
      const matchesSearch = group.name
        .toLowerCase()
        .includes(searchGroupQuery.toLowerCase());
      return matchesSearch;
    });
  }, [leagueGroups, searchGroupQuery]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSportChange = (sportId: string) => {
    setSelectedSportType(sportId);
  };

  const handleAdd = () => {
    if (tabValue === 1) {
      // Вкладка "Группы лиг" - открываем модальное окно создания группы лиг
      setIsCreateGroupModalOpen(true);
    }
  };

  const handleCloseGroupModal = () => {
    setIsCreateGroupModalOpen(false);
  };

  const handleCreateLeagueGroup = async (data: CreateLeagueGroupData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(createLeagueGroup({ data, token: activeToken })).unwrap();
  };

  const handleEditLeagueGroup = (groupId: number) => {
    const group = leagueGroups.find((g) => g.id === groupId);
    if (group) {
      setLeagueGroupToEdit({
        id: group.id,
        name: group.name,
        order: group.order,
        cityId: group.cityId,
        sportType: group.sportType,
      });
      setIsEditGroupModalOpen(true);
    }
  };

  const handleCloseEditGroupModal = () => {
    setIsEditGroupModalOpen(false);
    setLeagueGroupToEdit(null);
  };

  const handleUpdateLeagueGroup = async (
    id: number,
    data: EditLeagueGroupData,
  ) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(
      updateLeagueGroup({ id, data, token: activeToken }),
    ).unwrap();

    // Перезагружаем список групп лиг после успешного обновления
    if (selectedCityForGroups === ALL_CITIES) {
      dispatch(
        fetchLeagueGroups({ token: activeToken, sportType: selectedSportType }),
      );
    } else if (selectedCityDataForGroups) {
      dispatch(
        fetchLeagueGroups({
          token: activeToken,
          cityId: String(selectedCityDataForGroups.id),
          sportType: selectedSportType,
        }),
      );
    }
  };

  const handleDeleteLeagueGroup = (groupId: number, groupName: string) => {
    setLeagueGroupToDelete({
      id: groupId,
      name: groupName,
    });
    setDeleteGroupDialogOpen(true);
  };

  const handleCloseDeleteGroupDialog = () => {
    if (!isDeletingGroup) {
      setDeleteGroupDialogOpen(false);
      setLeagueGroupToDelete(null);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!leagueGroupToDelete || !activeToken) {
      return;
    }

    setIsDeletingGroup(true);
    try {
      await dispatch(
        deleteLeagueGroup({
          id: leagueGroupToDelete.id,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteGroupDialog();
    } catch (error) {
      console.error("Error deleting league group:", error);
    } finally {
      setIsDeletingGroup(false);
    }
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
        minHeight: "100%",
        backgroundColor: "surface",
      }}
    >
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
        <LeaguesTab
          cities={cities}
          citiesError={citiesError}
          activeToken={activeToken}
          selectedSportType={selectedSportType}
          onCityChangeInModal={handleCityChangeInModal}
        />
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
              value={searchGroupQuery}
              onChange={setSearchGroupQuery}
              placeholder="Поиск группы лиг..."
            />
          </div>
          <div style={{ width: "100%" }}>
            <FilterChips
              options={cityOptions as readonly string[]}
              selected={selectedCityForGroups}
              onSelect={setSelectedCityForGroups}
            />
          </div>
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
          {leagueGroupsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={48} />
            </Box>
          ) : (
            <LeagueGroupsList
              leagueGroups={filteredLeagueGroups}
              onEdit={handleEditLeagueGroup}
              onDelete={handleDeleteLeagueGroup}
            />
          )}
        </Box>
      </TabPanel>

      {tabValue === 1 && (
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
      )}

      <CreateLeagueGroupModal
        open={isCreateGroupModalOpen}
        onClose={handleCloseGroupModal}
        onSubmit={handleCreateLeagueGroup}
        cities={cities}
        sportType={selectedSportType}
      />

      <EditLeagueGroupModal
        open={isEditGroupModalOpen}
        onClose={handleCloseEditGroupModal}
        onSubmit={handleUpdateLeagueGroup}
        cities={cities}
        sportType={selectedSportType}
        initialData={leagueGroupToEdit}
      />

      <DeleteConfirmDialog
        open={deleteGroupDialogOpen}
        onClose={handleCloseDeleteGroupDialog}
        onConfirm={handleConfirmDeleteGroup}
        title="Удалить группу лиг?"
        message={
          leagueGroupToDelete
            ? `Вы уверены, что хотите удалить группу лиг "${leagueGroupToDelete.name}"? Это действие нельзя отменить.`
            : ""
        }
        loading={isDeletingGroup}
      />
    </Box>
  );
};

export default LeagueManagementPage;
