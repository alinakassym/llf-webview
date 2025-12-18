import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Player, PlayerProfile } from "../../types/player";
import { playerService, type CreatePlayerProfilePayload } from "../../services/playerService";

interface PlayerState {
  itemsByTeamId: Record<string, Player[]>; // Игроки по командам
  loadingTeams: string[]; // Какие команды сейчас загружаются
  errorByTeamId: Record<string, string | null>; // Ошибки по командам
  allPlayers: Player[]; // Все игроки
  loadingAll: boolean; // Загрузка всех игроков
  errorAll: string | null; // Ошибка загрузки всех игроков
  playerProfiles: PlayerProfile[]; // Профили всех игроков
  loadingProfiles: boolean; // Загрузка профилей
  errorProfiles: string | null; // Ошибка загрузки профилей
}

const initialState: PlayerState = {
  itemsByTeamId: {},
  loadingTeams: [],
  errorByTeamId: {},
  allPlayers: [],
  loadingAll: false,
  errorAll: null,
  playerProfiles: [],
  loadingProfiles: false,
  errorProfiles: null,
};

// Thunk для загрузки игроков по команде
export const fetchPlayers = createAsyncThunk<
  { teamId: string | undefined; players: Player[] },
  { teamId?: string; token: string; seasonId?: string; sportType?: string }
>("players/fetchPlayers", async ({ teamId, token, seasonId, sportType }) => {
  const players = await playerService.getPlayers(token, teamId, seasonId, sportType);
  return { teamId, players };
});

// Thunk для загрузки всех игроков
export const fetchAllPlayers = createAsyncThunk<
  Player[],
  { token: string; teamId?: string; seasonId?: string }
>("players/fetchAllPlayers", async ({ token, teamId, seasonId }) => {
  const players = await playerService.getPlayers(token, teamId, seasonId);
  return players;
});

// Thunk для загрузки профилей игроков
export const fetchPlayerProfiles = createAsyncThunk<
  PlayerProfile[],
  { token: string; sportType?: string }
>("players/fetchPlayerProfiles", async ({ token, sportType }) => {
  const profiles = await playerService.getPlayerProfiles(token, sportType);
  return profiles;
});

// Thunk для создания профиля игрока
export const createPlayerProfile = createAsyncThunk<
  PlayerProfile,
  { data: CreatePlayerProfilePayload; token: string }
>("players/createPlayerProfile", async ({ data, token }) => {
  const player = await playerService.createPlayerProfile(data, token);
  return player;
});

const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    clearPlayers: (state) => {
      state.itemsByTeamId = {};
      state.loadingTeams = [];
      state.errorByTeamId = {};
      state.allPlayers = [];
      state.loadingAll = false;
      state.errorAll = null;
    },
    clearPlayersForTeam: (state, action: { payload: string }) => {
      delete state.itemsByTeamId[action.payload];
      state.loadingTeams = state.loadingTeams.filter(
        (teamId) => teamId !== action.payload
      );
      delete state.errorByTeamId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlayers.pending, (state, action) => {
        const teamId = action.meta.arg.teamId || "__ALL__";
        if (!state.loadingTeams.includes(teamId)) {
          state.loadingTeams.push(teamId);
        }
        state.errorByTeamId[teamId] = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        const { teamId, players } = action.payload;

        if (teamId) {
          // Если teamId указан, сохраняем игроков для конкретной команды
          state.itemsByTeamId[teamId] = players.sort((a, b) =>
            a.fullName.localeCompare(b.fullName)
          );
          state.loadingTeams = state.loadingTeams.filter((id) => id !== teamId);
        } else {
          // Если teamId не указан, группируем игроков по командам
          const grouped: Record<string, Player[]> = {};
          players.forEach((player) => {
            const playerTeamId = String(player.teamId);
            if (!grouped[playerTeamId]) {
              grouped[playerTeamId] = [];
            }
            grouped[playerTeamId].push(player);
          });

          // Сортируем игроков в каждой команде и сохраняем
          Object.entries(grouped).forEach(([teamKey, teamPlayers]) => {
            state.itemsByTeamId[teamKey] = teamPlayers.sort((a, b) =>
              a.fullName.localeCompare(b.fullName)
            );
          });

          state.loadingTeams = state.loadingTeams.filter((id) => id !== "__ALL__");
        }
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        const teamId = action.meta.arg.teamId || "__ALL__";
        state.loadingTeams = state.loadingTeams.filter((id) => id !== teamId);
        state.errorByTeamId[teamId] =
          action.error.message || "Failed to fetch players";
      })
      .addCase(fetchAllPlayers.pending, (state) => {
        state.loadingAll = true;
        state.errorAll = null;
      })
      .addCase(fetchAllPlayers.fulfilled, (state, action) => {
        state.allPlayers = action.payload.sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );
        state.loadingAll = false;
      })
      .addCase(fetchAllPlayers.rejected, (state, action) => {
        state.loadingAll = false;
        state.errorAll = action.error.message || "Failed to fetch all players";
      })
      .addCase(fetchPlayerProfiles.pending, (state) => {
        state.loadingProfiles = true;
        state.errorProfiles = null;
      })
      .addCase(fetchPlayerProfiles.fulfilled, (state, action) => {
        state.playerProfiles = action.payload.sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );
        state.loadingProfiles = false;
      })
      .addCase(fetchPlayerProfiles.rejected, (state, action) => {
        state.loadingProfiles = false;
        state.errorProfiles =
          action.error.message || "Failed to fetch player profiles";
      })
      .addCase(createPlayerProfile.pending, (state) => {
        state.loadingProfiles = true;
        state.errorProfiles = null;
      })
      .addCase(createPlayerProfile.fulfilled, (state, action) => {
        state.playerProfiles.push(action.payload);
        state.playerProfiles.sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );
        state.loadingProfiles = false;
      })
      .addCase(createPlayerProfile.rejected, (state, action) => {
        state.loadingProfiles = false;
        state.errorProfiles =
          action.error.message || "Failed to create player profile";
      });
  },
});

// Селектор для получения игроков по команде
export const selectPlayersByTeam = (state: RootState, teamId: string) => {
  return state.players.itemsByTeamId[teamId] || [];
};

// Селектор для получения всех игроков (из загруженных по командам)
export const selectAllPlayersByTeams = (state: RootState) => {
  return Object.values(state.players.itemsByTeamId).flat();
};

// Селектор для получения всех игроков (из общей загрузки)
export const selectAllPlayers = (state: RootState) => {
  return state.players.allPlayers;
};

// Селектор для загрузки всех игроков
export const selectAllPlayersLoading = (state: RootState) => {
  return state.players.loadingAll;
};

// Селектор для ошибки загрузки всех игроков
export const selectAllPlayersError = (state: RootState) => {
  return state.players.errorAll;
};

// Селектор для получения профилей игроков
export const selectPlayerProfiles = (state: RootState) => {
  return state.players.playerProfiles;
};

// Селектор для загрузки профилей
export const selectPlayerProfilesLoading = (state: RootState) => {
  return state.players.loadingProfiles;
};

// Селектор для ошибки загрузки профилей
export const selectPlayerProfilesError = (state: RootState) => {
  return state.players.errorProfiles;
};

export const { clearPlayers, clearPlayersForTeam } = playerSlice.actions;
export default playerSlice.reducer;
