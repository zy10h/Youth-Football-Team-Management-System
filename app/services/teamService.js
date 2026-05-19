import api from "./api";
import {
  getCachedData,
  markCacheResult,
  withOfflineCache,
} from "./cacheService";

const TEAMS_CACHE_KEY = "offline.teams";
const TEAM_DETAIL_CACHE_PREFIX = "offline.team";
const TEAMS_BY_COACH_CACHE_PREFIX = "offline.teamsByCoach";

const getEntityId = (item) => item?._id || item?.id || item;

function getListFromPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  return payload?.teams || [];
}

export async function getTeams() {
  return withOfflineCache(TEAMS_CACHE_KEY, async () => {
    const response = await api.get("/teams");
    return response.data;
  });
}

export async function getTeam(id) {
  try {
    return await withOfflineCache(
      `${TEAM_DETAIL_CACHE_PREFIX}.${id}`,
      async () => {
        const response = await api.get(`/teams/${id}`);
        return response.data;
      }
    );
  } catch (error) {
    const cached = await getCachedData(TEAMS_CACHE_KEY);
    const cachedTeam = getListFromPayload(cached?.data).find(
      (team) => String(getEntityId(team)) === String(id)
    );

    if (cachedTeam) {
      return markCacheResult(cachedTeam, true, cached.cachedAt);
    }

    throw error;
  }
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
  try {
    return await withOfflineCache(
      `${TEAMS_BY_COACH_CACHE_PREFIX}.${coachId}`,
      async () => {
        const response = await api.get(`/teams/coach/${coachId}`);
        return response.data;
      }
    );
  } catch (error) {
    const cached = await getCachedData(TEAMS_CACHE_KEY);
    const teams = getListFromPayload(cached?.data).filter(
      (team) => String(getEntityId(team.coach)) === String(coachId)
    );

    if (cached) {
      return markCacheResult(teams, true, cached.cachedAt);
    }

    throw error;
  }
}
