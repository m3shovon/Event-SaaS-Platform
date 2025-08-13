"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchBudgetItem, updateBudgetItem, clearCurrentBudgetItem } from "@/store/slices/budgetSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { fetchVendors } from "@/store/slices/vendorSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function EditBudgetPage() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const { currentBudgetItem, isLoading } = useAppSelector((state) => state.budget)
  const { events } = useAppSelector((state) => state.events)
  const { vendors } = useAppSelector((state) => state.vendors)

  const [formData, setFormData] = useState({
    event: "",
    category: "",
    item_name: "",
    estimated_cost: "",
    actual_cost: "",
    vendor: "",
    vendor_name: "",
    status: "",
    due_date: "",
    notes: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)
  const budgetId = Number(params.id)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchBudgetItem(budgetId)).unwrap(),
          dispatch(fetchEvents()).unwrap(),
          dispatch(fetchVendors()).unwrap(),
        ])
        setDataLoaded(true)
      } catch (error) {
        toast.error("Failed to load data. Please refresh the page.")
      }
    }

    if (budgetId) {
      loadData()
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentBudgetItem())
    }
  }, [dispatch, budgetId])

  // Update form when budget item is loaded
  useEffect(() => {
    if (currentBudgetItem && dataLoaded) {
      setFormData({
        event: currentBudgetItem.event?.toString() || "",
        category: currentBudgetItem.category || "",
        item_name: currentBudgetItem.item_name || "",
        estimated_cost: currentBudgetItem.estimated_cost?.toString() || "",
        actual_cost: currentBudgetItem.actual_cost?.toString() || "",
        vendor: currentBudgetItem.vendor?.toString() || "",
        vendor_name: currentBudgetItem.vendor_name || "",
        status: currentBudgetItem.status || "",
        due_date: currentBudgetItem.due_date || "",
        notes: currentBudgetItem.notes || "",
      })
    }
  }, [currentBudgetItem, dataLoaded])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleVendorChange = (value: string) => {
    if (value === "0" || value === "") {
      // No vendor selected
      setFormData((prev) => ({ ...prev, vendor: "", vendor_name: "" }))
    } else {
      // Vendor selected from dropdown
      const selectedVendor = vendors.find((v) => v.id.toString() === value)
      setFormData((prev) => ({
        ...prev,
        vendor: value,
        vendor_name: selectedVendor?.name || "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!formData.item_name || !formData.category || !formData.estimated_cost) {
      toast.error("Please fill in all required fields")
      setIsSubmitting(false)
      return
    }

    try {
      const updateData = {
        event: formData.event ? Number.parseInt(formData.event) : null,
        category: formData.category,
        item_name: formData.item_name,
        estimated_cost: Number.parseFloat(formData.estimated_cost),
        actual_cost: formData.actual_cost ? Number.parseFloat(formData.actual_cost) : null,
        vendor: formData.vendor ? Number.parseInt(formData.vendor) : null,
        vendor_name: formData.vendor_name || "",
        status: formData.status,
        due_date: formData.due_date || null,
        notes: formData.notes,
      }

      await dispatch(
        updateBudgetItem({
          id: budgetId,
          budgetData: updateData,
        }),
      ).unwrap()

      toast.success("Budget item updated successfully!")
      router.push("/admin/budget")
    } catch (error: any) {
      toast.error(error.message || "Failed to update budget item")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !dataLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading budget item...</p>
        </div>
      </div>
    )
  }

  if (!currentBudgetItem) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Budget Item Not Found</h1>
          <p className="text-gray-600 mb-4">The budget item you're looking for doesn't exist.</p>
          <Button onClick={() => router.push("/admin/budget")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Budget
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Edit Budget Item</h1>
          <p className="text-gray-600">Update budget item details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event">Event</Label>
                <Select value={formData.event} onValueChange={(value) => handleInputChange("event", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event" />
                  </SelectTrigger>
                  <SelectContent>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id.toString()}>
                        {event.name} - {new Date(event.date).toLocaleDateString()}
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
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="flowers">Flowers</SelectItem>
                    <SelectItem value="invitations">Invitations</SelectItem>
                    <SelectItem value="gifts">Gifts</SelectItem>
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
                placeholder="Enter item name"
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
                  min="0"
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
                  min="0"
                  value={formData.actual_cost}
                  onChange={(e) => handleInputChange("actual_cost", e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor (Optional)</Label>
                <Select value={formData.vendor} onValueChange={handleVendorChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No vendor</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id.toString()}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vendor_name">Vendor Name (Optional)</Label>
                <Input
                  id="vendor_name"
                  value={formData.vendor_name}
                  onChange={(e) => handleInputChange("vendor_name", e.target.value)}
                  placeholder="Enter vendor name"
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
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Update Budget Item
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
