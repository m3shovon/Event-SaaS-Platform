"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
} from "lucide-react"
import { fetchEvents, deleteEvent } from "@/store/slices/eventSlice"
import { fetchBudgetItems } from "@/store/slices/budgetSlice"
import { fetchGuests } from "@/store/slices/guestSlice"
import { toast } from "sonner"
import Link from "next/link"

const statusColors = {
  planning: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  active: "bg-blue-100 text-blue-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusIcons = {
  planning: Clock,
  confirmed: CheckCircle,
  active: AlertTriangle,
  completed: CheckCircle,
  cancelled: AlertTriangle,
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const eventId = Number.parseInt(params.id as string)

  const { events, isLoading } = useSelector((state: any) => state.events)
  const { budgetItems } = useSelector((state: any) => state.budget)
  const { guests } = useSelector((state: any) => state.guests)

  const [event, setEvent] = useState(null)

  useEffect(() => {
    dispatch(fetchEvents())
    dispatch(fetchBudgetItems({ event: eventId }))
    dispatch(fetchGuests({ event: eventId }))
  }, [dispatch, eventId])

  useEffect(() => {
    if (events.length > 0) {
      const foundEvent = events.find((e) => e.id === eventId)
      setEvent(foundEvent)
    }
  }, [events, eventId])

  const handleDeleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      try {
        await dispatch(deleteEvent(eventId)).unwrap()
        toast.success("Event deleted successfully")
        router.push("/admin/events")
      } catch (error) {
        toast.error("Failed to delete event")
      }
    }
  }

  if (isLoading || !event) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[event.status]
  const eventBudgetItems = budgetItems.filter((item) => item.event === eventId)
  const eventGuests = guests.filter((guest) => guest.event === eventId)

  // Calculate budget stats
  const totalBudget = eventBudgetItems.reduce((sum, item) => sum + Number.parseFloat(item.estimated_cost), 0)
  const totalSpent = eventBudgetItems.reduce((sum, item) => sum + Number.parseFloat(item.actual_cost), 0)
  const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Calculate guest stats
  const confirmedGuests = eventGuests.filter((guest) => guest.rsvp_status === "confirmed").length
  const pendingGuests = eventGuests.filter((guest) => guest.rsvp_status === "pending").length
  const checkedInGuests = eventGuests.filter((guest) => guest.checked_in).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/events">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.name}</h1>
            <p className="text-muted-foreground">Event details and management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/events/${eventId}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Edit Event
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDeleteEvent}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Event
          </Button>
        </div>
      </div>

      {/* Event Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Event Overview
            </CardTitle>
            <Badge className={statusColors[event.status]}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Date:</span>
                <span>{new Date(event.date).toLocaleDateString()}</span>
                {event.time && <span>at {event.time}</span>}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Venue:</span>
                <span>{event.venue}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Expected Guests:</span>
                <span>{event.expected_guests}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium">Budget:</span>
                <span>৳{Number.parseFloat(event.budget).toLocaleString()}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <span className="font-medium">Category:</span>
                <Badge variant="outline" className="ml-2 capitalize">
                  {event.category}
                </Badge>
              </div>
              {event.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-muted-foreground mt-1">{event.description}</p>
                </div>
              )}
              {event.address && (
                <div>
                  <span className="font-medium">Address:</span>
                  <p className="text-muted-foreground mt-1">{event.address}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">৳{totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">of ৳{totalBudget.toLocaleString()}</p>
            <Progress value={budgetUsage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventGuests.length}</div>
            <p className="text-xs text-muted-foreground">invited guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedGuests}</div>
            <p className="text-xs text-muted-foreground">{pendingGuests} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{checkedInGuests}</div>
            <p className="text-xs text-muted-foreground">at event</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="budget" className="space-y-4">
        <TabsList>
          <TabsTrigger value="budget">Budget Items</TabsTrigger>
          <TabsTrigger value="guests">Guest List</TabsTrigger>
          <TabsTrigger value="details">Event Details</TabsTrigger>
        </TabsList>

        <TabsContent value="budget" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Budget Items</CardTitle>
                <Link href={`/admin/budget/new?event=${eventId}`}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </Link>
              </div>
              <CardDescription>Budget breakdown for this event</CardDescription>
            </CardHeader>
            <CardContent>
              {eventBudgetItems.length === 0 ? (
                <div className="text-center py-8">
                  <DollarSign className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Budget Items</h3>
                  <p className="text-muted-foreground mb-4">Add budget items to track expenses for this event</p>
                  <Link href={`/admin/budget/new?event=${eventId}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Budget Item
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventBudgetItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{item.item_name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{item.category}</p>
                        {item.vendor && <p className="text-sm text-muted-foreground">Vendor: {item.vendor}</p>}
                      </div>
                      <div className="text-right">
                        <div className="font-medium">৳{Number.parseFloat(item.actual_cost).toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">
                          of ৳{Number.parseFloat(item.estimated_cost).toLocaleString()}
                        </div>
                        <Badge
                          className={
                            item.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : item.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Guest List</CardTitle>
                <Link href={`/admin/guests/new?event=${eventId}`}>
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Guest
                  </Button>
                </Link>
              </div>
              <CardDescription>Guests invited to this event</CardDescription>
            </CardHeader>
            <CardContent>
              {eventGuests.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Guests</h3>
                  <p className="text-muted-foreground mb-4">Add guests to manage invitations for this event</p>
                  <Link href={`/admin/guests/new?event=${eventId}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Guest
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {eventGuests.map((guest) => (
                    <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{guest.name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">{guest.category}</p>
                        {guest.email && <p className="text-sm text-muted-foreground">{guest.email}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        {guest.plus_ones > 0 && <Badge variant="outline">+{guest.plus_ones}</Badge>}
                        <Badge
                          className={
                            guest.rsvp_status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : guest.rsvp_status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {guest.rsvp_status}
                        </Badge>
                        {guest.checked_in && <Badge className="bg-blue-100 text-blue-800">Checked In</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Details</CardTitle>
              <CardDescription>Complete information about this event</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Name:</span> {event.name}
                      </div>
                      <div>
                        <span className="font-medium">Category:</span> {event.category}
                      </div>
                      <div>
                        <span className="font-medium">Status:</span> {event.status}
                      </div>
                      <div>
                        <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                      </div>
                      {event.time && (
                        <div>
                          <span className="font-medium">Time:</span> {event.time}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Venue Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Venue:</span> {event.venue}
                      </div>
                      {event.address && (
                        <div>
                          <span className="font-medium">Address:</span> {event.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Budget & Guests</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Budget:</span> ৳{Number.parseFloat(event.budget).toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Expected Guests:</span> {event.expected_guests}
                      </div>
                      <div>
                        <span className="font-medium">Actual Guests:</span> {eventGuests.length}
                      </div>
                    </div>
                  </div>

                  {(event.contact_person || event.contact_phone || event.contact_email) && (
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        {event.contact_person && (
                          <div>
                            <span className="font-medium">Contact Person:</span> {event.contact_person}
                          </div>
                        )}
                        {event.contact_phone && (
                          <div>
                            <span className="font-medium">Phone:</span> {event.contact_phone}
                          </div>
                        )}
                        {event.contact_email && (
                          <div>
                            <span className="font-medium">Email:</span> {event.contact_email}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {event.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}

              {event.special_requirements && (
                <div>
                  <h4 className="font-medium mb-2">Special Requirements</h4>
                  <p className="text-sm text-muted-foreground">{event.special_requirements}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Created:</span> {new Date(event.created_at).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">Last Updated:</span> {new Date(event.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
