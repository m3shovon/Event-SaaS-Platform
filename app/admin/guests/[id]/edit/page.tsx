"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Calendar, MapPin } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import { apiClient } from "@/lib/api"

interface Guest {
  id: number
  name: string
  email: string
  phone: string
  category: string
  rsvp_status: string
  plus_ones: number
  dietary_restrictions: string
  notes: string
  invitation_sent: boolean
  checked_in: boolean
  event: number
}

interface Event {
  id: number
  name: string
  date: string
  venue: string
  category: string
}

export default function EditGuestPage() {
  const params = useParams()
  const router = useRouter()
  const guestId = Number.parseInt(params.id as string)

  const [guest, setGuest] = useState<Guest | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "",
    rsvp_status: "",
    plus_ones: 0,
    dietary_restrictions: "",
    notes: "",
    invitation_sent: false,
    checked_in: false,
    event: "",
  })

  useEffect(() => {
    loadData()
  }, [guestId])

  const loadData = async () => {
    try {
      setIsLoadingData(true)

      // Load guest and events data in parallel
      const [guestResponse, eventsResponse] = await Promise.all([apiClient.getGuest(guestId), apiClient.getEvents()])

      setGuest(guestResponse)

      // Handle events response format
      const eventsData = eventsResponse.results || eventsResponse || []
      setEvents(eventsData)

      // Set form data with guest information
      setFormData({
        name: guestResponse.name || "",
        email: guestResponse.email || "",
        phone: guestResponse.phone || "",
        category: guestResponse.category || "",
        rsvp_status: guestResponse.rsvp_status || "",
        plus_ones: guestResponse.plus_ones || 0,
        dietary_restrictions: guestResponse.dietary_restrictions || "",
        notes: guestResponse.notes || "",
        invitation_sent: guestResponse.invitation_sent || false,
        checked_in: guestResponse.checked_in || false,
        event: guestResponse.event?.toString() || "",
      })
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load guest data")
    } finally {
      setIsLoadingData(false)
    }
  }

  const getCurrentEventName = () => {
    if (!guest || !guest.event) return "No event assigned"

    const currentEvent = events.find((event) => event.id === guest.event)
    if (!currentEvent) return "Event not found"

    return `${currentEvent.name} - ${new Date(currentEvent.date).toLocaleDateString()}`
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast.error("Guest name is required")
      return
    }

    if (!formData.event) {
      toast.error("Please select an event")
      return
    }

    try {
      setIsSubmitting(true)

      const updateData = {
        ...formData,
        event: Number.parseInt(formData.event),
        plus_ones: Number.parseInt(formData.plus_ones.toString()) || 0,
      }

      await apiClient.updateGuest(guestId, updateData)

      toast.success("Guest updated successfully")
      router.push("/admin/guests")
    } catch (error: any) {
      console.error("Error updating guest:", error)
      toast.error(error.message || "Failed to update guest")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!guest) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/guests">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Guest Not Found</h1>
            <p className="text-muted-foreground">The requested guest could not be found</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/guests">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Guest</h1>
          <p className="text-muted-foreground">Update guest information and event assignment</p>
        </div>
      </div>

      {/* Current Event Assignment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Current Event Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="font-medium">{getCurrentEventName()}</p>
              {guest.event && events.find((e) => e.id === guest.event) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <MapPin className="h-4 w-4" />
                  {events.find((e) => e.id === guest.event)?.venue}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Information</CardTitle>
          <CardDescription>Update the guest details and event assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Guest Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter guest name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event">Event *</Label>
                <Select value={formData.event} onValueChange={(value) => handleInputChange("event", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.length > 0 ? (
                      events.map((event) => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name} - {new Date(event.date).toLocaleDateString()}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground">No events available</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="family">Family</SelectItem>
                    <SelectItem value="friends">Friends</SelectItem>
                    <SelectItem value="colleagues">Colleagues</SelectItem>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="vendors">Vendors</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rsvp_status">RSVP Status</Label>
                <Select value={formData.rsvp_status} onValueChange={(value) => handleInputChange("rsvp_status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select RSVP status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="declined">Declined</SelectItem>
                    <SelectItem value="maybe">Maybe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plus_ones">Plus Ones</Label>
                <Input
                  id="plus_ones"
                  type="number"
                  min="0"
                  value={formData.plus_ones}
                  onChange={(e) => handleInputChange("plus_ones", Number.parseInt(e.target.value) || 0)}
                  placeholder="Number of plus ones"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
                placeholder="Enter any dietary restrictions"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about the guest"
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="invitation_sent"
                  checked={formData.invitation_sent}
                  onCheckedChange={(checked) => handleInputChange("invitation_sent", checked)}
                />
                <Label htmlFor="invitation_sent">Invitation sent</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="checked_in"
                  checked={formData.checked_in}
                  onCheckedChange={(checked) => handleInputChange("checked_in", checked)}
                />
                <Label htmlFor="checked_in">Checked in at event</Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? "Updating..." : "Update Guest"}
              </Button>
              <Link href="/admin/guests">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
