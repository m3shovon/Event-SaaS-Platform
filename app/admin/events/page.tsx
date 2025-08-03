"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchEvents, deleteEvent } from "@/store/slices/eventSlice"
import Link from "next/link"
import { toast } from "sonner"

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

export default function EventsPage() {
  const dispatch = useDispatch()
  const { events, isLoading } = useSelector((state: any) => state.events)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  const handleDeleteEvent = async (eventId: number) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await dispatch(deleteEvent(eventId)).unwrap()
        toast.success("Event deleted successfully")
      } catch (error) {
        toast.error("Failed to delete event")
      }
    }
  }

  const filteredEvents = events.filter((event: any) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || event.status === statusFilter
    const matchesCategory = categoryFilter === "all" || event.category === categoryFilter

    return matchesSearch && matchesStatus && matchesCategory
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">Manage all your events in one place</p>
        </div>
        <Link href="/admin/events/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="wedding">Wedding</SelectItem>
                <SelectItem value="corporate">Corporate</SelectItem>
                <SelectItem value="community">Community</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="anniversary">Anniversary</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">{events.length === 0 ? "No Events Yet" : "No Events Found"}</h3>
            <p className="text-muted-foreground mb-4">
              {events.length === 0
                ? "Create your first event to get started"
                : "Try adjusting your search or filter criteria"}
            </p>
            {events.length === 0 && (
              <Link href="/admin/events/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event: any) => {
            const StatusIcon = statusIcons[event.status as keyof typeof statusIcons]

            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{event.name}</CardTitle>
                      <CardDescription className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(event.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
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
                        <DropdownMenuItem onClick={() => handleDeleteEvent(event.id)} className="text-red-600">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Event
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge className={statusColors[event.status as keyof typeof statusColors]}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {event.status}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {event.category}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {event.venue}
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      {event.expected_guests} guests
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />৳{Number.parseFloat(event.budget).toLocaleString()}
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link href={`/admin/events/${event.id}`}>
                      <Button className="w-full bg-transparent" variant="outline">
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
    </div>
  )
}
