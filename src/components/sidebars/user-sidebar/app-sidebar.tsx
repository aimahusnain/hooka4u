"use client"

import { BookA, Bot, DollarSign, Frame, GalleryVerticalEnd, ListOrdered, Menu, MenuSquare, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import * as React from "react"
import { NavMain } from "@/components/sidebars/user-sidebar/nav-main"
import { HomepageQR } from "@/components/sidebars/user-sidebar/nav-projects"
import { NavUser } from "@/components/sidebars/user-sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebars/user-sidebar/team-switcher"
import { MobileBottomNav } from "@/components/sidebars/user-sidebar/mobile-bottom-nav"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile"

// Sidebar static data
const sidebarData = {
  teams: {
    name: "VIPService4U",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  navMain: [
    {
      title: "New Order",
      url: "/user-dashboard/new-order",
      icon: BookA,
      isActive: true,
    },
    {
      title: "All Orders",
      url: "/user-dashboard/all-orders",
      icon: ListOrdered,
    },
    {
      title: "Menu Prices",
      url: "/user-dashboard/menu-prices",
      icon: DollarSign,
    },
    {
      title: "Menu",
      url: "/user-dashboard/menu",
      icon: Menu,
      requiresAdmin: true,
    },
    {
      title: "Users Management",
      url: "/user-dashboard/users-management",
      icon: Users,
      requiresAdmin: true,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const isMobile = useIsMobile()

  // Map NextAuth user to NavUser props
  const user = session?.user
    ? {
        name: session.user.name ?? "Guest",
        email: session.user.username ?? "",
        avatar: session.user.image ?? "/avatars/default.jpg",
      }
    : {
        name: "Guest",
        email: "",
        avatar: "/avatars/default.jpg",
      }

  // Filter navigation items based on user role
  const filteredNavMain = React.useMemo(() => {
    const userRole = session?.user?.role
    return sidebarData.navMain.filter((item) => {
      if (item.requiresAdmin) {
        return userRole === "ADMIN"
      }
      return true
    })
  }, [session?.user?.role])

  if (isMobile) {
    return (
      <>
        <MobileBottomNav items={filteredNavMain} />
        {/* Add padding to main content to avoid overlap with bottom nav */}
        <div className="pb-20" />
      </>
    )
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <HomepageQR/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
