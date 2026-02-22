const prefix = "ppt-chart-gen::";

async function getStore() {
  if (typeof OfficeRuntime !== "undefined" && OfficeRuntime.storage) {
    return {
      getItem: (k: string) => OfficeRuntime.storage.getItem(prefix + k),
      setItem: (k: string, v: string) => OfficeRuntime.storage.setItem(prefix + k, v)
    };
  }
  return {
    getItem: async (k: string) => window.localStorage.getItem(prefix + k),
    setItem: async (k: string, v: string) => window.localStorage.setItem(prefix + k, v)
  };
}

export async function saveJson<T>(key: string, value: T) {
  const store = await getStore();
  await store.setItem(key, JSON.stringify(value));
}

export async function loadJson<T>(key: string, fallback: T): Promise<T> {
  const store = await getStore();
  const raw = await store.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
