import { type FC, useState, useMemo } from "react";
import {
  Box,
  Typography,
  IconButton,
  Fab,
  Container,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import ManagementItemCard from "../components/ManagementItemCard";
import type { League, LeagueCity, LeagueGroup } from "../types/league";

const CITIES: readonly LeagueCity[] = [
  "Все города",
  "Астана",
  "Алматы",
  "Шымкент",
] as const;

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
  { id: "7", name: "Мастер Лига 35+", city: "Астана", group: "Молодежная Лига" },
];

const LeagueManagementPage: FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<LeagueCity>("Все города");
  const [selectedGroup, setSelectedGroup] =
    useState<LeagueGroup>("Все группы");

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

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppBar
        position="sticky"
        color="default"
        elevation={0}
        sx={{
          backgroundColor: "background.paper",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar>
          <IconButton
            edge="start"
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" fontWeight={600}>
            Управление лигами
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 3, pb: 10 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Поиск лиги..."
          />

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <FilterChips
              options={CITIES}
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
              variant="subtitle1"
              fontWeight={600}
              gutterBottom
              sx={{ mb: 2 }}
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
