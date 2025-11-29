import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type FavoritesState = {
  favorites: number[];
};

const getInitialFavorites = () => {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
};

const initialState: FavoritesState = {
  favorites: getInitialFavorites(),
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  selectors: {
    favoritesSelector: state => state.favorites,
  },
  reducers: {
    toggleFavorite: (state, action: PayloadAction<number>) => {
      const gameId = action.payload;
      const isAlreadyFav = state.favorites.includes(gameId);

      state.favorites = isAlreadyFav
        ? state.favorites.filter(id => id !== gameId)
        : [...state.favorites, gameId];
    },
    removeFavorite: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
  },
});

export const { toggleFavorite, removeFavorite } = favoritesSlice.actions;
export const { favoritesSelector } = favoritesSlice.selectors;
export default favoritesSlice.reducer;
