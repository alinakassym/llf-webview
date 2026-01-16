import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CupGroup, CupGroupTeam } from "../../types/cup";
import { cupService } from "../../services/cupService";

interface CupGroupState {
  itemsByCupId: Record<string, CupGroup[]>;
  loadingCups: string[];
  errorByCupId: Record<string, string | null>;
}

const initialState: CupGroupState = {
  itemsByCupId: {},
  loadingCups: [],
  errorByCupId: {},
};

// Константа для пустого массива чтобы избежать создания нового reference
const EMPTY_GROUPS: CupGroup[] = [];

// Thunk для загрузки групп кубка
export const fetchCupGroups = createAsyncThunk<
  { cupId: string; groups: CupGroup[] },
  { cupId: number; token: string }
>("cupGroups/fetchCupGroups", async ({ cupId, token }) => {
  const groups = await cupService.getGroups(cupId, token);
  return { cupId: String(cupId), groups };
});

// Thunk для загрузки одной группы с командами
export const fetchCupGroupById = createAsyncThunk<
  { cupId: string; group: CupGroup },
  { cupId: number; groupId: number; token: string }
>("cupGroups/fetchCupGroupById", async ({ cupId, groupId, token }) => {
  const group = await cupService.getGroupById(cupId, groupId, token);
  return { cupId: String(cupId), group };
});

// Thunk для создания новой группы
export const createCupGroup = createAsyncThunk<
  { cupId: string; group: CupGroup },
  { cupId: number; name: string; order: number; token: string }
>("cupGroups/createCupGroup", async ({ cupId, name, order, token }) => {
  const group = await cupService.createGroup(cupId, { name, order }, token);
  return { cupId: String(cupId), group };
});

// Thunk для добавления команды в группу
export const addTeamToCupGroup = createAsyncThunk<
  { cupId: string; groupId: number; team: CupGroupTeam },
  {
    cupId: number;
    groupId: number;
    teamId: number;
    seed?: number | null;
    order?: number | null;
    token: string;
  }
>(
  "cupGroups/addTeamToCupGroup",
  async ({ cupId, groupId, teamId, seed, order, token }) => {
    const team = await cupService.addTeamToGroup(
      cupId,
      groupId,
      { teamId, seed, order },
      token,
    );
    return { cupId: String(cupId), groupId, team };
  },
);

const cupGroupSlice = createSlice({
  name: "cupGroups",
  initialState,
  reducers: {
    clearCupGroups: (state) => {
      state.itemsByCupId = {};
      state.loadingCups = [];
      state.errorByCupId = {};
    },
    clearCupGroupsForCup: (state, action: { payload: string }) => {
      delete state.itemsByCupId[action.payload];
      state.loadingCups = state.loadingCups.filter(
        (cupId) => cupId !== action.payload,
      );
      delete state.errorByCupId[action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCupGroups.pending, (state, action) => {
        const cupId = String(action.meta.arg.cupId);
        if (!state.loadingCups.includes(cupId)) {
          state.loadingCups.push(cupId);
        }
        delete state.errorByCupId[cupId];
      })
      .addCase(fetchCupGroups.fulfilled, (state, action) => {
        const { cupId, groups } = action.payload;
        // Сохраняем группы в том порядке, в котором пришли с бэкенда
        state.itemsByCupId[cupId] = groups;
        state.loadingCups = state.loadingCups.filter((id) => id !== cupId);
        delete state.errorByCupId[cupId];
      })
      .addCase(fetchCupGroups.rejected, (state, action) => {
        const cupId = String(action.meta.arg.cupId);
        state.loadingCups = state.loadingCups.filter((id) => id !== cupId);
        state.errorByCupId[cupId] =
          action.error.message || "Failed to load cup groups";
      })
      .addCase(fetchCupGroupById.fulfilled, (state, action) => {
        const { cupId, group } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Обновляем группу с полученными командами
          const index = groups.findIndex((g) => g.id === group.id);
          if (index !== -1) {
            groups[index] = group;
          }
        }
      })
      .addCase(createCupGroup.fulfilled, (state, action) => {
        const { cupId, group } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Добавляем новую группу в массив
          groups.push(group);
        } else {
          // Если групп для этого кубка еще нет, создаем новый массив
          state.itemsByCupId[cupId] = [group];
        }
      })
      .addCase(addTeamToCupGroup.fulfilled, (state, action) => {
        const { cupId, groupId, team } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Находим группу по ID
          const group = groups.find((g) => g.id === groupId);
          if (group) {
            // Инициализируем массив teams если его нет
            if (!group.teams) {
              group.teams = [];
            }
            // Добавляем команду в группу
            group.teams.push(team);
          }
        }
      });
  },
});

export const { clearCupGroups, clearCupGroupsForCup } = cupGroupSlice.actions;
export default cupGroupSlice.reducer;

// Селекторы
export type RootState = { cupGroups: CupGroupState };
export const selectCupGroupsByCupId =
  (cupId: string) => (state: RootState) => {
    const groups = state.cupGroups.itemsByCupId[cupId] || EMPTY_GROUPS;
    // Фильтруем только если есть невалидные элементы
    const hasInvalidGroups = groups.some(
      (group) => !group || !group.id || !group.name,
    );
    if (!hasInvalidGroups) {
      return groups;
    }
    return groups.filter((group) => group && group.id && group.name);
  };
export const selectCupGroupsLoadingForCup =
  (cupId: string) => (state: RootState) =>
    state.cupGroups.loadingCups.includes(cupId);
export const selectCupGroupsErrorForCup =
  (cupId: string) => (state: RootState) =>
    state.cupGroups.errorByCupId[cupId] || null;
