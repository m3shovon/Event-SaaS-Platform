"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreHorizontal,
  Mail,
  Phone,
  CheckCircle,
  Clock,
  X,
  UserCheck,
  UserPlus,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchGuests, deleteGuest } from "@/store/slices/guestSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { toast } from "sonner"
import Link from "next/link"

const rsvpColors = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  maybe: "bg-blue-100 text-blue-800",
}

const rsvpIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  declined: X,
  maybe: Clock,
}

export default function GuestsPage() {
  const dispatch = useDispatch()
  const { guests, stats, isLoading } = useSelector((state: any) => state.guests)
  const { events } = useSelector((state: any) => state.events)
  const [searchTerm, setSearchTerm] = useState("")
  const [rsvpFilter, setRsvpFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [eventFilter, setEventFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchGuests())
    dispatch(fetchEvents())
  }, [dispatch])

  const handleDeleteGuest = async (guestId: number) => {
    if (window.confirm("Are you sure you want to delete this guest?")) {
      try {
        await dispatch(deleteGuest(guestId)).unwrap()
        toast.success("Guest deleted successfully")
        // Refresh the list to update stats
        dispatch(fetchGuests())
      } catch (error) {
        toast.error("Failed to delete guest")
      }
    }
  }

  const filteredGuests = guests.filter((guest: any) => {
    const matchesSearch =
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRsvp = rsvpFilter === "all" || guest.rsvp_status === rsvpFilter
    const matchesCategory = categoryFilter === "all" || guest.category === categoryFilter
    const matchesEvent = eventFilter === "all" || guest.event.toString() === eventFilter

    return matchesSearch && matchesRsvp && matchesCategory && matchesEvent
  })

  // Calculate stats from backend or fallback to client-side calculation
  const totalGuests = stats?.total_guests || guests.length
  const totalAttendees =
    stats?.total_attendees || guests.reduce((sum: number, guest: any) => sum + 1 + (guest.plus_ones || 0), 0)
  const confirmedGuests =
    stats?.confirmed_guests || guests.filter((guest: any) => guest.rsvp_status === "confirmed").length
  const confirmedAttendees =
    stats?.confirmed_attendees ||
    guests
      .filter((guest: any) => guest.rsvp_status === "confirmed")
      .reduce((sum: number, guest: any) => sum + 1 + (guest.plus_ones || 0), 0)
  const pendingGuests = stats?.pending_guests || guests.filter((guest: any) => guest.rsvp_status === "pending").length
  const checkedInGuests = stats?.checked_in_guests || guests.filter((guest: any) => guest.checked_in).length

  // Group by event for summary
  const eventSummary = events.map((event: any) => {
    const eventGuests = guests.filter((guest: any) => guest.event === event.id)
    const totalEventAttendees = eventGuests.reduce((sum: number, guest: any) => sum + 1 + (guest.plus_ones || 0), 0)
    const confirmedEventAttendees = eventGuests
      .filter((guest: any) => guest.rsvp_status === "confirmed")
      .reduce((sum: number, guest: any) => sum + 1 + (guest.plus_ones || 0), 0)

    return {
      ...event,
      totalGuests: eventGuests.length,
      totalAttendees: totalEventAttendees,
      confirmedAttendees: confirmedEventAttendees,
      confirmed: eventGuests.filter((guest: any) => guest.rsvp_status === "confirmed").length,
      pending: eventGuests.filter((guest: any) => guest.rsvp_status === "pending").length,
      declined: eventGuests.filter((guest: any) => guest.rsvp_status === "declined").length,
    }
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Guest Management</h1>
          <p className="text-muted-foreground">Manage invitations, RSVPs, and guest check-ins</p>
        </div>
        <Link href="/admin/guests/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Guests</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGuests}</div>
            <p className="text-xs text-muted-foreground">Invited guests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{totalAttendees}</div>
            <p className="text-xs text-muted-foreground">Including plus ones</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{confirmedGuests}</div>
            <p className="text-xs text-muted-foreground">{confirmedAttendees} total attendees</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked In</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{checkedInGuests}</div>
            <p className="text-xs text-muted-foreground">At events</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Guest Summary */}
      {eventSummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Guests by Event</CardTitle>
            <CardDescription>Guest breakdown for each event (including plus ones)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {eventSummary.map((event: any) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <h4 className="font-medium">{event.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {event.totalGuests} guests • {event.totalAttendees} total attendees
                    </p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{event.confirmed}</div>
                      <div className="text-xs text-muted-foreground">Confirmed</div>
                      <div className="text-xs text-green-600">({event.confirmedAttendees} attendees)</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{event.pending}</div>
                      <div className="text-xs text-muted-foreground">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-red-600">{event.declined}</div>
                      <div className="text-xs text-muted-foreground">Declined</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search guests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {events.map((event: any) => (
                  <SelectItem key={event.id} value={event.id.toString()}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by RSVP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All RSVP Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
                <SelectItem value="maybe">Maybe</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="family">Family</SelectItem>
                <SelectItem value="friends">Friends</SelectItem>
                <SelectItem value="colleagues">Colleagues</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="vendors">Vendors</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Guest List */}
      {filteredGuests.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{guests.length === 0 ? "No Guests Yet" : "No Guests Found"}</h3>
            <p className="text-muted-foreground mb-4">
              {guests.length === 0
                ? "Add your first guest to start managing invitations"
                : "Try adjusting your search or filter criteria"}
            </p>
            {guests.length === 0 && (
              <Link href="/admin/guests/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Guest
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Guest List</CardTitle>
            <CardDescription>All guests across your events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredGuests.map((guest: any) => {
                const RsvpIcon = rsvpIcons[guest.rsvp_status as keyof typeof rsvpIcons]
                const event = events.find((e: any) => e.id === guest.event)
                const totalGuestAttendees = 1 + (guest.plus_ones || 0)

                return (
                  <div key={guest.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{guest.name}</h4>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/guests/${guest.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Guest
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="w-4 h-4 mr-2" />
                              Send Invitation
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteGuest(guest.id)} className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete Guest
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="capitalize">{guest.category}</span>
                        {event && (
                          <>
                            <span>•</span>
                            <span>{event.name}</span>
                          </>
                        )}
                        {guest.email && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {guest.email}
                            </span>
                          </>
                        )}
                        {guest.phone && (
                          <>
                            <span>•</span>
                            <span className="flex items-center">
                              <Phone className="w-3 h-3 mr-1" />
                              {guest.phone}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Badge className={rsvpColors[guest.rsvp_status as keyof typeof rsvpColors]}>
                            <RsvpIcon className="w-3 h-3 mr-1" />
                            {guest.rsvp_status}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            <UserPlus className="w-3 h-3 mr-1" />
                            {totalGuestAttendees} attendee{totalGuestAttendees > 1 ? "s" : ""}
                          </Badge>
                          {guest.plus_ones > 0 && (
                            <Badge variant="secondary">
                              +{guest.plus_ones} guest{guest.plus_ones > 1 ? "s" : ""}
                            </Badge>
                          )}
                          {guest.checked_in && (
                            <Badge className="bg-purple-100 text-purple-800">
                              <UserCheck className="w-3 h-3 mr-1" />
                              Checked In
                            </Badge>
                          )}
                          {guest.invitation_sent && <Badge variant="outline">Invitation Sent</Badge>}
                        </div>
                      </div>

                      {guest.dietary_restrictions && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Dietary:</strong> {guest.dietary_restrictions}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
