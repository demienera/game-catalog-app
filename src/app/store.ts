import type { Action, Middleware, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore, isAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import games, { fetchFavoriteGamesThunk } from "./slices/games/slice";
import favorites, { setFavoritesGames } from "./slices/favorites/slice";

const localStorageMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const result = next(action);

    if (isAction(action)) {
      if (
        action.type === "games/addCreatedGame" ||
        action.type === "games/removeGame"
      ) {
        const state = store.getState();
        // Локальные игры: отрицательные ID или очень большие числа (timestamp)
        const MAX_API_ID = 1000000;
        const localGames = state.games.allGames.filter(
          game => game.id < 0 || game.id > MAX_API_ID,
        );
        localStorage.setItem("createdGames", JSON.stringify(localGames));
      }

      // Сохраняем загруженные игры избранного в favoritesGames
      if (action.type === fetchFavoriteGamesThunk.fulfilled.type) {
        const state = store.getState();
        const loadedGames = (action as any).payload || [];
        const currentFavoritesGames = state.favorites.favoritesGames;
        const newGames = loadedGames.filter(
          (game: any) =>
            !currentFavoritesGames.some((g: any) => g.id === game.id),
        );
        if (newGames.length > 0) {
          // Добавляем новые игры в начало списка избранного
          store.dispatch(
            setFavoritesGames([...newGames, ...currentFavoritesGames]),
          );
        }
      }
    }

    return result;
  };

const rootReducer = combineSlices({ games, favorites });
export type RootState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<RootState>) => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: getDefaultMiddleware => {
      return getDefaultMiddleware().concat(localStorageMiddleware);
    },
    preloadedState,
  });

  setupListeners(store.dispatch);
  return store;
};

export const store = makeStore();

export type AppStore = typeof store;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
