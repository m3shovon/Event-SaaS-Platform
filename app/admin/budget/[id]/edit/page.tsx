"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, DollarSign } from "lucide-react"
import { fetchBudgetItem, updateBudgetItem } from "@/store/slices/budgetSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
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

const statusOptions = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "partial", label: "Partially Paid" },
  { value: "overdue", label: "Overdue" },
]

export default function EditBudgetItemPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const budgetId = Number.parseInt(params.id as string)

  const { events } = useSelector((state: any) => state.events)
  const { budgetItems, currentBudgetItem, isLoading } = useSelector((state: any) => state.budget)

  const [formData, setFormData] = useState({
    event: "",
    category: "",
    item_name: "",
    estimated_cost: "",
    actual_cost: "",
    vendor: "",
    status: "pending",
    due_date: "",
    notes: "",
  })

  useEffect(() => {
    dispatch(fetchEvents())
    dispatch(fetchBudgetItem(budgetId))
  }, [dispatch, budgetId])

  useEffect(() => {
    if (currentBudgetItem) {
      setFormData({
        event: currentBudgetItem.event?.toString() || "",
        category: currentBudgetItem.category || "",
        item_name: currentBudgetItem.item_name || "",
        estimated_cost: currentBudgetItem.estimated_cost?.toString() || "",
        actual_cost: currentBudgetItem.actual_cost?.toString() || "",
        vendor: currentBudgetItem.vendor || "",
        status: currentBudgetItem.status || "pending",
        due_date: currentBudgetItem.due_date || "",
        notes: currentBudgetItem.notes || "",
      })
    }
  }, [currentBudgetItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.event || !formData.category || !formData.item_name || !formData.estimated_cost) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await dispatch(
        updateBudgetItem({
          id: budgetId,
          budgetData: {
            ...formData,
            estimated_cost: Number.parseFloat(formData.estimated_cost),
            actual_cost: Number.parseFloat(formData.actual_cost),
          },
        }),
      ).unwrap()

      toast.success("Budget item updated successfully")
      router.push("/admin/budget")
    } catch (error: any) {
      toast.error(error.message || "Failed to update budget item")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!currentBudgetItem) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/budget">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Budget Item</h1>
          <p className="text-muted-foreground">Update budget item details</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Item Details
          </CardTitle>
          <CardDescription>Update the budget item information</CardDescription>
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
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {budgetCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="item_name">Item Name *</Label>
                <Input
                  id="item_name"
                  value={formData.item_name}
                  onChange={(e) => handleInputChange("item_name", e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange("vendor", e.target.value)}
                  placeholder="Enter vendor name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost (৳) *</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.estimated_cost}
                  onChange={(e) => handleInputChange("estimated_cost", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_cost">Actual Cost (৳)</Label>
                <Input
                  id="actual_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.actual_cost}
                  onChange={(e) => handleInputChange("actual_cost", e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes or comments"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Budget Item"}
              </Button>
              <Link href="/admin/budget">
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
