import api from "./api";
import { withOfflineCache } from "./cacheService";

const PLAYERS_CACHE_KEY = "offline.players";

function getPlayersCacheKey(params) {
  return `${PLAYERS_CACHE_KEY}.${JSON.stringify(params || {})}`;
}

export async function getPlayers(params = {}) {
  return withOfflineCache(getPlayersCacheKey(params), async () => {
    const response = await api.get("/players", { params });
    return response.data;
  });
}

export async function createPlayer(playerData) {
  const response = await api.post("/players", playerData);
  return response.data;
}

export async function updatePlayer(id, playerData) {
  const response = await api.put(`/players/${id}`, playerData);
  return response.data;
}

export async function deletePlayer(id) {
  const response = await api.delete(`/players/${id}`);
  return response.data;
}
