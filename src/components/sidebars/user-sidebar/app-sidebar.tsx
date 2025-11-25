"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import {
  BookOpen,
  Bot,
  Frame,
  GalleryVerticalEnd,
  Map,
  MenuSquare,
  PieChart,
  Settings2,
} from "lucide-react"

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

// Sidebar static data
const sidebarData = {
  teams: {
    name: "Hooka4u",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  navMain: [
    {
      title: "Order Taking",
      url: "#",
      icon: MenuSquare,
      isActive: true,
      items: [
        { title: "New Order", url: "/user-dashboard/new-order" },
        { title: "Edit Order", url: "/user-dashboard/edit-order" },
        { title: "Delete Orders", url: "/user-dashboard/delete-orders" },
        { title: "All Orders", url: "/user-dashboard/all-orders" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        { title: "Genesis", url: "#" },
        { title: "Explorer", url: "#" },
        { title: "Quantum", url: "#" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        { title: "Introduction", url: "#" },
        { title: "Get Started", url: "#" },
        { title: "Tutorials", url: "#" },
        { title: "Changelog", url: "#" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        { title: "General", url: "#" },
        { title: "Team", url: "#" },
        { title: "Billing", url: "#" },
        { title: "Limits", url: "#" },
      ],
    },
  ],
  projects: [
    { name: "Design Engineering", url: "#", icon: Frame },
    { name: "Sales & Marketing", url: "#", icon: PieChart },
    { name: "Travel", url: "#", icon: Map },
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

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher team={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
        <NavProjects projects={sidebarData.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
