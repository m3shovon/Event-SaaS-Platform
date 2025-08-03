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
import { DollarSign, ArrowLeft } from "lucide-react"
import { createBudgetItem } from "@/store/slices/budgetSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { fetchVendors } from "@/store/slices/vendorSlice"
import { toast } from "sonner"
import Link from "next/link"

const budgetCategories = [
  { value: "venue", label: "Venue" },
  { value: "catering", label: "Catering" },
  { value: "decoration", label: "Decoration" },
  { value: "photography", label: "Photography" },
  { value: "entertainment", label: "Entertainment" },
  { value: "transportation", label: "Transportation" },
  { value: "flowers", label: "Flowers" },
  { value: "invitations", label: "Invitations" },
  { value: "gifts", label: "Gifts" },
  { value: "miscellaneous", label: "Miscellaneous" },
]

const budgetStatuses = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partial" },
  { value: "overdue", label: "Overdue" },
]

export default function NewBudgetItemPage() {
  const [formData, setFormData] = useState({
    event: "",
    category: "",
    item_name: "",
    estimated_cost: "",
    actual_cost: "0",
    vendor: "",
    status: "pending",
    due_date: "",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const router = useRouter()
  const dispatch = useDispatch()
  const { events } = useSelector((state: any) => state.events)
  const { vendors } = useSelector((state: any) => state.vendors)

  useEffect(() => {
    dispatch(fetchEvents())
    dispatch(fetchVendors())
  }, [dispatch])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.event) newErrors.event = "Event is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.item_name.trim()) newErrors.item_name = "Item name is required"
    if (!formData.estimated_cost || Number.parseFloat(formData.estimated_cost) <= 0) {
      newErrors.estimated_cost = "Valid estimated cost is required"
    }
    if (Number.parseFloat(formData.actual_cost) < 0) {
      newErrors.actual_cost = "Actual cost cannot be negative"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const budgetData = {
        ...formData,
        event: Number.parseInt(formData.event),
        estimated_cost: Number.parseFloat(formData.estimated_cost),
        actual_cost: Number.parseFloat(formData.actual_cost),
      }

      await dispatch(createBudgetItem(budgetData)).unwrap()
      toast.success("Budget item created successfully!")
      router.push("/admin/budget")
    } catch (error) {
      toast.error(error.message || "Failed to create budget item")
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
        <Link href="/admin/budget">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Budget Item</h1>
          <p className="text-muted-foreground">Create a new budget item for your event</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget Item Details
            </CardTitle>
            <CardDescription>Essential information about the budget item</CardDescription>
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
                    {budgetCategories.map((category) => (
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
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleInputChange("item_name", e.target.value)}
                className={errors.item_name ? "border-red-500" : ""}
                placeholder="Enter item name"
              />
              {errors.item_name && <p className="text-sm text-red-500">{errors.item_name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost (৳) *</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  value={formData.estimated_cost}
                  onChange={(e) => handleInputChange("estimated_cost", e.target.value)}
                  className={errors.estimated_cost ? "border-red-500" : ""}
                  placeholder="0"
                  min="0"
                  step="100"
                />
                {errors.estimated_cost && <p className="text-sm text-red-500">{errors.estimated_cost}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_cost">Actual Cost (৳)</Label>
                <Input
                  id="actual_cost"
                  type="number"
                  value={formData.actual_cost}
                  onChange={(e) => handleInputChange("actual_cost", e.target.value)}
                  className={errors.actual_cost ? "border-red-500" : ""}
                  placeholder="0"
                  min="0"
                  step="100"
                />
                {errors.actual_cost && <p className="text-sm text-red-500">{errors.actual_cost}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor & Status Information</CardTitle>
            <CardDescription>Additional details about the budget item</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select
                  value={formData.vendor || "defaultVendor"}
                  onValueChange={(value) => handleInputChange("vendor", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No vendor selected</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.name}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => handleInputChange("due_date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Budget Item"}
          </Button>
        </div>
      </form>
    </div>
  )
}
