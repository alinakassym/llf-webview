// llf-webview/src/pages/cups-management.tsx

import { type FC, useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Fab, Container, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { SportSelectRow, type Sport } from "../components/SportSelectRow";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import AllCitiesCupsList from "../components/AllCitiesCupsList";
import CreateCupModal, {
  type CreateCupData,
} from "../components/CreateCupModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import { SportType, SportTypeName } from "../types/sportType";
import type { Cup } from "../types/cup";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import {
  fetchCups,
  createCup,
  deleteCup,
  selectCupsByCity,
} from "../store/slices/cupSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { ALL_CITIES } from "../constants/leagueManagement";

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_CUPS: Cup[] = [];

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

const CupsManagementPage: FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useAppSelector((state) => state.cities);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>(ALL_CITIES);
  const [selectedSportType, setSelectedSportType] = useState<number>(2);
  const [isCreateCupModalOpen, setIsCreateCupModalOpen] = useState(false);
  const [deleteCupDialogOpen, setDeleteCupDialogOpen] = useState(false);
  const [cupToDelete, setCupToDelete] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [isDeletingCup, setIsDeletingCup] = useState(false);

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

  // Находим данные выбранного города
  const selectedCityData = useMemo(
    () => cities.find((city) => city.name === selectedCity),
    [cities, selectedCity],
  );

  // Загружаем кубки при выборе города
  useEffect(() => {
    if (!activeToken || authLoading || webViewLoading) {
      return;
    }

    if (selectedCity === ALL_CITIES) {
      // Загружаем все кубки одним запросом без cityId
      dispatch(
        fetchCups({
          token: activeToken,
          sportType: selectedSportType,
        }),
      );
    } else {
      // Загружаем кубки для конкретного города
      if (selectedCityData) {
        dispatch(
          fetchCups({
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

  // Получаем кубки в зависимости от выбранного города
  const cups = useAppSelector((state) => {
    if (selectedCity === ALL_CITIES) {
      return selectCupsByCity("__ALL__")(state);
    } else if (selectedCityData) {
      return selectCupsByCity(String(selectedCityData.id))(state);
    }
    return EMPTY_CUPS;
  });

  const filteredCups = useMemo(() => {
    return cups.filter((cup: Cup) => {
      const matchesSearch = (cup.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [cups, searchQuery]);

  // Группировка кубков по городу
  const cupsByGroup = useMemo(() => {
    const grouped: Record<string, Cup[]> = {};
    filteredCups.forEach((cup) => {
      // Защита от undefined значений
      if (!cup || !cup.name) {
        return;
      }

      const groupKey =
        selectedCity === ALL_CITIES
          ? cup.cityName || "Неизвестный город"
          : cup.cityName;
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(cup);
    });

    return grouped;
  }, [selectedCity, filteredCups]);

  const handleEdit = (cityId: number, cupId: string) => {
    navigate(`/cup-management/${cityId}/${cupId}/${selectedSportType}`);
  };

  const handleDelete = (cupId: string, cupName: string) => {
    setCupToDelete({ id: parseInt(cupId), name: cupName });
    setDeleteCupDialogOpen(true);
  };

  const handleAdd = () => {
    setIsCreateCupModalOpen(true);
  };

  const handleCloseCupModal = () => {
    setIsCreateCupModalOpen(false);
  };

  const handleCreateCup = async (data: CreateCupData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }

    await dispatch(
      createCup({
        data: {
          name: data.name,
          cityId: data.cityId,
          leagueId: null,
          sportType: selectedSportType,
          startDate: null,
          endDate: null,
        },
        token: activeToken,
      }),
    ).unwrap();
  };

  const handleCloseDeleteCupDialog = () => {
    if (!isDeletingCup) {
      setDeleteCupDialogOpen(false);
      setCupToDelete(null);
    }
  };

  const handleConfirmDeleteCup = async () => {
    if (!cupToDelete || !activeToken) {
      return;
    }

    setIsDeletingCup(true);
    try {
      await dispatch(
        deleteCup({
          cupId: cupToDelete.id,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteCupDialog();
    } catch (error) {
      console.error("Error deleting cup:", error);
    } finally {
      setIsDeletingCup(false);
    }
  };

  const handleSportChange = useCallback((sportId: number) => {
    setSelectedSportType(sportId);
  }, []);

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
        minHeight: "100vh",
        backgroundColor: "surface",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          padding: "0 8px",
          width: "100%",
          minHeight: 48,
          maxHeight: 48,
          display: "flex",
          alignItems: "center",
          gap: 2,
          borderBottom: 1,
          borderColor: "divider",
          background: (theme) =>
            `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
        }}
      >
        <div style={{ marginTop: 8 }}>
          <SportSelectRow sports={SPORTS} onSportChange={handleSportChange} />
        </div>
        <SearchBar
          variant="standard"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Поиск кубка..."
          iconColor="#FFFFFF"
          textColor="#FFFFFF"
          borderBottomColor="tertiary.main"
        />
      </Box>
      <Container disableGutters maxWidth={false} sx={{ pt: 2, px: 0, pb: 0 }}>
        <Box
          sx={{
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

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <FilterChips
              options={cityOptions as readonly string[]}
              selected={selectedCity}
              onSelect={setSelectedCity}
            />
          </Box>

          <Box
            sx={{
              px: 2,
              pb: 8,
              height: "calc(100vh - 112px)",
              overflowY: "auto",
            }}
          >
            <AllCitiesCupsList
              cupsByCity={cupsByGroup}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
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

      <CreateCupModal
        open={isCreateCupModalOpen}
        onClose={handleCloseCupModal}
        onSubmit={handleCreateCup}
        cities={cities}
        sportType={selectedSportType}
      />

      <DeleteConfirmDialog
        open={deleteCupDialogOpen}
        onClose={handleCloseDeleteCupDialog}
        onConfirm={handleConfirmDeleteCup}
        title="Удалить кубок?"
        message={`Вы уверены, что хотите удалить кубок "${cupToDelete?.name}"?`}
        loading={isDeletingCup}
      />
    </Box>
  );
};

export default CupsManagementPage;
