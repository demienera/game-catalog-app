import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getGamesApi, getGameByIdApi } from "../../../utils/api";
import { Game } from "../../../utils/types";
import { RootState } from "../../store";

export const fetchGamesThunk = createAsyncThunk(
  "games/getGames",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      return await getGamesApi(page);
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : "Failed to fetch games",
      );
    }
  },
);

export const fetchFavoriteGamesThunk = createAsyncThunk(
  "games/fetchFavorites",
  async (ids: number[], { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;

      // Локальные игры: отрицательные ID или очень большие числа (потеря знака при сериализации)
      // API игры обычно имеют ID меньше 1 миллиона, а timestamp (Date.now()) дает числа > 1 миллиарда
      const MAX_API_ID = 1000000;
      const isLocalId = (id: number) => id < 0 || id > MAX_API_ID;

      const localIds = ids.filter(isLocalId);
      const apiIds = ids.filter(id => !isLocalId(id));

      // Находим локальные игры из allGames, которые есть в списке избранных
      const localGames = state.games.allGames.filter(game =>
        localIds.includes(game.id),
      );

      // Находим API игры, которые уже есть в allGames
      const existingApiGames = state.games.allGames.filter(game =>
        apiIds.includes(game.id),
      );

      // Находим API игры, которые нужно загрузить
      const gamesToFetch = apiIds.filter(
        id =>
          id != null &&
          id > 0 &&
          !state.games.allGames.some(game => game.id === id),
      );

      const apiGames = await Promise.all(
        gamesToFetch
          .filter((id): id is number => id != null && id > 0)
          .map(id => getGameByIdApi(id).catch(() => null)),
      );

      // Возвращаем все игры: локальные + уже загруженные API + новые API
      return [
        ...localGames,
        ...existingApiGames,
        ...(apiGames.filter(Boolean) as Game[]),
      ];
    } catch (e) {
      return rejectWithValue(
        e instanceof Error ? e.message : "Failed to fetch favorites",
      );
    }
  },
);

const savedGames: Game[] = JSON.parse(
  localStorage.getItem("createdGames") || "[]",
);

export type GamesState = {
  allGames: Game[];
  currentGames: Game[];
  isLoading: boolean;
  isFavoritesLoading: boolean;
  total: number;
  currentPage: number;
  error: string | null;
};

const initialState: GamesState = {
  allGames: savedGames,
  currentGames: [],
  isLoading: false,
  isFavoritesLoading: false,
  total: 0,
  currentPage: 1,
  error: null,
};

const gamesSlice = createSlice({
  name: "games",
  initialState,
  selectors: {
    allGamesSelector: state => state.allGames,
    isLoadingGamesSelector: state => state.isLoading,
    isFavoritesLoadingSelector: state => state.isFavoritesLoading,
    totalGamesSelector: state => state.total,
    currentGamesSelector: state => state.currentGames,
  },
  reducers: {
    removeGame(state, action: PayloadAction<number>) {
      const id = action.payload;
      state.allGames = state.allGames.filter(game => game.id !== id);
      // Также удаляем из currentGames
      state.currentGames = state.currentGames.filter(game => game.id !== id);
    },
    addCreatedGame: (state, action: PayloadAction<Game>) => {
      const id = action.payload.id;
      if (!state.allGames.some(g => g.id === id)) {
        state.allGames.unshift(action.payload);
        // Добавляем игру в начало currentGames
        // Если мы не на первой странице, сбрасываем на первую страницу
        if (state.currentPage !== 1) {
          state.currentPage = 1;
        }
        // Добавляем игру в начало currentGames, если её еще нет там
        if (!state.currentGames.some(g => g.id === id)) {
          state.currentGames = [action.payload, ...state.currentGames];
        }
      }
    },
    resetFavoritesLoading: state => {
      state.isFavoritesLoading = false;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGamesThunk.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGamesThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchGamesThunk.fulfilled, (state, action) => {
        const newGames = action.payload.results;
        const page = action.meta.arg;
        state.currentPage = page;

        const existingIds = new Set(state.allGames.map(g => g.id));
        const uniqueNewGames = newGames.filter(
          game => !existingIds.has(game.id),
        );

        state.allGames = [...state.allGames, ...uniqueNewGames];
        state.total = action.payload.count;
        state.isLoading = false;

        // На первой странице добавляем локальные игры в начало списка
        if (page === 1) {
          const MAX_API_ID = 1000000;
          const localGames = state.allGames.filter(
            game => game.id < 0 || game.id > MAX_API_ID,
          );
          // Объединяем локальные игры с API играми, исключая дубликаты
          const apiGameIds = new Set(newGames.map(g => g.id));
          const localGamesToShow = localGames.filter(
            game => !apiGameIds.has(game.id),
          );
          state.currentGames = [...localGamesToShow, ...newGames];
        } else {
          state.currentGames = newGames;
        }
      })
      .addCase(fetchFavoriteGamesThunk.pending, state => {
        state.isFavoritesLoading = true;
      })
      .addCase(fetchFavoriteGamesThunk.rejected, (state, action) => {
        state.isFavoritesLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchFavoriteGamesThunk.fulfilled, (state, action) => {
        state.isFavoritesLoading = false;

        // Фильтруем только API игры (исключаем локальные с большими ID)
        const MAX_API_ID = 1000000;
        const newGames = action.payload.filter(
          game => game.id > 0 && game.id <= MAX_API_ID,
        );
        const existingIds = new Set(state.allGames.map(g => g.id));
        const uniqueNewGames = newGames.filter(
          game => !existingIds.has(game.id),
        );

        state.allGames = [...state.allGames, ...uniqueNewGames];
      });
  },
});

export const {
  allGamesSelector,
  currentGamesSelector,
  isLoadingGamesSelector,
  isFavoritesLoadingSelector,
  totalGamesSelector,
} = gamesSlice.selectors;
export const { removeGame, addCreatedGame, resetFavoritesLoading } =
  gamesSlice.actions;
export default gamesSlice.reducer;
