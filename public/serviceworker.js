// Service Worker code


async function getAuthToken() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open("postr_auth_db", 1);

    dbRequest.onerror = (event) => reject("Failed to open DB");

    dbRequest.onsuccess = (event) => {
      const db = dbRequest.result;
      const tx = db.transaction("auth", "readonly");
      const store = tx.objectStore("auth");
      const getRequest = store.get("token");

      getRequest.onsuccess = () => {
        const result = getRequest.result;
        resolve(result?.token);
        db.close();
      };

      getRequest.onerror = () => reject("Failed to read token");
    };
  });
}



async function openWs() {
  const token = await getAuthToken();

  if (!token) {
    console.error("No auth token found!");
    return;
  }

  const ws = new WebSocket(`wss://api.postlyapp.com/subscriptions?token=${encodeURIComponent(token)}`);

  ws.onopen = () => console.log("✅ WS connected in SW");

  ws.onmessage = (event) => {
    const { notification_data, type } = JSON.parse(event.data);

    switch (type) {
      case "notify":
        const { url, post, author, notification_body, notification_title, icon, image } = notification_data;

        self.registration.showNotification(notification_title, {
          body: notification_body,
          icon,
          image,
          badge: icon,
          data: { url }, // ⚠️ Needed for click handler!
          actions: [
            { action: 'open_url', title: 'Open Site' },
          ],
        });
        break;

      case "INVALID_TOKEN":
        console.warn("Token invalid, closing WS");
        ws.close();
        break;
    }
  };

  ws.onclose = (event) => {
    console.warn("WS closed:", event.code, event.reason);

    // If normal close, do not reconnect.
    if (event.code === 1000) return;

    // Reconnect after short delay
    setTimeout(() => {
      openWs();
    }, 2000);
  };

  ws.onerror = (err) => {
    console.error("WS error:", err);
    ws.close();
  };
}

self.addEventListener("activate", (e) => {
  e.waitUntil(openWs())
})


self.addEventListener("message", (e) => {
  const { type } = e.data;
  if (type === "reconnect") {
    console.log("Received reconnect message");
    openWs();
  }
});

self.addEventListener('notificationclick', event => {
  const { url } = event.notification.data;
  event.notification.close();
  event.waitUntil(clients.openWindow(url));
});
