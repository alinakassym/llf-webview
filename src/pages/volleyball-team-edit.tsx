// llf-webview/src/pages/volleyball-team-edit.tsx

import { type FC, useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Box, Container, Typography, CircularProgress } from "@mui/material";
import { ShirtIcon } from "../components/icons";
import { teamService } from "../services/teamService";
import { playerService } from "../services/playerService";
import { seasonService } from "../services/seasonService";
import { useAuth } from "../hooks/useAuth";
import { useWebViewToken } from "../hooks/useWebViewToken";
import type { Team } from "../types/team";
import type { PlayerProfile } from "../types/player";
import type { Season } from "../types/season";
import EmptyPlayerSlot from "../components/EmptyPlayerSlot";
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
  const { teamId } = useParams<{ teamId: string }>();
  const { token, loading: authLoading } = useAuth();
  const { webViewToken, loading: webViewLoading } = useWebViewToken();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string>("");
  const [playerProfiles, setPlayerProfiles] = useState<PlayerProfile[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [seasonsLoading, setSeasonsLoading] = useState(false);

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

  // Загружаем профили игроков и сезоны при открытии модального окна
  useEffect(() => {
    const fetchPlayerProfiles = async () => {
      if (!isModalOpen || !activeToken) {
        return;
      }

      try {
        setProfilesLoading(true);
        const profiles = await playerService.getPlayerProfiles(
          activeToken,
          String(SportType.Volleyball)
        );
        setPlayerProfiles(profiles);
      } catch (err) {
        console.error("Error fetching player profiles:", err);
      } finally {
        setProfilesLoading(false);
      }
    };

    const fetchSeasons = async () => {
      if (!isModalOpen || !activeToken || !team) {
        return;
      }

      try {
        setSeasonsLoading(true);
        const seasonsData = await seasonService.getSeasons(
          activeToken,
          team.cityId,
          String(SportType.Volleyball)
        );
        setSeasons(seasonsData);
      } catch (err) {
        console.error("Error fetching seasons:", err);
      } finally {
        setSeasonsLoading(false);
      }
    };

    fetchPlayerProfiles();
    fetchSeasons();
  }, [isModalOpen, activeToken, team]);

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
              <EmptyPlayerSlot
                label={
                  VolleyballPositionAbbreviation[
                    VolleyballPosition.MiddleBlocker
                  ]
                }
                backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
                borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
                onClick={() =>
                  handlePlayerSlotClick(
                    VolleyballPositionName[VolleyballPosition.MiddleBlocker],
                  )
                }
              />
              <EmptyPlayerSlot
                label={
                  VolleyballPositionAbbreviation[
                    VolleyballPosition.MiddleBlocker
                  ]
                }
                backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
                borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
                onClick={() =>
                  handlePlayerSlotClick(
                    VolleyballPositionName[VolleyballPosition.MiddleBlocker],
                  )
                }
              />
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
              <EmptyPlayerSlot
                label={
                  VolleyballPositionAbbreviation[VolleyballPosition.Setter]
                }
                backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
                borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
                onClick={() =>
                  handlePlayerSlotClick(
                    VolleyballPositionName[VolleyballPosition.Setter],
                  )
                }
              />
              <EmptyPlayerSlot
                label={
                  VolleyballPositionAbbreviation[
                    VolleyballPosition.OutsideHitter
                  ]
                }
                backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
                borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
                onClick={() =>
                  handlePlayerSlotClick(
                    VolleyballPositionName[VolleyballPosition.OutsideHitter],
                  )
                }
              />
              <EmptyPlayerSlot
                label={
                  VolleyballPositionAbbreviation[VolleyballPosition.Opposite]
                }
                backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
                borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
                onClick={() =>
                  handlePlayerSlotClick(
                    VolleyballPositionName[VolleyballPosition.Opposite],
                  )
                }
              />
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
              <EmptyPlayerSlot
                label={
                  VolleyballPositionAbbreviation[VolleyballPosition.Libero]
                }
                backgroundColor={VOLLEYBALL_HOVER_BACKGROUND_COLOR}
                borderColor={VOLLEYBALL_HOVER_BORDER_COLOR}
                onClick={() =>
                  handlePlayerSlotClick(
                    VolleyballPositionName[VolleyballPosition.Libero],
                  )
                }
              />
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
