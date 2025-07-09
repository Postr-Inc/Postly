// Service Worker (sw.js)

let wsConnection = null;
let reconnectTimer = null;
const MAX_RECONNECT_ATTEMPTS = 3; // Reduced from 5
let reconnectAttempts = 0;
let isTokenValid = false;

// Improved connection manager
class WSManager {
  static async connect(token) {
    // Clean up any existing connection
    this.disconnect();
    
    if (!token) {
      token = await this.getToken();
      if (!token) {
        console.log('No token available, skipping connection');
        return;
      }
    }

    wsConnection = new WebSocket(`wss://api.postlyapp.com/subscriptions?token=${encodeURIComponent(token)}`);
    
    wsConnection.onopen = () => {
      console.log('✅ WS connected in SW');
      reconnectAttempts = 0;
      isTokenValid = true;
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('Message parse error:', e);
      }
    };

    wsConnection.onclose = (event) => {
      console.log(`WS closed: ${event.code} ${event.reason}`);
      this.handleClose(event);
    };

    wsConnection.onerror = (error) => {
      console.error('WS error:', error);
      this.disconnect();
    };
  }

  static disconnect() {
    if (wsConnection) {
      wsConnection.close(1000, 'Normal closure');
      wsConnection = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  }

  static async getToken() {
    try {
      return await new Promise((resolve, reject) => {
        const dbRequest = indexedDB.open("postr_auth_db", 1);
        
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          const tx = db.transaction("auth", "readonly");
          const store = tx.objectStore("auth");
          const request = store.get("token");
          
          request.onsuccess = () => {
            db.close();
            resolve(request.result?.token);
          };
          
          request.onerror = () => {
            db.close();
            reject('Token read error');
          };
        };
        
        dbRequest.onerror = () => reject('DB open error');
      });
    } catch (e) {
      console.error('Token fetch failed:', e);
      return null;
    }
  }

  static handleClose(event) {
    // Don't reconnect if closed normally
    if (event.code === 1000) return;
    
    // Don't reconnect if token was invalid
    if (!isTokenValid) return;
    
    
  }

  static handleMessage(data) {
    if (data.type === 'INVALID_TOKEN') {
      console.warn('Token invalidated');
      isTokenValid = false;
      this.disconnect();
      return;
    }
    
    if (data.notification_data) {
      this.showNotification(data.notification_data);
    }
  }

  static showNotification(notification) {
    const { url, notification_body, notification_title, icon, image } = notification;
    self.registration.showNotification(notification_title, {
      body: notification_body,
      icon,
      image,
      data: { url },
      actions: [{ action: 'open_url', title: 'Open' }]
    });
  }
}

// Event listeners
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activate new SW immediately
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    WSManager.getToken().then(token => {
      if (token) {
        return WSManager.connect(token);
      }
      return Promise.resolve();
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data.type === 'reconnect') {
    WSManager.connect(event.data.token);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
