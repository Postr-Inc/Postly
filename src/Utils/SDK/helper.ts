// === helpers.ts ===
export const DB_NAME = "postr_auth_db";
export const DB_VERSION = 2; // bump if you add more stores

export function openPostrDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
      if (!db.objectStoreNames.contains("auth")) {
        db.createObjectStore("auth", { keyPath: "id" });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => reject(request.error);
  });
}

export async function putSetting(key: string, value: any): Promise<void> {
  const db = await openPostrDB();
  const tx = db.transaction("settings", "readwrite");
  tx.objectStore("settings").put({ key, value });
  await tx.complete;
  db.close();
}

export async function putToken(token: string): Promise<void> {
  const db = await openPostrDB();
  const tx = db.transaction("auth", "readwrite");
  tx.objectStore("auth").put({ id: "token", token });
  await tx.complete;
  db.close();
}
