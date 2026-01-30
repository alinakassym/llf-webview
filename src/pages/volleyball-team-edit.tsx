// llf-webview/src/pages/volleyball-team-edit.tsx

import { type FC, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  MenuItem,
  TextField,
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import EditIcon from "@mui/icons-material/Edit";
import { ShirtIcon } from "../components/icons";
import { teamService } from "../services/teamService";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import type { RootState } from "../store";
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
import { fetchCities } from "../store/slices/citySlice";
import type { Team } from "../types/team";
import type { Season } from "../types/season";
import EmptyPlayerSlot from "../components/EmptyPlayerSlot";
import PlayerSlot from "../components/PlayerSlot";
import PlayerSelectionModal from "../components/PlayerSelectionModal";
import EditTeamModal, { type EditTeamData } from "../components/EditTeamModal";
import { SportType } from "../types/sportType";
import { type VolleyballPosition } from "../types/volleyballPosition";
import { getVolleyballPositionShort } from "../utils/volleyballPosition";

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_SEASONS: Season[] = [];

const VOLLEYBALL_BACKGROUND_COLOR = "rgba(179, 77, 68, 0.9)";
const VOLLEYBALL_BACKGROUND_COLOR2 = "rgba(179, 77, 68, 0.6)";
const VOLLEYBALL_BORDER_COLOR = "rgba(255, 255, 255, 0.5)";

const VolleyballTeamEditPage: FC = () => {
  const { teamId, cityId } = useParams<{ teamId: string; cityId: string }>();
  const dispatch = useAppDispatch();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] =
    useState<VolleyballPosition>(0);
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(() => {
    const saved = localStorage.getItem(`volleyball-team-${teamId}-season`);
    return saved ? Number(saved) : 0;
  });

  // Получаем playerProfiles из Redux store
  const playerProfiles = useAppSelector(selectPlayerProfiles);
  const profilesLoading = useAppSelector(selectPlayerProfilesLoading);

  // Получаем города из Redux store
  const { cities } = useAppSelector((state) => state.cities);

  // Создаём мемоизированный селектор чтобы избежать создания новой функции на каждый рендер
  const selectSeasons = useMemo(
    () => (state: RootState) =>
      cityId ? selectSeasonsByCity(cityId)(state) : EMPTY_SEASONS,
    [cityId],
  );
  const selectSeasonsLoading = useMemo(
    () => (state: RootState) =>
      cityId ? selectSeasonsLoadingForCity(cityId)(state) : false,
    [cityId],
  );

  // Получаем seasons из Redux store для cityId из параметров
  const seasons = useAppSelector(selectSeasons);
  const seasonsLoading = useAppSelector(selectSeasonsLoading);

  // Получаем игроков команды из Redux store
  const teamPlayers = useAppSelector((state) =>
    teamId ? selectPlayersByTeam(state, teamId) : [],
  );

  // Используем webViewToken если доступен, иначе fallback на Firebase token
  const activeToken = useMemo(
    () => webViewToken || token,
    [webViewToken, token],
  );

  // Фильтруем профили игроков, исключая тех кто уже в команде
  const availablePlayerProfiles = useMemo(() => {
    // Получаем ID профилей игроков которые уже в команде
    const teamPlayerProfileIds = new Set(
      teamPlayers
        .map((player) => player.playerProfileId)
        .filter((id): id is number => id !== undefined),
    );

    // Возвращаем только тех игроков которых нет в команде
    return playerProfiles.filter(
      (profile) =>
        profile.id !== undefined && !teamPlayerProfileIds.has(profile.id),
    );
  }, [playerProfiles, teamPlayers]);

  // Обработчик открытия модального окна для добавления игрока
  const handlePlayerSlotClick = (position: VolleyballPosition) => {
    setSelectedPosition(position);
    setIsModalOpen(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPosition(0);
  };

  // Обработчик открытия модального окна редактирования
  const handleEditTeam = () => {
    setIsEditModalOpen(true);
  };

  // Обработчик закрытия модального окна редактирования
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  // Обработчик сохранения изменений команды
  const handleUpdateTeam = async (data: EditTeamData) => {
    if (!activeToken || !teamId) {
      throw new Error("No auth token or team ID available");
    }

    await teamService.updateTeam(Number(teamId), data, activeToken);

    // Перезагружаем данные команды после обновления
    const updatedTeam = await teamService.getTeamById(teamId, activeToken);
    setTeam(updatedTeam);
  };

  // Загружаем города при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading) {
      dispatch(fetchCities(activeToken));
    }
  }, [activeToken, authLoading, webViewLoading, dispatch]);

  // Загружаем профили игроков через Redux только когда выбран сезон
  useEffect(() => {
    if (
      activeToken &&
      !authLoading &&
      !webViewLoading &&
      selectedSeasonId > 0
    ) {
      dispatch(
        fetchPlayerProfiles({
          token: activeToken,
          sportType: SportType.Volleyball,
        }),
      );
    }
  }, [activeToken, authLoading, webViewLoading, selectedSeasonId, dispatch]);

  // Загружаем сезоны через Redux при монтировании
  useEffect(() => {
    if (activeToken && !authLoading && !webViewLoading && cityId) {
      dispatch(
        fetchSeasons({
          cityId: Number(cityId),
          token: activeToken,
          sportType: SportType.Volleyball,
        }),
      );
    }
  }, [activeToken, authLoading, webViewLoading, cityId, dispatch]);

  // Сохраняем выбранный сезон в localStorage
  useEffect(() => {
    if (selectedSeasonId > 0 && teamId) {
      localStorage.setItem(
        `volleyball-team-${teamId}-season`,
        String(selectedSeasonId),
      );
    }
  }, [selectedSeasonId, teamId]);

  // Загружаем игроков команды при выборе сезона
  useEffect(() => {
    if (
      activeToken &&
      !authLoading &&
      !webViewLoading &&
      teamId &&
      selectedSeasonId > 0
    ) {
      dispatch(
        fetchPlayers({
          teamId: teamId,
          seasonId: String(selectedSeasonId),
          token: activeToken,
          sportType: SportType.Volleyball,
        }),
      );
    }
  }, [
    activeToken,
    authLoading,
    webViewLoading,
    teamId,
    selectedSeasonId,
    dispatch,
  ]);

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
  const renderPlayerSlot = (
    volleyballPosition: VolleyballPosition,
    index: number = 0,
  ) => {
    const positionAbbr = getVolleyballPositionShort(volleyballPosition, "ru");

    // Ищем всех игроков на этой позиции
    const playersAtPosition = teamPlayers.filter(
      (p) => p.volleyballPosition === volleyballPosition,
    );

    // Берем игрока по индексу
    const player = playersAtPosition[index];

    if (player) {
      // Есть игрок - показываем PlayerSlot

      return (
        <PlayerSlot
          fullName={player.fullName}
          label={positionAbbr}
          backgroundColor={VOLLEYBALL_BACKGROUND_COLOR}
          borderColor={VOLLEYBALL_BORDER_COLOR}
        />
      );
    } else {
      // Нет игрока - показываем EmptyPlayerSlot
      return (
        <EmptyPlayerSlot
          label={positionAbbr}
          backgroundColor={VOLLEYBALL_BACKGROUND_COLOR2}
          borderColor={VOLLEYBALL_BORDER_COLOR}
          onClick={() => handlePlayerSlotClick(volleyballPosition)}
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
        backgroundColor: "background.default",
      }}
    >
      <Container
        disableGutters
        maxWidth={false}
        sx={{ height: "100vh", px: 0, pt: 0, pb: 10 }}
      >
        {/* Шапка с градиентом */}
        <Box
          sx={{
            background: (theme) =>
              `linear-gradient(to right, ${theme.palette.gradient.join(", ")})`,
            px: 1,
            pb: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
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
              {team.primaryColor && team.secondaryColor ? (
                <ShirtIcon
                  size={64}
                  color1={team?.primaryColor ?? "#5060D8"}
                  color2={team?.secondaryColor ?? "#5060D8"}
                />
              ) : (
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography sx={{ fontSize: "32px" }}>👕</Typography>
                </Box>
              )}
            </Box>

            {/* Блок по центру - название команды */}
            <Box sx={{ pt: 1, flex: 1 }}>
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

            {/* Блок справа - кнопка редактирования */}
            <Box>
              <IconButton
                onClick={handleEditTeam}
                sx={{
                  color: "#FFFFFF",
                  padding: 1,
                }}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Выбор сезона */}
        <Box sx={{ px: 2, pt: 2, pb: 0 }}>
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
            height: "100vh",
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
          {selectedSeasonId === 0 ? (
            <Box
              sx={{
                position: "absolute",
                top: "20%",
                left: "50%",
                padding: 2,
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                width: 200,
                textAlign: "center",
                backgroundColor: VOLLEYBALL_BACKGROUND_COLOR,
                border: `2px dashed ${VOLLEYBALL_BORDER_COLOR}`,
                borderRadius: 2,
                transition: "all 0.2s ease",
                pointerEvents: "auto",
                transform: "translate(-50%, -50%)",
                opacity: 0.8,
              }}
            >
              <ArrowUpwardIcon sx={{ color: "#FFFFFF" }} />
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1,
                  color: "#FFFFFF",
                  fontWeight: 500,
                }}
              >
                Выберите сезон
              </Typography>
            </Box>
          ) : (
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
                {renderPlayerSlot(3)}
                {renderPlayerSlot(6)}
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
                {renderPlayerSlot(1)}
                {renderPlayerSlot(2)}
                {renderPlayerSlot(4)}
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
                {renderPlayerSlot(5)}
              </div>
            </Box>
          )}
        </Box>
      </Container>

      {/* Модальное окно выбора игрока */}
      <PlayerSelectionModal
        open={isModalOpen}
        onClose={handleCloseModal}
        position={selectedPosition}
        playerProfiles={availablePlayerProfiles}
        seasons={seasons}
        loading={profilesLoading}
        seasonsLoading={seasonsLoading}
        teamId={teamId || ""}
        selectedSeasonId={selectedSeasonId}
        token={activeToken || ""}
        onPlayerAdded={() => {
          // Перезагружаем список игроков команды после добавления
          if (activeToken && teamId && selectedSeasonId > 0) {
            dispatch(
              fetchPlayers({
                teamId: teamId,
                seasonId: String(selectedSeasonId),
                token: activeToken,
                sportType: SportType.Volleyball,
              }),
            );
          }
        }}
      />

      {/* Модальное окно редактирования команды */}
      <EditTeamModal
        open={isEditModalOpen}
        onClose={handleCloseEditModal}
        team={team}
        cities={cities}
        token={activeToken || ""}
        sportType={SportType.Volleyball}
        onSubmit={handleUpdateTeam}
      />
    </Box>
  );
};

export default VolleyballTeamEditPage;
