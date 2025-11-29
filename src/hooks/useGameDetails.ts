import { useEffect, useState } from "react";
import { allGamesSelector } from "../app/slices/games/slice";
import { useAppSelector } from "../app/hooks";
import { getGameByIdApi, getGameScreenshotsApi } from "../utils/api";
import { Game } from "../utils/types";

export function useGameDetails(id?: number) {
  const localGames = useAppSelector(allGamesSelector);
  const [game, setGame] = useState<Game | null>(null);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id === undefined || id === null || !Number.isFinite(id)) {
      setError("ID игры не указан или невалиден");
      setLoading(false);
      return;
    }

    const loadGameData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Проверяем, является ли это локальной игрой
        const MAX_API_ID = 1000000;
        const isLocalId = id < 0 || id > MAX_API_ID;

        if (isLocalId) {
          const localGame = localGames.find(g => g.id === id);
          if (localGame) {
            setGame(localGame);
            setScreenshots(localGame.screenshots || []);
            setLoading(false);
            return;
          }
        }

        const [apiGame, apiScreenshots] = await Promise.all([
          getGameByIdApi(id),
          getGameScreenshotsApi(id),
        ]);

        setGame(apiGame);
        setScreenshots(apiScreenshots);
      } catch (e) {
        const localGame = localGames.find(g => g.id === id);
        if (localGame) {
          setGame(localGame);
          setScreenshots(localGame.screenshots || []);
        } else {
          setError("Игра не найдена");
        }
      } finally {
        setLoading(false);
      }
    };

    loadGameData();
  }, [id, localGames]);

  return { game, screenshots, loading, error };
}
