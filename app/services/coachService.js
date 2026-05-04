import api from "./api";

export async function getCoaches() {
  const response = await api.get("/coaches");
  return response.data;
}

export async function getCoach(id) {
  const response = await api.get(`/coaches/${id}`);
  return response.data;
}

export async function createCoach(coachData) {
  const response = await api.post("/coaches", coachData);
  return response.data;
}

export async function updateCoach(id, coachData) {
  const response = await api.put(`/coaches/${id}`, coachData);
  return response.data;
}

export async function deleteCoach(id) {
  const response = await api.delete(`/coaches/${id}`);
  return response.data;
}
