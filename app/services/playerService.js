import api from "./api";

export async function getPlayers() {
  const response = await api.get("/players");
  return response.data;
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