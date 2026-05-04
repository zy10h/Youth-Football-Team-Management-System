import api from "./api";

export async function getTeams() {
  const response = await api.get("/teams");
  return response.data;
}