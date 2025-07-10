// WebSocket Manager
const WSManager = {
  ws: null,

  // Get the token from IndexedDB

  async shouldShowNotifications() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("postr_auth_db", 2);
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("settings")) {
        db.close();
        return resolve(false); // default to disabled if not found
      }

      const tx = db.transaction("settings", "readonly");
      const store = tx.objectStore("settings");
      const getReq = store.get("notifications_enabled");

      getReq.onsuccess = () => {
        const value = getReq.result?.value ?? false;
        db.close();
        resolve(value);
      };

      getReq.onerror = () => {
        db.close();
        reject("Failed to read notification toggle");
      };
    };
    request.onerror = () => reject("DB open error");
  });
},
  async getToken() {
    return new Promise((resolve, reject) => {
      const dbRequest = indexedDB.open("postr_auth_db", 2); // Use the correct version!

      dbRequest.onupgradeneeded = (event) => {
        const db = dbRequest.result;
        if (!db.objectStoreNames.contains("auth")) {
          db.createObjectStore("auth", { keyPath: "id" });
        }
      };

      dbRequest.onerror = () => reject('DB open error');

      dbRequest.onsuccess = () => {
        const db = dbRequest.result;

        if (!db.objectStoreNames.contains("auth")) {
          db.close();
          reject('Object store missing');
          return;
        }

        const tx = db.transaction("auth", "readonly");
        const store = tx.objectStore("auth");
        const request = store.get("token");

        request.onsuccess = () => {
          db.close();
          resolve(request.result?.token || null);
        };

        request.onerror = () => {
          db.close();
          reject('Token read error');
        };
      };
    });
  },

  // Establish a WebSocket connection
  async connect(token) {
    if (!token) {
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'ws_error', error: 'No token provided' }));
      });
    }

    if (this.ws) this.ws.close();

    // Open the WebSocket connection
    this.ws = new WebSocket(`wss://api.postlyapp.com/subscriptions?token=${encodeURIComponent(token)}`);

    // When WebSocket connection opens
    this.ws.onopen = () => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'ws_open' }));
      });
    };

    // Handle incoming messages from WebSocket
    this.ws.onmessage = async (event) => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'ws_message', data: event.data }));
      });

      try {
        const msg = JSON.parse(event.data); 
        let enabled = await WSManager.shouldShowNotifications() 
        let notification_data = msg.notification_data
        if (msg.type === 'notify' && enabled){
          self.registration.showNotification(notification_data.notification_title, {
            body:notification_data.notification_body ,
            icon: notification_data.icon || '/icon.png',
            data: { url: notification_data.url || '/' }
          });
        }
      } catch (e) {
        console.log(e)
        // Ignore parse errors
      }
    };

    // When WebSocket closes
    this.ws.onclose = () => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'ws_close' }));
      });
    };

    // WebSocket error handling
    this.ws.onerror = (err) => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'ws_error', error: err.message }));
      });
    };
  },

  // Send data through WebSocket
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
    } else {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.postMessage({ type: 'ws_error', error: 'WebSocket not connected' }));
      });
    }
  },

  // Close the WebSocket connection
  close() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
};

// Listen for messages from the frontend
self.addEventListener('message', (event) => {
  const { type, token, data } = event.data || {};

  switch (type) {
    case 'connect':
    case 'reconnect':
      WSManager.connect(token);
      break;
    case 'send':
    case 'ws_send':
      WSManager.send(data);
      break;
    case 'close':
    case 'ws_close':
      WSManager.close();
      break;
    case 'notification-preference':
      break;
    default: 
    
      WSManager.send(JSON.stringify(event.data)) 
  }
});

// Service Worker activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const token = await WSManager.getToken().catch(() => null);
      console.log(token)
      if (token) {
        WSManager.connect(token);
      }
      self.clients.claim(); // Ensure the SW is controlling all clients
    })()
  );
});

// Notification click handler (open window or focus the app)
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      return clients.openWindow('/');
    })
  );
});
