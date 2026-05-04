import api from "./api";

export async function getTeams() {
  const response = await api.get("/teams");
  return response.data;
}

export async function getTeam(id) {
  const response = await api.get(`/teams/${id}`);
  return response.data;
}

export async function createTeam(teamData) {
  const response = await api.post("/teams", teamData);
  return response.data;
}

export async function updateTeam(id, teamData) {
  const response = await api.put(`/teams/${id}`, teamData);
  return response.data;
}

export async function deleteTeam(id) {
  const response = await api.delete(`/teams/${id}`);
  return response.data;
}

export async function getTeamsByCoach(coachId) {
  const response = await api.get(`/teams/coach/${coachId}`);
  return response.data;
}
