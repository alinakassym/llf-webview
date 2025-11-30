import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { RootState } from "../index";
import type { Player } from "../../types/player";
import { playerService } from "../../services/playerService";

interface PlayerState {
  itemsByTeamId: Record<string, Player[]>; // Игроки по командам
  loadingTeams: string[]; // Какие команды сейчас загружаются
  errorByTeamId: Record<string, string | null>; // Ошибки по командам
}

const initialState: PlayerState = {
  itemsByTeamId: {},
  loadingTeams: [],
  errorByTeamId: {},
};

// Thunk для загрузки игроков
export const fetchPlayers = createAsyncThunk<
  { teamId: string; players: Player[] },
  { teamId: string; token: string; seasonId?: string }
>("players/fetchPlayers", async ({ teamId, token, seasonId }) => {
  const players = await playerService.getPlayers(token, teamId, seasonId);
  return { teamId, players };
});

const playerSlice = createSlice({
  name: "players",
  initialState,
  reducers: {
    clearPlayers: (state) => {
      state.itemsByTeamId = {};
      state.loadingTeams = [];
      state.errorByTeamId = {};
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
        const teamId = action.meta.arg.teamId;
        if (!state.loadingTeams.includes(teamId)) {
          state.loadingTeams.push(teamId);
        }
        state.errorByTeamId[teamId] = null;
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        const { teamId, players } = action.payload;
        state.itemsByTeamId[teamId] = players.sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );
        state.loadingTeams = state.loadingTeams.filter((id) => id !== teamId);
      })
      .addCase(fetchPlayers.rejected, (state, action) => {
        const teamId = action.meta.arg.teamId;
        state.loadingTeams = state.loadingTeams.filter((id) => id !== teamId);
        state.errorByTeamId[teamId] =
          action.error.message || "Failed to fetch players";
      });
  },
});

// Селектор для получения игроков по команде
export const selectPlayersByTeam = (state: RootState, teamId: string) => {
  return state.players.itemsByTeamId[teamId] || [];
};

// Селектор для получения всех игроков
export const selectAllPlayers = (state: RootState) => {
  return Object.values(state.players.itemsByTeamId).flat();
};

export const { clearPlayers, clearPlayersForTeam } = playerSlice.actions;
export default playerSlice.reducer;
