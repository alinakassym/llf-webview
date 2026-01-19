// llf-webview/src/pages/cup-management.tsx

import { type FC, useState, useEffect, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Fab,
  Tabs,
  Tab,
  Container,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { SportSelectRow, type Sport } from "../components/SportSelectRow";
import { SportType, SportTypeName } from "../types/sportType";
import CupGroupsList from "../components/CupGroupsList";
import CupToursView from "../components/CupToursView";
import CreateCupGroupModal, {
  type CreateCupGroupData,
} from "../components/CreateCupGroupModal";
import AddTeamToCupGroupModal from "../components/AddTeamToCupGroupModal";
import CreateCupTourModal, {
  type CreateCupTourData,
} from "../components/CreateCupTourModal";
import EditCupTourModal, {
  type EditCupTourData,
} from "../components/EditCupTourModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchCupGroups,
  fetchCupGroupById,
  createCupGroup,
  updateCupGroup,
  addTeamToCupGroup,
  deleteTeamFromCupGroup,
  deleteCupGroup,
  createCupTour,
  updateCupTour,
  deleteCupTour,
  selectCupGroupsByCupId,
  selectCupGroupsLoadingForCup,
} from "../store/slices/cupGroupSlice";
import { fetchTeams, selectTeamsByCity } from "../store/slices/teamSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";

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

const CupManagementPage: FC = () => {
  const { cupId, cityId, sportType } = useParams<{
    cityId: string;
    cupId: string;
    sportType: string;
  }>();

  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [tabValue, setTabValue] = useState(0);
  const [selectedSportType, setSelectedSportType] = useState<number>(
    sportType ? parseInt(sportType) : 2,
  );
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [isAddTeamModalOpen, setIsAddTeamModalOpen] = useState(false);
  const [selectedGroupForTeam, setSelectedGroupForTeam] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [editingGroup, setEditingGroup] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleteTeamDialogOpen, setDeleteTeamDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<{
    groupId: number;
    teamId: number;
    teamName: string;
  } | null>(null);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [deleteGroupDialogOpen, setDeleteGroupDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeletingGroup, setIsDeletingGroup] = useState(false);
  const [loadingTourGroupIds, setLoadingTourGroupIds] = useState<number[]>([]);
  const [isCreateTourModalOpen, setIsCreateTourModalOpen] = useState(false);
  const [selectedGroupForTour, setSelectedGroupForTour] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isEditTourModalOpen, setIsEditTourModalOpen] = useState(false);
  const [editingTourData, setEditingTourData] = useState<{
    groupId: number;
    groupName: string;
    tourId: number;
  } | null>(null);
  const [deleteTourDialogOpen, setDeleteTourDialogOpen] = useState(false);
  const [tourToDelete, setTourToDelete] = useState<{
    groupId: number;
    tourId: number;
    tourName: string;
  } | null>(null);
  const [isDeletingTour, setIsDeletingTour] = useState(false);

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Мемоизируем селектор групп для стабильной ссылки
  const selectGroups = useMemo(
    () => (cupId ? selectCupGroupsByCupId(cupId) : () => []),
    [cupId],
  );

  const selectLoading = useMemo(
    () => (cupId ? selectCupGroupsLoadingForCup(cupId) : () => false),
    [cupId],
  );

  // Получаем группы кубка из store
  const groups = useAppSelector(selectGroups);
  const groupsLoading = useAppSelector(selectLoading);

  // Получаем команды для города из URL параметра, исключая команды уже назначенные в этот кубок
  const teams = useAppSelector((state) =>
    cityId && cupId
      ? selectTeamsByCity(state, cityId, parseInt(cupId))
      : [],
  );

  const handleSportChange = useCallback((sportId: number) => {
    setSelectedSportType(sportId);
  }, []);

  // Загружаем группы кубка при монтировании
  useEffect(() => {
    if (cupId && activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCupGroups({ cupId: parseInt(cupId), token: activeToken }));
    }
  }, [cupId, activeToken, authLoading, webViewLoading, dispatch]);

  // Логируем открытие кубка для отладки
  useEffect(() => {
    if (cupId) {
      console.log("Opened cup:", cupId, "sportType:", selectedSportType);
    }
  }, [cupId, selectedSportType]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleEditGroup = (groupId: number, groupName: string) => {
    setEditingGroup({
      id: groupId,
      name: groupName,
    });
    setIsCreateGroupModalOpen(true);
  };

  const handleDeleteGroup = (groupId: number, groupName: string) => {
    setGroupToDelete({ id: groupId, name: groupName });
    setDeleteGroupDialogOpen(true);
  };

  const handleExpandGroup = (groupId: number) => {
    if (cupId && activeToken) {
      dispatch(
        fetchCupGroupById({
          cupId: parseInt(cupId),
          groupId,
          token: activeToken,
        }),
      );
    }
  };

  const handleAdd = () => {
    if (tabValue === 0) {
      // Вкладка "Группы" - открываем модальное окно создания группы
      setIsCreateGroupModalOpen(true);
    }
  };

  const handleCloseGroupModal = () => {
    setIsCreateGroupModalOpen(false);
    setEditingGroup(null);
  };

  const handleCreateOrUpdateCupGroup = async (data: CreateCupGroupData) => {
    if (!activeToken || !cupId) {
      throw new Error("No auth token or cupId available");
    }

    if (editingGroup) {
      // Режим редактирования - находим текущий order группы
      const group = groups.find((g) => g.id === editingGroup.id);
      const currentOrder = group?.order || 1;

      await dispatch(
        updateCupGroup({
          cupId: parseInt(cupId),
          groupId: editingGroup.id,
          name: data.name,
          order: currentOrder,
          token: activeToken,
        }),
      ).unwrap();
    } else {
      // Режим создания - автоматически назначаем порядок
      await dispatch(
        createCupGroup({
          cupId: parseInt(cupId),
          name: data.name,
          order: groups.length + 1,
          token: activeToken,
        }),
      ).unwrap();
    }
  };

  const handleAddTeam = (groupId: number, groupName: string) => {
    // Загружаем команды при открытии модального окна
    // Используем excludeCup чтобы получить только команды, не назначенные в этот кубок
    if (cityId && cupId && activeToken) {
      dispatch(
        fetchTeams({
          cityId: parseInt(cityId),
          token: activeToken,
          sportType: selectedSportType,
          excludeCup: parseInt(cupId),
        }),
      );
    }

    setSelectedGroupForTeam({ id: groupId, name: groupName });
    setIsAddTeamModalOpen(true);
  };

  const handleCloseAddTeamModal = () => {
    setIsAddTeamModalOpen(false);
    setSelectedGroupForTeam(null);
  };

  const handleAddTeamSubmit = async (data: {
    teamId: number;
    seed: number | null;
  }) => {
    if (!activeToken || !cupId || !selectedGroupForTeam) {
      throw new Error("No auth token, cupId or group selected");
    }

    // Находим группу и автоматически генерируем order
    const group = groups.find((g) => g.id === selectedGroupForTeam.id);
    const teamsCount = group?.teams?.length || 0;

    await dispatch(
      addTeamToCupGroup({
        cupId: parseInt(cupId),
        groupId: selectedGroupForTeam.id,
        teamId: data.teamId,
        seed: data.seed,
        order: teamsCount + 1,
        token: activeToken,
      }),
    ).unwrap();
  };

  const handleDeleteTeam = (
    groupId: number,
    teamId: number,
    teamName: string,
  ) => {
    setTeamToDelete({ groupId, teamId, teamName });
    setDeleteTeamDialogOpen(true);
  };

  const handleCloseDeleteTeamDialog = () => {
    if (!isDeletingTeam) {
      setDeleteTeamDialogOpen(false);
      setTeamToDelete(null);
    }
  };

  const handleConfirmDeleteTeam = async () => {
    if (!teamToDelete || !activeToken || !cupId) {
      return;
    }

    setIsDeletingTeam(true);
    try {
      await dispatch(
        deleteTeamFromCupGroup({
          cupId: parseInt(cupId),
          groupId: teamToDelete.groupId,
          teamId: teamToDelete.teamId,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteTeamDialog();
    } catch (error) {
      console.error("Error deleting team:", error);
    } finally {
      setIsDeletingTeam(false);
    }
  };

  const handleCloseDeleteGroupDialog = () => {
    if (!isDeletingGroup) {
      setDeleteGroupDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  const handleConfirmDeleteGroup = async () => {
    if (!groupToDelete || !activeToken || !cupId) {
      return;
    }

    setIsDeletingGroup(true);
    try {
      await dispatch(
        deleteCupGroup({
          cupId: parseInt(cupId),
          groupId: groupToDelete.id,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteGroupDialog();
    } catch (error) {
      console.error("Error deleting group:", error);
    } finally {
      setIsDeletingGroup(false);
    }
  };

  const handleExpandTourGroup = (groupId: number) => {
    console.log("cupId: ", cupId);
    console.log("activeToken: ", activeToken);
    if (cupId && activeToken) {
      const group = groups.find((g) => g.id === groupId);

      console.log("group: ", group);
      // Загружаем туры только если их еще нет
      if (group && !group.tours?.length) {
        setLoadingTourGroupIds((prev) =>
          prev.includes(groupId) ? prev : [...prev, groupId],
        );

        dispatch(
          fetchCupGroupById({
            cupId: parseInt(cupId),
            groupId,
            token: activeToken,
          }),
        ).finally(() => {
          setLoadingTourGroupIds((prev) => prev.filter((id) => id !== groupId));
        });
      }
    }
  };

  const handleAddTour = (groupId: number, groupName: string) => {
    setSelectedGroupForTour({ id: groupId, name: groupName });
    setIsCreateTourModalOpen(true);
  };

  const handleCloseCreateTourModal = () => {
    setIsCreateTourModalOpen(false);
    setSelectedGroupForTour(null);
  };

  const handleCreateTourSubmit = async (data: CreateCupTourData) => {
    if (!activeToken || !cupId || !selectedGroupForTour) {
      throw new Error("No auth token, cupId or group selected");
    }

    await dispatch(
      createCupTour({
        cupId: parseInt(cupId),
        groupId: selectedGroupForTour.id,
        data,
        token: activeToken,
      }),
    ).unwrap();
  };

  const handleEditTour = (groupId: number, tourId: number) => {
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setEditingTourData({
        groupId,
        groupName: group.name,
        tourId,
      });
      setIsEditTourModalOpen(true);
    }
  };

  const handleCloseEditTourModal = () => {
    setIsEditTourModalOpen(false);
    setEditingTourData(null);
  };

  const handleEditTourSubmit = async (data: EditCupTourData) => {
    if (!activeToken || !cupId || !editingTourData) {
      throw new Error("No auth token, cupId or editing tour data");
    }

    await dispatch(
      updateCupTour({
        cupId: parseInt(cupId),
        groupId: editingTourData.groupId,
        tourId: editingTourData.tourId,
        data,
        token: activeToken,
      }),
    ).unwrap();
  };

  const handleDeleteTour = (
    groupId: number,
    tourId: number,
    tourName: string,
  ) => {
    setTourToDelete({ groupId, tourId, tourName });
    setDeleteTourDialogOpen(true);
  };

  const handleCloseDeleteTourDialog = () => {
    if (!isDeletingTour) {
      setDeleteTourDialogOpen(false);
      setTourToDelete(null);
    }
  };

  const handleConfirmDeleteTour = async () => {
    if (!tourToDelete || !activeToken || !cupId) {
      return;
    }

    setIsDeletingTour(true);
    try {
      await dispatch(
        deleteCupTour({
          cupId: parseInt(cupId),
          groupId: tourToDelete.groupId,
          tourId: tourToDelete.tourId,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteTourDialog();
    } catch (error) {
      console.error("Error deleting tour:", error);
    } finally {
      setIsDeletingTour(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "surface",
        overflow: "hidden",
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
            label="Группы"
            id="groups-tab-0"
            aria-controls="cup-tabpanel-0"
          />
          <Tab label="Туры" id="tours-tab-1" aria-controls="cup-tabpanel-1" />
        </Tabs>
      </Box>

      <Container disableGutters maxWidth={false} sx={{ pt: 2, px: 2, pb: 8 }}>
        {/* Таб "Группы" */}
        {tabValue === 0 && (
          <Box role="tabpanel" id="cup-tabpanel-0">
            {groupsLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            ) : (
              <CupGroupsList
                groups={groups}
                onEdit={handleEditGroup}
                onDelete={handleDeleteGroup}
                onExpandGroup={handleExpandGroup}
                onAddTeam={handleAddTeam}
                onDeleteTeam={handleDeleteTeam}
              />
            )}
          </Box>
        )}

        {/* Таб "Туры" */}
        {tabValue === 1 && (
          <Box role="tabpanel" id="cup-tabpanel-1">
            {groupsLoading ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  py: 4,
                }}
              >
                <CircularProgress size={40} />
              </Box>
            ) : (
              <CupToursView
                groups={groups}
                onExpandGroup={handleExpandTourGroup}
                loadingGroupIds={loadingTourGroupIds}
                onAddTour={handleAddTour}
                onEditTour={handleEditTour}
                onDeleteTour={handleDeleteTour}
              />
            )}
          </Box>
        )}
      </Container>

      {tabValue === 0 && (
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

      <CreateCupGroupModal
        open={isCreateGroupModalOpen}
        onClose={handleCloseGroupModal}
        onSubmit={handleCreateOrUpdateCupGroup}
        editingGroup={editingGroup}
      />

      <AddTeamToCupGroupModal
        open={isAddTeamModalOpen}
        onClose={handleCloseAddTeamModal}
        teams={teams}
        onSubmit={handleAddTeamSubmit}
        groupName={selectedGroupForTeam?.name || ""}
      />

      <DeleteConfirmDialog
        open={deleteTeamDialogOpen}
        onClose={handleCloseDeleteTeamDialog}
        onConfirm={handleConfirmDeleteTeam}
        title="Удалить команду?"
        message={`Вы уверены, что хотите удалить команду "${teamToDelete?.teamName}" из группы?`}
        loading={isDeletingTeam}
      />

      <DeleteConfirmDialog
        open={deleteGroupDialogOpen}
        onClose={handleCloseDeleteGroupDialog}
        onConfirm={handleConfirmDeleteGroup}
        title="Удалить группу?"
        message={`Вы уверены, что хотите удалить группу "${groupToDelete?.name}"?`}
        loading={isDeletingGroup}
      />

      <CreateCupTourModal
        open={isCreateTourModalOpen}
        onClose={handleCloseCreateTourModal}
        teams={selectedGroupForTour ? groups.find((g) => g.id === selectedGroupForTour.id)?.teams || [] : []}
        onSubmit={handleCreateTourSubmit}
        groupName={selectedGroupForTour?.name || ""}
        nextTourNumber={
          selectedGroupForTour
            ? (groups.find((g) => g.id === selectedGroupForTour.id)?.tours?.length || 0) + 1
            : 1
        }
      />

      <EditCupTourModal
        open={isEditTourModalOpen}
        onClose={handleCloseEditTourModal}
        teams={editingTourData ? groups.find((g) => g.id === editingTourData.groupId)?.teams || [] : []}
        onSubmit={handleEditTourSubmit}
        groupName={editingTourData?.groupName || ""}
        editingTour={
          editingTourData
            ? groups
                .find((g) => g.id === editingTourData.groupId)
                ?.tours?.find((t) => t.id === editingTourData.tourId) || null
            : null
        }
      />

      <DeleteConfirmDialog
        open={deleteTourDialogOpen}
        onClose={handleCloseDeleteTourDialog}
        onConfirm={handleConfirmDeleteTour}
        title="Удалить тур?"
        message={`Вы уверены, что хотите удалить тур "${tourToDelete?.tourName}"?`}
        loading={isDeletingTour}
      />
    </Box>
  );
};

export default CupManagementPage;
