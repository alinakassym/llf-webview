// llf-webview/src/pages/cup-management.tsx

import { type FC, useState, useEffect, useMemo } from "react";
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
import CreateCupGroupModal, {
  type CreateCupGroupData,
} from "../components/CreateCupGroupModal";
import AddTeamToCupGroupModal from "../components/AddTeamToCupGroupModal";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchCupGroups,
  fetchCupGroupById,
  createCupGroup,
  updateCupGroup,
  addTeamToCupGroup,
  selectCupGroupsByCupId,
  selectCupGroupsLoadingForCup,
} from "../store/slices/cupGroupSlice";
import { selectCupById } from "../store/slices/cupSlice";
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
  const { cupId, sportType } = useParams<{
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
    order: number;
  } | null>(null);

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Получаем кубок из store
  const cup = useAppSelector((state) =>
    cupId ? selectCupById(cupId)(state) : null,
  );

  // Получаем группы кубка из store
  const groups = useAppSelector((state) =>
    cupId ? selectCupGroupsByCupId(cupId)(state) : [],
  );
  const groupsLoading = useAppSelector((state) =>
    cupId ? selectCupGroupsLoadingForCup(cupId)(state) : false,
  );

  // Получаем команды для города кубка
  const teams = useAppSelector((state) =>
    cup ? selectTeamsByCity(state, String(cup.cityId)) : [],
  );

  const handleSportChange = (sportId: number) => {
    setSelectedSportType(sportId);
  };

  // Загружаем группы кубка при монтировании
  useEffect(() => {
    if (cupId && activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCupGroups({ cupId: parseInt(cupId), token: activeToken }));
    }
  }, [cupId, activeToken, authLoading, webViewLoading, dispatch]);

  // Загружаем команды когда известен город и спорт
  useEffect(() => {
    if (cup && activeToken && !authLoading && !webViewLoading) {
      dispatch(
        fetchTeams({
          cityId: cup.cityId,
          token: activeToken,
          sportType: cup.sportType,
        }),
      );
    }
  }, [cup, activeToken, authLoading, webViewLoading, dispatch]);

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
    // Находим группу в массиве, чтобы получить её order
    const group = groups.find((g) => g.id === groupId);
    if (group) {
      setEditingGroup({
        id: groupId,
        name: groupName,
        order: group.order,
      });
      setIsCreateGroupModalOpen(true);
    }
  };

  const handleDeleteGroup = (groupId: number, groupName: string) => {
    console.log("Delete group:", groupId, groupName);
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
      // Режим редактирования
      await dispatch(
        updateCupGroup({
          cupId: parseInt(cupId),
          groupId: editingGroup.id,
          name: data.name,
          order: data.order,
          token: activeToken,
        }),
      ).unwrap();
    } else {
      // Режим создания
      await dispatch(
        createCupGroup({
          cupId: parseInt(cupId),
          name: data.name,
          order: data.order,
          token: activeToken,
        }),
      ).unwrap();
    }
  };

  const handleAddTeam = (groupId: number, groupName: string) => {
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
    order: number | null;
  }) => {
    if (!activeToken || !cupId || !selectedGroupForTeam) {
      throw new Error("No auth token, cupId or group selected");
    }
    await dispatch(
      addTeamToCupGroup({
        cupId: parseInt(cupId),
        groupId: selectedGroupForTeam.id,
        teamId: data.teamId,
        seed: data.seed,
        order: data.order,
        token: activeToken,
      }),
    ).unwrap();
  };

  const handleEditTeam = (
    groupId: number,
    teamId: number,
    teamName: string,
  ) => {
    console.log("Edit team:", { groupId, teamId, teamName });
    // TODO: Implement team editing functionality
  };

  const handleDeleteTeam = (
    groupId: number,
    teamId: number,
    teamName: string,
  ) => {
    console.log("Delete team:", { groupId, teamId, teamName });
    // TODO: Implement team deletion functionality
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
                onEditTeam={handleEditTeam}
                onDeleteTeam={handleDeleteTeam}
              />
            )}
          </Box>
        )}

        {/* Таб "Туры" */}
        {tabValue === 1 && (
          <Box role="tabpanel" id="cup-tabpanel-1">
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              Туры будут отображаться здесь
            </Box>
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
        existingGroupsCount={groups.length}
        editingGroup={editingGroup}
      />

      <AddTeamToCupGroupModal
        open={isAddTeamModalOpen}
        onClose={handleCloseAddTeamModal}
        teams={teams}
        onSubmit={handleAddTeamSubmit}
        groupName={selectedGroupForTeam?.name || ""}
      />
    </Box>
  );
};

export default CupManagementPage;
