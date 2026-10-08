import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;
let tokenPromise: Promise<string | null> | null = null;

async function getSocketToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/socket-token", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok || !data?.success || !data?.token) {
      console.error(
        "SOCKET TOKEN ERROR:",
        data?.message || "Socket token not received",
      );

      return null;
    }

    return data.token;
  } catch (error) {
    console.error("SOCKET TOKEN FETCH ERROR:", error);
    return null;
  }
}

function loadSocketToken(): Promise<string | null> {
  if (!tokenPromise) {
    tokenPromise = getSocketToken();
  }

  return tokenPromise;
}

export function getSocket(): Socket {
  if (!socket) {
    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      "http://localhost:10000";

    socket = io(socketUrl, {
      path: "/socket.io",

      transports: ["websocket", "polling"],

      withCredentials: true,

      autoConnect: false,

      timeout: 10000,
    });

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Get JWT and then connect
    loadSocketToken().then((token) => {
      if (!socket || !token) {
        return;
      }

      socket.auth = {
        token,
      };

      socket.connect();
    });
  }

  return socket;
}

export function refreshSocketToken(): void {
  tokenPromise = null;

  if (!socket) {
    return;
  }

  getSocketToken().then((token) => {
    if (!socket || !token) {
      return;
    }

    socket.auth = {
      token,
    };

    if (socket.connected) {
      socket.disconnect();
    }

    socket.connect();
  });
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  tokenPromise = null;
}






// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;

// export function getSocket(): Socket {
//   if (!socket) {
//     socket = io(
//       process.env.NEXT_PUBLIC_SOCKET_URL ||
//         "http://localhost:3000",
//       {
//         path: "/socket.io",

//         transports: [
//           "websocket",
//           "polling",
//         ],

//         withCredentials: true,

//         autoConnect: true,
//       },
//     );
//   }

//   return socket;
// }









// import { io, Socket } from "socket.io-client";

// let socket: Socket | null = null;

// export function getSocket() {
//   if (!socket) {
//     socket = io(
//       process.env.NEXT_PUBLIC_SOCKET_URL ||
//         "http://localhost:3001",
//       {
//         transports: ["websocket"],
//         withCredentials: true,
//         autoConnect: true,
//       },
//     );
//   }

//   return socket;
// }

