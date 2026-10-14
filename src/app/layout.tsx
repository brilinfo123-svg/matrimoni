
import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";

import Providers from "@/components/Providers";
import LayoutShell from "@/components/LayoutShell/LayoutShell";
import NotificationPrompt from "@/components/NotificationPrompt/NotificationPrompt";
import { FavoritesProvider } from "@/components/FavoritesProvider/FavoritesProvider";
import {
  MessageNotificationProvider,
} from "@/components/MessageNotificationProvider/MessageNotificationProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "EverMilan",
  description: "Find your meaningful connection.",
  applicationName: "EverMilan",
  manifest: "/manifest.webmanifest",

  appleWebApp: {
    capable: true,
    title: "EverMilan",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#a83268",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <FavoritesProvider>
          <Providers>
            <MessageNotificationProvider>
              <LayoutShell>
                {children}
              </LayoutShell>
            </MessageNotificationProvider>

            <NotificationPrompt />
          </Providers>
        </FavoritesProvider>

        <Toaster
          position="top-right"
          richColors
          closeButton
        />
      </body>
    </html>
  );
}
