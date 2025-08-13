"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { fetchBudgetItems, deleteBudgetItem } from "@/store/slices/budgetSlice"
import { fetchEvents } from "@/store/slices/eventSlice"
import { fetchVendors } from "@/store/slices/vendorSlice"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreHorizontal, Edit, Trash2, DollarSign, Calendar, Package, AlertCircle } from "lucide-react"
import { toast } from "sonner"

export default function BudgetPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { budgetItems, isLoading } = useAppSelector((state) => state.budget)
  const { events } = useAppSelector((state) => state.events)
  const { vendors } = useAppSelector((state) => state.vendors)

  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    dispatch(fetchBudgetItems())
    dispatch(fetchEvents())
    dispatch(fetchVendors())
  }, [dispatch])

  const filteredItems = budgetItems.filter((item) => {
    const matchesSearch =
      item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vendor_name && item.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const getEventName = (eventId: number) => {
    const event = events.find((e) => e.id === eventId)
    return event ? event.name : "Unknown Event"
  }

  const getVendorName = (vendorId: number | null, vendorName: string | null) => {
    if (vendorName) return vendorName
    if (vendorId) {
      const vendor = vendors.find((v) => v.id === vendorId)
      return vendor ? vendor.name : "Unknown Vendor"
    }
    return "No Vendor"
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: AlertCircle, color: "text-yellow-600" },
      paid: { variant: "default" as const, icon: DollarSign, color: "text-green-600" },
      partial: { variant: "outline" as const, icon: Package, color: "text-blue-600" },
      overdue: { variant: "destructive" as const, icon: Calendar, color: "text-red-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const handleEdit = (id: number) => {
    router.push(`/admin/budget/${id}/edit`)
  }

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this budget item?")) {
      try {
        await dispatch(deleteBudgetItem(id)).unwrap()
        toast.success("Budget item deleted successfully!")
      } catch (error) {
        toast.error("Failed to delete budget item")
      }
    }
  }

  // Calculate totals
  const totalEstimated = filteredItems.reduce((sum, item) => sum + Number(item.estimated_cost), 0)
  const totalActual = filteredItems.reduce((sum, item) => sum + Number(item.actual_cost || 0), 0)
  const totalPaid = filteredItems
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.actual_cost || 0), 0)
  const totalPending = filteredItems
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + Number(item.estimated_cost), 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Budget Management</h1>
          <p className="text-gray-600">Track and manage your event budget items</p>
        </div>
        <Button onClick={() => router.push("/admin/budget/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Budget Item
        </Button>
      </div>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Estimated</p>
                <p className="text-2xl font-bold">${totalEstimated.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Actual</p>
                <p className="text-2xl font-bold">${totalActual.toFixed(2)}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search budget items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Budget Items Table */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No budget items found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first budget item.</p>
              <Button onClick={() => router.push("/admin/budget/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Add Budget Item
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4 font-medium">Item</th>
                    <th className="text-left p-4 font-medium">Event</th>
                    <th className="text-left p-4 font-medium">Category</th>
                    <th className="text-left p-4 font-medium">Vendor</th>
                    <th className="text-left p-4 font-medium">Estimated</th>
                    <th className="text-left p-4 font-medium">Actual</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Due Date</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium">{item.item_name}</div>
                          {item.notes && <div className="text-sm text-gray-600 truncate max-w-xs">{item.notes}</div>}
                        </div>
                      </td>
                      <td className="p-4 text-sm">{getEventName(item.event)}</td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">{getVendorName(item.vendor, item.vendor_name)}</td>
                      <td className="p-4 font-medium">${Number(item.estimated_cost).toFixed(2)}</td>
                      <td className="p-4 font-medium">${Number(item.actual_cost || 0).toFixed(2)}</td>
                      <td className="p-4">{getStatusBadge(item.status)}</td>
                      <td className="p-4 text-sm">
                        {item.due_date ? new Date(item.due_date).toLocaleDateString() : "No due date"}
                      </td>
                      <td className="p-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
