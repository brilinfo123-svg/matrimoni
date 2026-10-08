import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL ||
        "http://localhost:3000",
      {
        path: "/socket.io",

        transports: [
          "websocket",
          "polling",
        ],

        withCredentials: true,

        autoConnect: true,
      },
    );
  }

  return socket;
}

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

