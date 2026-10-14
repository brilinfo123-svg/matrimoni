
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Matrimonial",
    short_name: "Matrimonial",
    description: "Find your meaningful connection.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#a83268",
    icons: [
      {
        src: "/public/images/icons/EvermilanIcone.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/public/images/icons/everMial500.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
