import AsyncStorage from "@react-native-async-storage/async-storage";

export function markCacheResult(data, fromCache, cachedAt = null) {
  if (data && typeof data === "object") {
    Object.defineProperty(data, "__fromCache", {
      value: Boolean(fromCache),
      enumerable: false,
      configurable: true,
    });
    Object.defineProperty(data, "__cachedAt", {
      value: cachedAt,
      enumerable: false,
      configurable: true,
    });
  }

  return data;
}

export function getCacheMeta(data) {
  return {
    fromCache: Boolean(data?.__fromCache),
    cachedAt: data?.__cachedAt || null,
  };
}

export async function getCachedData(cacheKey) {
  try {
    const rawValue = await AsyncStorage.getItem(cacheKey);

    if (!rawValue) {
      return null;
    }

    const cached = JSON.parse(rawValue);
    return {
      data: cached.data,
      cachedAt: cached.cachedAt || null,
    };
  } catch (err) {
    console.log("LOAD CACHE ERROR:", err.message);
    return null;
  }
}

export async function setCachedData(cacheKey, data) {
  const cachedAt = new Date().toISOString();
  await AsyncStorage.setItem(cacheKey, JSON.stringify({ data, cachedAt }));
  return cachedAt;
}

export async function withOfflineCache(cacheKey, request) {
  try {
    const data = await request();
    const cachedAt = await setCachedData(cacheKey, data);
    return markCacheResult(data, false, cachedAt);
  } catch (error) {
    const cached = await getCachedData(cacheKey);

    if (cached) {
      return markCacheResult(cached.data, true, cached.cachedAt);
    }

    throw error;
  }
}
