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
import { Checkbox } from "@/components/ui/checkbox"
import { MapPin, ArrowLeft, Mail, Phone, Globe, Star } from "lucide-react"
import { createVendor } from "@/store/slices/vendorSlice"
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

export default function NewVendorPage() {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    rating: "5.0",
    price_range: "",
    services: "",
    notes: "",
    is_preferred: false,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const router = useRouter()
  const dispatch = useDispatch()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) newErrors.name = "Vendor name is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.price_range) newErrors.price_range = "Price range is required"
    if (!formData.services.trim()) newErrors.services = "Services description is required"
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Valid email is required"
    }
    if (formData.website && !formData.website.startsWith("http")) {
      newErrors.website = "Website must start with http:// or https://"
    }
    const rating = Number.parseFloat(formData.rating)
    if (rating < 0 || rating > 5) {
      newErrors.rating = "Rating must be between 0 and 5"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const vendorData = {
        ...formData,
        rating: Number.parseFloat(formData.rating),
      }

      await dispatch(createVendor(vendorData)).unwrap()
      toast.success("Vendor added successfully!")
      router.push("/admin/vendors")
    } catch (error) {
      toast.error(error.message || "Failed to add vendor")
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
        <Link href="/admin/vendors">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Add Vendor</h1>
          <p className="text-muted-foreground">Add a new vendor to your network</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Vendor Information
            </CardTitle>
            <CardDescription>Basic details about the vendor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-red-500" : ""}
                placeholder="Enter vendor name"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {vendorCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price_range">Price Range *</Label>
                <Select value={formData.price_range} onValueChange={(value) => handleInputChange("price_range", value)}>
                  <SelectTrigger className={errors.price_range ? "border-red-500" : ""}>
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
                {errors.price_range && <p className="text-sm text-red-500">{errors.price_range}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="services">Services *</Label>
              <Textarea
                id="services"
                value={formData.services}
                onChange={(e) => handleInputChange("services", e.target.value)}
                className={errors.services ? "border-red-500" : ""}
                placeholder="Describe the services offered by this vendor..."
                rows={3}
              />
              {errors.services && <p className="text-sm text-red-500">{errors.services}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>How to reach the vendor</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                    placeholder="vendor@example.com"
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

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  className={`pl-8 ${errors.website ? "border-red-500" : ""}`}
                  placeholder="https://vendor-website.com"
                />
              </div>
              {errors.website && <p className="text-sm text-red-500">{errors.website}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Complete address of the vendor..."
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Rating & Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Rating & Additional Information</CardTitle>
            <CardDescription>Rating and other details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <div className="relative">
                <Star className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rating"
                  type="number"
                  value={formData.rating}
                  onChange={(e) => handleInputChange("rating", e.target.value)}
                  className={`pl-8 ${errors.rating ? "border-red-500" : ""}`}
                  placeholder="5.0"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              {errors.rating && <p className="text-sm text-red-500">{errors.rating}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Any additional notes about the vendor..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_preferred"
                checked={formData.is_preferred}
                onCheckedChange={(checked) => handleInputChange("is_preferred", checked)}
              />
              <Label htmlFor="is_preferred">Mark as preferred vendor</Label>
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Adding..." : "Add Vendor"}
          </Button>
        </div>
      </form>
    </div>
  )
}
