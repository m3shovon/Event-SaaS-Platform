"use client"

import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  Heart,
  Building,
  Briefcase,
  PartyPopper,
  Eye,
  Edit,
  MoreHorizontal,
  Plus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchEvents } from "@/store/slices/eventSlice"
import { fetchBudgetItems } from "@/store/slices/budgetSlice"
import { fetchGuests } from "@/store/slices/guestSlice"
import { fetchVendors } from "@/store/slices/vendorSlice"
import Link from "next/link"
import { toast } from "sonner"

const categoryIcons = {
  wedding: Heart,
  corporate: Briefcase,
  community: Building,
  social: PartyPopper,
}

const categoryColors = {
  wedding: "bg-pink-500",
  corporate: "bg-blue-500",
  community: "bg-green-500",
  social: "bg-purple-500",
}

export default function AdminDashboardClient() {
  const dispatch = useDispatch()
  const { events, isLoading: eventsLoading } = useSelector((state: any) => state.events)
  const { budgetItems } = useSelector((state: any) => state.budget)
  const { guests } = useSelector((state: any) => state.guests)
  const { vendors } = useSelector((state: any) => state.vendors)

  useEffect(() => {
    const loadData = async () => {
      try {
        await dispatch(fetchEvents()).unwrap()
        await dispatch(fetchBudgetItems()).unwrap()
        await dispatch(fetchGuests()).unwrap()
        await dispatch(fetchVendors()).unwrap()
      } catch (error) {
        toast.error("Failed to load dashboard data")
      }
    }
    loadData()
  }, [dispatch])

  // Calculate stats from real data
  const totalBudget = budgetItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.estimated_cost), 0)
  const totalSpent = budgetItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.actual_cost), 0)
  const totalGuests = guests.length
  const confirmedGuests = guests.filter((guest: any) => guest.rsvp_status === "confirmed").length
  const activeVendors = vendors.filter((vendor: any) => vendor.is_preferred).length

  const stats = [
    {
      title: "Total Events",
      value: events.length.toString(),
      change: "+12%",
      trend: "up",
      icon: Calendar,
      description: "from last month",
    },
    {
      title: "Total Budget",
      value: `৳${totalBudget.toLocaleString()}`,
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      description: "estimated cost",
    },
    {
      title: "Total Guests",
      value: totalGuests.toString(),
      change: "+7%",
      trend: "up",
      icon: Users,
      description: `${confirmedGuests} confirmed`,
    },
    {
      title: "Active Vendors",
      value: activeVendors.toString(),
      change: "-2%",
      trend: "down",
      icon: TrendingUp,
      description: "preferred vendors",
    },
  ]

  if (eventsLoading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
          <p className="text-muted-foreground">Here's what's happening with your events today.</p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stat.trend === "up" ? (
                    <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  )}
                  <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                  <span className="ml-1">{stat.description}</span>
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Your latest event activities and progress</CardDescription>
            </div>
            <Link href="/admin/events">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first event to get started</p>
              <Link href="/admin/events/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {events.slice(0, 5).map((event: any) => {
                const IconComponent = categoryIcons[event.category as keyof typeof categoryIcons] || Calendar
                const colorClass = categoryColors[event.category as keyof typeof categoryColors] || "bg-gray-500"
                const eventBudgetItems = budgetItems.filter((item: any) => item.event === event.id)
                const eventBudget = eventBudgetItems.reduce(
                  (sum: number, item: any) => sum + Number.parseFloat(item.estimated_cost),
                  0,
                )
                const eventSpent = eventBudgetItems.reduce(
                  (sum: number, item: any) => sum + Number.parseFloat(item.actual_cost),
                  0,
                )
                const budgetPercentage = eventBudget > 0 ? (eventSpent / eventBudget) * 100 : 0

                return (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`w-10 h-10 ${colorClass} rounded-lg flex items-center justify-center`}>
                      <IconComponent className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">{event.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={
                              event.status === "confirmed"
                                ? "default"
                                : event.status === "active"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {event.status === "confirmed" && <CheckCircle className="w-3 h-3 mr-1" />}
                            {event.status === "planning" && <Clock className="w-3 h-3 mr-1" />}
                            {event.status === "active" && <AlertTriangle className="w-3 h-3 mr-1" />}
                            {event.status}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}`}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/events/${event.id}/edit`}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Event
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </div>
                        <div>
                          <Users className="w-4 h-4 inline mr-1" />
                          {event.expected_guests} guests
                        </div>
                        <div>
                          <DollarSign className="w-4 h-4 inline mr-1" />৳{eventSpent.toLocaleString()}
                        </div>
                      </div>

                      {eventBudget > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Budget Used: {budgetPercentage.toFixed(1)}%</span>
                            <span>
                              ৳{eventSpent.toLocaleString()} / ৳{eventBudget.toLocaleString()}
                            </span>
                          </div>
                          <Progress
                            value={budgetPercentage}
                            className={`h-2 ${budgetPercentage > 80 ? "bg-red-100" : "bg-green-100"}`}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/events">
            <CardHeader className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <CardTitle className="text-lg">Events</CardTitle>
              <CardDescription>Manage your events</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-blue-600">{events.length}</div>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/budget">
            <CardHeader className="text-center">
              <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <CardTitle className="text-lg">Budget</CardTitle>
              <CardDescription>Track expenses</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-green-600">৳{totalSpent.toLocaleString()}</div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/guests">
            <CardHeader className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <CardTitle className="text-lg">Guests</CardTitle>
              <CardDescription>Manage guest lists</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalGuests}</div>
              <p className="text-sm text-muted-foreground">Total Guests</p>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link href="/admin/vendors">
            <CardHeader className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <CardTitle className="text-lg">Vendors</CardTitle>
              <CardDescription>Manage vendors</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-orange-600">{vendors.length}</div>
              <p className="text-sm text-muted-foreground">Total Vendors</p>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  )
}
