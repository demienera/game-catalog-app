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

      const localIds = ids.filter(id => id < 0);
      const apiIds = ids.filter(id => id > 0);

      const localGames = state.games.allGames.filter(game =>
        localIds.includes(game.id),
      );

      const gamesToFetch = apiIds.filter(
        id => !state.games.allGames.some(game => game.id === id),
      );

      const apiGames = await Promise.all(
        gamesToFetch.map(id => getGameByIdApi(id).catch(() => null)),
      );

      return [...localGames, ...(apiGames.filter(Boolean) as Game[])];
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
      state.allGames = state.allGames.filter(
        game => game.id !== action.payload,
      );
    },
    addCreatedGame: (state, action: PayloadAction<Game>) => {
      const id = action.payload.id;
      if (!state.allGames.some(g => g.id === id)) {
        state.allGames.unshift(action.payload);
      }
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
        state.currentPage = action.meta.arg;
        state.currentGames = newGames;

        const existingIds = new Set(state.allGames.map(g => g.id));
        const uniqueNewGames = newGames.filter(
          game => !existingIds.has(game.id),
        );

        state.allGames = [...state.allGames, ...uniqueNewGames];
        state.total = action.payload.count;
        state.isLoading = false;
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

        const newGames = action.payload.filter(game => game.id > 0);
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
export const { removeGame, addCreatedGame } = gamesSlice.actions;
export default gamesSlice.reducer;
