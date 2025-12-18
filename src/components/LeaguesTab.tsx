// llf-webview/src/components/LeaguesTab.tsx

import { type FC, useState, useMemo, useEffect } from "react";
import { Box, Fab, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "./SearchBar";
import FilterChips from "./FilterChips";
import SingleCityLeaguesList from "./SingleCityLeaguesList";
import AllCitiesLeaguesList from "./AllCitiesLeaguesList";
import CreateLeagueModal, { type CreateLeagueData } from "./CreateLeagueModal";
import EditLeagueModal, { type EditLeagueData } from "./EditLeagueModal";
import DeleteConfirmDialog from "./DeleteConfirmDialog";
import type { League } from "../types/league";
import type { City } from "../types/city";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store";
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
  selectLeagueGroups,
  selectLeagueGroupsLoading,
  selectLeagueGroupsError,
} from "../store/slices/leagueGroupSlice";
import { ALL_CITIES, ALL_GROUPS } from "../constants/leagueManagement";

interface LeaguesTabProps {
  cities: City[];
  citiesError: string | null;
  activeToken: string | null;
  selectedSportType: string;
  onCityChangeInModal: (cityId: number) => void;
}

const LeaguesTab: FC<LeaguesTabProps> = ({
  cities,
  citiesError,
  activeToken,
  selectedSportType,
  onCityChangeInModal,
}) => {
  const dispatch = useAppDispatch();
  const leagueGroups = useAppSelector(selectLeagueGroups);
  const leagueGroupsLoading = useAppSelector(selectLeagueGroupsLoading);
  const leagueGroupsError = useAppSelector(selectLeagueGroupsError);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [selectedGroup, setSelectedGroup] = useState<string>(ALL_GROUPS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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
    if (!activeToken) {
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
    selectedSportType,
    dispatch,
  ]);

  // Загружаем лиги при выборе города или изменении спорта
  useEffect(() => {
    if (!activeToken || cities.length === 0) {
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
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
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

  return (
    <>
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
          height:
            selectedCity === ALL_CITIES
              ? "calc(100vh - 174px)"
              : "calc(100vh - 221px)",
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
        onCityChange={onCityChangeInModal}
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
    </>
  );
};

export default LeaguesTab;
