import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Game } from "../../../utils/types";

export type FavoritesState = {
  favorites: number[];
  favoritesGames: Game[];
};

const FAVORITES_STORAGE_KEY = "favorites";
const FAVORITES_GAMES_STORAGE_KEY = "favoritesGames";

const getInitialFavorites = (): number[] => {
  const stored = JSON.parse(
    localStorage.getItem(FAVORITES_STORAGE_KEY) || "[]",
  );
  // Фильтруем валидные ID (исключаем null, undefined, NaN, строки)
  return Array.isArray(stored)
    ? stored.filter(
        (id): id is number =>
          typeof id === "number" && Number.isFinite(id) && id !== null,
      )
    : [];
};

const getInitialFavoritesGames = (): Game[] => {
  const stored = JSON.parse(
    localStorage.getItem(FAVORITES_GAMES_STORAGE_KEY) || "[]",
  );
  return Array.isArray(stored) ? stored : [];
};

const saveFavoritesToStorage = (favorites: number[]) => {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
};

const saveFavoritesGamesToStorage = (games: Game[]) => {
  localStorage.setItem(FAVORITES_GAMES_STORAGE_KEY, JSON.stringify(games));
};

const initialState: FavoritesState = {
  favorites: getInitialFavorites(),
  favoritesGames: getInitialFavoritesGames(),
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  selectors: {
    favoritesSelector: state => state.favorites,
    favoritesGamesSelector: state => state.favoritesGames,
  },
  reducers: {
    toggleFavorite: (
      state,
      action: PayloadAction<{ gameId: number; game?: Game }>,
    ) => {
      const { gameId, game } = action.payload;
      const isAlreadyFav = state.favorites.includes(gameId);

      if (isAlreadyFav) {
        state.favorites = state.favorites.filter(id => id !== gameId);
        state.favoritesGames = state.favoritesGames.filter(
          (g: Game) => g.id !== gameId,
        );
      } else {
        state.favorites = [...state.favorites, gameId];
        if (game) {
          // Добавляем игру в начало списка избранного
          state.favoritesGames = [
            game,
            ...state.favoritesGames.filter((g: Game) => g.id !== gameId),
          ];
        }
      }

      // Сохраняем в localStorage
      saveFavoritesToStorage(state.favorites);
      saveFavoritesGamesToStorage(state.favoritesGames);
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
      state.favoritesGames = state.favoritesGames.filter(
        (g: Game) => g.id !== action.payload,
      );

      // Сохраняем в localStorage
      saveFavoritesToStorage(state.favorites);
      saveFavoritesGamesToStorage(state.favoritesGames);
    },
    setFavoritesGames: (state, action: PayloadAction<Game[]>) => {
      state.favoritesGames = action.payload;
      saveFavoritesGamesToStorage(state.favoritesGames);
    },
    loadFavoritesFromStorage: state => {
      state.favorites = getInitialFavorites();
      state.favoritesGames = getInitialFavoritesGames();
    },
  },
});

export const {
  toggleFavorite,
  removeFavorite,
  setFavoritesGames,
  loadFavoritesFromStorage,
} = favoritesSlice.actions;
export const { favoritesSelector, favoritesGamesSelector } =
  favoritesSlice.selectors;
export default favoritesSlice.reducer;
