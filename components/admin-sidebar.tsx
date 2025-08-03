"use client"

import type * as React from "react"
import {
  Calendar,
  DollarSign,
  Users,
  MapPin,
  BarChart3,
  Settings,
  User,
  CreditCard,
  Bell,
  FileText,
  Home,
  Plus,
  Heart,
  Building,
  Briefcase,
  PartyPopper,
  ChevronRight,
  LogOut,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"

const data = {
  user: {
    name: "John Doe",
    email: "john@eventflow.com",
    avatar: "/placeholder-user.jpg",
    plan: "Pro Plan",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Events",
      url: "/admin/events",
      icon: Calendar,
      badge: "12",
      items: [
        {
          title: "All Events",
          url: "/admin/events",
        },
        {
          title: "Wedding Events",
          url: "/admin/events/wedding",
          icon: Heart,
        },
        {
          title: "Community Events",
          url: "/admin/events/community",
          icon: Building,
        },
        {
          title: "Corporate Events",
          url: "/admin/events/corporate",
          icon: Briefcase,
        },
        {
          title: "Social Events",
          url: "/admin/events/social",
          icon: PartyPopper,
        },
      ],
    },
    {
      title: "Budget Management",
      url: "/admin/budget",
      icon: DollarSign,
      items: [
        {
          title: "Budget Overview",
          url: "/admin/budget",
        },
        {
          title: "Expense Tracking",
          url: "/admin/budget/expenses",
        },
        {
          title: "Payment Schedule",
          url: "/admin/budget/payments",
        },
        {
          title: "Financial Reports",
          url: "/admin/budget/reports",
        },
      ],
    },
    {
      title: "Guest Management",
      url: "/admin/guests",
      icon: Users,
      items: [
        {
          title: "Guest Lists",
          url: "/admin/guests",
        },
        {
          title: "RSVP Tracking",
          url: "/admin/guests/rsvp",
        },
        {
          title: "Invitations",
          url: "/admin/guests/invitations",
        },
        {
          title: "Check-in System",
          url: "/admin/guests/checkin",
        },
      ],
    },
    {
      title: "Vendor Management",
      url: "/admin/vendors",
      icon: MapPin,
      items: [
        {
          title: "Vendor Directory",
          url: "/admin/vendors",
        },
        {
          title: "Contracts",
          url: "/admin/vendors/contracts",
        },
        {
          title: "Reviews & Ratings",
          url: "/admin/vendors/reviews",
        },
        {
          title: "Payment Tracking",
          url: "/admin/vendors/payments",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: FileText,
    },
    {
      title: "Notifications",
      url: "/admin/notifications",
      icon: Bell,
      badge: "3",
    },
  ],
  navSettings: [
    {
      title: "Profile Settings",
      url: "/admin/profile",
      icon: User,
    },
    {
      title: "Billing & Plans",
      url: "/admin/billing",
      icon: CreditCard,
    },
    {
      title: "General Settings",
      url: "/admin/settings",
      icon: Settings,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-sidebar-primary-foreground">
                  <Calendar className="size-4 text-white" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">EventFlow</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">{data.user.plan}</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navMain.map((item) => (
                <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={item.isActive}>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                        {item.items && (
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        )}
                      </a>
                    </SidebarMenuButton>
                    {item.items?.length ? (
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild>
                                <a href={subItem.url}>
                                  {subItem.icon && <subItem.icon className="w-4 h-4" />}
                                  <span>{subItem.title}</span>
                                </a>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    ) : null}
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/admin/events/new">
                    <Plus />
                    <span>New Event</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Analytics & Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSecondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navSettings.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={data.user.avatar || "/placeholder.svg"} alt={data.user.name} />
                    <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{data.user.name}</span>
                    <span className="truncate text-xs">{data.user.email}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage src={data.user.avatar || "/placeholder.svg"} alt={data.user.name} />
                      <AvatarFallback className="rounded-lg">JD</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">{data.user.name}</span>
                      <span className="truncate text-xs">{data.user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
