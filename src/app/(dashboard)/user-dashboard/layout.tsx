import { AppSidebar } from "@/components/sidebars/user-sidebar/app-sidebar";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";
import type { Metadata } from "next";
import "../../globals.css";

export const metadata: Metadata = {
  title: "Hooka4u User Dashboard - Your Hookah, Your Way",
  description: "Hooka4u User Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider className="bg-blue-400">
          <AppSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}
