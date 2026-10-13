
"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isMessagesPage = pathname.startsWith("/messages");

  return (
    <>
      {!isMessagesPage && <Header />}

      {children}

      {!isMessagesPage && <Footer />}
    </>
  );
}
