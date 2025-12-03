// llf-webview/src/pages/team-edit.tsx

import { type FC, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { ShirtIcon } from "../components/icons";
import { teamService } from "../services/teamService";
import { playerService } from "../services/playerService";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import type { Team } from "../types/team";
import type { Player } from "../types/player";
import PlayerCard from "../components/PlayerCard";

const TeamEditPage: FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Загружаем данные команды и игроков
  useEffect(() => {
    const fetchTeamAndPlayers = async () => {
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
        const [teamData, playersData] = await Promise.all([
          teamService.getTeamById(teamId, activeToken),
          playerService.getPlayers(activeToken, teamId),
        ]);
        setTeam(teamData);
        setPlayers(playersData);
      } catch (err) {
        console.error("Error fetching team:", err);
        setError("Не удалось загрузить данные команды");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndPlayers();
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
            px: 2,
            pb: 2,
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

        {/* Контентная область - футбольное поле */}
        <Box
          sx={{
            position: "relative",
          }}
        >
          {/* Изображение поля */}
          <Box
            component="img"
            src="/images/football-field.png"
            alt="Football field"
            sx={{
              padding: 2,
              position: "relative",
              left: "50%",
              width: "150%",
              transform: "translate(-50%, 0)",
              height: "100%",
              display: "block",
              margin: "0 auto",
              filter: "hue-rotate(50deg) brightness(1.2) contrast(1.1)",
            }}
          />

          {/* Контейнер для игроков - позиционируется поверх поля */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: 500,
              height: "100%",
              pointerEvents: "none",
            }}
          >
            {/* Формация мини-футбола 2-2-1 (максимум 6 игроков) */}
            {players.slice(0, 6).map((player, index) => {
              // Определяем позицию игрока на поле для мини-футбола (2-2-1)
              const positions = [
                // Вратарь
                { top: "8%", left: "50%", transform: "translateX(-50%)" },
                // Защитники (2)
                { top: "35%", left: "30%" },
                { top: "35%", left: "70%" },
                // Полузащитники (2)
                { top: "60%", left: "30%" },
                { top: "60%", left: "70%" },
                // Нападающий (1)
                { top: "85%", left: "50%", transform: "translateX(-50%)" },
              ];

              const position = positions[index] || {
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              };

              return (
                <PlayerCard
                  key={player.id}
                  playerName={player.fullName}
                  playerNumber={player.number}
                  position={position}
                />
              );
            })}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default TeamEditPage;
