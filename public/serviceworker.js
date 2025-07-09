// sw.js

let wsConnection = null;
let reconnectTimer = null;
const MAX_RECONNECT_ATTEMPTS = 3;
let reconnectAttempts = 0;
let isTokenValid = false;

class WSManager {
  static async connect(token) {
    this.disconnect();

    if (!token) {
      token = await this.getToken();
      if (!token) {
        console.warn('No token available, skipping WS connect');
        return;
      }
    }

    console.log('🔌 Connecting WS with token:', token);

    wsConnection = new WebSocket(`wss://api.postlyapp.com/subscriptions?token=${encodeURIComponent(token)}`);

    wsConnection.onopen = () => {
      console.log('✅ WS connected');
      reconnectAttempts = 0;
      isTokenValid = true;
    };

    wsConnection.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (e) {
        console.error('WS message parse error:', e);
      }
    };

    wsConnection.onclose = (event) => {
      console.warn(`WS closed: ${event.code} ${event.reason}`);
      this.handleClose(event);
    };

    wsConnection.onerror = (error) => {
      console.error('WS error:', error);
      this.disconnect();
      this.scheduleReconnect();
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
    return new Promise((resolve, reject) => {
      const dbRequest = indexedDB.open("postr_auth_db", 2); // ✅ Use correct version!

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
  }

  static handleClose(event) {
    if (event.code === 1000) {
      console.log('Normal WS close, not reconnecting.');
      return;
    }
    if (!isTokenValid) {
      console.warn('Token invalid, not reconnecting.');
      return;
    }
    this.scheduleReconnect();
  }

  static scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('Max reconnect attempts reached.');
      return;
    }

    reconnectAttempts++;
    const delay = reconnectAttempts * 2000;
    console.log(`⏳ Scheduling reconnect in ${delay}ms...`);

    reconnectTimer = setTimeout(async () => {
      const token = await this.getToken().catch(() => null);
      if (token) {
        this.connect(token);
      }
    }, delay);
  }

  static handleMessage(data) {
    if (data.type === 'INVALID_TOKEN') {
      console.warn('Received INVALID_TOKEN');
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

// SW lifecycle events

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const token = await WSManager.getToken().catch(() => null);
      if (token) {
        await WSManager.connect(token);
      }
      self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'reconnect') {
    event.waitUntil(WSManager.connect(event.data.token));
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
