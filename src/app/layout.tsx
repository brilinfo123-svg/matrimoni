import type { Metadata } from "next";
import { headers } from "next/headers";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";
import NotificationPrompt from "@/components/NotificationPrompt/NotificationPrompt";
import { MessageNotificationProvider } from "@/components/MessageNotificationProvider/MessageNotificationProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "Matrimonial",
  description: "Find your meaningful connection.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Messages page par Header/Footer hide
  const isMessagesPage = pathname.startsWith("/messages");

  // Auth pages par notification popup hide
  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password");

  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <Providers>
          <MessageNotificationProvider>
            {!isMessagesPage && <Header />}

            {children}

            {!isMessagesPage && <Footer />}
          </MessageNotificationProvider>

          {!isAuthPage && <NotificationPrompt />}
        </Providers>
      </body>
    </html>
  );
}
