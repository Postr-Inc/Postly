import useCache from "../Hooks/useCache";
import { openPostrDB } from "./helper";
import isTokenExpired from "./jwt";
import { ErrorCodes, HttpCodes } from "./opCodes";
import { authStore } from "./Types/AuthStore";
import { GeneralTypes } from "./Types/GeneralTypes";
import { Buffer } from "buffer/";
const ip = null;
type MetricsStore = {
  user: string;
  viewed_hashtags: string[];
  viewed_profiles: string[];
  posts_liked: string[];
  posts_bookmarked: string[];
  commented_on_post: string[];
  followed_after_post_view: string[];
};

 function extractErrorMessage(error: any): string {
  if (!error) return "Unknown error";

    
  console.log("Error keys:", Object.keys(error));

  if (error.details?.response?.data?.token?.message) {
    return error.details.response.data.token.message;
  }

  if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
    return error.errors.map((e: any) => e.message || JSON.stringify(e)).join(", ");
  }

  // Fallback to JSON string
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

type AuthData = {
  token: string;
  id?: string;
  [key: string]: any;
};
export type AlertPayload = {
  type: "error" | "success" | "info" | "warning";
  message: string;
  link?: string;
};

export function dispatchAlert(payload: AlertPayload) {
  const event = new CustomEvent("custom-alert", {
    detail: payload,
  });
  window.dispatchEvent(event);
}

/**
 * @credit https://github.com/tijnjh/ios-haptics/tree/main
 * @description IOS Haptic Feedback
 */

const haptic = () => {
  try {
    const label = document.createElement("label");
    label.ariaHidden = "true";
    label.style.display = "none";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    label.appendChild(input);

    document.head.appendChild(label);
    label.click();
    document.head.removeChild(label);
  } catch {
    // do nothing
  }
};

/**
 * Two rapid haptics (good for confirmation)
 */
haptic.confirm = () => {
  haptic();
  setTimeout(() => haptic(), 120);
};

/**
 * Three rapid haptics (useful for errors)
 */
haptic.error = () => {
  haptic();
  setTimeout(() => haptic(), 120);
  setTimeout(() => haptic(), 240);
};

export { haptic };

export default class SDK {
  serverURL: string;
  hasChecked = false;
  ip = "";
  isOnIos: Boolean;
  changeEvent: CustomEvent;
  ws: WebSocket | null = null;
  wsUrl: string;
  statisticalData: any[];
  callbacks: Map<string, (data: any) => void>;
  subscriptions: Map<string, (data: any) => void>; 
  notedMetrics: Map<string, any>;
  constructor(data: { serverURL: string }) {
    this.serverURL = data.serverURL;
    this.ip = sessionStorage.getItem("ip") as string;
    this.callbacks = new Map();
    this.changeEvent = new CustomEvent("authChange");
    this.subscriptions = new Map(); 
    openPostrDB()
    this.wsUrl = this.serverURL  
    /**
     * @description data metrics used to track user activity - this is stored locally
     */
    this.statisticalData = JSON.parse(localStorage.getItem("postr_statistical") || "{}");
    this.notedMetrics = new Map();

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/serviceworker.js").catch((e) => {
        console.log(e)
      })
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("✅ Notification permission granted");
        } else {
          console.log("❌ Notification permission denied");
        }
      });

    }
    this.metrics.initializeMetrics()
    // autoroll new token every hour
    setInterval(() => {
      if (localStorage.getItem("postr_auth")) {
        let auth = JSON.parse(localStorage.getItem("postr_auth") || "{}");
        if (auth.token) {
          this.sendMsg({
            type: GeneralTypes.AUTH_ROLL_TOKEN,
            byWebsocket: true,
            payload: {
              ...auth,
              type: "auth_roll_token",
            },
            security: {
              token: auth.token,
            },
          })

        } else {
          console.log("Token expired, reauthenticating");
        }
      }

      this.metrics.uploadUserMetrics();
    }, 3600000) // every hour

    //@ts-ignore
    this.isOnIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    const clearCache = async () => {

      this.metrics.uploadUserMetrics();
      console.log("Clearing app cache");
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }

    };

    if (this.isOnIos) {
      // Both events to maximize the chance it runs
      window.addEventListener("pagehide", clearCache);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          clearCache();
        }
      });
    } else {
      // Non-iOS can clear immediately or on unload
      clearCache();
    }

    // check if logged in and check if ws is closed periodically
     
  }

  on = (type: "authChange" | string, cb: (data: any) => void) => {
    window.addEventListener(type, (event) => {
      cb(event);
    });
  };

  // Define the type for the metrics store


  worker = {
  ws: {
    send: (msg: any) => {
      console.log(msg);

      // Check if the service worker is available and controlling
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(msg);
      } else {
        console.warn('No active service worker controller found.');
      }
    },

    addEventListener: (cb: (ev: MessageEvent) => void) => {
      // Ensure the service worker controller is available
      if (navigator.serviceWorker.controller) {
        // Add event listener to the service worker controller
        navigator.serviceWorker.addEventListener("message",cb)
      } else {
        console.warn('No active service worker controller found.');
      }
    },

    removeEventListener: (cb: (ev: MessageEvent) => void) => {
      // Ensure the service worker controller is available
      if (navigator.serviceWorker.controller) {
        // Remove event listener from the service worker controller
        navigator.serviceWorker.removeEventListener("message", cb)
      } else {
        console.warn('No active service worker controller found.');
      }
    }
  }
};


  metrics = {
    uploadUserMetrics: async () => {
      if (!this.authStore.model.username) return;
      const store = JSON.parse(localStorage.getItem("postr_user_metrics") || "{}");
      if (!store.user) {
        if (this.authStore.model.username) store.user = JSON.parse(localStorage.getItem("postr_auth") || "{}").id;
      }

      try {
        const res = this.send("/metrics/user", {
          method: "POST",
          body: store,
          headers: {
            "Content-Type": "application/json",
            "Authorization": JSON.parse(localStorage.getItem("postr_auth") || "{}").token
          }
        });
        const response = await res;
        if (response.status == 200) {
          console.log(`✅ Uploaded user metrics`);
          localStorage.removeItem("postr_user_metrics");
        } else {
          console.warn(`⚠️ Failed to upload user metrics`);
        }
      } catch (err) {
        console.warn(`❌ Upload error:`, err);
      }
    },
    noteMetrics: (action: keyof Omit<MetricsStore, "user">, data: any) => {
      console.log(`Note metric: ${action}`, data);
      this.notedMetrics.set(action, data);
    },
    getNotedMetrics: (key: keyof Omit<MetricsStore, "user">) => {
      return this.notedMetrics.get(key);
    },
    trackUserMetric: (action: keyof Omit<MetricsStore, "user">, relationId: string) => {
      const store: MetricsStore = JSON.parse(localStorage.getItem("postr_user_metrics") || "{}");

      if (!store[action]) {
        store[action] = [];
      }

      if (!store[action].includes(relationId)) {
        store[action].push(relationId);

        console.log(`✅ Metric added: ${action} → ${relationId}`);
      } else {
        store[action] = store[action].filter((id) => id !== relationId)

        console.log(`✅ Metric removed: ${action} → ${relationId}`);
      }

      localStorage.setItem("postr_user_metrics", JSON.stringify(store));
    },
    initializeMetrics: () => {
      const existing = localStorage.getItem("postr_user_metrics");
      if (!existing) {
        const newData: MetricsStore = {
          user: this.authStore.model.id,
          viewed_hashtags: [],
          viewed_profiles: [],
          posts_liked: [],
          posts_bookmarked: [],
          commented_on_post: [],
          followed_after_post_view: []
        };
        localStorage.setItem("postr_user_metrics", JSON.stringify(newData));
      }
    }
  }


  // Existing methods like collection(), authStore, etc...

  async send<T = any>(
    endpoint: string,
    options: {
      method?: "GET" | "POST" | "PUT" | "DELETE",
      body?: any,
      headers?: Record<string, string>
    } = {}
  ): Promise<T> {
    const method = options.method || "POST";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const token = JSON.parse(localStorage.getItem("postr_auth") || "{}").token || null;
    if (token) {
      headers["Authorization"] = `${token}`;
    }

    const response = await fetch(`${this.serverURL}${endpoint}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Unknown error occurred",
        status: response.status,
      }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  wsReconnect = () => {
    
  };

  convertToBase64(file: Blob): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  async maybeConvertBlobFields(data: any) {
    if (data.avatar instanceof Blob) {
      data.avatar = await this.convertToBase64(data.avatar);
    }
    if (data.banner instanceof Blob) {
      data.banner = await this.convertToBase64(data.banner);
    }
    return data;
  }

  // ✅ Helper: Find and update by ID in arrays
  updateArrayById(array: any[], id: string, data: any): boolean {
    const index = array.findIndex((e) => e.id === id);
    if (index !== -1) {
      console.log("Updating item at index:", index, "with data:", data);
      array[index] = { ...array[index], ...data };
      return true;
    }
    return false;
  }

  // ✅ Helper: Find and update by username in arrays
  updateArrayByUsername = (array: any[], username: string, data: any): boolean => {
    const index = array.findIndex((e) => e.username === username);
    if (index !== -1) {
      array[index] = { ...array[index], ...data };
      return true;
    }
    return false;
  }

  updateCache = async (
    collection: string,
    id: string,
    data: any,
    fullPost?: any,
    action: "add" | "remove" = "add"
  ) => {
    const { get, set, remove, clear } = useCache();

    // Since Map is in-memory, no async keys() or open caches, 
    // so we need a way to track all cache keys.
    // For simplicity, assume you maintain a separate Set of keys somewhere,
    // or you can store keys in a special Map entry.

    // Example: a global cacheKeys Set stored in the cache object for demo:
    // You need to implement and maintain this set elsewhere in your code.
    const cacheKeys: string[] = get("__cache_keys__") || [];

    for (const key of cacheKeys) {
      let value = get(key);
      if (!value) continue;

      let updated = false;
      const requestUrl = key.toLowerCase();

      // Matchers same as before:
      const isCommentsFeedForPost =
        collection === "comments" &&
        requestUrl.includes("comments") &&
        requestUrl.includes(id);

      const isBookmarksFeed = requestUrl.includes("bookmarks_bookmarks_");

      switch (collection) {
        case "posts":
        case "comments": {
          if (Array.isArray(value)) {
            const index = value.findIndex((e: any) => e.id === id);
            if (index !== -1) {
              value[index] = { ...value[index], ...data };
              updated = true;
            }
            if (isCommentsFeedForPost && fullPost) {
              const exists = value.find((e: any) => e.id === fullPost.id);
              if (action === "add" && !exists) {
                value.unshift(fullPost);
                updated = true;
              } else if (action === "remove" && exists) {
                value = value.filter((e: any) => e.id !== fullPost.id);
                updated = true;
              }
            } else if (isBookmarksFeed && fullPost) {
              const exists = value.find((e: any) => e.id === fullPost.id);
              if (action === "add" && !exists) {
                value.unshift(fullPost);
                updated = true;
              } else if (action === "remove" && exists) {
                value = value.filter((e: any) => e.id !== fullPost.id);
                updated = true;
              }
            } else {
              const exists = value.find((e: any) => e.id === id);
              if (action === "add" && !exists) {
                value.unshift(fullPost);
                updated = true;
              } else if (action === "remove" && exists) {
                value = value.filter((e: any) => e.id !== id);
                updated = true;
              }
            }
          } else if (value.payload && Array.isArray(value.payload)) {
            const index = value.payload.findIndex((e: any) => e.id === id);
            if (index !== -1) {
              value.payload[index] = { ...value.payload[index], ...data };
              updated = true;
            }
          } else if (value.payload?.id === id) {
            value.payload = { ...value.payload, ...data };
            updated = true;
          } else if (value.id === id) {
            value = { ...value, ...data };
            updated = true;
          } else if (action === "add" && fullPost) {
            const exists = value.find((e: any) => e.id === fullPost.id);
            if (!exists) {
              value.unshift(fullPost);
              updated = true;
            }
          }
          break;
        }

        case "users": {
          // Assuming convertToBase64 is defined elsewhere if needed
          if (data.avatar instanceof Blob) {
            data.avatar = await convertToBase64(data.avatar);
          }
          if (data.banner instanceof Blob) {
            data.banner = await convertToBase64(data.banner);
          }

          if (value.payload && Array.isArray(value.payload)) {
            const index = value.payload.findIndex((e: any) => e.username === id);
            if (index !== -1) {
              value.payload[index] = { ...value.payload[index], ...data };
              updated = true;
            }
          } else if (Array.isArray(value)) {
            const index = value.findIndex((e: any) => e.username === id);
            if (index !== -1) {
              value[index] = { ...value[index], ...data };
              updated = true;
            }
          } else if (value.payload?.username === id || value?.username === id) {
            value = { ...value, ...data };
            updated = true;
          }
          break;
        }
      }

      // Bookmarks special case
      if (isBookmarksFeed && fullPost) {
        if (Array.isArray(value)) {
          const exists = value.find((e: any) => e.id === id);
          if (action === "add" && !exists) {
            value.unshift(fullPost);
            updated = true;
          } else if (action === "remove" && exists) {
            value = value.filter((e: any) => e.id !== id);
            updated = true;
          }
        }
      }

      if (updated) {
        set(key, value, 3600 * 1000); // 1 hour TTL
        console.log(`✅ Cache updated for: ${key}`);
      } else {
        console.log(`⏭️ No update needed for: ${key}`);
      }
    }
  };





  checkAuth = async () => {

    if (localStorage.getItem("postr_auth") && !this.hasChecked) {
      let res = await fetch(`${this.serverURL}/auth/verify`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("postr_auth") || "{}").token,
        },
      });
      this.hasChecked = true;
      if (res.status !== 200) {
        this.authStore.model = {}
        localStorage.removeItem("postr_auth")
        return;
      }
      
    }


  };

  waitUntilSocketIsOpen = (cb: () => void) => {
    if (this.ws?.readyState === WebSocket.OPEN) {
      cb();
    } else {
      setTimeout(() => {
        this.waitUntilSocketIsOpen(cb);
      }, 100);
    }
  }

  handleMessages = (data: any) => {
    let _data = JSON.parse(data)
    console.log("Received data from WebSocket", _data);
    if (_data.data && _data.data.callback && this.callbacks.has(_data.data.callback)) {
      this.callbacks.get(_data.data.callback)?.(_data.data);
      console.log("Callback executed for", _data.data.callback);
      this.callbacks.delete(_data.data.callback);
      return;
    }
  };


  authStore: authStore = {
    model: JSON.parse(localStorage.getItem("postr_auth") || "{}"),
    deleteAccount: () => {
      return new Promise(async (resolve, reject) => {
        const res = await fetch(`${this.serverURL}/auth/delete`, {
          method: "DELETE",
          headers: {
            "Authorization": this.authStore.model.token
          }
        })
      })
    },
    getBasicAuthToken: async () => {
      try {
        const response = await fetch(`${this.serverURL}/auth/get-basic-auth-token`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })

        const { status, token, message, id } = await response.json();

        let wsUrl = response.headers.get("Server") || "";

        if (!wsUrl || wsUrl.trim() === "") {
          wsUrl = this.serverURL; // fallback
        } else if (wsUrl.startsWith("localhost")) {
          wsUrl = "http://" + wsUrl;
        }

        // Convert http(s) to ws(s)
        if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
          wsUrl = wsUrl.replace(/^https?:\/\//, (match) => (match === "https://" ? "wss://" : "ws://"));
        }

        this.wsUrl = wsUrl;
        if (status !== 200) {
          return message
        }
        else {
          localStorage.setItem("postr_auth", JSON.stringify({ token, wsUrl: this.wsUrl }))
          this.authStore.model.token = token

          this.authStore.model.id = id
          return true
        }
      } catch (error) {
         dispatchAlert({
          type:"error",
          "message":"Failed to provide basic auth token, check server status or network connection"
        })
      }
    
    },
    isValid: () => {
      if (!this.authStore.model.token) return false;
      return isTokenExpired(this.authStore.model.token) ? false : true;
    },
      requestPasswordReset: async (email: string) => {
  try {
    const response = await fetch(`${this.serverURL}/auth/requestPasswordReset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      let errorMessage = `HTTP error ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.message) errorMessage = errorJson.message;
      } catch {
        // ignore JSON parse errors
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    if (data.status !== 200) throw new Error(data.message || "Unknown error");

  } catch (err) {
    throw err;
  }
},

resetPassword: async (token: string, password: string) => {
  try {
    const response = await fetch(`${this.serverURL}/auth/resetPassword`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resetToken: token, password }),
    });

   if (!response.ok) {
  let errorJson = null;
  try {
    errorJson = await response.json();
  } catch {
    // ignore
  }

  let message = "Unknown error";
  if (errorJson) {
     message = errorJson
  } else {
    message = `HTTP error ${response.status}`;
  }

  throw new Error(extractErrorMessage(message));
}


    const data = await response.json();
    if (data.status !== 200) throw new Error(data.message || "Unknown error");

  } catch (err) {
    throw err;
  }
},


    logout: () => {
      if (window.location.pathname !== "/auth/login") {
        localStorage.removeItem("postr_auth");
        window.location.href = "/auth/login";
      }


    },
    login: async (emailOrUsername: string, password: string) => {
  try {
    const response = await fetch(`${this.serverURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailOrUsername,
        password,
        deviceInfo: {
          userAgent: navigator.userAgent,
        },
      }),
    });

    // Handle WebSocket URL from headers or fallback
    let wsUrl = response.headers.get("Server") || this.serverURL;
    
    // Ensure proper URL format
    wsUrl = wsUrl.trim();
    if (wsUrl.startsWith("localhost")) {
      wsUrl = `http://${wsUrl}`;
    }

    // Convert http(s) to ws(s)
    if (!wsUrl.startsWith("ws://") && !wsUrl.startsWith("wss://")) {
      wsUrl = wsUrl.replace(/^https?:\/\//, (match) => 
        match === "https://" ? "wss://" : "ws://"
      );
    }

    this.wsUrl = wsUrl;
    const result = await response.json();

    if (!response.ok) {
      throw result;
    }

    // Update auth state
    this.authStore.model = result.data;
    const authData = { ...result.data, wsUrl: this.wsUrl };
    localStorage.setItem("postr_auth", JSON.stringify(authData));

    // Handle WebSocket connection
    if (this.ws) {
      this.ws.close();
    }
    this.wsReconnect();

    // Store token in IndexedDB with proper error handling
    try {
      await this.storeTokenInIndexedDB(result.data.token);
    } catch (error) {
      console.error("Failed to store token in IndexedDB:", error);
      // Don't fail login if IndexedDB fails, but log it
    }

    // Notify service worker if available
    if (navigator.serviceWorker?.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: "reconnect",
          token: result.data.token
        });
      } catch (swError) {
        console.error("Failed to notify service worker:", swError);
      }
    }

    return result.data;
  } catch (error) {
    console.error("Login failed:", error);
    // Clear any partial auth state on failure
    this.authStore.model = {};
    localStorage.removeItem("postr_auth");
    throw error;
  }
},

 

    // Helper method for IndexedDB token storage



  
  }

  connectToWS = () => {
    this.workerChannel.postMessage({"type": "connect"})
  }

  cdn = {
    getUrl: (collection: string, id: string, file: string) => {
      return `${this.serverURL}/api/files/${collection}/${id}/${file}`;
    }
  };
  stripPagePart(key: string) {
    // Replace any _<number>_ in the middle of underscores
    return key.replace(/_(\d+)_/g, "_");
  }

  resetCache = async (key?: string) => {
    const { remove, clear } = useCache();

    if (!key) {
      await clear();
      return;
    }

    const cache = await caches.open("device-periscope-cache");
    const requests = await cache.keys();

    const normalizedTarget = this.stripPagePart(key.toLowerCase().trim());

    for (const request of requests) {
      const parts = request.url.split("/");
      const requestKey = parts[parts.length - 1];
      const normalizedRequestKey = this.stripPagePart(requestKey);

      console.log("Normalized CacheKey:", normalizedRequestKey, "Target:", normalizedTarget);

      if (normalizedRequestKey.includes(normalizedTarget)) {
        await remove(requestKey);
      }
    }
  };



  private storeTokenInIndexedDB = (token: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!token || typeof token !== "string") {
      reject(new Error("Invalid token provided"));
      return;
    }

    const DB_NAME = "postr_auth_db";
    const DB_VERSION = 2;
    const STORE_NAME = "auth";

    const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

    // Timeout for safety (5 seconds)
    const timeoutId = setTimeout(() => {
      reject(new Error("IndexedDB operation timed out"));
      if (dbRequest.result) {
        dbRequest.result.close();
      }
    }, 5000);

    dbRequest.onerror = () => {
      clearTimeout(timeoutId);
      console.error("IndexedDB open error:", dbRequest.error);
      reject(new Error(`Database error: ${dbRequest.error?.message || "Unknown error"}`));
    };

    dbRequest.onblocked = () => {
      clearTimeout(timeoutId);
      console.warn("Database upgrade blocked");
      reject(new Error("Database upgrade blocked by another connection"));
    };

    dbRequest.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
        console.log(`Created object store "${STORE_NAME}"`);
      }
    };

    dbRequest.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        clearTimeout(timeoutId);
        db.close();
        reject(new Error(`Object store "${STORE_NAME}" not found`));
        return;
      }

      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.onerror = () => {
        clearTimeout(timeoutId);
        console.error("Transaction error:", tx.error);
        db.close();
        reject(new Error(`Transaction failed: ${tx.error?.message || "Unknown error"}`));
      };

      const store = tx.objectStore(STORE_NAME);
      const putRequest = store.put({ id: "token", token });

      putRequest.onerror = () => {
        clearTimeout(timeoutId);
        console.error("Put operation error:", putRequest.error);
        db.close();
        reject(new Error(`Failed to store token: ${putRequest.error?.message || "Unknown error"}`));
      };

      tx.oncomplete = () => {
        clearTimeout(timeoutId);
        db.close();
        console.log("Token successfully stored in IndexedDB");
        resolve();
      };
    };
  });
};



  sendMsg = async (msg: any, type: any) => {
    // WebSocket path
    if (msg.byWebsocket) {
      if (!this.ws) {
        this.wsReconnect();
        // Optionally wait for connection here before sending, or just return and try again later
        return {
          message: "WebSocket not connected, reconnecting...",
        };
      }

      if (this.ws.readyState !== WebSocket.OPEN) {
        return {
          message: "WebSocket is not open",
        };
      }

      // Wait until socket open and send
      this.waitUntilSocketIsOpen(() => {
        const cid = this.callback((data: any) => {
          if (data.type === GeneralTypes.AUTH_ROLL_TOKEN) {
            const newToken = data.token;
            let authData = JSON.parse(localStorage.getItem("postr_auth") || "{}");
            authData.token = newToken;
            localStorage.setItem("postr_auth", JSON.stringify(authData));
            this.authStore.model = authData;
            // Update token in IndexedDB for service worker access
            const dbRequest = indexedDB.open("postr_auth_db", 1);
            dbRequest.onupgradeneeded = function (event) {
              const db = dbRequest.result;
              if (!db.objectStoreNames.contains("auth")) {
                db.createObjectStore("auth", { keyPath: "id" });
              }
            };
            dbRequest.onsuccess = function (event) {
              const db = dbRequest.result;
              const tx = db.transaction("auth", "readwrite");
              const store = tx.objectStore("auth");
              store.put({ id: "token", token: newToken });
              tx.oncomplete = () => db.close();
            };
            window.dispatchEvent(this.changeEvent);

            navigator.serviceWorker.controller?.postMessage({ type: "reconnect" });
          }
        });

        msg.callback = cid;
        this.ws.send(JSON.stringify(msg));
      });

      return;
    }

    // HTTP path
    try {
      // Token validation
      if (!msg.security || !msg.security.token || isTokenExpired(msg.security.token)) {
        if (!this.authStore.isValid()) {
          return {
            opCode: ErrorCodes.INVALID_OR_MISSING_TOKEN,
            message: "You are not authorized to perform this action",
          };
        }
      }

      const token = JSON.parse(localStorage.getItem("postr_auth") || "{}").token;
      let endpoint = "";
      let method = "POST";
      let body: BodyInit | undefined = undefined;
      const headers: HeadersInit = {
        Authorization: token,
      };

      // Handle file uploads for create with files
      if (
        msg.type === GeneralTypes.CREATE &&
        msg.payload.data.files &&
        Array.isArray(msg.payload.data.files) &&
        msg.payload.data.files.length > 0
      ) {
        endpoint = `${this.serverURL}/collection/${msg.payload.collection}`;

        const formData = new FormData();
        const { files, ...restOfData } = msg.payload.data;
        // Append JSON payload (without files)
        const payloadWithoutFiles = {
          ...msg,
          payload: {
            ...msg.payload,
            data: restOfData,
          }
        };
        formData.append("payload", JSON.stringify(payloadWithoutFiles.payload));
        formData.append("type", msg.type);
        formData.append("security", JSON.stringify({
          token
        }));
        // Append files individually
        for (const file of files) {
          // Ensure file is a File or Blob instance
          formData.append("files", file);
        }

        body = formData;
        // DO NOT set Content-Type for FormData — browser sets it automatically
      } else if (msg.type === "list" || msg.type === "get") {
        // GET requests with query parameters
        method = "GET";
        endpoint = `${this.serverURL}/collection/${msg.payload.collection}`;

        const params = new URLSearchParams();
        for (const [key, value] of Object.entries(msg.payload)) {
          if (key === "collection") continue; // skip, it's in path
          if (typeof value === "object") {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, String(value));
          }
        }
        endpoint += `?${params.toString()}`;
      } else if (type === "search") {
        // Deep search endpoint
        endpoint = `${this.serverURL}/deepsearch`;
        method = "POST";
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(msg);
      } else {
        // Default JSON POST
        endpoint = `${this.serverURL}/collection/${msg.payload.collection}`;
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(msg);
      }

      // Send fetch request
      const response = await fetch(endpoint, {
        method,
        headers,
        body,
      });

      // Handle rate limiting headers
      const remaining = parseInt(response.headers.get("Ratelimit-Remaining") || "0");
      const retryAfter = parseInt(response.headers.get("Retry-After") || "0");

      if (!response.ok) {
        if (remaining === 0 && retryAfter > 0) {
          dispatchAlert({
            type: "error",
            message: `You've been rate-limited. Try again in ${retryAfter} seconds.`,
          });
        }

        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (_) { }

        return {
          opCode: response.status,
          message: errorMessage,
        };
      }

      return await response.json();
    } catch (err) {
      dispatchAlert({
        type: "error",
        message: "Something went wrong while sending your request.",
      });

      return {
        opCode: ErrorCodes.SYSTEM_ERROR,
        message: "Network or unexpected error occurred",
      };
    }
  };




  callback(cb: (data: any) => void) {
    const id = Math.random().toString(36).substring(7);
    const cleanup = () => {
      this.callbacks.delete(id);
    };
    this.callbacks.set(id, (data: any) => {
      cb(data);
      cleanup();
    });
    return id;
  }
  getCacheKey(type: "post" | "posts-comments", postId: string) {
    switch (type) {
      case "post":
        return `post-${postId}`;
      case "posts-comments":
        return `posts-${postId}-comments`;
    }
  }
  public deepSearch = async (collections: string[], query: string) => {
    try{ 
      const res = await this.send("/deepSearch", {
        method :"POST",
        body:{
          query,
          collections
        }
      }) 
      return res?.results
    }catch (errr){
      console.log(errr)
      return []
    } 
  }

  /**
   * @method collection
   * @description use methods to interact with a collection
   * @param name  name of the collection
   * @returns  {
   * {list: (page: number, limit: number, options: { order: "asc" | "dec", sort: string, expand: string[]}, shouldCache: boolean) => Promise<any>},
   * {create: (data: any) => Promise<any>},
   * {update: (id: string, data: any) => Promise<any>},
   * {delete: (id: string) => Promise<any>}
   * }
   */
  public collection(name: string) {
    return {
      /**
       * @method subscribe
       * @description subscribe to a collection
       * @param id
       * @param options
       * @returns {Promise<any>}
       */
      subscribe: async (id: "*" | string, options: { cb: (data: any) => void }) => {
        return new Promise(async (resolve, reject) => {
          if (!this.subscriptions.has(`${name}:${id}`)) {
            this.subscriptions.set(`${name}:${id}`, options.cb);
            this.waitUntilSocketIsOpen(() => {
              this.ws?.send(JSON.stringify({ payload: { collection: name, id, callback: `${name}:${id}` }, security: { token: this.authStore.model.token } }));
            });
          } else {
            reject("Already subscribed to this collection");
          }
        })
      },
      /**
       * @method list
       * @description list all records in a collection with pagination
       * @param page
       * @param limit
       * @param options
       * @param shouldCache
       * @returns {Promise<{opCode: number, items: any[], totalItems: number, totalPages: number}>}
       */
      list: async (
        page: number = 1,
        limit: number = 10,
        options?: {
          order?: "asc" | "dec" | any;
          sort?: string;
          expand?: string[];
          recommended?: boolean;
          filter?: string;
          cacheKey?: string;
        },
        shouldCache = true
      ) => {
        return new Promise(async (resolve, reject) => {
          const { set, get, remove, clear } = useCache();
          const cacheKey = options?.cacheKey || `${this.serverURL}/api/collections/${name}?page=${page}&limit=${limit}`;
          const cacheData = shouldCache ? await get(cacheKey) : null;
          if (cacheData) return resolve({
            opCode: HttpCodes.OK,
            ...(Array.isArray(cacheData) ? { items: [...cacheData] } : { items: cacheData.payload }), totalItems: cacheData.totalItems, totalPages: cacheData.totalPages
          });

          let out = await this.sendMsg({
            type: GeneralTypes.LIST,
            payload: {
              collection: name,
              page,
              limit,
              options,
              cacheKey: options?.cacheKey
            },
            security: {
              token: this.authStore.model.token,
            },
            callback: "",
          }) as any;
          if (out.opCode !== HttpCodes.OK) return reject(out);
          console.log(cacheKey, "Caching data for key:", out.payload);
          shouldCache && set(cacheKey, out, new Date().getTime() + 3600); // cache for 1 hour\ 
          resolve({
            opCode: out.opCode,
            items: out.payload,
            totalItems: out.totalItems,
            totalPages: out.totalPages,
            cacheKey
          }) as any;
        });
      },

      createFile: async (file: File) => {
        // turn file into a buffer
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        return new Promise((resolve, reject) => {
          reader.onload = () => {
            resolve({ data: Array.from(new Uint8Array(reader.result as ArrayBuffer)), name: file.name });
          };
        });
      },
      /**
       * @method update
       * @description Update a record in a collection
       * @param id
       * @param data
       */

      update: async (id: string, data: any, options?: { cacheKey?: string, expand?: any[], invalidateCache: string[] }) => {
        return new Promise(async (resolve, reject) => {

          this.updateCache(name, id, data)
          let out = await this.sendMsg({
            type: GeneralTypes.UPDATE,
            payload: {
              collection: name,
              id: id,
              fields: data,
              options
            },
            security: {
              token: JSON.parse(localStorage.getItem("postr_auth") || "{}").token
            },
            callback: ""
          })
          resolve(out.payload)
        })
      },
      /**
       * @method create
       * @description create a record in a collection
       * @param data
       * @returns {Promise<any>}
       */
      create: async (data: any, options?: { cacheKey?: string, expand?: any[], [key: string]: any, invalidateCache?: string[] }) => {
        return new Promise(async (resolve, reject) => {

          if (options?.invalidateCache && Array.isArray(options.invalidateCache)) {
            const { set, get, remove, clear } = useCache();
            // check keys that include the one in invalidateCache
            const keys = await caches.keys();
            for (let key of keys) {
              const cacheData = await (await caches.open(key)).keys();
              for (let cache of cacheData) {
                if (options.invalidateCache.includes(cache.url)) {
                  await caches.delete(cache.url);
                }
              }
            }
          }

          let out = await this.sendMsg({
            type: GeneralTypes.CREATE,
            hasFiles: data.files,
            payload: {
              collection: name,
              invalidateCache: options?.invalidateCache,
              data,
              expand: options?.expand
            },
            security: {
              token: JSON.parse(localStorage.getItem("postr_auth") || "{}").token,
            },
            callback: "",
          }) as any
          resolve(out.payload)
        });
      },

      /**
       * @method get
       * @description get a record in a collection
       * @param id
       * @returns {Promise<any>}
       */

      get: async (
        id: string,
        options?: { expand?: string[], cacheKey?: string },
        shouldCache = true
      ) => {
        return new Promise(async (resolve, reject) => {
          const { set, get } = useCache();

          const cacheKey = options?.cacheKey || `${this.serverURL}/api/collections/${name}/${id}`;
          const cached = shouldCache ? await get(cacheKey) : null;

          if (cached) return resolve(cached);

          const out = await this.sendMsg({
            type: GeneralTypes.GET,
            payload: {
              collection: name,
              id,
              options
            },
            security: {
              token: this.authStore.model.token
            },
            callback: ""
          }) as any;

          if (out.opCode !== HttpCodes.OK) return reject(out);

          if (shouldCache) {
            console.log("Caching data for key:", cacheKey);
            await set(cacheKey, out.payload, Date.now() + 3600); // 1 hour TTL
          }

          resolve(out.payload);
        });
      },

    };
  }
}
