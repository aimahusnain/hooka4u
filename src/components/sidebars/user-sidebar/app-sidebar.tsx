"use client"

import {
  Bot,
  Frame,
  GalleryVerticalEnd,
  MenuSquare
} from "lucide-react"
import { useSession } from "next-auth/react"
import * as React from "react"

import { NavMain } from "@/components/sidebars/user-sidebar/nav-main"
import { NavProjects } from "@/components/sidebars/user-sidebar/nav-projects"
import { NavUser } from "@/components/sidebars/user-sidebar/nav-user"
import { TeamSwitcher } from "@/components/sidebars/user-sidebar/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import ThemeButton from "@/components/ThemeButton"

// Sidebar static data
const sidebarData = {
  teams: {
    name: "Hooka4u",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  navMain: [
    {
      title: "Order Tracking",
      url: "#",
      icon: MenuSquare,
      isActive: true,
      items: [
        { title: "New Order", url: "/user-dashboard/new-order" },
        { title: "All Orders", url: "/user-dashboard/all-orders" },
        { title: "Menu Prices", url: "/user-dashboard/menu-prices" },
      ],
    },
    {
      title: "Admin",
      url: "#",
      icon: Bot,
      requiresAdmin: true,
      items: [
        { title: "Menu", url: "/user-dashboard/menu" },
        { title: "Users Management", url: "/user-dashboard/users-management" },
      ],
    }
  ],
  projects: [
    { name: "Place New Order (Guest)", url: "/place-new-order", icon: Frame },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()

  // Map NextAuth user to NavUser props
  const user = session?.user
    ? {
        name: session.user.name ?? "Guest",
        email: session.user.username ?? "", // fallback if email not available
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
      // If the item requires admin access, only show it to admins
      if (item.requiresAdmin) {
        return userRole === "ADMIN"
      }
      // Show all other items to everyone
      return true
    })
  }, [session?.user?.role])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
        <NavProjects projects={sidebarData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeButton />
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}