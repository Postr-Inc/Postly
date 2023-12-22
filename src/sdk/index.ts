"use client";
import { isTokenExpired } from "./jwt/index"
import { useCallback, useEffect, useState } from "react";

const store = {
    get: (key: string) => {
        if (typeof window == "undefined") return;
        return localStorage.getItem(key)
    }

    ,
    set: (key: string, value: any) => {
        if(typeof window == "undefined") return;
        return localStorage.setItem(key, value)
    },
    remove: (key: string) => {
        if (typeof window == "undefined") return;
        return localStorage.removeItem(key)
    },
    clear: () => {
        if (typeof window == "undefined") return;
        return localStorage.clear()
    }
}
interface authStore {
    model: {
        id: string
        avatar: string,
        username: string,
        created: string,
        bio: string,
        updated: string,
        bookmarks: Array<string>,
        followers: Array<string>,
        token: string,
        postr_plus: boolean,
        validVerified: boolean,
    }
    onChange: Function
    update: Function
    clear: Function
    isValid:  Function
    img: Function,
    isRatelimited: Function;
    global: any
}

interface isRatelimited {
    limit: number
    duration: number
    used: number
    ratelimited: boolean
}
 
/**
 * @class PostrSDK
 * @description PostrSDK - the official Postr hapta client sdk
 * @version v0.0.4
 */


export  default class postrSdk {
    private type: string
    private ws: WebSocket
    private sendMessage: (e: any) => void
    private callbacks: Map<string, any>
    private isStandalone: boolean
   
    changeEvent: CustomEvent
    cancellation: any
    sessionID: string
    pbUrl: string
    currType: string
    $memoryCache: Map<string, any>
    token: string
    constructor(data:{wsUrl: string, pbUrl: string, cancellation: any}) {
         
        this.sessionID = crypto.randomUUID()
        this.isStandalone = false
        typeof window == "undefined" ? this.type = "server" : this.type = "client"
        this.ws = new WebSocket(data.wsUrl.includes("localhost") ? "ws://" + data.wsUrl : "wss://" + data.wsUrl)
        this.$memoryCache = new Map()
        this.token = JSON.parse(store.get("postr_auth") || '{}') ? JSON.parse(store.get("postr_auth") || '{}').token : null
        /**
         * @param {boolean} cancellation
         * @description cancel request if taking too long
         */
        this.cancellation  = data.cancellation
        this.sendMessage = (e) => {
            this.waitForSocketConnection(() => {
                this.ws.send(e)
            })
        }
        this.currType = ""
        this.pbUrl =  data.pbUrl
        this.callbacks = new Map()
        this.ws.onmessage = (e) => this.onmessage(e);

        
        
        this.changeEvent = new CustomEvent("authChange", { detail: { model: JSON.parse(store.get("postr_auth") || "{}").model, token:  JSON.parse(store.get("postr_auth") || '{}') ? JSON.parse(store.get("postr_auth") || '{}').token : null } })
 
        this.ws.onopen = () => {
             this.ws.send(JSON.stringify({ type: "authSession", token: this.token, session: this.sessionID }))
        }

    }
    /**
     * @method upload
     * @description convert file into readable format
     * @param file 
     * @returns 
     */

    
    public getRawFileData(file: File): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            // Create a FileReader to read the file
            let reader = new FileReader();

            // Set up event listeners for when the file reading is complete
            reader.onload = () => {
                // Resolve the Promise with the result (Uint8Array)
                const arrayBuffer = reader.result as ArrayBuffer;
                const uint8Array = new Uint8Array(arrayBuffer);
                resolve(uint8Array);
            };

            // Set up an event listener for errors during file reading
            reader.onerror = (error) => {
                // Reject the Promise with the error
                reject(error);
            };

            // Read the file as an ArrayBuffer
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * @method cdn
     * @description Get files from the postr cdn
     * @returns {cdn}
     * 
     */
    cdn = {
        url: (data: { id: string, collection: string, file: string }) => {
            return `${this.pbUrl}/api/files/${data.collection}/${data.id}/${data.file}`
        },
        
        getFile: (data: { recordId: string, collection: string, field:string }) =>{
            return new Promise((resolve, reject) => {
                let key = crypto.randomUUID()
                !data.collection ? (reject(new Error("collection is required"))) : null
                !data.recordId ? (reject(new Error("recordId is required"))) : null
                !data.field ? (reject(new Error("field is required"))) : null
                this.callbacks.set(key, (d: any) => {
                    if (d.error) reject(d.error);
                    let file = new Blob([new Uint8Array(d.file)], { type: d.type })
                    let fileObj  = new File([file], d.fileName, { type: d.fileType })
                     
                    let reader = new FileReader();
                    reader.onload = () => {
                        // convert to base64 string
                        resolve(reader.result);

                    };
                    reader.readAsDataURL(fileObj);

                })

                this.sendMessage(JSON.stringify({ type: "fetchFile", key: key, collection: data.collection, field: data.field, recordID: data.recordId, token: this.token, session: this.sessionID }))
            })
        },
        
    }

    /**
     * @method cacehStore
     * @description Cache values with exp duration in ms
     * @returns {cacehStore}
     */
    cacehStore = {
        set: (key: string, value: any, cacheTime: number) => {
            console.log("set")
            if (typeof window == "undefined") return;
            if (cacheTime) {
                let cache = {
                    value: value,
                    cacheTime: cacheTime,
                    time: new Date().getTime()
                }
                this.$memoryCache.set(key,  JSON.stringify(cache))
            } else {
                this.$memoryCache.set(key, value)
            }
        },
        get: (key: string) => {
            if (typeof window == "undefined") return;
            let cache = this.$memoryCache.get(key) 
            if (cache) {
                if (cache.cacheTime) {
                    if (new Date().getTime() - cache.time > cache.cacheTime) {
                        this.$memoryCache.delete(key)
                        return null
                    } else {
                        return cache.value
                    }
                } else {
                    return cache
                }
            } else {
                return null
            }
        },
        delete: (key: string) => {
            if (typeof window == "undefined") return;
            this.$memoryCache.delete(key)
        },
        has: (key: string) => {
            if (typeof window == "undefined") return;
            return this.$memoryCache.has(key)
        },
        all: () => {
            return this.$memoryCache.entries()
        },
        keys: () => {
            return  Array.from(this.$memoryCache.keys())
        }
    }

    /**
     * @method authStore
     * @description Get the current authmodel data and listen for changes
     * @returns {authStore}
     * 
     */
    public authStore = {

        update:  () => {
            if (typeof window == "undefined") return;
            this.callbacks.set('authUpdate', (data: any) => {

                if (data.error) throw new Error(data.error);
                else if (data.clientData)  store.set("postr_auth",  JSON.stringify({ model: data.clientData, token: this.token }) || '{}');
                 
                window.dispatchEvent(this.changeEvent)
                this.callbacks.delete('authUpdate');
            })
            this.sendMessage(JSON.stringify({ type: "authUpdate",token: this.token, data: { record: this.authStore.model(),  key: 'authUpdate' }, session: this.sessionID}))

        },
        model:  () => {
            if (typeof window == "undefined") return;
            return JSON.parse(store.get("postr_auth") || '{}').model
        },
        onChange: (callback: Function) => {
            if (typeof window == "undefined") return;
            window.addEventListener("authChange", (e: Event) => {
                const authChange = (e as CustomEvent).detail
                callback(authChange)
            })

        },
        isValid: () => isTokenExpired(store.get("postr_auth") ? JSON.parse((store.get("postr_auth")|| '{}')).token : null,  0),
        img: () => {
            if (typeof window == "undefined") return;
             return `${this.pbUrl}/api/files/users/${this.authStore.model().id}/${this.authStore.model().avatar}`
        },
        isRatelimited: (type: string): Promise<isRatelimited> => {
            return new Promise((resolve, reject) => {
            this.callbacks.set('isRatelimited', (data: any) => {
                if (data.error) reject(data.error);
                resolve(data)
                this.callbacks.delete('isRatelimited');
            })
            this.sendMessage(JSON.stringify({ type: "isRatelimited",  key: 'isRatelimited', token:this.token, method: type, session: this.sessionID }))
        })
        },
        clear: () => {
            if (typeof window == "undefined") return;
            store.remove("postr_auth")
            window.dispatchEvent(this.changeEvent)
        },
        
    }

    async checkUsername(username: string) {
        return new Promise((resolve, reject) => {
            this.callbacks.set('checkUsername', (data: any) => {
                if (data.error) reject(data.error);
                resolve(data.message)
                this.callbacks.delete('checkUsername');
            })
            this.sendMessage(JSON.stringify({ type: "checkUsername",  key: 'checkUsername', data: { username: username } }))
        })
    }

 

     

     
    /**
     * @method authWithPassword
     * @param emailOrUsername 
     * @param password 
     * @returns  {Promise<model>}
     * @description Authenticate user with email or username and password
     */


    public authWithPassword(emailOrUsername: string, password: string) {
        return new Promise((resolve, reject) => {
            
            if (!emailOrUsername) {
                throw new Error("email or username is required")
            }
            else if (!password) {
                throw new Error("password is required")
            }
            else {
                this.callbacks.set("auth&password", (data: any) => {
                    if (data.clientData) {
                        if (typeof window == "undefined") return;
                       if(typeof window !== undefined)  localStorage.setItem("postr_auth", JSON.stringify({ model: data.clientData, token: data.clientData.token }));
                        resolve(data.clientData)
                        this.callbacks.delete("auth&password")
                        window.dispatchEvent(this.changeEvent)
                    } else if (data.error) {
                        reject(new Error(data.error))
                        this.callbacks.delete("auth&password")
                    }
                })
                this.sendMessage(JSON.stringify({ type: "auth&password", data: { emailOrUsername: emailOrUsername, password: password }, key: "auth&password" }))
            }
        })
    }
    private waitForSocketConnection(callback: Function) {
        const maxWaitTime = 5000; // Maximum waiting time in milliseconds (adjust as needed)
        const interval = 100; // Check the WebSocket state every 100 milliseconds

        const checkConnection = () => {


            if (this.ws.readyState === WebSocket.OPEN) {
                if (callback != null) {
                    callback();

                }
            } else if (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
                // Handle connection closure or failure
                console.error("WebSocket connection closed or failed.");
                if (callback != null) {
                    callback(new Error("WebSocket connection closed or failed."));

                }
            } else {
                // The connection is not yet open, so check again in 100 milliseconds
                setTimeout(checkConnection, interval);

            }


        };

        // Start checking the connection
        checkConnection();

        // Set a maximum waiting time
        setTimeout(() => {
            if (this.ws.readyState !== WebSocket.OPEN && callback != null) {
                callback(new Error("WebSocket connection timed out."));
            }
        }, maxWaitTime);
    }
    /**
     * @method getAsByteArray   
     * @param file 
     * @returns {Promise<Uint8Array>}
     * @description convert file into readable format to be uploaded through the websockete connection
     */

    public getAsByteArray(file: File): Promise<Uint8Array> {
        return new Promise<Uint8Array>((resolve, reject) => {
            let reader = new FileReader();
            console.log(file)
            reader.onload = () => {
                const arrayBuffer = reader.result as ArrayBuffer;
                const uint8Array = new Uint8Array(arrayBuffer);
                //@ts-ignore
                resolve(Array.from(uint8Array));
            };
            reader.onerror = (error) => {
                reject(error);
            };
            reader.readAsArrayBuffer(file);
        });
    }


    /**
     * @method oauth
     * @param data
     * @description Authenticate user with oauth provider 
     * @returns  {Promise<model>}
     */

    public oauth(data: { provider: string, redirect_uri: string, redirect?: boolean }) {
        return new Promise((resolve, reject) => {
            
            if (!data.provider) {
                throw new Error("provider is required")
            }
            else if (!data.redirect_uri) {
                throw new Error("redirect_uri is required")
            }
            else {
                let { provider, redirect_uri, redirect } = data
                this.callbacks.set("oauth", (data: any) => {
                    if (typeof window == "undefined") return;
                    data.url ? window.open(data.url) : null
                    if (data.clientData) {
                        store.set("postr_auth", JSON.stringify({ model: data.clientData.record, token: data.clientData.token })) 
                        this.token = data.clientData.token
                       
                        redirect ? window.location.href = redirect_uri : null
                        setTimeout(() => {
                            resolve(data.clientData)
                        }, 1000)
 
                        this.callbacks.delete("oauth")
                        window.dispatchEvent(this.changeEvent)

                    } else if (data.error) {
                        reject(new Error(data.error))
                        this.callbacks.delete("oauth")
                    }
                })
                this.sendMessage(JSON.stringify({ type: "oauth", data: data , session: this.sessionID }))
            }
        })

    }
    private onmessage(e: any) {
        let data = JSON.parse(e.data)
        if (this.callbacks.has(data.key)) {
            let func = this.callbacks.get(data.key)

            func(data.data ? data.data : data)
        }
    }

    /**
     * @method read
     * @param data 
     * @returns  {Promise<any>}
     * @description Read a record from a collection
     */

    public read(data: { id: string, collection: string, returnable?: Array<string>, expand: Array<string> }) {
        return new Promise((resolve, reject) => {
            let key = crypto.randomUUID();
            !data.collection ? (reject(new Error("collection is required"))) : null;
            !this.authStore.isValid ? (reject(new Error("token is expired"))) : null;
    
            this.callbacks.set(key, (responseData: any) => {
                if (responseData.error) {
                    reject(responseData);
                } else {
                    resolve(responseData);
                }
                this.callbacks.delete(key);
            });
    
            this.sendMessage(JSON.stringify({
                type: "read", key: key, collection: data.collection, token: this.token, id: data.id, returnable: data.returnable, expand: data.expand, session: this.sessionID
            }));
     
        });
    }
    
    /**
     * @method update
     * @param data 
     * @returns  {Promise<any>}
     * @description Update a record in a collection
     */
    public update(data: { id: string, collection: string, filter?: string, record: Object, sort?: string }) {
        
        return new Promise((resolve, reject) => {
            let key = crypto.randomUUID()
            !data.collection ? (reject(new Error("collection is required"))) : null
            !data.record ? (reject(new Error("data is required"))) : null
            !this.authStore.isValid ? (reject(new Error("token is expired"))) : null


            this.callbacks.set(key, (data: any) => {
                if (data.error) reject(data);
                resolve(data)
                this.callbacks.delete(key)
            })



            this.sendMessage(JSON.stringify({ type: "update", key: key, data: data.record, collection: data.collection, sort: data.sort, filter: data.filter, token: this.token, id: data.id, session: this.sessionID }))
        })
    }
    /**
     * @method list
     * @param data
     * @returns  {Promise<any>}
     * @description List records from a collection
     */
    public list(data: { collection: string, filter?: string, sort?: string, limit?: number, page?: number, returnable?: Array<string>, expand?: Array<string> }) {
        return new Promise((resolve, reject) => {
            let key = crypto.randomUUID();
            this.currType = "list"
            !data.collection ? (reject(new Error("collection is required"))) : null;
            !this.authStore.isValid ? (reject(new Error("token is expired"))) : null;
    
            this.callbacks.set(key, (responseData: any) => {
                if (responseData.error)  return;
                else resolve(responseData);
                this.callbacks.delete(key);
            });
    
            this.sendMessage(JSON.stringify({
                    type: "list", 
                    key: key, 
                    token: this.token, 
                    data: {
                    returnable: data.returnable || null,
                    collection: data.collection,
                    sort: data.sort,
                    filter: data.filter,
                    limit: data.limit,
                    offset: data.page,
                    id: this.authStore.model()?.id || null,
                    expand: data.expand || null
                },
                session: this.sessionID
            }));
    
            
            
        });
    }
    
    /**
     * @method delete
     * @param data 
     * @returns  {Promise<any>}
     * @description Delete a record from a collection
     */
    public delete(data: { id: string, collection: string, filter?: string }) {
        return new Promise((resolve, reject) => {
            let key = crypto.randomUUID()
            !data.collection ? (reject(new Error("collection is required"))) : null
            !this.authStore.isValid ? (reject(new Error("token is expired"))) : null
            this.callbacks.set(key, (data: any) => {
                if (data.error) reject(data);
                resolve(data)
            })

            this.sendMessage(JSON.stringify({ type: "delete", key: key, collection: data.collection, ownership:this.authStore.model().id, filter: data.filter, token: this.token, id: data.id || null , session: this.sessionID}))
        })
    }
    /**
     * @method create
     * @param data 
     * @returns  {Promise<any>}
     * @description Create a record in a collection
     */
    public create(data: { collection: string, record: object, expand: Array<string> }) {
        
        return new Promise((resolve, reject) => {
            let key = crypto.randomUUID()
            !data.collection ? (reject(new Error("collection is required"))) : null
            !data.record ? (reject(new Error("record is required"))) : null
            if (data.collection !== "users" && !this.authStore.isValid) {
                reject(new Error("token is expired"))
            }
            this.callbacks.set(key, (data: any) => {
                if (data.error) reject(new Error(data));
                resolve(data)
            })

            this.sendMessage(JSON.stringify({ method: "create", type: "create", key: key,  
            expand: data.expand,
            record: data.record, collection: data.collection, token: this.token || null, id: this.authStore.model().id || null, session: this.sessionID }))
        } )
    }

    public on(data:{event: string, id:string, collection: string}, callback: Function) {
      
        let key =  crypto.randomUUID()
        if (!event) {
            throw new Error("event is required")
        }
        !data.collection ? (new Error("collection is required")) : null
        !callback || typeof callback === 'function' ? (new Error("callback is required")) : null
        if (!data.id)  throw new Error("id is required");
       
         
                this.callbacks.set(key, (d: any) => {
                    if (d.error) throw new Error(d.error);
                    callback(d)
                    
                })
                this.sendMessage(JSON.stringify({ type: "subscribe", key: key, eventType: data.event, collection:data.collection, id:data.id, token: this.token }))
                return  {
                    unsubscribe: () => {
                        this.callbacks.delete(key)
                    }
                }
         
      
        
    }
    public close() {
        this.ws.close()
    }

     
}