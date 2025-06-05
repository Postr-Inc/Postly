import useCache from "../Hooks/useCache";
import isTokenExpired from "./jwt";
import { HttpCodes } from "./opCodes";
import { authStore } from "./Types/AuthStore";
import { GeneralTypes } from "./Types/GeneralTypes";
const ip = null;
 
export default class SDK {
  serverURL: string;
  hasChecked = false;
  ip = "";
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
   
    
     window.onbeforeunload = function () {
      // clear app cache
      console.log("Clearing app cache");
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          caches.delete(key);
        });
      });
     }
    // check if logged in and check if ws is closed periodically
    setInterval(() => {
      if(this.ws === null || this.ws.readyState === WebSocket.CLOSED && localStorage.getItem("postr_auth")){
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
    for(let key of keys){
        const cacheData = await (await caches.open(key)).keys(); 
        switch(collection){
          case "posts":
            for(let cache of cacheData){ 
              const cacheDataJSON = await (await caches.open(key)).match(cache).then((res)=> res?.json());
              
              if(Array.isArray(cacheDataJSON.value)){
                  const payload = cacheDataJSON.value 
                  console.log("Post to update", payload, id, data);
                  const post = payload.find((e: any)=> e.id === id); 
                  if(post){
                      const index = payload.indexOf(post); 
                      payload[index] = {...post, ...data}
                      cacheDataJSON.value.payload = payload;
                      set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
                  } 
              }else{
                  const post = cacheDataJSON.value 
                  console.log("Post to update", post, id, data);
                  if(post.id === id){
                      cacheDataJSON.value.payload = {...post, ...data}
                  }
                  set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
              }
            }
            
            break;
          case "comments":
            for(let cache of cacheData){ 
              const cacheDataJSON = await (await caches.open(key)).match(cache).then((res)=> res?.json());
              
              if(Array.isArray(cacheDataJSON.value)){
                  const payload = cacheDataJSON.value 
                  console.log("Post to update", payload, id, data);
                  const post = payload.find((e: any)=> e.id === id); 
                  if(post){
                      const index = payload.indexOf(post); 
                      payload[index] = {...post, ...data}
                      cacheDataJSON.value.payload = payload;
                      set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
                  } 
              }else{
                  const post = cacheDataJSON.value 
                  console.log("Post to update", post, id, data);
                  if(post.id === id){
                      cacheDataJSON.value.payload = {...post, ...data}
                  }
                  set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
              }
            }
            
          break;
          case "users":
            for(let cache of cacheData){ 
             // find user by id
              if(cache.url.includes(id)){
                  // now grab the data
                  var cacheDataJSON = await (await caches.open(key)).match(cache).then((res)=> res?.json()); 
                  if(Array.isArray(cacheDataJSON.value)){
                    cacheDataJSON.value = cacheDataJSON.value.map((e: any)=> e.id === id ? {...e, ...data} : e)
                  }else{
                    // if update data is a buffer convert to base64
                    if(data.avatar){
                      data.avatar = Buffer.from(data.avatar).toString('base64');
                    }else if(data.banner){
                      data.banner = Buffer.from(data.banner).toString('base64');
                    }
                    cacheDataJSON.value = {...cacheDataJSON.value, ...data}
                  }
                  set(cache.url, cacheDataJSON.value, new Date().getTime() + 3600);
              }
          }
        }
        
    }
  }

  checkAuth = async () => { 
     
    if(localStorage.getItem("postr_auth") && !this.hasChecked){
      let res = await fetch(`${this.serverURL}/auth/verify`, {
        headers: {
          Authorization:  JSON.parse(localStorage.getItem("postr_auth") || "{}").token,
        },
      });
      this.hasChecked = true;
      if (res.status !== 200) {
        console.log("Token invalid, reauthenticating");
        localStorage.removeItem("postr_auth"); 
        window.location.href = "/auth/login"
        return;
      }
      if(this.ws === null) this.connectToWS();
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
    let _data = JSON.parse(data);  
    let cb = this.subscriptions.get(_data.callback); 
    if (cb) {
      cb(_data.payload);
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
      if(window.location.pathname !== "/auth/login") window.location.href = "/auth/login";
    },
    login: async (emailOrUsername: string, password: string) => {
      return new Promise(async (resolve, reject) => {
        if(emailOrUsername === "" || password === "" || !emailOrUsername || !password || emailOrUsername.length < 3 || password.length < 3) {
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
        if (status !== 200)  return reject(message);
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

 

  sendMsg = async (msg: any, type: any) => {
    console.log(msg);
  
    let body;
    let headers;
  
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
      if(out.opCode !== HttpCodes.OK) return reject(out); 
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
           if(!this.subscriptions.has(`${name}:${id}`)){ 
              this.subscriptions.set(`${name}:${id}`, options.cb); 
              this.waitUntilSocketIsOpen(() => {
                this.ws?.send(JSON.stringify({ payload: { collection: name, id, callback: `${name}:${id}` }, security: { token: this.authStore.model.token } }));
              });
           }else{
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
          const cacheData = shouldCache ?  await get(cacheKey) : null; 
          if (cacheData) return resolve({opCode: HttpCodes.OK, 
             ...(Array.isArray(cacheData) ? {items: [...cacheData]} : {items: [cacheData.payload]}), totalItems: cacheData.totalItems, totalPages: cacheData.totalPages});
          
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
          if(out.opCode !== HttpCodes.OK) return reject(out);
          shouldCache && set(cacheKey, out.payload,  new Date().getTime() + 3600); // cache for 1 hour\ 
          resolve({
            opCode:  out.opCode,
            items:  out.payload,
            totalItems:out.totalItems,
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

       update: async (id: string, data: any, options?: {cacheKey?: string, expand?:any[]}) => {
        return new Promise(async (resolve, reject)=> {
           
            this.updateCache(name,id, data)
            let out = await this.sendMsg({
                type: GeneralTypes.UPDATE,
                payload: {
                    collection: name,
                    id: id,
                    fields: data,
                    options
                },
                security : {
                    token: JSON.parse(localStorage.getItem("postr_auth") || "{}").token
                },
                callback:  ""
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
      create: async (data: any, options?: {cacheKey?: string, expand?:any[], [ key: string]: any }) => { 
        return new Promise(async (resolve, reject) => {
          
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

      get: async (id: string, options?:{expand?: string[], cacheKey?: string}) => {
        return new Promise(async (resolve, reject)=>{
          
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
            callback:""
          }) as any;
          if(out.opCode !== HttpCodes.OK) return reject(out);
           resolve(out.payload) 
        })
      },
    };
  }
}
