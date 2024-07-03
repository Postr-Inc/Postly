"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[545],{2545:function(e,t,s){var r,i,o;s.d(t,{h:function(){return l}}),(o=r||(r={})).AUTH_WITH_PASSWORD="authwithpassword",o.OAUTH="oauth",o.ISRATELIMITED="isRatelimited",o.ISONLINE="ping",o.AUH_GUIDED_HANDSHAKE="authGuidedHandshake",o.REFRESH_TOKEN="tokenRefresh",o.FETCH_FILE="fetchFile",o.CHECK_ONLINE="checkStatus",o.CHANGE_PASSWORD="changePassword",o.LIST="list",o.AUTH_UPDATE="authUpdate",o.REALTIME_SUBSCRIBE="realtime",o.REALTIME_UNSUBSCRIBE="unsubscribe",o.DELETE="delete",i="function"==typeof atob?atob:function(e){var t=String(e).replace(/=+$/,"");if(t.length%4==1)throw Error("'atob' failed: The string to be decoded is not correctly encoded.");for(var s,r,i,o="",n=0;s=t.charAt(n++);)-1!==(s="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(s))&&(r=i%4?64*r+s:s,i++%4&&(o+=String.fromCharCode(255&r>>(-2*i&6))));return o};let n={get:e=>localStorage.getItem(e),set:(e,t)=>localStorage.setItem(e,t),remove:e=>localStorage.removeItem(e),clear:()=>localStorage.clear()};class a{checkConnection(){return this.ws.readyState===WebSocket.OPEN}getRawFileData(e){return new Promise((t,s)=>{let r=new FileReader;r.onload=()=>{let e=r.result,s=new Uint8Array(e);t(s)},r.onerror=e=>{s(e)},r.readAsArrayBuffer(e)})}checkName(e){return new Promise((t,s)=>{e||s(Error("email or username is required")),this.callbacks.set("checkname",e=>{e.error?s(Error(e.error)):t(e.exists)}),console.log({...e.includes("@")?{email:e}:{username:e}}),this.sendMessage(JSON.stringify({type:"checkname",key:"checkname",data:{...e.includes("@")?{email:e}:{username:e}},session:this.sessionID}))})}changePassword(e){let{currentPassword:t,newPassword:s,confirmedPassword:r}=e}appendToQueue(e){if(!e.requestID&&!this.queue.has(e.requestID))return}waitForSocketConnection(e){let t=()=>{this.ws.readyState===WebSocket.OPEN?null!=e&&e():this.ws.readyState===WebSocket.CLOSED||this.ws.readyState===WebSocket.CLOSING?(console.error("WebSocket connection closed or failed."),null!=e&&e(Error("WebSocket connection closed or failed."))):setTimeout(t,100)};t(),setTimeout(()=>{this.ws.readyState!==WebSocket.OPEN&&null!=e&&e(Error("WebSocket connection timed out."))},5e3)}getAsByteArray(e){return new Promise((t,s)=>{let r=new FileReader;r.onload=()=>{let e=r.result,s=new Uint8Array(e);t(Array.from(s))},r.onerror=e=>{s(e)},r.readAsArrayBuffer(e)})}oauth(e){return new Promise((t,s)=>{if(e.provider){if(e.redirect_uri){let{provider:r,redirect_uri:i,redirect:o}=e;this.callbacks.set("oauth",e=>{e.url&&window.open(e.url),e.clientData?(localStorage.setItem("postr_auth",JSON.stringify({model:e.clientData.record,token:e.clientData.token})),t(e.clientData),window.dispatchEvent(this.changeEvent)):e.error&&s(Error(e.error))}),this.sendMessage(JSON.stringify({type:"oauth",data:e,session:this.sessionID}))}else throw Error("redirect_uri is required")}else throw Error("provider is required")})}onmessage(e){let t=JSON.parse(e.data);if(this.callbacks.has(t.key))this.callbacks.get(t.key)(t.data?t.data:t);else if("status"===t.type)t.data.forEach(e=>{this.online.set("online",e);{let e=setTimeout(()=>{window.dispatchEvent(this.onlineEvent),clearTimeout(e)},1e3)}});else if("pong"==t.type){let e=Date.now()-t.time;this.online.set("latency",e);{let e=setTimeout(()=>{window.dispatchEvent(this.onlineEvent),clearTimeout(e)},1e3)}}}async read(e){return new Promise((t,s)=>{e.collection||s(Error("collection is required")),this.authStore.isValid||s(Error("token is expired")),this.sendMessage(JSON.stringify({type:"read",key:this.callback(t,s),collection:e.collection,token:JSON.parse(n.get("postr_auth")||"{}").token,cacheKey:e.cacheKey||null,id:e.id,returnable:e.returnable,expand:e.expand,session:this.sessionID,authKey:e.authKey||null}))})}update(e){return new Promise((t,s)=>{crypto.randomUUID(),e.collection||s(Error("collection is required")),e.record||s(Error("data is required")),this.authStore.isValid||s(Error("token is expired")),this.sendMessage(JSON.stringify({type:"update",key:this.callback(t,s),data:e.record,expand:e.expand,collection:e.collection,skipDataUpdate:e.skipDataUpdate||!1,invalidateCache:e.invalidateCache||null,immediatelyUpdate:e.immediatelyUpdate||!1,sort:e.sort,filter:e.filter,token:JSON.parse(n.get("postr_auth")||"{}").token,id:e.id,session:this.sessionID,cacheKey:e.cacheKey||null}))})}list(e){return new Promise((t,s)=>{var r;this.currType="list",e.collection||s(Error("collection is required")),this.authStore.isValid||s(Error("token is expired")),this.sendMessage(JSON.stringify({type:"list",key:this.callback(t,s),token:this.authStore.model().token,data:{returnable:e.returnable||null,collection:e.collection,sort:e.sort,filter:e.filter,cacheTime:e.cacheTime||null,refresh:e.refresh||!1,refreshEvery:e.refreshEvery||0,limit:e.limit,offset:e.page,id:(null===(r=this.authStore.model())||void 0===r?void 0:r.id)||null,expand:e.expand||null,cacheKey:e.cacheKey},session:this.sessionID}))})}delete(e){return new Promise((t,s)=>{e.collection||s(Error("collection is required")),this.authStore.isValid||s(Error("token is expired"));let r=this.callback(t,s);this.sendMessage(JSON.stringify({type:"delete",key:r,collection:e.collection,ownership:this.authStore.model().id,filter:e.filter,token:this.authStore.model().token,id:e.id||null,session:this.sessionID,cacheKey:e.cacheKey||null}))})}callback(e,t){let s=crypto.randomUUID();return this.callbacks.set(s,r=>{r.error&&t(r.error),this.callbacks.delete(s),e(r)}),s}async create(e){return new Promise((t,s)=>{crypto.randomUUID(),e.collection||s(Error("collection is required")),e.record||s(Error("record is required")),"users"===e.collection||this.authStore.isValid||s(Error("token is expired")),this.sendMessage(JSON.stringify({method:"create",type:"create",key:this.callback(t,s),invalidateCache:e.invalidateCache||null,expand:e.expand,record:e.record,collection:e.collection,token:this.authStore.model().token,id:this.authStore.model().id||null,session:this.sessionID,cacheKey:e.cacheKey||null}))})}subscribe(e,t){let s=crypto.randomUUID();if(!event)throw Error("event is required");if(e.collection||Error("collection is required"),t&&"function"!=typeof t||Error("callback is required"),!this.subscriptions.has("".concat(this.sessionID,"-").concat(e.collection)))return this.callbacks.set(s,e=>{if(e.error)throw Error(e.error);t(e)}),this.subscriptions.set("".concat(this.sessionID,"-").concat(e.collection),!0),console.log("Subscribing to event",e.event),this.sendMessage(JSON.stringify({type:"realtime",key:s,eventType:e.event,collection:e.collection,token:this.authStore.model().token,session:this.sessionID})),{unsubscribe:()=>{this.callbacks.delete(s),this.sendMessage(JSON.stringify({type:"unsubscribe",key:s,session:this.sessionID}))}}}close(){this.ws.close()}constructor(e){this.queue=new Map,this.events={emit:(e,t)=>{window.dispatchEvent(new CustomEvent(e,{detail:t}))},on:(e,t)=>{window.addEventListener(e,e=>{t(e)})}},this.isSubscribed=e=>this.subscriptions.has(e),this.cdn={url:e=>"".concat(this.pbUrl,"/api/files/").concat(e.collection,"/").concat(e.id,"/").concat(e.file),getFile:e=>new Promise((t,s)=>{let r=crypto.randomUUID();e.collection||s(Error("collection is required")),e.recordId||s(Error("recordId is required")),e.field||s(Error("field is required")),this.callbacks.set(r,e=>{e.error&&s(e.error);let r=new Blob([new Uint8Array(e.file)],{type:e.type}),i=new File([r],e.fileName,{type:e.fileType}),o=new FileReader;o.onload=()=>{t(o.result)},o.readAsDataURL(i)}),this.sendMessage(JSON.stringify({type:"fetchFile",key:r,collection:e.collection,field:e.field,recordID:e.recordId,token:this.authStore.model().token,session:this.sessionID}))})},this.cacheStore={set:(e,t,s)=>{if(s){let r={value:t,cacheTime:s,time:new Date().getTime()};this.$memoryCache.set(e,JSON.stringify(r))}else this.$memoryCache.set(e,t)},update:(e,t)=>{let s=this.$memoryCache.get(e);s&&(s.cacheTime?(s.value=t,s.time=new Date().getTime(),this.$memoryCache.set(e,JSON.stringify(s))):this.$memoryCache.set(e,t))},get:e=>{let t=this.$memoryCache.get(e);return t?t.cacheTime?new Date().getTime()-t.time>t.cacheTime?(this.$memoryCache.delete(e),null):t.value:t:null},delete:e=>{this.$memoryCache.delete(e)},has:e=>this.$memoryCache.has(e),all:()=>this.$memoryCache.entries(),keys:()=>Array.from(this.$memoryCache.keys())},this.authStore={refreshToken:async()=>{console.log("Refreshing token"),this.callbacks.set("tokenRefresh",e=>new Promise((t,s)=>{if(e.error)return s(e);localStorage.setItem("postr_auth",JSON.stringify({model:this.authStore.model(),token:e.token||this.authStore.model().token})),window.dispatchEvent(this.changeEvent)})),this.sendMessage(JSON.stringify({type:"refreshToken",key:r.REFRESH_TOKEN,token:this.authStore.model().token,session:this.sessionID}))},resetPassword:async(e,t)=>new Promise((s,r)=>{if(!t||!e)return r(Error("email, password and token are required"));this.callbacks.set("resetPassword",e=>{e.error&&r(e),s(e),this.callbacks.delete("resetPassword")}),console.log({password:t,token:e}),this.sendMessage(JSON.stringify({type:"changePassword",key:"resetPassword",data:{password:t,token:e},session:this.sessionID}))}),requestPasswordReset:async e=>new Promise((t,s)=>{if(!e)return s(Error("email is required"));this.callbacks.set("requestPasswordReset",e=>{e.error&&s(e.error),t(e),this.callbacks.delete("requestPasswordReset")}),this.sendMessage(JSON.stringify({type:"requestPasswordReset",key:"requestPasswordReset",data:{email:e},session:this.sessionID}))}),login:async(e,t)=>new Promise((s,r)=>{this.callbacks.set("auth&password",e=>{e.clientData?(localStorage.setItem("postr_auth",JSON.stringify({model:e.clientData.record,token:e.clientData.token})),s(e.clientData.record),this.callbacks.delete("auth&password"),window.dispatchEvent(this.changeEvent)):e.error&&(r(Error(e.error)),this.callbacks.delete("auth&password"))}),this.sendMessage(JSON.stringify({type:"auth&password",data:{emailOrUsername:e,password:t},key:"auth&password",session:this.sessionID}))}),create:async e=>new Promise((t,s)=>{if(!e.username||!e.email||!e.password)return s(Error("username, email and password are required"));this.callbacks.set("authCreate",e=>(console.log(e),e.error)?s(e):t(e)),this.sendMessage(JSON.stringify({type:"authCreate",key:"authCreate",data:e,session:this.sessionID}))}),update:()=>{localStorage.getItem("postr_auth")&&(this.callbacks.set("authUpdate",e=>{if(e.error&&e.hasOwnProperty("isValid")&&!e.isValid)console.error(e);else if(e.error)throw Error(e);else e.clientData&&console.log("Auth updated"+e.clientData)}),this.sendMessage(JSON.stringify({type:r.AUTH_UPDATE,token:this.authStore.model().token,key:"authUpdate",data:JSON.parse(localStorage.getItem("postr_auth")).model,session:this.sessionID})))},model:e=>{if(!e)return{...JSON.parse(n.get("postr_auth")||"{}").model,token:JSON.parse(n.get("postr_auth")||"{}").token};localStorage.setItem("postr_auth",JSON.stringify({model:e,token:JSON.parse(n.get("postr_auth")||"{}").token}))},onChange:e=>{window.addEventListener("authChange",t=>{let s=t.detail;e(s)})},isValid:()=>{let e=localStorage.getItem("postr_auth")?JSON.parse(n.get("postr_auth")||"{}").token:null;return!!e&&!function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;var s=function(e){if(e)try{var t=decodeURIComponent(i(e.split(".")[1]).split("").map(function(e){return"%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)}).join(""));return JSON.parse(t)||{}}catch(e){console.error("Error decoding token payload:",e)}return{}}(e).exp;return!!s&&Date.now()>=(s-t)*1e3}(e)},img:()=>this.cdn.url({id:this.authStore.model().id,collection:"users",file:this.authStore.model().avatar}),isRatelimited:async e=>new Promise((t,s)=>{this.callbacks.set("isRatelimited",e=>{e.error&&s(e.error),t(e),this.callbacks.delete("isRatelimited")}),this.sendMessage(JSON.stringify({type:"isRatelimited",key:"isRatelimited",token:this.authStore.model().token,method:e,session:this.sessionID}))}),clear:()=>{try{n.remove("postr_auth"),window.dispatchEvent(this.changeEvent)}catch(e){console.error(e)}}},this.onlineEvent=new CustomEvent("online"),this.changeEvent=new CustomEvent("change"),this.sessionID=crypto.randomUUID(),this.isStandalone=!1,this.subscriptions=new Map,this.ws=new WebSocket("".concat(e.wsUrl.trim().startsWith("127")||e.wsUrl.trim().startsWith("localhost")?"ws":"wss","://").concat(e.wsUrl)),this.$memoryCache=new Map,window.postr={version:" 1.7.0"},this.token=JSON.parse(n.get("postr_auth")||"{}")?JSON.parse(n.get("postr_auth")||"{}").token:null,this.cancellation=e.cancellation,this.sendMessage=e=>new Promise((t,s)=>{this.waitForSocketConnection(()=>{this.ws.send(e),t(0)})}),this.currType="",this.pbUrl=e.pbUrl,this.callbacks=new Map,this.ws.onmessage=e=>this.onmessage(e);let t=()=>{console.log("Connected to server"),this.ws.send(JSON.stringify({type:"authSession",token:this.token,session:this.sessionID}))};this.ws.onopen=()=>{t()};let s=!1,o=()=>{this.ws=new WebSocket("".concat(e.wsUrl.trim().startsWith("127")||e.wsUrl.trim().startsWith("localhost")?"ws":"wss","://").concat(e.wsUrl)),this.ws.onmessage=e=>this.onmessage(e),this.ws.onopen=()=>{t(),this.authStore.refreshToken(),s=!1},this.ws.onclose=()=>{console.log("Connection closed unexpectedly"),s=!1,a()},console.log("Reconnecting to server")};function a(){s||(s=!0,setTimeout(()=>{o()},1e3))}this.ws.onclose=()=>{a()},this.online=new Map,this.changeEvent=new CustomEvent("authChange",{detail:{model:JSON.parse(n.get("postr_auth")||"{}").model,token:JSON.parse(n.get("postr_auth")||"{}")?JSON.parse(n.get("postr_auth")||"{}").token:null}}),this.onlineEvent=new CustomEvent("online",{detail:{online:this.online}}),window.onbeforeunload=()=>{this.sendMessage(JSON.stringify({type:"close",token:this.token,session:this.sessionID})).then(()=>{this.ws.close()}),this.subscriptions.forEach((e,t)=>{this.sendMessage(JSON.stringify({type:"unsubscribe",key:t,token:this.authStore.model().token,session:this.sessionID}))})};let l=setInterval(()=>{this.$memoryCache.forEach((e,t)=>{let s=JSON.parse(e);s.time&&new Date().getTime()-s.time>s.cacheTime&&(this.$memoryCache.delete(t),clearInterval(l))})},1e3),c=setInterval(()=>{this.ws.readyState!==WebSocket.OPEN||clearInterval(c)},1e3)}}let l=new a({wsUrl:"localhost:8080",pbUrl:"https://postrapi.pockethost.io",cancellation:!0})}}]);