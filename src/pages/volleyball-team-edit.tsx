// llf-webview/src/pages/volleyball-team-edit.tsx

import { type FC, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Typography, CircularProgress, MenuItem, TextField } from "@mui/material";
import { ShirtIcon } from "../components/icons";
import { teamService } from "../services/teamService";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  fetchPlayerProfiles,
  selectPlayerProfiles,
  selectPlayerProfilesLoading,
  fetchPlayers,
  selectPlayersByTeam,
} from "../store/slices/playerSlice";
import {
  fetchSeasons,
  selectSeasonsByCity,
  selectSeasonsLoadingForCity,
} from "../store/slices/seasonSlice";
import type { Team } from "../types/team";
import EmptyPlayerSlot from "../components/EmptyPlayerSlot";
import PlayerSlot from "../components/PlayerSlot";
import PlayerSelectionModal from "../components/PlayerSelectionModal";
import {
  VolleyballPosition,
  VolleyballPositionName,
  VolleyballPositionAbbreviation,
} from "../types/volleyballPosition";
import { SportType } from "../types/sportType";

const VOLLEYBALL_HOVER_BACKGROUND_COLOR = "rgba(179, 77, 68, 0.9)";
const VOLLEYBALL_HOVER_BORDER_COLOR = "rgba(255, 255, 255, 0.5)";

const VolleyballTeamEditPage: FC = () => {
  const { teamId, cityId } = useParams<{ teamId: string; cityId: string }>();
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(() => {
    const saved = localStorage.getItem(`volleyball-team-${teamId}-season`);
    return saved ? Number(saved) : 0;
  });

  // Получаем playerProfiles из Redux store
  const playerProfiles = useAppSelector(selectPlayerProfiles);
  const profilesLoading = useAppSelector(selectPlayerProfilesLoading);

  // Получаем seasons из Redux store для cityId из параметров
  const seasons = useAppSelector((state) =>
    cityId ? selectSeasonsByCity(cityId)(state) : []
  );
  const seasonsLoading = useAppSelector((state) =>
    cityId ? selectSeasonsLoadingForCity(cityId)(state) : false
  );

  // Получаем игроков команды из Redux store
  const teamPlayers = useAppSelector((state) =>
    teamId ? selectPlayersByTeam(state, teamId) : []
  );

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Обработчик открытия модального окна для добавления игрока
  const handlePlayerSlotClick = (position: string) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition("");
  };

  // Загружаем профили игроков через Redux при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(
        fetchPlayerProfiles({
          token: activeToken,
          sportType: String(SportType.Volleyball),
        })
      );
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  // Загружаем сезоны через Redux при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading && cityId) {
      dispatch(
        fetchSeasons({
          cityId: Number(cityId),
          token: activeToken,
          sportType: String(SportType.Volleyball),
        })
      );
    }
  }, [activeToken, authLoading, webViewLoading, cityId, dispatch]);

  // Сохраняем выбранный сезон в localStorage
  useEffect(() => {
    if (selectedSeasonId > 0 && teamId) {
      localStorage.setItem(`volleyball-team-${teamId}-season`, String(selectedSeasonId));
    }
  }, [selectedSeasonId, teamId]);

  // Загружаем игроков команды при выборе сезона
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading && teamId && selectedSeasonId > 0) {
      dispatch(
        fetchPlayers({
          teamId: teamId,
          seasonId: String(selectedSeasonId),
          token: activeToken,
          sportType: String(SportType.Volleyball),
        })
      );
    }
  }, [activeToken, authLoading, webViewLoading, teamId, selectedSeasonId, dispatch]);

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
        const teamData = await teamService.getTeamById(teamId, activeToken);
        setTeam(teamData);
      } catch (err) {
        console.error("Error fetching team:", err);
        setError("Не удалось загрузить данные команды");
      } finally {
        setLoading(false);
      }
    };

    fetchTeamAndPlayers();
  }, [teamId, activeToken, authLoading, webViewLoading]);

  // Вспомогательная функция для рендеринга слота игрока
  const renderPlayerSlot = (volleyballPosition: VolleyballPosition) => {
    const positionName = VolleyballPositionName[volleyballPosition];
    const positionAbbr = VolleyballPositionAbbreviation[volleyballPosition];

    // Ищем игрока на этой позиции
    const player = teamPlayers.find(
      (p) =>
        VolleyballPosition[
          p.volleyballPosition as unknown as keyof typeof VolleyballPosition
        ] === volleyballPosition,
    );

    if (player) {
      // Есть игрок - показываем PlayerSlot

      return (
        <PlayerSlot
          fullName={player.fullName}
          label={positionAbbr}
          backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
          borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
        />
      );
    } else {
      // Нет игрока - показываем EmptyPlayerSlot
      return (
        <EmptyPlayerSlot
          label={positionAbbr}
          backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
          borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
          onClick={() => handlePlayerSlotClick(positionName)}
        />
      );
    }
  };

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
      <Container disableGutters maxWidth={false} sx={{ px: 0, pt: 0, pb: 10 }}>
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

        {/* Выбор сезона */}
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <TextField
            label="Сезон"
            select
            value={selectedSeasonId}
            onChange={(e) => setSelectedSeasonId(Number(e.target.value))}
            fullWidth
            size="small"
            disabled={seasonsLoading || seasons.length === 0}
          >
            <MenuItem value={0} disabled>
              Выберите сезон
            </MenuItem>
            {seasons.map((season) => (
              <MenuItem key={season.id} value={season.id}>
                {season.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Контентная область - волейбольное поле */}
        <Box
          sx={{
            position: "relative",
          }}
        >
          {/* Изображение поля */}
          <Box
            component="img"
            src="/images/volleyball-field.png"
            alt="Volleyball field"
            sx={{
              padding: 2,
              position: "relative",
              left: "50%",
              width: "150%",
              transform: "translate(-50%, 0)",
              height: "100%",
              display: "block",
              margin: "0 auto",
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
            {/* Верхний ряд - Блокирующие (БЛ) - 2 карточки */}
            <div
              style={{
                position: "relative",
                top: "6%",
                marginBottom: 28,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {renderPlayerSlot(VolleyballPosition.MiddleBlocker)}
              {renderPlayerSlot(VolleyballPosition.MiddleBlocker)}
            </div>

            {/* Средний ряд - Связующий (СВ), Нападающий (НАП), Диагональный (ДИ) - 3 карточки */}
            <div
              style={{
                position: "relative",
                top: "6%",
                marginBottom: 28,
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {renderPlayerSlot(VolleyballPosition.Setter)}
              {renderPlayerSlot(VolleyballPosition.OutsideHitter)}
              {renderPlayerSlot(VolleyballPosition.Opposite)}
            </div>

            {/* Нижний ряд - Либеро (ЛИБ) - 1 карточка */}
            <div
              style={{
                position: "relative",
                top: "6%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: 20,
              }}
            >
              {renderPlayerSlot(VolleyballPosition.Libero)}
            </div>
          </Box>
        </Box>
      </Container>

      {/* Модальное окно выбора игрока */}
      <PlayerSelectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        position={selectedPosition}
        playerProfiles={playerProfiles}
        seasons={seasons}
        loading={profilesLoading}
        seasonsLoading={seasonsLoading}
      />
    </Box>
  );
};

export default VolleyballTeamEditPage;
