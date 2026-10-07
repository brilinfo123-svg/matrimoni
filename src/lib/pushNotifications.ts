/* -------------------------------------------------------
   BASE64URL → ARRAY BUFFER
------------------------------------------------------- */

function urlBase64ToArrayBuffer(
  base64String: string,
): ArrayBuffer {
  const padding = "=".repeat(
    (4 - (base64String.length % 4)) % 4,
  );

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const buffer = new ArrayBuffer(rawData.length);
  const bytes = new Uint8Array(buffer);

  for (let index = 0; index < rawData.length; index++) {
    bytes[index] = rawData.charCodeAt(index);
  }

  return buffer;
}

/* -------------------------------------------------------
   DISABLE PUSH NOTIFICATIONS
------------------------------------------------------- */

export async function disablePushNotifications() {
  try {
    if (!("serviceWorker" in navigator)) {
      return false;
    }

    const registration =
      await navigator.serviceWorker.getRegistration("/");

    if (!registration) {
      return true;
    }

    const subscription =
      await registration.pushManager.getSubscription();

    if (!subscription) {
      return true;
    }

    const response = await fetch(
      "/api/push/unsubscribe",
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      },
    );

    if (!response.ok) {
      console.error(
        "Failed to remove push subscription from server.",
      );

      return false;
    }

    await subscription.unsubscribe();

    console.log(
      "Push notifications disabled.",
    );

    return true;
  } catch (error) {
    console.error(
      "PUSH_DISABLE_ERROR:",
      error,
    );

    return false;
  }
}

/* -------------------------------------------------------
   REGISTER / ENABLE PUSH NOTIFICATIONS
------------------------------------------------------- */

export async function registerPushNotifications() {
  /* -----------------------------------------------------
     BROWSER SUPPORT CHECK
  ----------------------------------------------------- */

  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    console.warn(
      "Push notifications are not supported.",
    );

    return false;
  }

  /* -----------------------------------------------------
     VAPID PUBLIC KEY
  ----------------------------------------------------- */

  const publicKey =
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  if (!publicKey) {
    console.error(
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY is missing.",
    );

    return false;
  }

  try {
    /* ---------------------------------------------------
       REGISTER SERVICE WORKER
    --------------------------------------------------- */

    console.log(
      "Registering Matrimonial Service Worker...",
    );

    const registration =
      await navigator.serviceWorker.register(
        "/sw.js",
        {
          scope: "/",
        },
      );

    console.log(
      "Matrimonial SW registration:",
      registration,
    );

    /* ---------------------------------------------------
       WAIT FOR SERVICE WORKER
    --------------------------------------------------- */

    await navigator.serviceWorker.ready;

    console.log(
      "Matrimonial SW ready:",
      registration.active?.scriptURL,
    );

    /* ---------------------------------------------------
       NOTIFICATION PERMISSION
    --------------------------------------------------- */

    let permission =
      Notification.permission;

    if (permission === "default") {
      permission =
        await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn(
        "Notification permission was not granted.",
      );

      return false;
    }

    /* ---------------------------------------------------
       GET EXISTING PUSH SUBSCRIPTION
    --------------------------------------------------- */

    let subscription =
      await registration.pushManager.getSubscription();

    /* ---------------------------------------------------
       CREATE NEW PUSH SUBSCRIPTION
    --------------------------------------------------- */

    if (!subscription) {
      subscription =
        await registration.pushManager.subscribe({
          userVisibleOnly: true,

          applicationServerKey:
            urlBase64ToArrayBuffer(publicKey),
        });
    }

    /* ---------------------------------------------------
       SAVE SUBSCRIPTION TO SERVER
    --------------------------------------------------- */

    const response = await fetch(
      "/api/push/subscribe",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(
          subscription.toJSON(),
        ),
      },
    );

    if (!response.ok) {
      console.error(
        "Failed to save push subscription.",
      );

      return false;
    }

    /* ---------------------------------------------------
       SUCCESS
    --------------------------------------------------- */

    console.log(
      "Push notifications enabled successfully.",
    );

    return true;
  } catch (error) {
    console.error(
      "PUSH_REGISTRATION_ERROR:",
      error,
    );

    return false;
  }
}
