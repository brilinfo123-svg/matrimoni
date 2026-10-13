
import type { Metadata } from "next";

import Providers from "@/components/Providers";
import LayoutShell from "@/components//LayoutShell/LayoutShell";
import NotificationPrompt from "@/components/NotificationPrompt/NotificationPrompt";
import {
  MessageNotificationProvider,
} from "@/components/MessageNotificationProvider/MessageNotificationProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Matrimonial",
  description: "Find your meaningful connection.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <MessageNotificationProvider>
            <LayoutShell>
              {children}
            </LayoutShell>
          </MessageNotificationProvider>

          <NotificationPrompt />
        </Providers>
      </body>
    </html>
  );
}
