"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, DollarSign } from "lucide-react"
import { createBudgetItem } from "@/store/slices/budgetSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import type { RootState, AppDispatch } from "@/store/store"
import { toast } from "sonner"
import { useEffect } from "react"

export default function NewBudgetPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { events } = useSelector((state: RootState) => state.events)
  console.log("Events:", events)
  const { isLoading } = useSelector((state: RootState) => state.budget)

  const [formData, setFormData] = useState({
    event: "",
    category: "",
    item_name: "",
    estimated_cost: "",
    actual_cost: "",
    notes: "",
    status: "pending",
  })

  useEffect(() => {
    dispatch(fetchEvents())
  }, [dispatch])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.event || !formData.category || !formData.item_name || !formData.estimated_cost) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await dispatch(
        createBudgetItem({
          ...formData,
          event: Number.parseInt(formData.event),
          estimated_cost: Number.parseFloat(formData.estimated_cost),
          actual_cost: formData.actual_cost ? Number.parseFloat(formData.actual_cost) : 0,
        }),
      ).unwrap()

      toast.success("Budget item created successfully!")
      router.push("/admin/budget")
    } catch (error: any) {
      toast.error(error.message || "Failed to create budget item")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Add Budget Item</h1>
          <p className="text-muted-foreground">Create a new budget item for an event</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Item Details
          </CardTitle>
          <CardDescription>Enter the details for the new budget item</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event *</Label>
                <Select value={formData.event} onValueChange={(value) => handleInputChange("event", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name} - {event.status}
                        {/* {event.name} - {new Date(event.date).toLocaleDateString()} - {event.status} */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venue">Venue</SelectItem>
                    <SelectItem value="catering">Catering</SelectItem>
                    <SelectItem value="decoration">Decoration</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="item_name">Item Name *</Label>
              <Input
                id="item_name"
                value={formData.item_name}
                onChange={(e) => handleInputChange("item_name", e.target.value)}
                placeholder="e.g., Wedding Venue Rental"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost *</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  value={formData.estimated_cost}
                  onChange={(e) => handleInputChange("estimated_cost", e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="actual_cost">Actual Cost</Label>
                <Input
                  id="actual_cost"
                  type="number"
                  step="0.01"
                  value={formData.actual_cost}
                  onChange={(e) => handleInputChange("actual_cost", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about this budget item..."
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Budget Item"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
