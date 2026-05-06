import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

const COACH_INTRODUCTIONS_KEY = "coachIntroductions";

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
  const response = await api.get("/coaches");
  const introductions = await getCoachIntroductions();
  const data = response.data;

  if (Array.isArray(data)) {
    return data.map((coach) => mergeCoachIntroduction(coach, introductions));
  }

  if (Array.isArray(data.coaches)) {
    return {
      ...data,
      coaches: data.coaches.map((coach) =>
        mergeCoachIntroduction(coach, introductions)
      ),
    };
  }

  return data;
}

export async function getCoach(id) {
  const response = await api.get(`/coaches/${id}`);
  const introductions = await getCoachIntroductions();
  return mergeCoachIntroduction(response.data, introductions);
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
