import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:3000",
      {
        path: "/socket.io",

        auth: (callback) => {
          fetch("/api/auth/socket-token", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          })
            .then(async (response) => {
              const data = await response.json();

              if (!response.ok || !data?.token) {
                throw new Error(
                  data?.message || "Socket token unavailable",
                );
              }

              callback({ token: data.token });
            })
            .catch((error) => {
              console.error("Socket token error:", error);
              callback({});
            });
        },

        transports: ["websocket", "polling"],
        withCredentials: true,
        autoConnect: true,
        timeout: 10000,
      },
    );

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
  }

  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
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

