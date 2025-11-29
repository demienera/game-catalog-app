import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchGamesThunk,
  removeGame,
  totalGamesSelector,
  isLoadingGamesSelector,
  isFavoritesLoadingSelector,
  allGamesSelector,
  currentGamesSelector,
  fetchFavoriteGamesThunk,
} from "../app/slices/games/slice";
import {
  favoritesSelector,
  removeFavorite,
} from "../app/slices/favorites/slice";

export const useCatalogData = () => {
  const dispatch = useAppDispatch();
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);

  const currentGames = useAppSelector(currentGamesSelector);
  const allGames = useAppSelector(allGamesSelector);
  const favorites = useAppSelector(favoritesSelector);
  const total = useAppSelector(totalGamesSelector);
  const isLoading = useAppSelector(isLoadingGamesSelector);
  const isFavoritesLoading = useAppSelector(isFavoritesLoadingSelector);

  const displayedGames = useMemo(() => {
    if (showFavorites) {
      return allGames.filter(game => favorites.includes(game.id));
    }

    return currentGames;
  }, [showFavorites, allGames, favorites, currentGames]);

  useEffect(() => {
    if (!showFavorites) {
      dispatch(fetchGamesThunk(page));
    }
  }, [dispatch, page, showFavorites]);

  useEffect(() => {
    if (showFavorites && favorites.length > 0) {
      const missingFavorites = favorites.filter(
        id => !allGames.some(game => game.id === id),
      );

      if (missingFavorites.length > 0) {
        dispatch(fetchFavoriteGamesThunk(missingFavorites));
      }
    }
  }, [showFavorites, favorites, allGames, dispatch]);

  const isEmpty = !displayedGames.length;
  const isLoadingData = showFavorites ? isFavoritesLoading : isLoading;

  const handleShowFavorites = (value: "all" | "favorites") => {
    setShowFavorites(value === "favorites");
  };

  const handleDelete = (id: number) => {
    dispatch(removeGame(id));
    dispatch(removeFavorite(id));
  };

  return {
    displayedGames,
    total,
    isEmpty,
    isLoadingData,
    showFavorites,
    page,
    setPage,
    handleShowFavorites,
    handleDelete,
  };
};
