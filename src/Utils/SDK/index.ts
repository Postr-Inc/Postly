import useCache from "../Hooks/useCache";
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
export type AlertPayload = {
  type: "error" | "success" | "info" | "warning";
  message: string;
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
    /**
     * @description data metrics used to track user activity - this is stored locally
     */
    this.statisticalData = JSON.parse(localStorage.getItem("postr_statistical") || "{}");
    this.notedMetrics = new Map();

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
    setInterval(() => {
      if (this.ws === null || this.ws.readyState === WebSocket.CLOSED && localStorage.getItem("postr_auth") && this.authStore.model.id) {
        this.wsReconnect();
      }
    }, 0) // check every 5 minutes
  }

  on = (type: "authChange" | string, cb: (data: any) => void) => {
    window.addEventListener(type, (event) => {
      cb(event);
    });
  };

  // Define the type for the metrics store


  metrics = {
    uploadUserMetrics: async () => {
      if(!this.authStore.model.username) return;
      const store = JSON.parse(localStorage.getItem("postr_user_metrics") || "{}"); 
      if (!store.user) {
         if(this.authStore.model.username) store.user = JSON.parse(localStorage.getItem("postr_auth") || "{}").id;
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
      }else{
        store[action] = store[action].filter((id)=> id !== relationId)
        
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
    this.ws = new WebSocket(`${this.serverURL}/subscriptions`);

    this.ws.onopen = () => {
      console.log("✅ WS connected");
    };

    this.ws.onerror = (err) => {
      console.log("❌ WS error", err);
    };

    this.ws.onclose = (ev) => {
      console.log(`⚠️ WS closed: ${ev.code} ${ev.reason}`);
    };

    this.ws.onmessage = (event) => {
      this.handleMessages(event.data);
    };
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
      if (this.ws === null) this.connectToWS();
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
    getBasicAuthToken: () => {
      return new Promise(async (resolve, reject) => {
        const response = await fetch(`${this.serverURL}/auth/get-basic-auth-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          }
        })

        const { status, token, message, id } = await response.json();
        if (status !== 200) {
          return reject(message)
        }
        else {
          localStorage.setItem("postr_auth", JSON.stringify({ token }))
          this.authStore.model.token = token

          this.authStore.model.id = id
          resolve(true)
        }
      })
    },
    isValid: () => {
      if (!this.authStore.model.token) return false;
      return isTokenExpired(this.authStore.model.token) ? false : true;
    },
    requestPasswordReset: async (email: string) => {
      return new Promise(async (resolve, reject) => {
        const response = await fetch(`${this.serverURL}/auth/requestPasswordReset`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        });
        const { status, message } = await response.json();
        if (status !== 200) return reject(message);
        return resolve();
      });
    },
    resetPassword: async (token: string, password: string) => {
      return new Promise(async (resolve, reject) => {
        const response = await fetch(`${this.serverURL}/auth/resetPassword`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            password,
          }),
        });
        const { status, message } = await response.json();
        if (status !== 200) return reject(message);
        return resolve();
      });
    },
    logout: () => {
      if (window.location.pathname !== "/auth/login") {
        localStorage.removeItem("postr_auth");
        window.location.href = "/auth/login";
      }

    },
    login: async (emailOrUsername: string, password: string) => {
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

      const result = await response.json();

      if (!response.ok) {
        throw result; // Pass whole error to the UI
      }

      this.authStore.model = result.data;
      this.wsReconnect()
      localStorage.setItem("postr_auth", JSON.stringify(result.data));

      return result.data;
    },


    async getIP() {
      try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        this.ip = data.ip;
        return data.ip;
      } catch (error) {
        console.error(error);
      }
    }
  }

  connectToWS = () => {
    this.ws = new WebSocket(`${this.serverURL}/subscriptions`);
    this.ws.onmessage = (event) => {
      this.handleMessages(event.data);
    };
  }

  cdn = {
    getUrl: (collection: string, id: string, file: string) => {
      return this.serverURL + `/api/files/${collection}/${id}/${file}`;
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






  sendMsg = async (msg: any, type: any) => {
    if (!this.ws && msg.byWebsocket) {
      this.wsReconnect();
    }

    if (msg.byWebsocket && this.ws) {
      if (this.ws.readyState !== WebSocket.OPEN) {
        return {
          opCode: HttpCodes.INTERNAL_SERVER_ERROR,
          message: "WebSocket is not open",
        };
      }

      this.waitUntilSocketIsOpen(() => {
        let cid = this.callback((data: any) => {
          if (data.type === GeneralTypes.AUTH_ROLL_TOKEN) {
            const newToken = data.token;
            let authData = JSON.parse(localStorage.getItem("postr_auth") || "{}");
            authData.token = newToken;
            localStorage.setItem("postr_auth", JSON.stringify(authData));
            this.authStore.model = authData;
            window.dispatchEvent(this.changeEvent);
          }
        });

        msg.callback = cid;
        this.ws?.send(JSON.stringify(msg));
      });

      return;
    }

    // HTTP Path
    try {
      // Validate token
      if (!msg.security || !msg.security.token || isTokenExpired(msg.security.token)) {
        if (!this.authStore.isValid()) {
          return {
            opCode: ErrorCodes.INVALID_OR_MISSING_TOKEN,
            message: "You are not authorized to perform this action",
          };
        }
      }

      const token = JSON.parse(localStorage.getItem("postr_auth") || "{}").token;
      const body = JSON.stringify(msg);
      const headers = {
        "Content-Type": "application/json",
        Authorization: token,
      };

      const endpoint =
        type === "search"
          ? `${this.serverURL}/deepsearch`
          : `${this.serverURL}/collection/${msg.payload.collection}`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body,
      });

      const remaining = parseInt(response.headers.get("Ratelimit-Remaining") || "0");
      const retryAfter = parseInt(response.headers.get("Retry-After") || "0");

      if (!response.ok) {
        if (remaining === 0 && retryAfter > 0) {
          dispatchAlert({
            type: "error",
            message: `You've been rate-limited. Try again in ${retryAfter} seconds.`,
          });
        }

        // Try to parse server response, but fallback to default message
        let errorMessage = "An error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (_) {
          // ignore bad JSON
        }

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
    return new Promise(async (resolve, reject) => {
      let out = await this.sendMsg({
        type: GeneralTypes.DEEP_SEARCH,
        payload: {
          collections,
          query,
        },
        security: {
          token: this.authStore.model.token,
        },
        callback: "",
      }, "search") as any;
      if (out.opCode !== HttpCodes.OK) return reject(out);
      resolve(out.payload);
    });
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
