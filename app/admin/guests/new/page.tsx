"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Users } from "lucide-react"
import { createGuest } from "@/store/slices/guestSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { toast } from "sonner"
import Link from "next/link"

const guestCategories = [
  { value: "family", label: "Family" },
  { value: "friends", label: "Friends" },
  { value: "colleagues", label: "Colleagues" },
  { value: "vip", label: "VIP" },
  { value: "vendors", label: "Vendors" },
  { value: "other", label: "Other" },
]

const rsvpStatuses = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "declined", label: "Declined" },
  { value: "maybe", label: "Maybe" },
]

export default function NewGuestPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const searchParams = useSearchParams()
  const preselectedEventId = searchParams.get("event")

  const { events } = useSelector((state: any) => state.events)
  const { isLoading } = useSelector((state: any) => state.guests)

  const [formData, setFormData] = useState({
    event: preselectedEventId || "",
    name: "",
    email: "",
    phone: "",
    category: "",
    rsvp_status: "pending",
    plus_ones: "0",
    dietary_restrictions: "",
    notes: "",
    invitation_sent: false,
    checked_in: false,
  })

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.event || !formData.name || !formData.category) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await dispatch(
        createGuest({
          ...formData,
          plus_ones: Number.parseInt(formData.plus_ones),
        }),
      ).unwrap()

      toast.success("Guest added successfully")
      router.push("/admin/guests")
    } catch (error: any) {
      toast.error(error.message || "Failed to add guest")
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
          <h1 className="text-3xl font-bold tracking-tight">Add Guest</h1>
          <p className="text-muted-foreground">Add a new guest to your event</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Guest Details
          </CardTitle>
          <CardDescription>Enter the details for the new guest</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event">Event *</Label>
                <Select value={formData.event} onValueChange={(value) => handleInputChange("event", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event: any) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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
                  placeholder="guest@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+880 1234 567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {guestCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
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
                    {rsvpStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plus_ones">Number of Additional Guests</Label>
                <Input
                  id="plus_ones"
                  type="number"
                  min="0"
                  max="10"
                  value={formData.plus_ones}
                  onChange={(e) => handleInputChange("plus_ones", e.target.value)}
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground">How many additional people will attend with this guest?</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
                <Input
                  id="dietary_restrictions"
                  value={formData.dietary_restrictions}
                  onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
                  placeholder="e.g., Vegetarian, Halal, Allergies"
                />
              </div>
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
                  onCheckedChange={(checked) => handleInputChange("invitation_sent", checked as boolean)}
                />
                <Label htmlFor="invitation_sent">Invitation sent</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="checked_in"
                  checked={formData.checked_in}
                  onCheckedChange={(checked) => handleInputChange("checked_in", checked as boolean)}
                />
                <Label htmlFor="checked_in">Checked in at event</Label>
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Adding..." : "Add Guest"}
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
