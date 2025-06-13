import useCache from "../Hooks/useCache";
import isTokenExpired from "./jwt";
import { HttpCodes } from "./opCodes";
import { authStore } from "./Types/AuthStore";
import { GeneralTypes } from "./Types/GeneralTypes";
import { Buffer } from "buffer/";
const ip = null;

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
          localStorage.removeItem("postr_auth");
          window.location.href = "/auth/login";
        }
      }
    }, 3600000) // every hour

    //@ts-ignore
    this.isOnIos = navigator.userAgent.match(/iPad/i)|| navigator.userAgent.match(/iPhone/i) 
    if(this.isOnIos){
      window.onpagehide = (e)=>{
        console.log("Clearing app cache");
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
      }
    }else{
      console.log("Clearing app cache");
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
    } 
    // check if logged in and check if ws is closed periodically
    setInterval(() => {
      if (this.ws === null || this.ws.readyState === WebSocket.CLOSED && localStorage.getItem("postr_auth")) {
        this.wsReconnect();
      }
    }, 0) // check every 5 minutes
  }

  on = (type: "authChange" | string, cb: (data: any) => void) => {
    window.addEventListener(type, (event) => {
      cb(event);
    });
  };

  wsReconnect = () => {
    this.ws = new WebSocket(`${this.serverURL}/subscriptions`);
    this.ws.onmessage = (event) => {
      this.handleMessages(event.data);
    };
  }

  updateCache = async (collection: string, id: string, data: any) => {
    const { set, get, remove, clear } = useCache();
    const keys = await caches.keys();
    for (let key of keys) {
      const cacheData = await (await caches.open(key)).keys();
      switch (collection) {
        case "posts":
        case "comments":
          for (let cache of cacheData) {
            const cacheDataJSON = await (await caches.open(key)).match(cache).then((res) => res?.json());
            // If value is array
            if (Array.isArray(cacheDataJSON?.value)) {
              const payload = cacheDataJSON.value;
              const item = payload.find((e: any) => e.id === id);
              if (item) {
                const index = payload.indexOf(item);
                payload[index] = { ...item, ...data };
                cacheDataJSON.value = payload;
                set(cache.url, cacheDataJSON, new Date().getTime() + 3600);
              }
            }
            // If value is object but payload is array
            else if (Array.isArray(cacheDataJSON?.value?.payload)) {
              const payload = cacheDataJSON.value.payload;
              const item = payload.find((e: any) => e.id === id);
              if (item) {
                const index = payload.indexOf(item);
                payload[index] = { ...item, ...data };
                cacheDataJSON.value.payload = payload;
                set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
              }
            }
            // If value is object and payload is object
            else if (cacheDataJSON?.value?.payload && cacheDataJSON.value.payload.id === id) {
              cacheDataJSON.value.payload = { ...cacheDataJSON.value.payload, ...data };
              set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
            }
            // If value is object and id matches
            else if (cacheDataJSON?.value && cacheDataJSON.value.id === id) {
              cacheDataJSON.value = { ...cacheDataJSON.value, ...data };
              set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
            }
          }
          break;
        case "users":
          for (let cache of cacheData) {
            if (cache.url.includes(id)) {
              var cacheDataJSON = await (await caches.open(key)).match(cache).then((res) => res?.json());
              if (Array.isArray(cacheDataJSON?.value)) {
                cacheDataJSON.value = cacheDataJSON.value.map((e: any) => e.id === id ? { ...e, ...data } : e);
              } else {
                // if update data is a buffer convert to base64
                if (data.avatar && (data.avatar instanceof ArrayBuffer || data.avatar instanceof Blob)) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    data.avatar = reader.result; // This will be a Data URL (base64 encoded)
                    // Now you can proceed with set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
                  };
                  reader.readAsDataURL(data.avatar);
                } else if (data.banner && (data.banner instanceof ArrayBuffer || data.banner instanceof Blob)) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    data.banner = reader.result;
                  };
                  reader.readAsDataURL(data.banner);
                } else {
                  cacheDataJSON.value = { ...cacheDataJSON.value, ...data };
                }
              }
              set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
            }
          }
          break;
      }
    }
  }

  checkAuth = async () => {

    if (localStorage.getItem("postr_auth") && !this.hasChecked) {
      let res = await fetch(`${this.serverURL}/auth/verify`, {
        headers: {
          Authorization: JSON.parse(localStorage.getItem("postr_auth") || "{}").token,
        },
      });
      this.hasChecked = true;
      if (res.status !== 200) {
        localStorage.removeItem("postr_auth");
        window.location.href = "/auth/login"
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
      localStorage.removeItem("postr_auth");
      window.dispatchEvent(this.changeEvent);
      if (window.location.pathname !== "/auth/login") window.location.href = "/auth/login";
    },
    login: async (emailOrUsername: string, password: string) => {
      return new Promise(async (resolve, reject) => {
        if (emailOrUsername === "" || password === "" || !emailOrUsername || !password || emailOrUsername.length < 3 || password.length < 3) {
          reject("Invalid email or password")
          return;
        }
        const response = await fetch(`${this.serverURL}/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            emailOrUsername,
            password,
            deviceInfo: navigator.userAgent,
          }),
        });
        const { data, status, message } = await response.json();
        if (status !== 200) return reject(message);
        this.authStore.model = data;
        this.connectToWS();
        localStorage.setItem("postr_auth", JSON.stringify(data));
        return resolve(data);

      })
    },
  };
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



  sendMsg = async (msg: any, type: any,) => {
    if (!this.ws && msg.byWebsocket) {
      this.wsReconnect();
    }
    if (msg.byWebsocket && this.ws) {
      if (this.ws.readyState !== WebSocket.OPEN) {
        return {
          //@ts-ignore
          opCode: HttpCodes.INTERNAL_SERVER_ERROR,
          message: "WebSocket is not open",
        };
      }
      this.waitUntilSocketIsOpen(() => {
        let cid = this.callback((data: any) => {
          console.log("Received data from WebSocket", data);
          switch (data.type) {
            case GeneralTypes.AUTH_ROLL_TOKEN:
              let newToken = data.token;
              let authData = JSON.parse(localStorage.getItem("postr_auth") || "{}");
              authData.token = newToken;
              localStorage.setItem("postr_auth", JSON.stringify(authData));
              this.authStore.model = authData;
              window.dispatchEvent(this.changeEvent);
              break;
          }
        });
        msg.callback = cid;
        this.ws?.send(JSON.stringify(msg));
      });
      return;
    }



    let body;
    let headers;
    if (!msg.security || !msg.security.token || isTokenExpired(msg.security.token)) {
      if (!this.authStore.isValid()) {
        return {
          opCode: HttpCodes.UNAUTHORIZED,
          message: "You are not authorized to perform this action",
        };
      }
    }
    body = JSON.stringify(msg);
    headers = {
      "Content-Type": "application/json",
      Authorization: JSON.parse(localStorage.getItem("postr_auth") || "{}").token,
    };
    const data = await fetch(
      type === "search"
        ? `${this.serverURL}/deepsearch`
        : `${this.serverURL}/collection/${msg.payload.collection}`,
      {
        method: "POST",
        headers,
        body,
      }
    );

    if (data.status !== 200) {
      return {
        opCode: data.status,
        message: "An error occurred",
      };
    }

    return data.json();
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

      get: async (id: string, options?: { expand?: string[], cacheKey?: string }) => {
        return new Promise(async (resolve, reject) => {

          let out = await this.sendMsg({
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
          resolve(out.payload)
        })
      },
    };
  }
}
