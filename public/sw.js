self.addEventListener("push", function (event) {
  if (!event.data) {
    return;
  }

  let data = {};

  try {
    data = event.data.json();
  } catch (error) {
    data = {
      title: "New Message",
      body: event.data.text(),
    };
  }

  /*
   * Sender name
   *
   * Backend will send:
   *
   * senderName: "Ananya Sharma"
   *
   * Fallback is used if senderName is missing.
   */
  const senderName =
    data.senderName || "Someone";

  /*
   * Notification title
   *
   * If backend sends a custom title,
   * use it.
   *
   * Otherwise create title using sender name.
   */
  const title =
    data.title ||
    `${senderName} sent you a message`;

  const options = {
    body:
      data.body ||
      "You have a new message.",

    icon:
      data.icon ||
      "/icons/icon-192.png",

    badge:
      data.badge ||
      "/icons/icon-192.png",

    /*
     * Every message gets a unique tag.
     *
     * This prevents different messages from
     * replacing each other.
     */
    tag:
      data.tag ||
      `matrimonial-message-${Date.now()}`,

    renotify: true,

    requireInteraction: false,

    /*
     * Extra information available when
     * notification is clicked.
     */
    data: {
      url:
        data.url ||
        "/messages",

      conversationId:
        data.conversationId ||
        null,

      senderId:
        data.senderId ||
        null,

      senderName:
        senderName,
    },

    actions: [
      {
        action: "open",
        title: "Open Message",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      title,
      options,
    ),
  );
});


/* =====================================================
   NOTIFICATION CLICK
===================================================== */

self.addEventListener(
  "notificationclick",
  function (event) {
    event.notification.close();

    const notificationData =
      event.notification.data || {};

    const url =
      notificationData.url ||
      "/messages";

    event.waitUntil(
      clients
        .matchAll({
          type: "window",
          includeUncontrolled: true,
        })
        .then(function (clientList) {
          /*
           * If website is already open,
           * navigate existing tab and focus it.
           */
          for (const client of clientList) {
            if ("focus" in client) {
              client.navigate(url);

              return client.focus();
            }
          }

          /*
           * Otherwise open a new window/tab.
           */
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        }),
    );
  },
);
