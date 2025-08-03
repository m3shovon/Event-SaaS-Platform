"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Users, ArrowLeft, Mail, Phone } from "lucide-react"
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
  const [formData, setFormData] = useState({
    event: "",
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
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const router = useRouter()
  const dispatch = useDispatch()
  const { events } = useSelector((state: any) => state.events)

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.event) newErrors.event = "Event is required"
    if (!formData.name.trim()) newErrors.name = "Guest name is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required"
    }
    if (Number.parseInt(formData.plus_ones) < 0) {
      newErrors.plus_ones = "Plus ones cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const guestData = {
        ...formData,
        event: Number.parseInt(formData.event),
        plus_ones: Number.parseInt(formData.plus_ones),
      }

      await dispatch(createGuest(guestData)).unwrap()
      toast.success("Guest added successfully!")
      router.push("/admin/guests")
    } catch (error) {
      toast.error(error.message || "Failed to add guest")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="space-y-6">
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Guest Information
            </CardTitle>
            <CardDescription>Basic details about the guest</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event *</Label>
                <Select value={formData.event} onValueChange={(value) => handleInputChange("event", value)}>
                  <SelectTrigger className={errors.event ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.event && <p className="text-sm text-red-500">{errors.event}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {guestCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Guest Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                placeholder="Enter guest name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={`pl-8 ${errors.email ? "border-red-500" : ""}`}
                    placeholder="guest@example.com"
                  />
                </div>
                {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="pl-8"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSVP & Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>RSVP & Additional Information</CardTitle>
            <CardDescription>RSVP status and other details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rsvp_status">RSVP Status</Label>
                <Select value={formData.rsvp_status} onValueChange={(value) => handleInputChange("rsvp_status", value)}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label htmlFor="plus_ones">Plus Ones</Label>
                <Input
                  id="plus_ones"
                  type="number"
                  value={formData.plus_ones}
                  onChange={(e) => handleInputChange("plus_ones", e.target.value)}
                  className={errors.plus_ones ? "border-red-500" : ""}
                  placeholder="0"
                  min="0"
                />
                {errors.plus_ones && <p className="text-sm text-red-500">{errors.plus_ones}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietary_restrictions">Dietary Restrictions</Label>
              <Textarea
                id="dietary_restrictions"
                value={formData.dietary_restrictions}
                onChange={(e) => handleInputChange("dietary_restrictions", e.target.value)}
                placeholder="Any dietary restrictions or allergies..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional notes about the guest..."
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
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Guest"}
          </Button>
        </div>
      </form>
    </div>
  )
}
