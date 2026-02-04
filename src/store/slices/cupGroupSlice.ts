import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { CupGroup, CupGroupTeam, CupTour } from "../../types/cup";
import {
  cupService,
  type CreateCupTourPayload,
  type UpdateCupTourPayload,
} from "../../services/cupService";

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

// Thunk для обновления группы
export const updateCupGroup = createAsyncThunk<
  { cupId: string; group: CupGroup },
  {
    cupId: number;
    groupId: number;
    name: string;
    order: number;
    token: string;
  }
>(
  "cupGroups/updateCupGroup",
  async ({ cupId, groupId, name, order, token }) => {
    // API возвращает 204 No Content, поэтому используем оптимистичное обновление
    await cupService.updateGroup(cupId, groupId, { name, order }, token);

    // Возвращаем данные, которые мы отправили (оптимистичное обновление)
    return {
      cupId: String(cupId),
      group: {
        id: groupId,
        name,
        order,
        // teams будут сохранены из старого state в reducer
      } as CupGroup,
    };
  },
);

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

// Thunk для удаления команды из группы
export const deleteTeamFromCupGroup = createAsyncThunk<
  { cupId: string; groupId: number; teamId: number },
  {
    cupId: number;
    groupId: number;
    teamId: number;
    token: string;
  }
>(
  "cupGroups/deleteTeamFromCupGroup",
  async ({ cupId, groupId, teamId, token }) => {
    // API возвращает 204 No Content, используем оптимистичное удаление
    await cupService.deleteTeamFromGroup(cupId, groupId, teamId, token);

    // Возвращаем идентификаторы для удаления из state
    return {
      cupId: String(cupId),
      groupId,
      teamId,
    };
  },
);

// Thunk для удаления группы
export const deleteCupGroup = createAsyncThunk<
  { cupId: string; groupId: number },
  {
    cupId: number;
    groupId: number;
    token: string;
  }
>(
  "cupGroups/deleteCupGroup",
  async ({ cupId, groupId, token }) => {
    // API возвращает 204 No Content, используем оптимистичное удаление
    await cupService.deleteGroup(cupId, groupId, token);

    // Возвращаем идентификаторы для удаления из state
    return {
      cupId: String(cupId),
      groupId,
    };
  },
);

// Thunk для создания тура
export const createCupTour = createAsyncThunk<
  { cupId: string; groupId: number; tour: CupTour },
  {
    cupId: number;
    groupId: number;
    data: CreateCupTourPayload;
    token: string;
  }
>(
  "cupGroups/createCupTour",
  async ({ cupId, groupId, data, token }) => {
    const tour = await cupService.createTour(cupId, groupId, data, token);
    return { cupId: String(cupId), groupId, tour };
  },
);

// Thunk для обновления тура
export const updateCupTour = createAsyncThunk<
  { cupId: string; groupId: number; tourId: number; data: UpdateCupTourPayload },
  {
    cupId: number;
    groupId: number;
    tourId: number;
    data: UpdateCupTourPayload;
    token: string;
  }
>(
  "cupGroups/updateCupTour",
  async ({ cupId, groupId, tourId, data, token }) => {
    // API возвращает 204 No Content, используем оптимистичное обновление
    await cupService.updateTour(tourId, data, token);

    // Возвращаем данные для обновления state
    return {
      cupId: String(cupId),
      groupId,
      tourId,
      data,
    };
  },
);

// Thunk для удаления тура
export const deleteCupTour = createAsyncThunk<
  { cupId: string; groupId: number; tourId: number },
  {
    cupId: number;
    groupId: number;
    tourId: number;
    token: string;
  }
>(
  "cupGroups/deleteCupTour",
  async ({ cupId, groupId, tourId, token }) => {
    // API возвращает 204 No Content, используем оптимистичное удаление
    await cupService.deleteTour(tourId, token);

    // Возвращаем идентификаторы для удаления из state
    return {
      cupId: String(cupId),
      groupId,
      tourId,
    };
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
      .addCase(updateCupGroup.fulfilled, (state, action) => {
        const { cupId, group } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Обновляем массив, создавая новую ссылку для правильного ре-рендера
          state.itemsByCupId[cupId] = groups.map((g) =>
            g.id === group.id
              ? { ...group, teams: g.teams || [] }
              : g
          );
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
      })
      .addCase(deleteTeamFromCupGroup.fulfilled, (state, action) => {
        const { cupId, groupId, teamId } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Находим группу по ID
          const group = groups.find((g) => g.id === groupId);
          if (group && group.teams) {
            // Удаляем команду из группы, создавая новый массив
            group.teams = group.teams.filter((t) => t.teamId !== teamId);
          }
        }
      })
      .addCase(deleteCupGroup.fulfilled, (state, action) => {
        const { cupId, groupId } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Удаляем группу из массива, создавая новый массив для правильного ре-рендера
          state.itemsByCupId[cupId] = groups.filter((g) => g.id !== groupId);
        }
      })
      .addCase(createCupTour.fulfilled, (state, action) => {
        const { cupId, groupId, tour } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Находим группу по ID
          const group = groups.find((g) => g.id === groupId);
          if (group) {
            // Инициализируем массив tours если его нет
            if (!group.tours) {
              group.tours = [];
            }
            // Добавляем тур в группу
            group.tours.push(tour);
          }
        }
      })
      .addCase(updateCupTour.fulfilled, (state, action) => {
        const { cupId, groupId, tourId, data } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Находим группу по ID
          const group = groups.find((g) => g.id === groupId);
          if (group && group.tours) {
            // Находим и обновляем тур
            const tourIndex = group.tours.findIndex((t) => t.id === tourId);
            if (tourIndex !== -1) {
              // Оптимистичное обновление: обновляем тур с новыми данными
              const existingTour = group.tours[tourIndex];
              group.tours[tourIndex] = {
                ...existingTour,
                number: data.number,
                name: data.name ?? "",
                startDate: data.startDate,
                endDate: data.endDate,
                dateTime: data.dateTime,
                location: data.location,
                team1Id: data.team1Id,
                team2Id: data.team2Id,
                team1Score: data.team1Score,
                team2Score: data.team2Score,
                team1Set1Score: data.team1Set1Score,
                team2Set1Score: data.team2Set1Score,
                team1Set2Score: data.team1Set2Score,
                team2Set2Score: data.team2Set2Score,
                team1Set3Score: data.team1Set3Score,
                team2Set3Score: data.team2Set3Score,
                // Сохраняем поля, которых нет в UpdateCupTourPayload
                cupGroupId: existingTour.cupGroupId,
                matchId: existingTour.matchId,
                sportType: existingTour.sportType,
                team1Name: existingTour.team1Name,
                team2Name: existingTour.team2Name,
                team1SetsWon: existingTour.team1SetsWon,
                team2SetsWon: existingTour.team2SetsWon,
              };
            }
          }
        }
      })
      .addCase(deleteCupTour.fulfilled, (state, action) => {
        const { cupId, groupId, tourId } = action.payload;
        const groups = state.itemsByCupId[cupId];
        if (groups) {
          // Находим группу по ID
          const group = groups.find((g) => g.id === groupId);
          if (group && group.tours) {
            // Удаляем тур из группы, создавая новый массив
            group.tours = group.tours.filter((t) => t.id !== tourId);
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
    const groups = state.cupGroups.itemsByCupId[cupId];
    if (!groups || groups.length === 0) {
      return EMPTY_GROUPS;
    }
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
