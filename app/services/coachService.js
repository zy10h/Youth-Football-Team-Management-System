import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import {
  getCacheMeta,
  getCachedData,
  markCacheResult,
  withOfflineCache,
} from "./cacheService";

const COACH_INTRODUCTIONS_KEY = "coachIntroductions";
const COACHES_CACHE_KEY = "offline.coaches";
const COACH_DETAIL_CACHE_PREFIX = "offline.coach";

const getCoachId = (coach) => coach?._id || coach?.id || coach;

async function getCoachIntroductions() {
  try {
    const rawValue = await AsyncStorage.getItem(COACH_INTRODUCTIONS_KEY);
    return rawValue ? JSON.parse(rawValue) : {};
  } catch (err) {
    console.log("LOAD COACH INTRODUCTIONS ERROR:", err.message);
    return {};
  }
}

async function saveCoachIntroductions(introductions) {
  await AsyncStorage.setItem(
    COACH_INTRODUCTIONS_KEY,
    JSON.stringify(introductions)
  );
}

function mergeCoachIntroduction(coach, introductions) {
  const coachId = String(getCoachId(coach));
  const hasLocalIntroduction = Object.prototype.hasOwnProperty.call(
    introductions,
    coachId
  );

  return {
    ...coach,
    introduction: hasLocalIntroduction
      ? introductions[coachId]
      : coach.introduction || "",
  };
}

function splitCoachPayload(coachData) {
  const { introduction, ...apiData } = coachData;
  return {
    apiData,
    introduction: introduction ?? "",
  };
}

export async function getCoaches() {
  const data = await withOfflineCache(COACHES_CACHE_KEY, async () => {
    const response = await api.get("/coaches");
    return response.data;
  });
  const introductions = await getCoachIntroductions();
  const cacheMeta = getCacheMeta(data);

  if (Array.isArray(data)) {
    return markCacheResult(
      data.map((coach) => mergeCoachIntroduction(coach, introductions)),
      cacheMeta.fromCache,
      cacheMeta.cachedAt
    );
  }

  if (Array.isArray(data.coaches)) {
    return markCacheResult(
      {
        ...data,
        coaches: data.coaches.map((coach) =>
          mergeCoachIntroduction(coach, introductions)
        ),
      },
      cacheMeta.fromCache,
      cacheMeta.cachedAt
    );
  }

  return markCacheResult(data, cacheMeta.fromCache, cacheMeta.cachedAt);
}

export async function getCoach(id) {
  try {
    const data = await withOfflineCache(
      `${COACH_DETAIL_CACHE_PREFIX}.${id}`,
      async () => {
        const response = await api.get(`/coaches/${id}`);
        return response.data;
      }
    );
    const introductions = await getCoachIntroductions();
    const cacheMeta = getCacheMeta(data);

    return markCacheResult(
      mergeCoachIntroduction(data, introductions),
      cacheMeta.fromCache,
      cacheMeta.cachedAt
    );
  } catch (error) {
    const cached = await getCachedData(COACHES_CACHE_KEY);
    const cachedCoach = (cached?.data?.coaches || cached?.data || []).find(
      (coach) => String(getCoachId(coach)) === String(id)
    );

    if (cachedCoach) {
      const introductions = await getCoachIntroductions();
      return markCacheResult(
        mergeCoachIntroduction(cachedCoach, introductions),
        true,
        cached.cachedAt
      );
    }

    throw error;
  }
}

export async function createCoach(coachData) {
  const { apiData, introduction } = splitCoachPayload(coachData);
  const response = await api.post("/coaches", apiData);
  const coachId = getCoachId(response.data);

  if (coachId) {
    const introductions = await getCoachIntroductions();
    introductions[String(coachId)] = introduction;
    await saveCoachIntroductions(introductions);
  }

  return {
    ...response.data,
    introduction,
  };
}

export async function updateCoach(id, coachData) {
  const { apiData, introduction } = splitCoachPayload(coachData);
  const response = await api.put(`/coaches/${id}`, apiData);
  const introductions = await getCoachIntroductions();
  introductions[String(id)] = introduction;
  await saveCoachIntroductions(introductions);

  return {
    ...response.data,
    introduction,
  };
}

export async function deleteCoach(id) {
  const response = await api.delete(`/coaches/${id}`);
  const introductions = await getCoachIntroductions();
  delete introductions[String(id)];
  await saveCoachIntroductions(introductions);
  return response.data;
}
