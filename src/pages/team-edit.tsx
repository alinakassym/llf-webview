// llf-webview/src/pages/team-edit.tsx

import { type FC, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { ShirtIcon } from "../components/icons";
import { teamService } from "../services/teamService";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import type { Team } from "../types/team";

const TeamEditPage: FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Загружаем данные команды
  useEffect(() => {
    const fetchTeam = async () => {
      if (!teamId) {
        setLoading(false);
        setError("ID команды не указан");
        return;
      }

      if (!activeToken || authLoading || webViewLoading) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const teamData = await teamService.getTeamById(teamId, activeToken);
        setTeam(teamData);
      } catch (err) {
        console.error("Error fetching team:", err);
        setError("Не удалось загрузить данные команды");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [teamId, activeToken, authLoading, webViewLoading]);

  // Показываем loader пока идет загрузка
  if (loading || authLoading || webViewLoading) {
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

  // Показываем ошибку если не удалось загрузить
  if (error || !team) {
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
        <Typography color="error">{error || "Команда не найдена"}</Typography>
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
      <Container maxWidth="md" sx={{ px: 0, pt: 0, pb: 10 }}>
        {/* Шапка с градиентом */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
            padding: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
            }}
          >
            {/* Блок слева - иконка */}
            <Box
              sx={{
                width: 80,
                height: 80,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
              }}
            >
              <ShirtIcon size={64} strokeColor="#FFFFFF" />
            </Box>

            {/* Блок справа - название команды */}
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#FFFFFF",
                  fontWeight: 600,
                  fontSize: "20px",
                }}
              >
                {team.name}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "14px",
                  marginTop: 0.5,
                }}
              >
                {team.leagueName} • {team.cityName}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Контентная область - пока пустая */}
        <Box sx={{ padding: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Содержимое страницы редактирования команды в разработке...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default TeamEditPage;
