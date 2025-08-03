"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, MapPin, DollarSign, ArrowLeft } from "lucide-react"
import { createEvent } from "@/store/slices/eventSlice"
import { toast } from "sonner"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { createBudgetItem } from "@/store/slices/budgetSlice"
import { createGuest } from "@/store/slices/guestSlice"

const eventCategories = [
  { value: "wedding", label: "Wedding" },
  { value: "corporate", label: "Corporate Event" },
  { value: "community", label: "Community Event" },
  { value: "social", label: "Social Event" },
  { value: "birthday", label: "Birthday Party" },
  { value: "anniversary", label: "Anniversary" },
  { value: "conference", label: "Conference" },
  { value: "seminar", label: "Seminar" },
  { value: "other", label: "Other" },
]

const eventStatuses = [
  { value: "planning", label: "Planning" },
  { value: "confirmed", label: "Confirmed" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export default function NewEventPage() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    address: "",
    budget: "",
    expected_guests: "",
    status: "planning",
    special_requirements: "",
    contact_person: "",
    contact_phone: "",
    contact_email: "",
    auto_budget: false,
    auto_guests: false,
    auto_vendors: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const router = useRouter()
  const dispatch = useDispatch()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Event name is required"
    if (!formData.category) newErrors.category = "Event category is required"
    if (!formData.date) newErrors.date = "Event date is required"
    if (!formData.time) newErrors.time = "Event time is required"
    if (!formData.venue.trim()) newErrors.venue = "Venue is required"
    if (!formData.budget || Number.parseFloat(formData.budget) <= 0) newErrors.budget = "Valid budget is required"
    if (!formData.expected_guests || Number.parseInt(formData.expected_guests) <= 0) {
      newErrors.expected_guests = "Expected guests must be greater than 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const eventData = {
        ...formData,
        budget: Number.parseFloat(formData.budget),
        expected_guests: Number.parseInt(formData.expected_guests),
      }

      const createdEvent = await dispatch(createEvent(eventData)).unwrap()

      // Create automated budget items
      if (formData.auto_budget) {
        const defaultBudgetCategories = [
          { category: "venue", item_name: "Venue Booking", percentage: 30 },
          { category: "catering", item_name: "Food & Beverages", percentage: 25 },
          { category: "decoration", item_name: "Decorations", percentage: 15 },
          { category: "photography", item_name: "Photography/Videography", percentage: 10 },
          { category: "entertainment", item_name: "Entertainment", percentage: 10 },
          { category: "miscellaneous", item_name: "Miscellaneous", percentage: 10 },
        ]

        for (const budgetItem of defaultBudgetCategories) {
          const estimatedCost = (Number.parseFloat(formData.budget) * budgetItem.percentage) / 100
          await dispatch(
            createBudgetItem({
              event: createdEvent.id,
              category: budgetItem.category,
              item_name: budgetItem.item_name,
              estimated_cost: estimatedCost,
              actual_cost: 0,
              vendor: "",
              status: "pending",
              due_date: "",
              notes: `Auto-generated ${budgetItem.item_name} budget item`,
            }),
          )
        }
      }

      // Create automated guest categories
      if (formData.auto_guests) {
        const guestCategories = ["family", "friends", "colleagues", "vip"]
        const guestsPerCategory = Math.ceil(Number.parseInt(formData.expected_guests) / guestCategories.length)

        for (const category of guestCategories) {
          await dispatch(
            createGuest({
              event: createdEvent.id,
              name: `${category.charAt(0).toUpperCase() + category.slice(1)} Guest List`,
              email: "",
              phone: "",
              category: category,
              rsvp_status: "pending",
              plus_ones: 0,
              dietary_restrictions: "",
              notes: `Auto-generated ${category} category placeholder`,
              invitation_sent: false,
              checked_in: false,
            }),
          )
        }
      }

      toast.success("Event created successfully!")
      if (formData.auto_budget) toast.success("Default budget categories created!")
      if (formData.auto_guests) toast.success("Guest categories created!")

      router.push("/admin/events")
    } catch (error) {
      toast.error(error.message || "Failed to create event")
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
        <Link href="/admin/events">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
          <p className="text-muted-foreground">Fill in the details to create your new event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>Essential details about your event</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className={errors.name ? "border-red-500" : ""}
                  placeholder="Enter event name"
                />
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Event Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventCategories.map((category) => (
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your event..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Event Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Event Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className={errors.time ? "border-red-500" : ""}
                />
                {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Event Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {eventStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Venue Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Venue Information
            </CardTitle>
            <CardDescription>Where will your event take place?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue Name *</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) => handleInputChange("venue", e.target.value)}
                className={errors.venue ? "border-red-500" : ""}
                placeholder="Enter venue name"
              />
              {errors.venue && <p className="text-sm text-red-500">{errors.venue}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Venue Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter complete address"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget & Guests */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget & Guests
            </CardTitle>
            <CardDescription>Financial planning and guest expectations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget">Total Budget (৳) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange("budget", e.target.value)}
                  className={errors.budget ? "border-red-500" : ""}
                  placeholder="0"
                  min="0"
                  step="100"
                />
                {errors.budget && <p className="text-sm text-red-500">{errors.budget}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_guests">Expected Guests *</Label>
                <Input
                  id="expected_guests"
                  type="number"
                  value={formData.expected_guests}
                  onChange={(e) => handleInputChange("expected_guests", e.target.value)}
                  className={errors.expected_guests ? "border-red-500" : ""}
                  placeholder="0"
                  min="1"
                />
                {errors.expected_guests && <p className="text-sm text-red-500">{errors.expected_guests}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Extra details and contact information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="special_requirements">Special Requirements</Label>
              <Textarea
                id="special_requirements"
                value={formData.special_requirements}
                onChange={(e) => handleInputChange("special_requirements", e.target.value)}
                placeholder="Any special requirements or notes..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact_person">Contact Person</Label>
                <Input
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => handleInputChange("contact_person", e.target.value)}
                  placeholder="Contact person name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  value={formData.contact_phone}
                  onChange={(e) => handleInputChange("contact_phone", e.target.value)}
                  placeholder="+880 1XXX-XXXXXX"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange("contact_email", e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automated Management */}
        <Card>
          <CardHeader>
            <CardTitle>Automated Management</CardTitle>
            <CardDescription>
              Automatically create budget items, guest categories, and vendor suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_budget"
                checked={formData.auto_budget || false}
                onCheckedChange={(checked) => handleInputChange("auto_budget", checked)}
              />
              <Label htmlFor="auto_budget">Create default budget categories</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_guests"
                checked={formData.auto_guests || false}
                onCheckedChange={(checked) => handleInputChange("auto_guests", checked)}
              />
              <Label htmlFor="auto_guests">Create guest categories (Family, Friends, Colleagues, VIP)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto_vendors"
                checked={formData.auto_vendors || false}
                onCheckedChange={(checked) => handleInputChange("auto_vendors", checked)}
              />
              <Label htmlFor="auto_vendors">Suggest vendors based on event category</Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  )
}
