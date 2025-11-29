// llf-webview/src/pages/cities-management.tsx

import { type FC, useState, useMemo, useEffect } from "react";
import { Box, Fab, Container, CircularProgress, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import ManagementItemCard from "../components/ManagementItemCard";
import CreateCityModal, {
  type CreateCityData,
} from "../components/CreateCityModal";
import EditCityModal, {
  type EditCityData,
} from "../components/EditCityModal";
import DeleteConfirmDialog from "../components/DeleteConfirmDialog";
import type { City } from "../types/city";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchCities,
  createCity,
  updateCity,
  deleteCity,
} from "../store/slices/citySlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";

const CitiesManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const {
    cities,
    loading: citiesLoading,
    error: citiesError,
  } = useAppSelector((state) => state.cities);

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [cityToEdit, setCityToEdit] = useState<City | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [cityToDelete, setCityToDelete] = useState<{
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

  // Загружаем города при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  const filteredCities = useMemo(() => {
    return cities.filter((city: City) => {
      const matchesSearch = city.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [cities, searchQuery]);

  const handleEdit = (cityId: string) => {
    const city = cities.find((c) => String(c.id) === cityId);
    if (city) {
      setCityToEdit(city);
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = (cityId: string, cityName: string) => {
    setCityToDelete({
      id: cityId,
      name: cityName,
    });
    setDeleteDialogOpen(true);
  };

  const handleAdd = () => {
    setIsCreateModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
  };

  const handleCreateCity = async (data: CreateCityData) => {
    if (!activeToken) {
      throw new Error("No auth token available");
    }
    await dispatch(createCity({ data, token: activeToken })).unwrap();
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCityToEdit(null);
  };

  const handleUpdateCity = async (data: EditCityData) => {
    if (!cityToEdit || !activeToken) {
      throw new Error("No city or token available");
    }

    await dispatch(
      updateCity({
        cityId: String(cityToEdit.id),
        data,
        token: activeToken,
      }),
    ).unwrap();
  };

  const handleCloseDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialogOpen(false);
      setCityToDelete(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!cityToDelete || !activeToken) {
      return;
    }

    setIsDeleting(true);
    try {
      await dispatch(
        deleteCity({
          cityId: cityToDelete.id,
          token: activeToken,
        }),
      ).unwrap();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting city:", error);
    } finally {
      setIsDeleting(false);
    }
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
          {/* Отображение ошибок */}
          {citiesError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              Ошибка загрузки городов: {citiesError}
            </Alert>
          )}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск города..."
          />

          <Box sx={{ mt: 1 }}>
            {filteredCities.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "text.secondary",
                }}
              >
                Города не найдены
              </Box>
            ) : (
              filteredCities.map((city) => (
                <ManagementItemCard
                  key={city.id}
                  title={city.name}
                  onEdit={() => handleEdit(String(city.id))}
                  onDelete={() => handleDelete(String(city.id), city.name)}
                />
              ))
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

      <CreateCityModal
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleCreateCity}
      />

      <EditCityModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSubmit={handleUpdateCity}
        city={
          cityToEdit
            ? {
                id: String(cityToEdit.id),
                name: cityToEdit.name,
              }
            : null
        }
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Удалить город?"
        message={
          cityToDelete
            ? `Вы уверены, что хотите удалить город "${cityToDelete.name}"? Это действие нельзя отменить.`
            : ""
        }
        loading={isDeleting}
      />
    </Box>
  );
};

export default CitiesManagementPage;
