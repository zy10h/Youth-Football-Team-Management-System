import api from "./api";

export async function getCoaches() {
  const response = await api.get("/coaches");
  return response.data;
}