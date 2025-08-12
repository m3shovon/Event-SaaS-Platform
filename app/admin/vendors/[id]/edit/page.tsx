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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, MapPin } from "lucide-react"
import { fetchVendor, updateVendor } from "@/store/slices/vendorSlice"
import { toast } from "sonner"
import Link from "next/link"

const vendorCategories = [
  { value: "catering", label: "Catering" },
  { value: "photography", label: "Photography" },
  { value: "decoration", label: "Decoration" },
  { value: "entertainment", label: "Entertainment" },
  { value: "venue", label: "Venue" },
  { value: "transportation", label: "Transportation" },
  { value: "flowers", label: "Flowers" },
  { value: "makeup", label: "Makeup & Beauty" },
  { value: "sound", label: "Sound & Lighting" },
  { value: "security", label: "Security" },
  { value: "other", label: "Other" },
]

const priceRanges = [
  { value: "budget", label: "Budget (৳)" },
  { value: "mid_range", label: "Mid Range (৳৳)" },
  { value: "premium", label: "Premium (৳৳৳)" },
  { value: "luxury", label: "Luxury (৳৳৳৳)" },
]

export default function EditVendorPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const vendorId = Number.parseInt(params.id as string)

  const { currentVendor, isLoading } = useSelector((state: any) => state.vendors)

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    rating: "0",
    price_range: "",
    services: "",
    notes: "",
    is_preferred: false,
  })

  useEffect(() => {
    dispatch(fetchVendor(vendorId))
  }, [dispatch, vendorId])

  useEffect(() => {
    if (currentVendor) {
      setFormData({
        name: currentVendor.name || "",
        category: currentVendor.category || "",
        email: currentVendor.email || "",
        phone: currentVendor.phone || "",
        address: currentVendor.address || "",
        website: currentVendor.website || "",
        rating: currentVendor.rating?.toString() || "0",
        price_range: currentVendor.price_range || "",
        services: currentVendor.services || "",
        notes: currentVendor.notes || "",
        is_preferred: currentVendor.is_preferred || false,
      })
    }
  }, [currentVendor])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.category || !formData.phone || !formData.address || !formData.price_range) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      await dispatch(
        updateVendor({
          id: vendorId,
          vendorData: {
            ...formData,
            rating: Number.parseFloat(formData.rating),
          },
        }),
      ).unwrap()

      toast.success("Vendor updated successfully")
      router.push("/admin/vendors")
    } catch (error: any) {
      toast.error(error.message || "Failed to update vendor")
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!currentVendor) {
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
        <Link href="/admin/vendors">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Vendor</h1>
          <p className="text-muted-foreground">Update vendor details</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Vendor Details
          </CardTitle>
          <CardDescription>Update the vendor information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Vendor Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter vendor name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="vendor@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+880 1234 567890"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://vendor-website.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_range">Price Range *</Label>
                <Select value={formData.price_range} onValueChange={(value) => handleInputChange("price_range", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price range" />
                  </SelectTrigger>
                  <SelectContent>
                    {priceRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Rating (0-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => handleInputChange("rating", e.target.value)}
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter vendor address"
                rows={2}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services Offered</Label>
              <Textarea
                id="services"
                value={formData.services}
                onChange={(e) => handleInputChange("services", e.target.value)}
                placeholder="Describe the services offered by this vendor"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Additional notes about the vendor"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_preferred"
                checked={formData.is_preferred}
                onCheckedChange={(checked) => handleInputChange("is_preferred", checked as boolean)}
              />
              <Label htmlFor="is_preferred">Mark as preferred vendor</Label>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Updating..." : "Update Vendor"}
              </Button>
              <Link href="/admin/vendors">
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
