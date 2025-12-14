// llf-webview/src/pages/users-management.tsx

import { type FC, useState, useMemo, useEffect } from "react";
import { Box, Container, CircularProgress, Alert } from "@mui/material";
import SearchBar from "../components/SearchBar";
import ManagementItemCard from "../components/ManagementItemCard";
import type { User } from "../types/user";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchUsers } from "../store/slices/userSlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";

// Функция для вычисления возраста из даты рождения
const calculateAge = (dateOfBirth: string): number => {
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

const UsersManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const users = useAppSelector((state) => state.users.users);
  const usersLoading = useAppSelector((state) => state.users.loading);
  const usersError = useAppSelector((state) => state.users.error);

  const [searchQuery, setSearchQuery] = useState("");

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Общий флаг загрузки
  const isLoading = useMemo(() => {
    return authLoading || webViewLoading || usersLoading;
  }, [authLoading, webViewLoading, usersLoading]);

  // Загружаем пользователей при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchUsers(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  const filteredUsers = useMemo(() => {
    let result: User[] = [];
    if (searchQuery.trim() === "") {
      result = users;
    }
    if (users.length > 0) {
      result = users.filter((user: User) => {
        const matchesSearch = user.fullName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        return matchesSearch;
      });
    }
    return result;
  }, [users, searchQuery]);

  const handleEdit = (userId: string) => {
    // TODO: Implement edit functionality
    console.log("Edit user:", userId);
    alert(`Редактировние в разработке`);
  };

  const handleDelete = (userId: string) => {
    // TODO: Implement delete functionality
    console.log("Delete user:", userId);
    alert(`Удаление в разработке`);
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
      <Container disableGutters maxWidth={false} sx={{ py: 2, pb: 10 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {/* Отображение ошибок */}
          {usersError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              Ошибка загрузки пользователей: {usersError}
            </Alert>
          )}
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск пользователя..."
          />

          <Box sx={{ mt: 1 }}>
            {filteredUsers.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 8,
                  color: "text.secondary",
                }}
              >
                Пользователи не найдены
              </Box>
            ) : (
              filteredUsers.map((user) => (
                <ManagementItemCard
                  key={user.id}
                  title={user.fullName}
                  subtitle={`Возраст: ${calculateAge(user.dateOfBirth)}`}
                  onEdit={() => handleEdit(String(user.id))}
                  onDelete={() => handleDelete(String(user.id))}
                />
              ))
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default UsersManagementPage;
