"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Plus, Search, Edit, Trash2, MoreHorizontal, Mail, Phone, Globe, Star, Heart } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { fetchVendors, deleteVendor } from "@/store/slices/vendorSlice"
import { toast } from "sonner"
import Link from "next/link"

const priceRangeColors = {
  budget: "bg-green-100 text-green-800",
  mid_range: "bg-blue-100 text-blue-800",
  premium: "bg-purple-100 text-purple-800",
  luxury: "bg-yellow-100 text-yellow-800",
}

const categoryIcons = {
  catering: "🍽️",
  photography: "📸",
  decoration: "🎨",
  entertainment: "🎵",
  venue: "🏢",
  transportation: "🚗",
  flowers: "🌸",
  makeup: "💄",
  sound: "🔊",
  security: "🛡️",
  other: "📋",
}

export default function VendorsPage() {
  const dispatch = useDispatch()
  const { vendors, isLoading } = useSelector((state: any) => state.vendors)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [priceRangeFilter, setPriceRangeFilter] = useState("all")
  const [preferredFilter, setPreferredFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchVendors())
  }, [dispatch])

  const handleDeleteVendor = async (vendorId: number) => {
    if (window.confirm("Are you sure you want to delete this vendor?")) {
      try {
        await dispatch(deleteVendor(vendorId)).unwrap()
        toast.success("Vendor deleted successfully")
      } catch (error) {
        toast.error("Failed to delete vendor")
      }
    }
  }

  const filteredVendors = vendors.filter((vendor: any) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.services.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter
    const matchesPriceRange = priceRangeFilter === "all" || vendor.price_range === priceRangeFilter
    const matchesPreferred =
      preferredFilter === "all" ||
      (preferredFilter === "preferred" && vendor.is_preferred) ||
      (preferredFilter === "not_preferred" && !vendor.is_preferred)

    return matchesSearch && matchesCategory && matchesPriceRange && matchesPreferred
  })

  // Calculate stats
  const totalVendors = vendors.length
  const preferredVendors = vendors.filter((vendor: any) => vendor.is_preferred).length
  const averageRating =
    vendors.length > 0
      ? vendors.reduce((sum: number, vendor: any) => sum + Number.parseFloat(vendor.rating), 0) / vendors.length
      : 0

  // Group by category for summary
  const categorySummary = Object.keys(categoryIcons)
    .map((category) => {
      const categoryVendors = vendors.filter((vendor: any) => vendor.category === category)
      return {
        category,
        count: categoryVendors.length,
        preferred: categoryVendors.filter((vendor: any) => vendor.is_preferred).length,
        averageRating:
          categoryVendors.length > 0
            ? categoryVendors.reduce((sum: number, vendor: any) => sum + Number.parseFloat(vendor.rating), 0) /
              categoryVendors.length
            : 0,
      }
    })
    .filter((item) => item.count > 0)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
          <p className="text-muted-foreground">Manage your event vendors and suppliers</p>
        </div>
        <Link href="/admin/vendors/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Vendor
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVendors}</div>
            <p className="text-xs text-muted-foreground">Registered vendors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Preferred Vendors</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{preferredVendors}</div>
            <p className="text-xs text-muted-foreground">
              {totalVendors > 0 ? ((preferredVendors / totalVendors) * 100).toFixed(1) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      {categorySummary.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vendors by Category</CardTitle>
            <CardDescription>Vendor breakdown by service category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {categorySummary.map((item) => (
                <div key={item.category} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{categoryIcons[item.category as keyof typeof categoryIcons]}</span>
                    <div>
                      <h4 className="font-medium capitalize">{item.category.replace("_", " ")}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.count} vendors • {item.preferred} preferred
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-500 mr-1" />
                      <span className="font-medium">{item.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="catering">Catering</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="decoration">Decoration</SelectItem>
                <SelectItem value="entertainment">Entertainment</SelectItem>
                <SelectItem value="venue">Venue</SelectItem>
                <SelectItem value="transportation">Transportation</SelectItem>
                <SelectItem value="flowers">Flowers</SelectItem>
                <SelectItem value="makeup">Makeup & Beauty</SelectItem>
                <SelectItem value="sound">Sound & Lighting</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priceRangeFilter} onValueChange={setPriceRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by price range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Price Ranges</SelectItem>
                <SelectItem value="budget">Budget (৳)</SelectItem>
                <SelectItem value="mid_range">Mid Range (৳৳)</SelectItem>
                <SelectItem value="premium">Premium (৳৳৳)</SelectItem>
                <SelectItem value="luxury">Luxury (৳৳৳৳)</SelectItem>
              </SelectContent>
            </Select>
            <Select value={preferredFilter} onValueChange={setPreferredFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by preference" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                <SelectItem value="preferred">Preferred Only</SelectItem>
                <SelectItem value="not_preferred">Not Preferred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vendor List */}
      {filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {vendors.length === 0 ? "No Vendors Yet" : "No Vendors Found"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {vendors.length === 0
                ? "Add your first vendor to start building your network"
                : "Try adjusting your search or filter criteria"}
            </p>
            {vendors.length === 0 && (
              <Link href="/admin/vendors/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vendor
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor: any) => (
            <Card key={vendor.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">{categoryIcons[vendor.category as keyof typeof categoryIcons]}</span>
                      <CardTitle className="text-lg">{vendor.name}</CardTitle>
                      {vendor.is_preferred && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                    </div>
                    <CardDescription className="capitalize">{vendor.category.replace("_", " ")}</CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Vendor
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Heart className="w-4 h-4 mr-2" />
                        {vendor.is_preferred ? "Remove from Preferred" : "Add to Preferred"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteVendor(vendor.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Vendor
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={priceRangeColors[vendor.price_range as keyof typeof priceRangeColors]}>
                    {vendor.price_range.replace("_", " ")}
                  </Badge>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{Number.parseFloat(vendor.rating).toFixed(1)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-muted-foreground">
                  {vendor.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      {vendor.email}
                    </div>
                  )}
                  {vendor.phone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-2" />
                      {vendor.phone}
                    </div>
                  )}
                  {vendor.website && (
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Website
                      </a>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5" />
                    <span className="line-clamp-2">{vendor.address}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Services</h4>
                  <p className="text-sm text-muted-foreground line-clamp-3">{vendor.services}</p>
                </div>

                {vendor.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Notes</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{vendor.notes}</p>
                  </div>
                )}

                <div className="pt-2">
                  <Button className="w-full bg-transparent" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
