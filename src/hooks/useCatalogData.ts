import { useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  fetchGamesThunk,
  removeGame,
  totalGamesSelector,
  isLoadingGamesSelector,
  isFavoritesLoadingSelector,
  currentGamesSelector,
  fetchFavoriteGamesThunk,
  resetFavoritesLoading,
} from "../app/slices/games/slice";
import {
  favoritesSelector,
  favoritesGamesSelector,
  removeFavorite,
  loadFavoritesFromStorage,
} from "../app/slices/favorites/slice";

export const useCatalogData = () => {
  const dispatch = useAppDispatch();
  const [showFavorites, setShowFavorites] = useState(false);
  const [page, setPage] = useState(1);
  const loadingFavoritesRef = useRef<Set<number>>(new Set());
  const lastProcessedFavoritesRef = useRef<string>("");

  const currentGames = useAppSelector(currentGamesSelector);
  const favorites = useAppSelector(favoritesSelector);
  const favoritesGames = useAppSelector(favoritesGamesSelector);

  // Используем ref для favoritesGames, чтобы избежать бесконечного цикла
  const favoritesGamesRef = useRef(favoritesGames);

  // Обновляем ref при изменении favoritesGames
  useEffect(() => {
    favoritesGamesRef.current = favoritesGames;
  }, [favoritesGames]);
  const total = useAppSelector(totalGamesSelector);
  const isLoading = useAppSelector(isLoadingGamesSelector);
  const isFavoritesLoading = useAppSelector(isFavoritesLoadingSelector);

  // Загружаем избранное из localStorage при монтировании
  useEffect(() => {
    dispatch(loadFavoritesFromStorage());
  }, [dispatch]);

  const displayedGames = useMemo(() => {
    if (showFavorites) {
      // Используем игры из localStorage (favoritesGames)
      // Фильтруем только те игры, которые есть в списке избранного
      const filtered = favoritesGames.filter(game =>
        favorites.includes(game.id),
      );

      // Если есть игры в favoritesGames, но они не совпадают с favorites,
      // это значит, что нужно загрузить недостающие
      // Но все равно показываем то, что есть
      return filtered;
    }

    return currentGames;
  }, [showFavorites, favorites, favoritesGames, currentGames]);

  useEffect(() => {
    if (!showFavorites) {
      dispatch(fetchGamesThunk(page));
    }
  }, [dispatch, page, showFavorites]);

  // Отдельный эффект для загрузки избранного при переключении на вкладку
  useEffect(() => {
    if (!showFavorites) {
      loadingFavoritesRef.current.clear();
      lastProcessedFavoritesRef.current = "";
      return;
    }

    // Загружаем избранное из localStorage при переключении на вкладку
    dispatch(loadFavoritesFromStorage());
    // Сразу сбрасываем состояние загрузки, чтобы показать данные из localStorage
    dispatch(resetFavoritesLoading());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFavorites, dispatch]);

  // Используем useMemo для создания стабильного ключа favorites
  // Это предотвратит бесконечный цикл
  const favoritesKey = useMemo(
    () => JSON.stringify([...favorites].sort((a, b) => a - b)),
    [favorites],
  );

  // Ref для отслеживания состояния монтирования
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Отдельный эффект для загрузки недостающих игр
  useEffect(() => {
    if (!showFavorites) {
      return;
    }

    // Если мы уже обрабатывали этот список, не делаем ничего
    if (lastProcessedFavoritesRef.current === favoritesKey) {
      return;
    }

    // Отмечаем, что мы обрабатываем этот список
    lastProcessedFavoritesRef.current = favoritesKey;

    // Используем requestAnimationFrame для получения актуального значения после loadFavoritesFromStorage
    // Это более безопасно, чем setTimeout, и не требует cleanup
    const rafId = requestAnimationFrame(() => {
      // Проверяем, что компонент еще смонтирован
      if (!isMountedRef.current) {
        return;
      }

      if (favorites.length === 0) {
        // Если избранных нет, сбрасываем состояние загрузки
        dispatch(resetFavoritesLoading());
        loadingFavoritesRef.current.clear();
        return;
      }

      // Проверяем, есть ли игры в favoritesGames из localStorage
      const validFavorites = favorites.filter(
        (id): id is number => id != null && Number.isFinite(id),
      );

      // Находим игры, которых нет в favoritesGames и которые еще не загружаются
      const missingFavorites = validFavorites.filter(
        id =>
          !favoritesGamesRef.current.some(game => game.id === id) &&
          !loadingFavoritesRef.current.has(id),
      );

      if (missingFavorites.length > 0) {
        // Отмечаем ID как загружающиеся
        missingFavorites.forEach(id => loadingFavoritesRef.current.add(id));

        // Загружаем только те игры, которых нет в localStorage
        dispatch(fetchFavoriteGamesThunk(missingFavorites)).finally(() => {
          // Проверяем, что компонент еще смонтирован перед обновлением ref
          if (isMountedRef.current) {
            // Убираем ID из списка загружающихся после завершения
            missingFavorites.forEach(id =>
              loadingFavoritesRef.current.delete(id),
            );
          }
        });
      } else {
        // Все игры уже загружены в localStorage, сбрасываем состояние загрузки
        dispatch(resetFavoritesLoading());
        loadingFavoritesRef.current.clear();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
    // Используем favoritesKey вместо favorites для стабильности
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showFavorites, favoritesKey, dispatch]);

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
