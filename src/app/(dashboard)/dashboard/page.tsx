import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookA, ListOrdered, DollarSign, Menu, Users, Frame, ArrowRight } from "lucide-react";

export default function Page() {
  const navMain = [
    {
      title: "New Order",
      url: "/dashboard/new-order",
      icon: BookA,
      description: "Create and submit a new order",
      isActive: true,
    },
    {
      title: "All Orders",
      url: "/dashboard/all-orders",
      icon: ListOrdered,
      description: "View and manage all orders",
    },
    {
      title: "Menu Prices",
      url: "/dashboard/menu-prices",
      icon: DollarSign,
      description: "Check current menu pricing",
    },
    {
      title: "Menu",
      url: "/dashboard/menu",
      icon: Menu,
      description: "Manage menu items and categories",
      requiresAdmin: true,
    },
    {
      title: "Users Management",
      url: "/dashboard/users-management",
      icon: Users,
      description: "Administer user accounts and permissions",
      requiresAdmin: true,
    },
  ];

  const projects = [
    {
      name: "Place New Order (Guest)",
      url: "/place-new-order",
      icon: Frame,
      description: "Quick order placement without login",
    },
  ];

  return (
    <div>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1 hidden sm:flex" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="block">
                <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-8 p-4 pt-0">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-muted-foreground">
            Quick access to your dashboard features
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Main Navigation
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {navMain.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.title}
                    href={item.url}
                    className="group"
                  >
                    <Card className="transition-all hover:shadow-md hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-base flex items-center gap-2">
                                {item.title}
                                {item.requiresAdmin && (
                                  <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                                    Admin
                                  </span>
                                )}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {item.description}
                              </CardDescription>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardHeader>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Quick Actions
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.name}
                    href={item.url}
                    className="group"
                  >
                    <Card className="transition-all hover:shadow-md hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Icon className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                              <CardTitle className="text-base">
                                {item.name}
                              </CardTitle>
                              <CardDescription className="text-xs">
                                {item.description}
                              </CardDescription>
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardHeader>
                    </Card>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}