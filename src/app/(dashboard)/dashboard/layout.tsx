import { AppSidebar } from "@/components/sidebars/user-sidebar/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { Metadata } from "next";
import "../../globals.css";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "VIPService4U User Dashboard - Your Hookah, Your Way",
  description: "VIPService4U User Dashboard",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "false";

  return (
      <>
        {/* <ThemeContextProvider> */}
          <SidebarProvider defaultOpen={defaultOpen} className="bg-lime-500/50">
            <AppSidebar />
            <SidebarInset>{children}</SidebarInset>
          </SidebarProvider>
        {/* </ThemeContextProvider> */}
      </>
  );
}
