import { createSignal, onMount } from "solid-js";
import ArrowLeft from "@/src/components/Icons/ArrowLeft";
import useNavigation from "@/src/Utils/Hooks/useNavigation";
import useTheme from "@/src/Utils/Hooks/useTheme";
import Page from "@/src/Utils/Shared/Page";

// Helper to read/write from IndexedDB
 function setNotificationPreference(enabled: boolean): Promise<void> {
  return new Promise((resolve, reject) => {
    localStorage.setItem("notifications_enabled", JSON.stringify(enabled)); // ✅ Mirror in localStorage

    const DB_NAME = "postr_auth_db";
    const DB_VERSION = 2;

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    };

    request.onsuccess = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("settings")) {
        db.close();
        const upgradeRequest = indexedDB.open(DB_NAME, DB_VERSION);

        upgradeRequest.onupgradeneeded = () => {
          const upgradeDb = upgradeRequest.result;
          if (!upgradeDb.objectStoreNames.contains("settings")) {
            upgradeDb.createObjectStore("settings", { keyPath: "key" });
          }
        };

        upgradeRequest.onsuccess = () => {
          const upgradeDb = upgradeRequest.result;
          const tx = upgradeDb.transaction("settings", "readwrite");
          const store = tx.objectStore("settings");
          store.put({ key: "notifications_enabled", value: enabled });

          tx.oncomplete = () => {
            upgradeDb.close();
            navigator.serviceWorker.controller?.postMessage({
              type: "notification-preference",
              enabled,
            });
            resolve();
          };

          tx.onerror = () => {
            upgradeDb.close();
            reject(tx.error);
          };
        };

        upgradeRequest.onerror = () => reject(upgradeRequest.error);
        return;
      }

      const tx = db.transaction("settings", "readwrite");
      const store = tx.objectStore("settings");
      store.put({ key: "notifications_enabled", value: enabled });

      tx.oncomplete = () => {
        db.close();
        navigator.serviceWorker.controller?.postMessage({
          type: "notification-preference",
          enabled,
        });
        resolve();
      };

      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    };

    request.onerror = () => reject(request.error);
  });
}



 function getNotificationPreference(): Promise<boolean> {
  return new Promise((resolve) => {
    // ✅ First try localStorage
    const cached = localStorage.getItem("notifications_enabled");
    if (cached !== null) {
      return resolve(JSON.parse(cached));
    }

    // Then fallback to IndexedDB
    const request = indexedDB.open("postr_auth_db", 2);

    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.close();
        return resolve(false);
      }

      const tx = db.transaction("settings", "readonly");
      const store = tx.objectStore("settings");
      const getReq = store.get("notifications_enabled");

      getReq.onsuccess = () => {
        db.close();
        const value = getReq.result?.value ?? false;
        localStorage.setItem("notifications_enabled", JSON.stringify(value)); // ✅ Cache for next time
        resolve(value);
      };

      getReq.onerror = () => {
        db.close();
        resolve(false);
      };
    };

    request.onerror = () => resolve(false);
  });
}


export default function () {
  const { params, route, navigate } = useNavigation("/settings");
  const { theme } = useTheme();

  const [notificationsEnabled, setNotificationsEnabled] = createSignal(false);

  onMount(async () => {
    const enabled = await getNotificationPreference();
    setNotificationsEnabled(enabled);
  });

  const toggleNotifications = async () => {
    const next = !notificationsEnabled();
    setNotificationsEnabled(next);
    await setNotificationPreference(next);
    if (next && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  };

  return (
    <Page {...{ navigate, params, route }} id={crypto.randomUUID()} hide={["bottomNav"]}>
      <div class="flex flex-col w-full h-full p-5">
        <div class="flex flex-row hero justify-between gap-2 mb-6">
          <ArrowLeft
            class={`w-6 h-6 cursor-pointer font-bold`}
            onClick={() => navigate("/settings")}
          />
          <h1 class="text-2xl hero">Notifications</h1>
          <div></div>
        </div>

        <div class="flex justify-between items-center border-b py-4">
          <span class="text-lg font-medium">Enable Notifications</span>
          <p>
            Get notifications when users like your posts, messages are recieved, when people you follow post, and when someone likes your post!
          </p>
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              class="sr-only peer"
              checked={notificationsEnabled()}
              onChange={toggleNotifications}
            />
            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700
                        peer-checked:after:translate-x-full peer-checked:bg-blue-600
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5
                        after:transition-all peer-checked:after:border-white">
            </div>
          </label>
        </div>
      </div>
    </Page>
  );
}
