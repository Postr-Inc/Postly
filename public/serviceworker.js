// Service Worker code

let wsConnection = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("postr_auth_db", 1);

    dbRequest.onerror = (event) => {
      console.error("Failed to open DB", event);
      reject("Failed to open DB");
    };

    dbRequest.onsuccess = (event) => {
      const db = dbRequest.result;
      const tx = db.transaction("auth", "readonly");
      const store = tx.objectStore("auth");
      const getRequest = store.get("token");

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        db.close();
        resolve(result?.token);
      };

      getRequest.onerror = () => {
        console.error("Failed to read token");
        db.close();
        reject("Failed to read token");
      };

      tx.onerror = () => {
        console.error("Transaction error");
        db.close();
        reject("Transaction failed");
      };
    };
  });
}

async function openWs(token) {
  // Close existing connection if it exists
  if (wsConnection) {
    wsConnection.close();
    wsConnection = null;
  }

  try {
    if (!token) {
      token = await getAuthToken();
    }

    if (!token) {
      console.error("No auth token found!");
      return;
    }

    wsConnection = new WebSocket(`ws://localhost:8080/subscriptions?token=${encodeURIComponent(token)}`);

    wsConnection.onopen = () => {
      console.log("✅ WS connected in SW");
      reconnectAttempts = 0; // Reset on successful connection
    };

    wsConnection.onmessage = (event) => {
      try {
        const { notification_data, type } = JSON.parse(event.data);

        switch (type) {
          case "notify":
            const { url, post, author, notification_body, notification_title, icon, image } = notification_data;

            self.registration.showNotification(notification_title, {
              body: notification_body,
              icon,
              image,
              badge: icon,
              data: { url },
              actions: [
                { action: 'open_url', title: 'Open Site' },
              ],
            });
            break;

          case "INVALID_TOKEN":
            console.warn("Token invalid, closing WS");
            wsConnection?.close();
            break;
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    wsConnection.onclose = (event) => {
      console.warn("WS closed:", event.code, event.reason);

      // If normal close, do not reconnect
      if (event.code === 1000) return;

      // Exponential backoff for reconnection
      const delay = Math.min(2000 * Math.pow(2, reconnectAttempts), 30000); // Max 30s delay
      reconnectAttempts++;

      if (reconnectAttempts <= MAX_RECONNECT_ATTEMPTS) {
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`);
        setTimeout(() => openWs(), delay);
      } else {
        console.error("Max reconnection attempts reached");
      }
    };

    wsConnection.onerror = (err) => {
      console.error("WS error:", err);
      wsConnection?.close();
    };

  } catch (error) {
    console.error("Error in openWs:", error);
  }
}

self.addEventListener("activate", (e) => {
  e.waitUntil(openWs());
});

self.addEventListener("message", (e) => {
  const { type, token } = e.data;
  if (type === "reconnect") {
    console.log("Received reconnect message");
    openWs(token);
  }
});

self.addEventListener('notificationclick', (event) => {
  const { url } = event.notification.data;
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
