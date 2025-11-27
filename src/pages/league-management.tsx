import { type FC, useState, useMemo, useEffect } from "react";
import {
  Box,
  Typography,
  Fab,
  Container,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import ManagementItemCard from "../components/ManagementItemCard";
import type { League, LeagueGroup } from "../types/league";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchCities } from "../store/slices/citySlice";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";

const GROUPS: readonly LeagueGroup[] = [
  "Все группы",
  "Молодежная Лига",
] as const;

// Моковые данные для демонстрации
const MOCK_LEAGUES: League[] = [
  { id: "1", name: "Супер Лига", city: "Астана", group: "Молодежная Лига" },
  { id: "2", name: "Лига A", city: "Астана", group: "Молодежная Лига" },
  { id: "3", name: "Лига B", city: "Астана", group: "Молодежная Лига" },
  { id: "4", name: "Лига C", city: "Астана", group: "Молодежная Лига" },
  { id: "5", name: "Лига D", city: "Астана", group: "Молодежная Лига" },
  { id: "6", name: "Лига E", city: "Астана", group: "Молодежная Лига" },
  {
    id: "7",
    name: "Мастер Лига 35+",
    city: "Астана",
    group: "Молодежная Лига",
  },
];

const LeagueManagementPage: FC = () => {
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();
  const { cities, loading: citiesLoading } = useAppSelector(
    (state) => state.cities,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("Все города");
  const [selectedGroup, setSelectedGroup] = useState<LeagueGroup>("Все группы");

  // Общий флаг загрузки: true если хотя бы один из флагов true
  const isLoading = useMemo(() => {
    return authLoading || webViewLoading || citiesLoading;
  }, [authLoading, webViewLoading, citiesLoading]);

  useEffect(() => {
    // Используем webViewToken если доступен, иначе fallback на Firebase token
    const activeToken = webViewToken || token;

    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [token, webViewToken, authLoading, webViewLoading, dispatch]);

  const cityOptions = useMemo(() => {
    const cityNames = cities.map((city) => city.name);
    return ["Все города", ...cityNames];
  }, [cities]);

  const filteredLeagues = useMemo(() => {
    return MOCK_LEAGUES.filter((league) => {
      const matchesSearch = league.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCity =
        selectedCity === "Все города" || league.city === selectedCity;
      const matchesGroup =
        selectedGroup === "Все группы" || league.group === selectedGroup;

      return matchesSearch && matchesCity && matchesGroup;
    });
  }, [searchQuery, selectedCity, selectedGroup]);

  const handleEdit = (leagueId: string) => {
    console.log("Edit league:", leagueId);
    // TODO: Открыть модальное окно редактирования или перейти на страницу редактирования
  };

  const handleDelete = (leagueId: string, leagueName: string) => {
    console.log("Delete league:", leagueId, leagueName);
    // TODO: Показать диалог подтверждения и удалить лигу
  };

  const handleAdd = () => {
    console.log("Add new league");
    // TODO: Открыть модальное окно создания новой лиги
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
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск лиги..."
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
            <FilterChips
              options={cityOptions as readonly string[]}
              selected={selectedCity}
              onSelect={setSelectedCity}
            />
            <FilterChips
              options={GROUPS}
              selected={selectedGroup}
              onSelect={setSelectedGroup}
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              gutterBottom
              sx={{ mb: 1, mt: 0 }}
            >
              {selectedCity !== "Все города" ? selectedCity : "Все города"}
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column" }}>
              {filteredLeagues.length > 0 ? (
                filteredLeagues.map((league) => (
                  <ManagementItemCard
                    key={league.id}
                    title={league.name}
                    subtitle={`Группа: ${league.group}`}
                    onEdit={() => handleEdit(league.id)}
                    onDelete={() => handleDelete(league.id, league.name)}
                  />
                ))
              ) : (
                <Typography
                  variant="body1"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ py: 4 }}
                >
                  Лиги не найдены
                </Typography>
              )}
            </Box>
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
    </Box>
  );
};

export default LeagueManagementPage;
