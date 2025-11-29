import type { Action, Middleware, ThunkAction } from "@reduxjs/toolkit";
import { combineSlices, configureStore, isAction } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import games from "./slices/games/slice";
import favorites from "./slices/favorites/slice";

const localStorageMiddleware: Middleware<{}, RootState> =
  store => next => action => {
    const result = next(action);

    if (isAction(action)) {
      if (
        action.type === "games/addCreatedGame" ||
        action.type === "games/removeGame"
      ) {
        const state = store.getState();
        const localGames = state.games.allGames.filter(game => game.id < 0);
        localStorage.setItem("createdGames", JSON.stringify(localGames));
      }

      if (
        action.type === "favorites/toggleFavorite" ||
        action.type === "favorites/removeFavorite"
      ) {
        const state = store.getState();
        localStorage.setItem(
          "favorites",
          JSON.stringify(state.favorites.favorites),
        );
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
