import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export async function getSocket(): Promise<Socket | null> {
  // Already connected/created
  if (socket) {
    return socket;
  }

  try {
    // Get short-lived socket JWT from your Next.js server
    const tokenResponse = await fetch("/api/auth/socket-token", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    const tokenData = await tokenResponse.json();

    if (
      !tokenResponse.ok ||
      !tokenData?.success ||
      !tokenData?.token
    ) {
      console.error(
        "SOCKET TOKEN ERROR:",
        tokenData?.message || "Socket token not received",
      );

      return null;
    }

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      "http://localhost:10000";

    socket = io(socketUrl, {
      path: "/socket.io",

      auth: {
        token: tokenData.token,
      },

      transports: ["websocket", "polling"],

      withCredentials: true,

      autoConnect: true,

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

    return socket;
  } catch (error) {
    console.error("SOCKET INITIALIZATION ERROR:", error);

    socket = null;

    return null;
  }
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
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

