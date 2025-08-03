"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Calendar,
  DollarSign,
  Users,
  MapPin,
  Plus,
  Bell,
  Settings,
  Heart,
  Building,
  Briefcase,
  PartyPopper,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { fetchEvents } from "@/store/slices/eventSlice"
import { fetchBudgetItems } from "@/store/slices/budgetSlice"
import { fetchGuests } from "@/store/slices/guestSlice"
import { fetchVendors } from "@/store/slices/vendorSlice"
import { toast } from "sonner"

const categoryIcons = {
  wedding: Heart,
  community: Building,
  corporate: Briefcase,
  social: PartyPopper,
}

const categoryNames = {
  wedding: "Wedding Planning",
  community: "Community Management",
  corporate: "Corporate Events",
  social: "Social Events",
}

export default function DashboardClient() {
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "all")

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

  const filteredEvents =
    selectedCategory === "all" ? events : events.filter((event: any) => event.category === selectedCategory)

  const totalBudget = budgetItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.estimated_cost), 0)
  const totalSpent = budgetItems.reduce((sum: number, item: any) => sum + Number.parseFloat(item.actual_cost), 0)
  const totalGuests = guests.length

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">EventFlow</h1>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
          <p className="text-slate-600">Here's what's happening with your events</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 inline mr-1" />
                Active events
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{totalBudget.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">৳{totalSpent.toLocaleString()} spent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGuests}</div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendors</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vendors.length}</div>
              <p className="text-xs text-muted-foreground">Registered vendors</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="grid w-full sm:w-auto grid-cols-4">
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
              <TabsTrigger value="guests">Guests</TabsTrigger>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
            </TabsList>
            <Link href="/admin/events/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </Link>
          </div>

          <TabsContent value="events" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All Events
              </Button>
              {Object.entries(categoryNames).map(([key, name]) => {
                const IconComponent = categoryIcons[key as keyof typeof categoryIcons]
                return (
                  <Button
                    key={key}
                    variant={selectedCategory === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(key)}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {name}
                  </Button>
                )
              })}
            </div>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first event to get started</p>
                  <Link href="/admin/events/new">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event: any) => {
                  const IconComponent = categoryIcons[event.category as keyof typeof categoryIcons] || Calendar
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
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                            <Badge variant="secondary" className="text-xs capitalize">
                              {event.category}
                            </Badge>
                          </div>
                          <Badge variant={event.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                            {event.status === "confirmed" ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <Clock className="w-3 h-3 mr-1" />
                            )}
                            {event.status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{event.name}</CardTitle>
                        <CardDescription className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(event.date).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {eventBudget > 0 && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Budget Used</span>
                              <span className={budgetPercentage > 80 ? "text-red-600" : "text-green-600"}>
                                {budgetPercentage.toFixed(1)}%
                              </span>
                            </div>
                            <Progress value={budgetPercentage} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>৳{eventSpent.toLocaleString()}</span>
                              <span>৳{eventBudget.toLocaleString()}</span>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Users className="w-4 h-4 mr-1" />
                            {event.expected_guests} guests
                          </div>
                          <Link href={`/admin/events/${event.id}`}>
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="budget" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Budget Overview</CardTitle>
                    <CardDescription>Track your spending across all events</CardDescription>
                  </div>
                  <Link href="/admin/budget">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {budgetItems.length === 0 ? (
                  <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Budget Items Yet</h3>
                    <p className="text-muted-foreground">Add budget items to track your expenses</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold">৳{totalBudget.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Budget</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">৳{totalSpent.toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Total Spent</p>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">৳{(totalBudget - totalSpent).toLocaleString()}</div>
                        <p className="text-sm text-muted-foreground">Remaining</p>
                      </div>
                    </div>
                    <Progress value={totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0} className="h-3" />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Guest Management</CardTitle>
                    <CardDescription>Manage invitations and RSVPs</CardDescription>
                  </div>
                  <Link href="/admin/guests">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {guests.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Guests Yet</h3>
                    <p className="text-muted-foreground">Add guests to start managing invitations</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{guests.length}</div>
                      <p className="text-sm text-muted-foreground">Total Guests</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {guests.filter((guest: any) => guest.rsvp_status === "confirmed").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Confirmed</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {guests.filter((guest: any) => guest.rsvp_status === "pending").length}
                      </div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {guests.filter((guest: any) => guest.checked_in).length}
                      </div>
                      <p className="text-sm text-muted-foreground">Checked In</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vendors" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vendor Management</CardTitle>
                    <CardDescription>Manage your event vendors and suppliers</CardDescription>
                  </div>
                  <Link href="/admin/vendors">
                    <Button variant="outline" size="sm">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {vendors.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Vendors Yet</h3>
                    <p className="text-muted-foreground">Add vendors to build your supplier network</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold">{vendors.length}</div>
                      <p className="text-sm text-muted-foreground">Total Vendors</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-red-500">
                        {vendors.filter((vendor: any) => vendor.is_preferred).length}
                      </div>
                      <p className="text-sm text-muted-foreground">Preferred</p>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-yellow-500">
                        {vendors.length > 0
                          ? (
                              vendors.reduce((sum: number, vendor: any) => sum + Number.parseFloat(vendor.rating), 0) /
                              vendors.length
                            ).toFixed(1)
                          : "0.0"}
                      </div>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
